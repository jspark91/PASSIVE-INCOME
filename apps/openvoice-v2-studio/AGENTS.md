# AGENTS.md - OpenVoice V2 Studio

## Project Identity

This folder is a separate consent-first OpenVoice V2 hosting project inside the
PASSIVE-INCOME repository.

Do not mix this service with the ETHNIC HOUSE tattoo booking app, desktop
calendar app, or any tunnel/CAD work. Keep API code, generated audio, reference
voices, checkpoints, and operating docs inside this folder unless a deployment
script explicitly needs a repository-level hook.

## Safety Boundary

This project may support adult audio only when every voice and script is
consented, commercial rights are documented, all performers and characters are
18+, and AI-generated status is disclosed.

Do not implement or accept workflows for:

- voice cloning without explicit voice-owner consent
- public figure, celebrity, influencer, ex-partner, coworker, or private person
  impersonation
- minors, minor-coded characters, school-age framing, or age-ambiguous sexual
  content
- non-consensual, coercive, intoxicated, drugged, sleeping, blackmail, or hidden
  recording scenarios
- storing raw identity documents, real legal names, or sensitive files in git

## Implementation Rules

- Keep OpenVoice checkpoints and generated audio out of git.
- Default adult generation off unless `ALLOW_ADULT_CONSENSUAL_CONTENT=true`.
- Require a consent manifest before a voice can be used.
- Prefer repeatable Docker and script workflows over manual notebooks.
- Keep tests focused on consent gates, forbidden text checks, and configuration
  defaults.

## Done Means

Before saying this project is ready:

- Run `powershell -NoProfile -ExecutionPolicy Bypass -File apps/openvoice-v2-studio/scripts/validate-openvoice-v2-studio.ps1`.
- Confirm no generated audio, reference voice, checkpoint, or private consent
  document is tracked by git.
- If Docker was changed, run a container build when Docker is available.
- If real OpenVoice inference was exercised, record the hardware, checkpoint
  path, and command in the final report.
