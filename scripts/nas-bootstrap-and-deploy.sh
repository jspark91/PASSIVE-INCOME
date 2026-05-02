#!/bin/sh
set -eu

APP_DIR="${APP_DIR:-/volume1/docker/ethnic-house}"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:-https://github.com/jspark91/PASSIVE-INCOME.git}"
GITHUB_REPO="${GITHUB_REPO:-jspark91/PASSIVE-INCOME}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
BACKUP_MANUAL_DIR="${BACKUP_MANUAL_DIR:-1}"

log() {
  printf '%s %s\n' "[ethnic-house-bootstrap]" "$1"
}

fail() {
  printf '%s ERROR: %s\n' "[ethnic-house-bootstrap]" "$1" >&2
  exit 1
}

download_url() {
  url="$1"
  dest="$2"

  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$dest"
    return
  fi

  if command -v wget >/dev/null 2>&1; then
    wget -q -O "$dest" "$url"
    return
  fi

  fail "curl or wget is required."
}

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

remote_sha() {
  api_file="/tmp/ethnic-house-github-commit.json"
  download_url "https://api.github.com/repos/$GITHUB_REPO/commits/$BRANCH" "$api_file"
  sha="$(sed -n 's/^[[:space:]]*"sha":[[:space:]]*"\([0-9a-f][0-9a-f]*\)".*/\1/p' "$api_file" | head -1)"
  [ -n "$sha" ] || fail "could not read latest GitHub commit sha."
  printf '%s\n' "$sha"
}

prepare_git_checkout() {
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

prepare_archive_checkout() {
  command -v tar >/dev/null 2>&1 || fail "tar is not installed on this NAS."

  parent_dir="$(dirname "$APP_DIR")"
  mkdir -p "$parent_dir"

  latest_sha="$(remote_sha)"
  sha_file="$APP_DIR/.ethnic-house-source-sha"
  current_sha=""
  if [ -f "$sha_file" ]; then
    current_sha="$(cat "$sha_file")"
  fi

  if [ "$current_sha" = "$latest_sha" ] && health_ok; then
    log "no GitHub changes and app is healthy; skipping archive deploy"
    exit 0
  fi

  archive="/tmp/ethnic-house-$latest_sha.tar.gz"
  extract_root="/tmp/ethnic-house-archive-$$"
  extracted_dir=""

  log "git is not installed; downloading GitHub archive $latest_sha"
  download_url "https://codeload.github.com/$GITHUB_REPO/tar.gz/$latest_sha" "$archive"

  mkdir -p "$extract_root"
  tar -xzf "$archive" -C "$extract_root"
  extracted_dir="$(find "$extract_root" -mindepth 1 -maxdepth 1 -type d | head -1)"
  [ -n "$extracted_dir" ] || fail "GitHub archive did not extract to a source directory."

  env_backup=""
  if [ -f "$APP_DIR/.env" ]; then
    env_backup="$parent_dir/ethnic-house.env.backup"
    cp "$APP_DIR/.env" "$env_backup"
    log "backed up existing .env to $env_backup"
  fi

  if [ -e "$APP_DIR" ]; then
    if [ "$BACKUP_MANUAL_DIR" != "1" ]; then
      fail "$APP_DIR exists and BACKUP_MANUAL_DIR is not enabled."
    fi

    backup_dir="$parent_dir/ethnic-house-previous-$(date +%Y%m%d-%H%M%S)"
    mv "$APP_DIR" "$backup_dir"
    log "moved existing source folder to $backup_dir"
  fi

  mv "$extracted_dir" "$APP_DIR"
  printf '%s\n' "$latest_sha" > "$sha_file"

  if [ -n "$env_backup" ] && [ -f "$env_backup" ]; then
    cp "$env_backup" "$APP_DIR/.env"
    log "restored .env into source folder"
  fi
}

run_deploy() {
  if [ ! -f "$APP_DIR/scripts/nas-deploy.sh" ]; then
    fail "$APP_DIR/scripts/nas-deploy.sh does not exist after checkout."
  fi

  log "running deploy"
  APP_DIR="$APP_DIR" BRANCH="$BRANCH" HEALTH_URL="$HEALTH_URL" SKIP_GIT_SYNC="${SKIP_GIT_SYNC:-0}" /bin/sh "$APP_DIR/scripts/nas-deploy.sh"
}

if command -v git >/dev/null 2>&1; then
  SKIP_GIT_SYNC=0
  prepare_git_checkout
else
  SKIP_GIT_SYNC=1
  prepare_archive_checkout
fi

run_deploy
