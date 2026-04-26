param()

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$InstallDir = Join-Path $RepoRoot ".tools\caddy"
$CaddyExe = Join-Path $InstallDir "caddy.exe"

if (Test-Path -LiteralPath $CaddyExe) {
  & $CaddyExe version
  exit 0
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$apiUrl = "https://api.github.com/repos/caddyserver/caddy/releases/latest"
$release = Invoke-RestMethod -Uri $apiUrl -Headers @{ "User-Agent" = "ETHNIC-HOUSE-setup" } -TimeoutSec 30
$asset = $release.assets |
  Where-Object { $_.name -match "windows_amd64\.zip$" } |
  Select-Object -First 1

if (!$asset) {
  throw "Could not find a Caddy Windows amd64 release asset."
}

$zipPath = Join-Path $InstallDir $asset.name

Write-Host "Downloading Caddy $($release.tag_name)"
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath -UseBasicParsing -TimeoutSec 120

Write-Host "Extracting Caddy to $InstallDir"
Expand-Archive -Path $zipPath -DestinationPath $InstallDir -Force

if (!(Test-Path -LiteralPath $CaddyExe)) {
  throw "caddy.exe was not found after extraction."
}

& $CaddyExe version
