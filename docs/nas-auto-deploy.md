# NAS Auto Deploy

This is the current recommended deployment path.

```text
PC changes -> git push -> GitHub -> Synology scheduled task -> docker compose rebuild
```

Use this instead of uploading zip files to the NAS. It also avoids requiring inbound
SSH from GitHub Actions.

## Single DSM Task

Create one Synology scheduled task:

```text
ethnic-house-auto-deploy
```

Run as:

```text
root
```

Schedule:

```text
Every 5 minutes
```

Script:

```sh
set -eu
exec 2>&1

LOG_DIR="/volume1/docker"
LOG_FILE="$LOG_DIR/ethnic-house-auto-deploy.log"
BOOTSTRAP_URL="https://raw.githubusercontent.com/jspark91/PASSIVE-INCOME/main/scripts/nas-bootstrap-and-deploy.sh"
BOOTSTRAP_FILE="/tmp/ethnic-house-bootstrap-and-deploy.sh"

echo "[task] start $(date)"
mkdir -p "$LOG_DIR"

if command -v curl >/dev/null 2>&1; then
  echo "[task] downloading bootstrap with curl"
  curl -fL "$BOOTSTRAP_URL" -o "$BOOTSTRAP_FILE"
else
  echo "[task] downloading bootstrap with wget"
  wget -O "$BOOTSTRAP_FILE" "$BOOTSTRAP_URL"
fi

ls -l "$BOOTSTRAP_FILE"
echo "[task] running bootstrap; log file: $LOG_FILE"

set +e
APP_DIR="/volume1/docker/ethnic-house" \
BRANCH="main" \
REPO_URL="https://github.com/jspark91/PASSIVE-INCOME.git" \
HEALTH_URL="http://127.0.0.1:3000/api/health" \
/bin/sh "$BOOTSTRAP_FILE" > "$LOG_FILE" 2>&1
STATUS=$?
set -e

cat "$LOG_FILE" || true
echo "[task] bootstrap exit=$STATUS"
exit "$STATUS"
```

The bootstrap script will:

- convert an old manual upload folder into a timestamped backup;
- clone `jspark91/PASSIVE-INCOME` into `/volume1/docker/ethnic-house` when Git is available;
- download the latest GitHub archive when Git is not available;
- pull or replace the source from the latest `main` branch;
- run `scripts/nas-deploy.sh`;
- rebuild the Docker container only when needed or when health fails.

## Cleanup

After `ethnic-house-auto-deploy` works, delete or disable older temporary DSM tasks:

```text
add-codex-ssh-key
enable-ssh-publickey
fix-codex-ssh-login
fix-sshd-before-match
fix-real-sshd-publickey
diagnose-ssh-publickey
diagnose-effective-sshd
```

## Check Logs

DSM task output shows the latest run. The persistent log is:

```text
/volume1/docker/ethnic-house-auto-deploy.log
```

Successful deploys include:

```text
[ethnic-house-deploy] deployment healthy
```

## Normal Update Flow

From the local repo:

```sh
git add .
git commit -m "Update site"
git push origin main
```

The NAS updates on the next scheduled run.

## Rules

- Do not upload zip files after this is working.
- Do not edit `/volume1/docker/ethnic-house` directly.
- Keep Synology reverse proxy pointed to `127.0.0.1:3000`.
- Keep only one device receiving router ports `80/443`.
- Git is optional. Without Git, the NAS uses the GitHub archive fallback.
