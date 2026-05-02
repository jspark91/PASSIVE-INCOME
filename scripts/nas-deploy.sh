#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/volume1/docker/ethnic-house}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
SKIP_GIT_SYNC="${SKIP_GIT_SYNC:-0}"

log() {
  printf '%s %s\n' "[ethnic-house-deploy]" "$1"
}

fail() {
  printf '%s ERROR: %s\n' "[ethnic-house-deploy]" "$1" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || fail "docker is not installed on this NAS user path."

if [ "$SKIP_GIT_SYNC" != "1" ]; then
  command -v git >/dev/null 2>&1 || fail "git is not installed on this NAS user path."
fi

health_ok() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsS "$HEALTH_URL" >/dev/null 2>&1
    return $?
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -q -O - "$HEALTH_URL" >/dev/null 2>&1
    return $?
  fi

  return 2
}

if [ ! -d "$APP_DIR" ]; then
  fail "$APP_DIR does not exist. Clone the repository there before enabling the scheduled task."
fi

cd "$APP_DIR"

if [ "$SKIP_GIT_SYNC" = "1" ]; then
  log "git sync skipped; using source already present in $APP_DIR"
  old_rev="archive"
  new_rev="archive-deploy"
else
  if [ ! -d "$APP_DIR/.git" ]; then
    fail "$APP_DIR is not a git checkout. Replace the uploaded zip copy with a git clone."
  fi

  log "syncing $REMOTE/$BRANCH in $APP_DIR"
  old_rev="$(git rev-parse HEAD)"
  current_branch="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$current_branch" != "$BRANCH" ]; then
    git checkout "$BRANCH"
  fi

  git fetch "$REMOTE" "$BRANCH"
  git pull --ff-only "$REMOTE" "$BRANCH"
  new_rev="$(git rev-parse HEAD)"
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  fail "Docker Compose is not available. Install Synology Container Manager."
fi

if [ "$old_rev" = "$new_rev" ]; then
  if health_ok; then
    log "no git changes and app is healthy; skipping rebuild"
    exit 0
  fi

  log "no git changes, but health check failed; rebuilding container"
fi

log "building and starting container"
$COMPOSE up -d --build --remove-orphans

if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  log "curl/wget not available; skipping HTTP health check"
  $COMPOSE ps
  exit 0
fi

log "waiting for health endpoint: $HEALTH_URL"
i=1
while [ "$i" -le 30 ]; do
  if health_ok; then
    log "deployment healthy"
    $COMPOSE ps
    exit 0
  fi

  sleep 2
  i=$((i + 1))
done

$COMPOSE ps
fail "health check did not pass after deployment"
