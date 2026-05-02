# NAS Auto Deploy

Use this after the first manual NAS test works if GitHub Actions cannot reach the NAS
through SSH. The goal is:

```text
PC changes -> git push -> GitHub -> Synology scheduled pull -> docker compose rebuild
```

This avoids uploading zip files to the NAS for every content change.

If SSH from GitHub Actions to the NAS is available, use
[`docs/github-actions-nas-deploy.md`](github-actions-nas-deploy.md) instead for immediate
deploys on every push to `main`.

## Recommended Mode

Use a Synology scheduled task that runs `scripts/nas-deploy.sh` every few minutes.
When there are no new commits and the app is healthy, the script exits without rebuilding.

This does not require opening NAS SSH to the public internet. The NAS only needs outbound access to GitHub.

## One-Time NAS Setup

SSH into the NAS or use Synology's Terminal/Task Scheduler tools.

Back up the current manual upload folder if it exists:

```sh
if [ -f /volume1/docker/ethnic-house/.env ]; then
  cp /volume1/docker/ethnic-house/.env /volume1/docker/ethnic-house.env.backup
fi

if [ -d /volume1/docker/ethnic-house ]; then
  mv /volume1/docker/ethnic-house "/volume1/docker/ethnic-house-manual-$(date +%Y%m%d-%H%M%S)"
fi
```

Clone the repository into the deployment path:

```sh
mkdir -p /volume1/docker
git clone https://github.com/jspark91/PASSIVE-INCOME.git /volume1/docker/ethnic-house
cd /volume1/docker/ethnic-house

if [ -f /volume1/docker/ethnic-house.env.backup ]; then
  cp /volume1/docker/ethnic-house.env.backup .env
fi
```

If the GitHub repository is private, clone with an SSH deploy key or a GitHub token instead of the public HTTPS URL.

Before continuing, confirm the NAS clone contains these files:

```text
/volume1/docker/ethnic-house/docker-compose.yml
/volume1/docker/ethnic-house/Dockerfile
/volume1/docker/ethnic-house/scripts/nas-deploy.sh
```

Run the first deploy manually:

```sh
APP_DIR=/volume1/docker/ethnic-house BRANCH=main sh scripts/nas-deploy.sh
```

Confirm local NAS health:

```text
http://NAS_IP:3000/api/health
```

Confirm public health from mobile data:

```text
https://ethnichouseseoul.com/api/health
```

## Synology Scheduled Task

In DSM:

1. Open `Control Panel`.
2. Open `Task Scheduler`.
3. Create `Scheduled Task` -> `User-defined script`.
4. Task name:

```text
ethnic-house-auto-deploy
```

5. User:

```text
root
```

6. Schedule:

```text
Every 5 minutes
```

7. User-defined script:

```sh
APP_DIR=/volume1/docker/ethnic-house BRANCH=main /bin/sh /volume1/docker/ethnic-house/scripts/nas-deploy.sh >> /volume1/docker/ethnic-house/deploy.log 2>&1
```

After this, the normal update path is:

```sh
git add .
git commit -m "Update site content"
git push origin main
```

The NAS will pull and rebuild on the next scheduled run.

## Check Deploy Logs

On the NAS:

```sh
tail -n 80 /volume1/docker/ethnic-house/deploy.log
```

Successful deploys include:

```text
[ethnic-house-deploy] deployment healthy
```

## Important Rules

- Do not edit files directly inside `/volume1/docker/ethnic-house` after it becomes a git checkout.
- Put changes in this repository, commit them, and push to GitHub.
- Keep Synology reverse proxy pointed to `127.0.0.1:3000`.
- Keep only one active deployment target receiving router ports `80/443`.
- If the scheduled task fails because the NAS folder has local edits, fix the repo state instead of overwriting live files by hand.
