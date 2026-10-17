#!/bin/sh
# Deploy sources extracted from the release ZIP, keeping .env and named volumes.
set -eu

APP_DIR="${APP_DIR:-/volume1/docker/ethnic-house}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
cd "$APP_DIR"
[ -f docker-compose.yml ] || { echo "docker-compose.yml was not found in $APP_DIR" >&2; exit 1; }

if docker compose version >/dev/null 2>&1; then
  compose() { docker compose "$@"; }
elif command -v docker-compose >/dev/null 2>&1; then
  compose() { docker-compose "$@"; }
else
  echo "Docker Compose is not available." >&2
  exit 1
fi

echo "[manual-deploy] Building the ZIP source; the current container stays running during the build."
compose build app
echo "[manual-deploy] Starting the rebuilt app; existing named volumes are preserved."
compose up -d --no-deps app

if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  compose ps
  echo "[manual-deploy] Check /booking in your browser; no HTTP checker is installed."
  exit 0
fi

attempt=0
while [ "$attempt" -lt 30 ]; do
  if command -v curl >/dev/null 2>&1; then
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null; then
      echo "[manual-deploy] Application healthy. Check /booking for the structured inquiry form."
      compose ps
      exit 0
    fi
  elif wget -q -T 5 -O - "$HEALTH_URL" >/dev/null; then
    echo "[manual-deploy] Application healthy. Check /booking for the structured inquiry form."
    compose ps
    exit 0
  fi
  attempt=$((attempt + 1))
  sleep 2
done

compose ps
echo "[manual-deploy] Health check failed. Review the app container logs." >&2
exit 1
