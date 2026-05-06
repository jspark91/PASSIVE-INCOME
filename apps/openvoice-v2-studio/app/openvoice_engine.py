from __future__ import annotations

import importlib.util
import math
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass(frozen=True)
class EngineSettings:
    checkpoint_root: Path
    device: str = "auto"
    mock_mode: bool = False


class OpenVoiceV2Engine:
    def __init__(self, settings: EngineSettings) -> None:
        self.settings = settings
        self._converter = None
        self._converter_device = None

    def availability(self) -> dict[str, object]:
        converter_config = self.settings.checkpoint_root / "converter" / "config.json"
        converter_ckpt = self.settings.checkpoint_root / "converter" / "checkpoint.pth"
        return {
            "mock_mode": self.settings.mock_mode,
            "openvoice_installed": importlib.util.find_spec("openvoice") is not None,
            "melo_installed": importlib.util.find_spec("melo") is not None,
            "checkpoint_root": str(self.settings.checkpoint_root),
            "converter_config_exists": converter_config.exists(),
            "converter_checkpoint_exists": converter_ckpt.exists(),
        }

    def synthesize(
        self,
        *,
        text: str,
        language: str,
        reference_audio_path: Path,
        output_path: Path,
        base_speaker: Optional[str] = None,
        speed: float = 1.0,
    ) -> None:
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if self.settings.mock_mode:
            self._write_mock_wav(output_path)
            return

        self._synthesize_openvoice(
            text=text,
            language=language,
            reference_audio_path=reference_audio_path,
            output_path=output_path,
            base_speaker=base_speaker,
            speed=speed,
        )

    def _synthesize_openvoice(
        self,
        *,
        text: str,
        language: str,
        reference_audio_path: Path,
        output_path: Path,
        base_speaker: Optional[str],
        speed: float,
    ) -> None:
        import torch
        from melo.api import TTS
        from openvoice import se_extractor
        from openvoice.api import ToneColorConverter

        device = self._resolve_device(torch)
        converter = self._load_converter(ToneColorConverter, device)

        target_se, _audio_name = se_extractor.get_se(
            str(reference_audio_path),
            converter,
            vad=True,
        )

        model = TTS(language=language, device=device)
        speaker_ids = model.hps.data.spk2id
        speaker_key = base_speaker or next(iter(speaker_ids.keys()))
        if speaker_key not in speaker_ids:
            raise ValueError(
                f"Unknown base_speaker '{speaker_key}'. Available: "
                + ", ".join(speaker_ids.keys())
            )

        source_key = speaker_key.lower().replace("_", "-")
        source_se_path = (
            self.settings.checkpoint_root / "base_speakers" / "ses" / f"{source_key}.pth"
        )
        if not source_se_path.exists():
            raise FileNotFoundError(f"Missing source speaker embedding: {source_se_path}")

        tmp_path = output_path.with_suffix(".source.wav")
        source_se = torch.load(str(source_se_path), map_location=device)

        if torch.backends.mps.is_available() and device == "cpu":
            torch.backends.mps.is_available = lambda: False

        model.tts_to_file(text, speaker_ids[speaker_key], str(tmp_path), speed=speed)
        converter.convert(
            audio_src_path=str(tmp_path),
            src_se=source_se,
            tgt_se=target_se,
            output_path=str(output_path),
            message="@PASSIVE-INCOME",
        )
        tmp_path.unlink(missing_ok=True)

    def _resolve_device(self, torch_module: object) -> str:
        if self.settings.device != "auto":
            return self.settings.device
        if torch_module.cuda.is_available():
            return "cuda:0"
        return "cpu"

    def _load_converter(self, converter_cls: object, device: str) -> object:
        if self._converter is not None and self._converter_device == device:
            return self._converter

        converter_config = self.settings.checkpoint_root / "converter" / "config.json"
        converter_ckpt = self.settings.checkpoint_root / "converter" / "checkpoint.pth"
        if not converter_config.exists() or not converter_ckpt.exists():
            raise FileNotFoundError(
                "OpenVoice V2 converter checkpoint is missing. Expected "
                f"{converter_config} and {converter_ckpt}."
            )

        converter = converter_cls(str(converter_config), device=device)
        converter.load_ckpt(str(converter_ckpt))
        self._converter = converter
        self._converter_device = device
        return converter

    @staticmethod
    def _write_mock_wav(output_path: Path) -> None:
        sample_rate = 22050
        duration_seconds = 0.75
        frequency = 440.0
        amplitude = 8000
        frame_count = int(sample_rate * duration_seconds)

        with wave.open(str(output_path), "w") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            for index in range(frame_count):
                value = int(amplitude * math.sin(2 * math.pi * frequency * index / sample_rate))
                wav_file.writeframesraw(value.to_bytes(2, byteorder="little", signed=True))
