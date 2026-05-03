#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/volume1/docker/ethnic-house}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
TELEGRAM_WEBHOOK_SECRET="${TELEGRAM_WEBHOOK_SECRET:-}"
KAKAO_ALERT_WEBHOOK_URL="${KAKAO_ALERT_WEBHOOK_URL:-}"
KAKAO_ALERT_WEBHOOK_TOKEN="${KAKAO_ALERT_WEBHOOK_TOKEN:-}"
NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://ethnichouseseoul.com}"
NEXT_PUBLIC_WHATSAPP_URL="${NEXT_PUBLIC_WHATSAPP_URL:-}"
NEXT_PUBLIC_LINE_URL="${NEXT_PUBLIC_LINE_URL:-}"
NEXT_PUBLIC_TELEGRAM_URL="${NEXT_PUBLIC_TELEGRAM_URL:-}"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="${NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:-}"

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

derive_telegram_contact() {
  if [ -n "$NEXT_PUBLIC_TELEGRAM_URL" ] && [ -n "$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" ]; then
    return
  fi

  if ! command -v curl >/dev/null 2>&1; then
    return
  fi

  bot_info="$(curl -fsS "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" 2>/dev/null || true)"
  bot_username="$(printf '%s' "$bot_info" | sed -n 's/.*"username":"\([^"]*\)".*/\1/p' | head -1)"

  if [ -z "$bot_username" ]; then
    return
  fi

  if [ -z "$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" ]; then
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="$bot_username"
  fi

  if [ -z "$NEXT_PUBLIC_TELEGRAM_URL" ]; then
    NEXT_PUBLIC_TELEGRAM_URL="https://t.me/$bot_username"
  fi
}

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
  write_env_value "$file" "NEXT_PUBLIC_SITE_URL" "$NEXT_PUBLIC_SITE_URL"
  write_env_value "$file" "TELEGRAM_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN"
  write_env_value "$file" "TELEGRAM_CHAT_ID" "$TELEGRAM_CHAT_ID"

  if [ -n "$TELEGRAM_WEBHOOK_SECRET" ]; then
    write_env_value "$file" "TELEGRAM_WEBHOOK_SECRET" "$TELEGRAM_WEBHOOK_SECRET"
  fi

  if [ -n "$KAKAO_ALERT_WEBHOOK_URL" ]; then
    write_env_value "$file" "KAKAO_ALERT_WEBHOOK_URL" "$KAKAO_ALERT_WEBHOOK_URL"
  fi

  if [ -n "$KAKAO_ALERT_WEBHOOK_TOKEN" ]; then
    write_env_value "$file" "KAKAO_ALERT_WEBHOOK_TOKEN" "$KAKAO_ALERT_WEBHOOK_TOKEN"
  fi

  if [ -n "$NEXT_PUBLIC_WHATSAPP_URL" ]; then
    write_env_value "$file" "NEXT_PUBLIC_WHATSAPP_URL" "$NEXT_PUBLIC_WHATSAPP_URL"
  fi

  if [ -n "$NEXT_PUBLIC_LINE_URL" ]; then
    write_env_value "$file" "NEXT_PUBLIC_LINE_URL" "$NEXT_PUBLIC_LINE_URL"
  fi

  if [ -n "$NEXT_PUBLIC_TELEGRAM_URL" ]; then
    write_env_value "$file" "NEXT_PUBLIC_TELEGRAM_URL" "$NEXT_PUBLIC_TELEGRAM_URL"
  fi

  if [ -n "$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" ]; then
    write_env_value "$file" "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME" "$NEXT_PUBLIC_TELEGRAM_BOT_USERNAME"
  fi
}

configure_telegram_webhook() {
  if ! command -v curl >/dev/null 2>&1; then
    log "curl is not available; skipping Telegram webhook setup."
    return
  fi

  webhook_url="$(printf '%s' "$NEXT_PUBLIC_SITE_URL" | sed 's#/$##')/api/telegram/webhook"

  if [ -n "$TELEGRAM_WEBHOOK_SECRET" ]; then
    if curl -fsS -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
      -d "url=$webhook_url" \
      -d "secret_token=$TELEGRAM_WEBHOOK_SECRET" >/dev/null; then
      log "telegram webhook was set to $webhook_url."
    else
      log "telegram webhook setup failed; check public HTTPS site URL."
    fi
  else
    if curl -fsS -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
      -d "url=$webhook_url" >/dev/null; then
      log "telegram webhook was set to $webhook_url."
    else
      log "telegram webhook setup failed; check public HTTPS site URL."
    fi
  fi
}

derive_telegram_contact
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
configure_telegram_webhook
