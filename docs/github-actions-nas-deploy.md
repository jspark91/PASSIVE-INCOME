# GitHub Actions NAS Deploy

This is a secondary deployment option. The current recommended path is the NAS
scheduled pull task in [`docs/nas-auto-deploy.md`](nas-auto-deploy.md).

Use GitHub Actions SSH deploy only when the NAS accepts public key SSH from
GitHub Actions and the required repository secrets are configured.

```text
git push origin main
-> GitHub Actions
-> SSH into NAS
-> /volume1/docker/ethnic-house/scripts/nas-deploy.sh
-> docker compose up -d --build
```

The workflow file is:

```text
.github/workflows/deploy-nas.yml
```

## Requirement

GitHub Actions must be able to reach the NAS through SSH.

If the required SSH secrets are missing, the workflow intentionally skips deploy
instead of failing. This keeps the scheduled pull setup clean while the SSH
route is not active.

Recommended access options:

- VPN/Tailscale address for the NAS.
- A tightly controlled SSH port forward to the NAS.

Do not expose DSM admin UI broadly to the internet just for deployment.

## One-Time NAS Setup

The NAS deployment folder must be a git clone, not a File Station zip upload:

```sh
mkdir -p /volume1/docker
git clone https://github.com/jspark91/PASSIVE-INCOME.git /volume1/docker/ethnic-house
cd /volume1/docker/ethnic-house
```

If the folder already exists from manual upload, follow the backup/replace steps in
[`docs/nas-auto-deploy.md`](nas-auto-deploy.md).

Run the first deploy manually on the NAS:

```sh
APP_DIR=/volume1/docker/ethnic-house BRANCH=main /bin/sh /volume1/docker/ethnic-house/scripts/nas-deploy.sh
```

## SSH Key

Create a deploy-only SSH key from your PC or another trusted machine:

```sh
ssh-keygen -t ed25519 -C "github-actions-ethnic-house-nas" -f ethnic-house-nas-deploy
```

Add the public key to the NAS user's `~/.ssh/authorized_keys`.

Put the private key into GitHub as a repository secret:

```text
NAS_SSH_PRIVATE_KEY
```

## GitHub Secrets

In GitHub:

```text
Repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Required:

```text
NAS_SSH_HOST
NAS_SSH_USER
NAS_SSH_PRIVATE_KEY
```

Optional:

```text
NAS_SSH_PORT
NAS_SSH_KNOWN_HOSTS
NAS_APP_DIR
NAS_DEPLOY_BRANCH
```

Recommended values:

```text
NAS_SSH_PORT=22
NAS_APP_DIR=/volume1/docker/ethnic-house
NAS_DEPLOY_BRANCH=main
```

For `NAS_SSH_KNOWN_HOSTS`, run this from a trusted machine and paste the output:

```sh
ssh-keyscan -p 22 NAS_HOSTNAME_OR_IP
```

If `NAS_SSH_KNOWN_HOSTS` is not set, the workflow will run `ssh-keyscan` during deployment.

## Normal Update Flow

After this is set up:

```sh
git add .
git commit -m "Update site"
git push origin main
```

Watch the run in:

```text
GitHub -> Actions -> Deploy to Synology NAS
```

The deployment is successful when the job prints:

```text
[ethnic-house-deploy] deployment healthy
```

## Fallback

If GitHub cannot reach the NAS through SSH, use the scheduled pull method in
[`docs/nas-auto-deploy.md`](nas-auto-deploy.md). That method does not require inbound SSH from GitHub.
