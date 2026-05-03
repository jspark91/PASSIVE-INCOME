#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/volume1/docker/ethnic-house}"
BRANCH="${BRANCH:-main}"
REMOTE="${REMOTE:-origin}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
SKIP_GIT_SYNC="${SKIP_GIT_SYNC:-0}"
env_changed=0

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

read_env_value() {
  file="$1"
  key="$2"

  if [ ! -f "$file" ]; then
    return 0
  fi

  sed -n "s/^$key=//p" "$file" | tail -1 | tr -d '\r'
}

write_env_value() {
  file="$1"
  key="$2"
  value="$3"

  if [ -z "$value" ]; then
    return
  fi

  mkdir -p "$(dirname "$file")"
  touch "$file"

  current="$(read_env_value "$file" "$key")"
  if [ "$current" = "$value" ]; then
    return
  fi

  tmp="$file.$$"
  if grep -q "^$key=" "$file"; then
    awk -v k="$key" -v v="$value" '
      BEGIN { prefix = k "=" }
      index($0, prefix) == 1 { print k "=" v; next }
      { print }
    ' "$file" > "$tmp"
  else
    cp "$file" "$tmp"
    printf '%s=%s\n' "$key" "$value" >> "$tmp"
  fi

  mv "$tmp" "$file"
  chmod 600 "$file" || true
  env_changed=1
}

derive_telegram_public_contact() {
  env_file="$APP_DIR/.env"
  token="${TELEGRAM_BOT_TOKEN:-$(read_env_value "$env_file" "TELEGRAM_BOT_TOKEN")}"
  site_url="${NEXT_PUBLIC_SITE_URL:-$(read_env_value "$env_file" "NEXT_PUBLIC_SITE_URL")}"
  public_url="${NEXT_PUBLIC_TELEGRAM_URL:-$(read_env_value "$env_file" "NEXT_PUBLIC_TELEGRAM_URL")}"
  bot_username="${NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:-$(read_env_value "$env_file" "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME")}"

  if [ -z "$site_url" ]; then
    site_url="https://ethnichouseseoul.com"
  fi

  write_env_value "$env_file" "NEXT_PUBLIC_SITE_URL" "$site_url"

  if [ -z "$token" ]; then
    return
  fi

  if [ -n "$public_url" ] && [ -n "$bot_username" ]; then
    return
  fi

  if ! command -v curl >/dev/null 2>&1; then
    log "curl is not available; skipping Telegram public URL derivation"
    return
  fi

  bot_info="$(curl -fsS "https://api.telegram.org/bot$token/getMe" 2>/dev/null || true)"
  derived_username="$(printf '%s' "$bot_info" | sed -n 's/.*"username":"\([^"]*\)".*/\1/p' | head -1)"

  if [ -z "$derived_username" ]; then
    log "could not derive Telegram bot username"
    return
  fi

  if [ -z "$bot_username" ]; then
    bot_username="$derived_username"
    write_env_value "$env_file" "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" "$bot_username"
  fi

  if [ -z "$public_url" ]; then
    write_env_value "$env_file" "NEXT_PUBLIC_TELEGRAM_URL" "https://t.me/$bot_username"
  fi
}

configure_telegram_webhook() {
  env_file="$APP_DIR/.env"
  token="${TELEGRAM_BOT_TOKEN:-$(read_env_value "$env_file" "TELEGRAM_BOT_TOKEN")}"
  site_url="${NEXT_PUBLIC_SITE_URL:-$(read_env_value "$env_file" "NEXT_PUBLIC_SITE_URL")}"
  secret="${TELEGRAM_WEBHOOK_SECRET:-$(read_env_value "$env_file" "TELEGRAM_WEBHOOK_SECRET")}"

  if [ -z "$token" ]; then
    return
  fi

  if [ -z "$site_url" ]; then
    site_url="https://ethnichouseseoul.com"
  fi

  if ! command -v curl >/dev/null 2>&1; then
    log "curl is not available; skipping Telegram webhook setup"
    return
  fi

  webhook_url="$(printf '%s' "$site_url" | sed 's#/$##')/api/telegram/webhook"

  if [ -n "$secret" ]; then
    if curl -fsS -X POST "https://api.telegram.org/bot$token/setWebhook" \
      -d "url=$webhook_url" \
      -d "secret_token=$secret" >/dev/null; then
      log "telegram webhook was set to $webhook_url"
    else
      log "telegram webhook setup failed; check public HTTPS site URL"
    fi
  else
    if curl -fsS -X POST "https://api.telegram.org/bot$token/setWebhook" \
      -d "url=$webhook_url" >/dev/null; then
      log "telegram webhook was set to $webhook_url"
    else
      log "telegram webhook setup failed; check public HTTPS site URL"
    fi
  fi
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

derive_telegram_public_contact

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  fail "Docker Compose is not available. Install Synology Container Manager."
fi

if [ "$old_rev" = "$new_rev" ] && [ "$env_changed" = "0" ]; then
  if health_ok; then
    log "no git changes and app is healthy; skipping rebuild"
    configure_telegram_webhook
    exit 0
  fi

  log "no git changes, but health check failed; rebuilding container"
elif [ "$old_rev" = "$new_rev" ] && [ "$env_changed" != "0" ]; then
  log "environment changed; rebuilding container"
fi

if docker ps -a --format '{{.Names}}' | grep -qx 'ethnic-house-app'; then
  log "removing existing ethnic-house-app container before recreate"
  docker rm -f ethnic-house-app >/dev/null
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
    configure_telegram_webhook
    $COMPOSE ps
    exit 0
  fi

  sleep 2
  i=$((i + 1))
done

$COMPOSE ps
fail "health check did not pass after deployment"
