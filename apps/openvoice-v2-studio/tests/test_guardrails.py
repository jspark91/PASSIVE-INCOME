from __future__ import annotations

import unittest

from app.guardrails import (
    GuardrailConfig,
    GuardrailError,
    validate_generation_request,
    validate_voice_registration,
)


VALID_ATTESTATION = {
    "voice_owner_is_18_plus": True,
    "voice_owner_consent_on_file": True,
    "script_performers_are_18_plus": True,
    "no_minor_or_minor_coded_content": True,
    "no_nonconsensual_or_coercive_content": True,
    "no_public_figure_or_private_person_impersonation": True,
    "ai_generated_disclosure": True,
    "rights_to_commercialize": True,
}


class GuardrailTests(unittest.TestCase):
    def test_voice_registration_requires_consent(self) -> None:
        with self.assertRaises(GuardrailError):
            validate_voice_registration(
                {
                    "consent_record_id": "voice-001",
                    "voice_owner_is_18_plus": True,
                    "voice_owner_consent_on_file": False,
                    "rights_to_commercialize": True,
                }
            )

    def test_adult_content_is_disabled_by_default(self) -> None:
        with self.assertRaisesRegex(GuardrailError, "disabled"):
            validate_generation_request(
                {
                    "text": "Neutral production test line.",
                    "language": "KR",
                    "content_rating": "adult_consensual",
                    "attestation": VALID_ATTESTATION,
                },
                GuardrailConfig(),
            )

    def test_valid_adult_request_passes_when_enabled(self) -> None:
        validate_generation_request(
            {
                "text": "Neutral production test line.",
                "language": "KR",
                "content_rating": "adult_consensual",
                "attestation": VALID_ATTESTATION,
            },
            GuardrailConfig(allow_adult_consensual_content=True),
        )

    def test_minor_coded_text_is_blocked(self) -> None:
        with self.assertRaisesRegex(GuardrailError, "minor"):
            validate_generation_request(
                {
                    "text": "A high school themed line.",
                    "language": "EN",
                    "content_rating": "general",
                    "attestation": VALID_ATTESTATION,
                },
                GuardrailConfig(),
            )

    def test_nonconsent_text_is_blocked(self) -> None:
        with self.assertRaisesRegex(GuardrailError, "non-consensual"):
            validate_generation_request(
                {
                    "text": "A forced scenario.",
                    "language": "EN",
                    "content_rating": "general",
                    "attestation": VALID_ATTESTATION,
                },
                GuardrailConfig(),
            )

    def test_missing_attestation_is_blocked(self) -> None:
        attestation = dict(VALID_ATTESTATION)
        attestation["ai_generated_disclosure"] = False
        with self.assertRaisesRegex(GuardrailError, "Missing"):
            validate_generation_request(
                {
                    "text": "Neutral production test line.",
                    "language": "EN",
                    "content_rating": "general",
                    "attestation": attestation,
                },
                GuardrailConfig(),
            )


if __name__ == "__main__":
    unittest.main()
