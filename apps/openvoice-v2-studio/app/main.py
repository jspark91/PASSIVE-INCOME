from __future__ import annotations

import json
import os
import shutil
import uuid
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .guardrails import (
    GuardrailConfig,
    GuardrailError,
    SUPPORTED_LANGUAGES,
    validate_generation_request,
    validate_voice_registration,
)
from .openvoice_engine import EngineSettings, OpenVoiceV2Engine


def _bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def _int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    return int(value)


WORKSPACE = Path(os.getenv("OPENVOICE_WORKSPACE", "workspace")).resolve()
VOICE_DIR = WORKSPACE / "reference_voices"
OUTPUT_DIR = WORKSPACE / "outputs"
CHECKPOINT_ROOT = Path(
    os.getenv(
        "OPENVOICE_CHECKPOINT_ROOT",
        str(WORKSPACE / "models" / "openvoice" / "checkpoints_v2"),
    )
).resolve()

GUARDRAIL_CONFIG = GuardrailConfig(
    allow_adult_consensual_content=_bool_env("ALLOW_ADULT_CONSENSUAL_CONTENT"),
    max_text_chars=_int_env("OPENVOICE_MAX_TEXT_CHARS", 900),
)

ENGINE = OpenVoiceV2Engine(
    EngineSettings(
        checkpoint_root=CHECKPOINT_ROOT,
        device=os.getenv("OPENVOICE_DEVICE", "auto"),
        mock_mode=_bool_env("OPENVOICE_MOCK_MODE"),
    )
)

app = FastAPI(title="OpenVoice V2 Studio", version="0.1.0")


class GenerationAttestation(BaseModel):
    voice_owner_is_18_plus: bool
    voice_owner_consent_on_file: bool
    script_performers_are_18_plus: bool
    no_minor_or_minor_coded_content: bool
    no_nonconsensual_or_coercive_content: bool
    no_public_figure_or_private_person_impersonation: bool
    ai_generated_disclosure: bool
    rights_to_commercialize: bool


class GenerateRequest(BaseModel):
    voice_id: str = Field(min_length=1)
    language: Literal["EN_NEWEST", "EN", "ES", "FR", "ZH", "JP", "KR"]
    text: str = Field(min_length=1)
    content_rating: Literal["general", "adult_consensual"] = "general"
    attestation: GenerationAttestation
    base_speaker: Optional[str] = None
    speed: float = Field(default=1.0, ge=0.5, le=2.0)


class GenerateResponse(BaseModel):
    job_id: str
    audio_url: str
    content_rating: str
    language: str


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "ok": True,
        "guardrails": {
            "adult_consensual_enabled": GUARDRAIL_CONFIG.allow_adult_consensual_content,
            "max_text_chars": GUARDRAIL_CONFIG.max_text_chars,
            "supported_languages": sorted(SUPPORTED_LANGUAGES),
        },
        "engine": ENGINE.availability(),
    }


@app.post("/v1/voices")
async def register_voice(
    reference_audio: UploadFile = File(...),
    voice_owner_alias: str = Form(...),
    consent_record_id: str = Form(...),
    voice_owner_is_18_plus: bool = Form(...),
    voice_owner_consent_on_file: bool = Form(...),
    rights_to_commercialize: bool = Form(...),
) -> dict[str, object]:
    payload = {
        "consent_record_id": consent_record_id,
        "voice_owner_is_18_plus": voice_owner_is_18_plus,
        "voice_owner_consent_on_file": voice_owner_consent_on_file,
        "rights_to_commercialize": rights_to_commercialize,
    }
    try:
        validate_voice_registration(payload)
    except GuardrailError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    extension = _audio_extension(reference_audio.filename)
    voice_id = _safe_voice_id(voice_owner_alias)
    voice_path = VOICE_DIR / voice_id
    voice_path.mkdir(parents=True, exist_ok=False)

    reference_path = voice_path / f"reference{extension}"
    with reference_path.open("wb") as output:
        shutil.copyfileobj(reference_audio.file, output)

    manifest = {
        "voice_id": voice_id,
        "voice_owner_alias": voice_owner_alias,
        "consent_record_id": consent_record_id,
        "voice_owner_is_18_plus": voice_owner_is_18_plus,
        "voice_owner_consent_on_file": voice_owner_consent_on_file,
        "rights_to_commercialize": rights_to_commercialize,
        "reference_audio_path": str(reference_path),
    }
    (voice_path / "manifest.json").write_text(
        json.dumps(manifest, indent=2),
        encoding="utf-8",
    )

    return {"voice_id": voice_id, "manifest_path": str(voice_path / "manifest.json")}


@app.post("/v1/generate", response_model=GenerateResponse)
def generate_audio(request: GenerateRequest) -> GenerateResponse:
    payload = request.model_dump()
    try:
        validate_generation_request(payload, GUARDRAIL_CONFIG)
    except GuardrailError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    voice_manifest = _load_voice_manifest(request.voice_id)
    reference_audio_path = Path(str(voice_manifest["reference_audio_path"]))
    if not reference_audio_path.exists():
        raise HTTPException(status_code=404, detail="Reference audio is missing.")

    job_id = uuid.uuid4().hex
    output_path = OUTPUT_DIR / f"{job_id}.wav"
    try:
        ENGINE.synthesize(
            text=request.text,
            language=request.language,
            reference_audio_path=reference_audio_path,
            output_path=output_path,
            base_speaker=request.base_speaker,
            speed=request.speed,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return GenerateResponse(
        job_id=job_id,
        audio_url=f"/v1/audio/{job_id}.wav",
        content_rating=request.content_rating,
        language=request.language,
    )


@app.get("/v1/audio/{file_name}")
def download_audio(file_name: str) -> FileResponse:
    if "/" in file_name or "\\" in file_name or not file_name.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Invalid file name.")
    output_path = OUTPUT_DIR / file_name
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Audio not found.")
    return FileResponse(output_path, media_type="audio/wav", filename=file_name)


def _audio_extension(file_name: Optional[str]) -> str:
    extension = Path(file_name or "").suffix.lower()
    if extension not in {".wav", ".mp3", ".flac", ".m4a"}:
        raise HTTPException(
            status_code=400,
            detail="reference_audio must be wav, mp3, flac, or m4a.",
        )
    return extension


def _safe_voice_id(alias: str) -> str:
    normalized = "".join(
        character.lower() if character.isalnum() else "-"
        for character in alias.strip()
    ).strip("-")
    if not normalized:
        normalized = "voice"
    return f"{normalized[:40]}-{uuid.uuid4().hex[:10]}"


def _load_voice_manifest(voice_id: str) -> dict[str, object]:
    if "/" in voice_id or "\\" in voice_id:
        raise HTTPException(status_code=400, detail="Invalid voice_id.")

    manifest_path = VOICE_DIR / voice_id / "manifest.json"
    if not manifest_path.exists():
        raise HTTPException(status_code=404, detail="Voice is not registered.")

    return json.loads(manifest_path.read_text(encoding="utf-8"))
