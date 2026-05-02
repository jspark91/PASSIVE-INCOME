#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/volume1/docker/ethnic-house}"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:-https://github.com/jspark91/PASSIVE-INCOME.git}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
BACKUP_MANUAL_DIR="${BACKUP_MANUAL_DIR:-1}"

log() {
  printf '%s %s\n' "[ethnic-house-bootstrap]" "$1"
}

fail() {
  printf '%s ERROR: %s\n' "[ethnic-house-bootstrap]" "$1" >&2
  exit 1
}

prepare_git_checkout() {
  command -v git >/dev/null 2>&1 || fail "git is not installed on this NAS."

  parent_dir="$(dirname "$APP_DIR")"
  mkdir -p "$parent_dir"

  if [ -d "$APP_DIR/.git" ]; then
    log "git checkout already exists at $APP_DIR"
    return
  fi

  env_backup=""
  if [ -f "$APP_DIR/.env" ]; then
    env_backup="$parent_dir/ethnic-house.env.backup"
    cp "$APP_DIR/.env" "$env_backup"
    log "backed up existing .env to $env_backup"
  fi

  if [ -e "$APP_DIR" ]; then
    if [ "$BACKUP_MANUAL_DIR" != "1" ]; then
      fail "$APP_DIR exists but is not a git checkout."
    fi

    backup_dir="$parent_dir/ethnic-house-manual-$(date +%Y%m%d-%H%M%S)"
    mv "$APP_DIR" "$backup_dir"
    log "moved existing manual folder to $backup_dir"
  fi

  log "cloning $REPO_URL to $APP_DIR"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"

  if [ -n "$env_backup" ] && [ -f "$env_backup" ]; then
    cp "$env_backup" "$APP_DIR/.env"
    log "restored .env into git checkout"
  fi
}

run_deploy() {
  if [ ! -f "$APP_DIR/scripts/nas-deploy.sh" ]; then
    fail "$APP_DIR/scripts/nas-deploy.sh does not exist after checkout."
  fi

  log "running deploy"
  APP_DIR="$APP_DIR" BRANCH="$BRANCH" HEALTH_URL="$HEALTH_URL" /bin/sh "$APP_DIR/scripts/nas-deploy.sh"
}

prepare_git_checkout
run_deploy
