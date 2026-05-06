# OpenVoice V2 Studio

This document defines the PASSIVE-INCOME OpenVoice V2 self-hosting project.

The implementation lives in:

```text
apps/openvoice-v2-studio
```

## Operating Principle

The business workflow must be consent-first:

- use only the operator's own voice or a contracted voice actor's voice
- keep signed consent and commercial rights records outside git
- require all voice owners, performers, and characters to be 18+
- disclose AI-generated audio wherever content is published
- block public figure/private person impersonation
- block minors, minor-coded scripts, and non-consensual/coercive scenarios

## Technical Shape

The service is a FastAPI wrapper around OpenVoice V2:

- `/v1/voices` stores a reference voice and consent manifest
- `/v1/generate` validates the generation attestation and calls OpenVoice V2
- `/v1/audio/{file}` returns generated WAV output
- `/health` reports guardrail defaults and engine readiness

The OpenVoice adapter follows the official V2 demo path:

1. load `checkpoints_v2/converter`
2. extract the target speaker embedding from a consented reference voice
3. generate base TTS with MeloTTS
4. convert tone color with OpenVoice V2

## Hosting

Local mock-mode validation:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
powershell -NoProfile -ExecutionPolicy Bypass -File apps/openvoice-v2-studio/scripts/validate-openvoice-v2-studio.ps1
```

Checkpoint download:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME\apps\openvoice-v2-studio
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/download-openvoice-v2-checkpoints.ps1
```

Docker start:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME\apps\openvoice-v2-studio
$env:ALLOW_ADULT_CONSENSUAL_CONTENT="true"
docker compose up --build
```

Use `OPENVOICE_MOCK_MODE=true` when validating API wiring without GPU,
checkpoints, or the OpenVoice dependency stack.

## Git Rules

These paths must stay untracked:

```text
apps/openvoice-v2-studio/workspace/
apps/openvoice-v2-studio/models/
apps/openvoice-v2-studio/outputs/
apps/openvoice-v2-studio/reference_voices/
```

Do not commit raw reference voices, generated audio, signed consent records,
identity files, or model checkpoint archives.

## Source References

- OpenVoice repository: https://github.com/myshell-ai/OpenVoice
- OpenVoice usage guide: https://github.com/myshell-ai/OpenVoice/blob/main/docs/USAGE.md
- MyShell OpenVoice documentation: https://docs.myshell.ai/ko/technology/openvoice
