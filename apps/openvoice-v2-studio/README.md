# OpenVoice V2 Studio

Self-hosted OpenVoice V2 API scaffold for consent-first adult audio production.

The service is intentionally separated from the ETHNIC HOUSE web app. It wraps
OpenVoice V2 behind an API that requires voice-owner consent, 18+ attestation,
commercial rights, AI disclosure, and forbidden-content checks before any
generation job can run.

## What This Provides

- FastAPI service for registering consented reference voices.
- OpenVoice V2 generation endpoint with a lazy-loaded model adapter.
- Guardrails for minors, non-consent, impersonation, and missing rights.
- Dockerfile and Docker Compose for self-hosting.
- PowerShell checkpoint downloader for the official OpenVoice V2 checkpoint.
- Local validation script and unit tests that run without GPU or model files.

## What This Does Not Provide

- No reference voices, generated audio, or model checkpoints in git.
- No erotic scripts or content library.
- No legal advice.
- No automated proof that a real person consented. The operator must keep signed
  consent and rights records outside git.

## Source Model Notes

OpenVoice V2 is maintained by MyShell at:

```text
https://github.com/myshell-ai/OpenVoice
```

The official documentation says OpenVoice V2 supports English, Spanish, French,
Chinese, Japanese, and Korean, and that V1/V2 are MIT licensed for commercial
and research use as of April 2024. The official V2 checkpoint URL documented by
MyShell is:

```text
https://myshell-public-repo-host.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip
```

## Local Validation

From the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File apps/openvoice-v2-studio/scripts/validate-openvoice-v2-studio.ps1
```

This validates Python syntax and the consent guardrail tests. It does not
download OpenVoice or run real synthesis.

## Download Checkpoints

From this folder:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/download-openvoice-v2-checkpoints.ps1
```

The script writes to:

```text
apps/openvoice-v2-studio/workspace/models/openvoice/checkpoints_v2
```

That directory is ignored by git.

## Run With Docker

Build the API image:

```powershell
docker compose build
```

Start in mock mode first:

```powershell
$env:OPENVOICE_MOCK_MODE="true"
docker compose up
```

Real OpenVoice inference requires checkpoints mounted at
`/workspace/models/openvoice/checkpoints_v2` and a CPU/GPU environment capable
of running PyTorch, MeloTTS, and OpenVoice.

Adult consensual generation is disabled by default. Enable it only after the
operating consent process is ready:

```powershell
$env:ALLOW_ADULT_CONSENSUAL_CONTENT="true"
```

## API

Health:

```http
GET /health
```

Register a consented reference voice:

```http
POST /v1/voices
Content-Type: multipart/form-data

reference_audio=<audio file>
voice_owner_alias=<stage or internal alias>
consent_record_id=<external record id>
voice_owner_is_18_plus=true
voice_owner_consent_on_file=true
rights_to_commercialize=true
```

Generate:

```http
POST /v1/generate
Content-Type: application/json

{
  "voice_id": "registered-voice-id",
  "language": "KR",
  "text": "Neutral production test line.",
  "content_rating": "adult_consensual",
  "attestation": {
    "voice_owner_is_18_plus": true,
    "voice_owner_consent_on_file": true,
    "script_performers_are_18_plus": true,
    "no_minor_or_minor_coded_content": true,
    "no_nonconsensual_or_coercive_content": true,
    "no_public_figure_or_private_person_impersonation": true,
    "ai_generated_disclosure": true,
    "rights_to_commercialize": true
  }
}
```
