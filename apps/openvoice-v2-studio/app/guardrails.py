from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable, Mapping


SUPPORTED_LANGUAGES = {"EN_NEWEST", "EN", "ES", "FR", "ZH", "JP", "KR"}

REQUIRED_ATTESTATIONS = {
    "voice_owner_is_18_plus",
    "voice_owner_consent_on_file",
    "script_performers_are_18_plus",
    "no_minor_or_minor_coded_content",
    "no_nonconsensual_or_coercive_content",
    "no_public_figure_or_private_person_impersonation",
    "ai_generated_disclosure",
    "rights_to_commercialize",
}

MINOR_PATTERNS = (
    r"\bminor\b",
    r"\bunder\s*age\b",
    r"\bunderage\b",
    r"\bteen\b",
    r"\bteenager\b",
    r"\bschool\s*girl\b",
    r"\bschool\s*boy\b",
    r"\bhigh\s*school\b",
    r"\bmiddle\s*school\b",
    r"\bchild\b",
    r"\bkid\b",
    r"\bloli\b",
    r"\bshota\b",
    r"미성년",
    r"청소년",
    r"아동",
    r"어린이",
    r"여고생",
    r"남고생",
    r"중학생",
    r"고등학생",
    r"교복",
)

NONCONSENT_PATTERNS = (
    r"\brape\b",
    r"\bforced\b",
    r"\bnon[-\s]?consensual\b",
    r"\bblackmail\b",
    r"\bdrugged\b",
    r"\bsleeping\b",
    r"\bunconscious\b",
    r"\bhidden\s*camera\b",
    r"\bwithout\s+consent\b",
    r"강간",
    r"강제로",
    r"비동의",
    r"동의\s*없이",
    r"몰래",
    r"수면",
    r"약물",
    r"협박",
)

IMPERSONATION_PATTERNS = (
    r"\bcelebrity\b",
    r"\bpublic\s*figure\b",
    r"\binfluencer\b",
    r"\blookalike\b",
    r"\bsoundalike\b",
    r"\bdeepfake\b",
    r"연예인",
    r"유명인",
    r"인플루언서",
    r"딥페이크",
    r"전\s*여친",
    r"전\s*남친",
)


class GuardrailError(ValueError):
    """Raised when a request violates the service safety boundary."""


@dataclass(frozen=True)
class GuardrailConfig:
    allow_adult_consensual_content: bool = False
    max_text_chars: int = 900


def validate_voice_registration(payload: Mapping[str, object]) -> None:
    required_true = (
        "voice_owner_is_18_plus",
        "voice_owner_consent_on_file",
        "rights_to_commercialize",
    )
    missing = [name for name in required_true if payload.get(name) is not True]
    if missing:
        raise GuardrailError(
            "Voice registration requires consent and rights fields: "
            + ", ".join(missing)
        )

    consent_record_id = str(payload.get("consent_record_id") or "").strip()
    if not consent_record_id:
        raise GuardrailError("consent_record_id is required.")


def validate_generation_request(
    payload: Mapping[str, object],
    config: GuardrailConfig,
) -> None:
    text = str(payload.get("text") or "")
    language = str(payload.get("language") or "")
    content_rating = str(payload.get("content_rating") or "general")
    attestation = payload.get("attestation")

    if not text.strip():
        raise GuardrailError("text is required.")

    if len(text) > config.max_text_chars:
        raise GuardrailError(
            f"text is too long. Max is {config.max_text_chars} characters."
        )

    if language not in SUPPORTED_LANGUAGES:
        raise GuardrailError(
            "language must be one of: " + ", ".join(sorted(SUPPORTED_LANGUAGES))
        )

    if content_rating == "adult_consensual" and not config.allow_adult_consensual_content:
        raise GuardrailError(
            "adult_consensual generation is disabled. Set "
            "ALLOW_ADULT_CONSENSUAL_CONTENT=true after consent operations are ready."
        )

    if not isinstance(attestation, Mapping):
        raise GuardrailError("attestation object is required.")

    missing_attestations = [
        name for name in sorted(REQUIRED_ATTESTATIONS) if attestation.get(name) is not True
    ]
    if missing_attestations:
        raise GuardrailError(
            "Missing required attestations: " + ", ".join(missing_attestations)
        )

    _reject_patterns(text, MINOR_PATTERNS, "minor or minor-coded content")
    _reject_patterns(text, NONCONSENT_PATTERNS, "non-consensual or coercive content")
    _reject_patterns(text, IMPERSONATION_PATTERNS, "impersonation risk")


def _reject_patterns(text: str, patterns: Iterable[str], label: str) -> None:
    for pattern in patterns:
        if re.search(pattern, text, flags=re.IGNORECASE):
            raise GuardrailError(f"Blocked {label}.")
