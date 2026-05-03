#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/volume1/docker/ethnic-house}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
KAKAO_ALERT_WEBHOOK_URL="${KAKAO_ALERT_WEBHOOK_URL:-}"
KAKAO_ALERT_WEBHOOK_TOKEN="${KAKAO_ALERT_WEBHOOK_TOKEN:-}"

log() {
  printf '%s %s\n' "[ethnic-house-chat-alerts]" "$1"
}

fail() {
  printf '%s ERROR: %s\n' "[ethnic-house-chat-alerts]" "$1" >&2
  exit 1
}

[ -n "$TELEGRAM_BOT_TOKEN" ] || fail "TELEGRAM_BOT_TOKEN is required."
[ -n "$TELEGRAM_CHAT_ID" ] || fail "TELEGRAM_CHAT_ID is required."
[ -d "$APP_DIR" ] || fail "$APP_DIR does not exist."

write_env_value() {
  file="$1"
  key="$2"
  value="$3"

  mkdir -p "$(dirname "$file")"
  touch "$file"

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
}

configure_env_file() {
  file="$1"
  write_env_value "$file" "TELEGRAM_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN"
  write_env_value "$file" "TELEGRAM_CHAT_ID" "$TELEGRAM_CHAT_ID"

  if [ -n "$KAKAO_ALERT_WEBHOOK_URL" ]; then
    write_env_value "$file" "KAKAO_ALERT_WEBHOOK_URL" "$KAKAO_ALERT_WEBHOOK_URL"
  fi

  if [ -n "$KAKAO_ALERT_WEBHOOK_TOKEN" ]; then
    write_env_value "$file" "KAKAO_ALERT_WEBHOOK_TOKEN" "$KAKAO_ALERT_WEBHOOK_TOKEN"
  fi
}

configure_env_file "$APP_DIR/.env"
configure_env_file "$APP_DIR/deploy/synology/.env"

log "chat alert env values were written."

cd "$APP_DIR"

if docker ps -a --format '{{.Names}}' | grep -qx 'ethnic-house-app'; then
  log "removing existing ethnic-house-app container before recreate"
  docker rm -f ethnic-house-app >/dev/null
fi

if docker compose version >/dev/null 2>&1; then
  docker compose up -d --build --remove-orphans
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d --build --remove-orphans
else
  fail "Docker Compose is not available."
fi

log "container restarted."
