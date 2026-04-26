param(
  [string]$Domain = "ethnichouseseoul.com",
  [int]$AppPort = 3000,
  [string]$SiteUrl = "",
  [string]$RunDir = "$env:USERPROFILE\passive-income-run"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$CaddyRoot = Join-Path $RepoRoot ".tools\caddy"
$CaddyExe = Join-Path $CaddyRoot "caddy.exe"
$Caddyfile = Join-Path $RepoRoot "Caddyfile"
$CaddyLog = Join-Path $RunDir ".caddy.log"
$CaddyErr = Join-Path $RunDir ".caddy.err.log"

if (!$SiteUrl) {
  $SiteUrl = "https://$Domain"
}

if (!(Test-Path -LiteralPath $CaddyExe)) {
  & (Join-Path $PSScriptRoot "install-caddy.ps1")
}

Write-Host "Starting Next.js with NEXT_PUBLIC_SITE_URL=$SiteUrl"
& (Join-Path $PSScriptRoot "start-ethnic-house-server.ps1") -Port $AppPort -HostName "127.0.0.1" -RunDir $RunDir -SiteUrl $SiteUrl

$existing = Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -like "*caddy*" -and
    $_.CommandLine -like "*$Caddyfile*"
  }

foreach ($process in $existing) {
  Write-Host "Stopping existing Caddy PID $($process.ProcessId)"
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

foreach ($port in @(80, 443)) {
  $portListeners = netstat -ano |
    Select-String ":$port " |
    Select-String "LISTENING" |
    ForEach-Object { ($_ -split "\s+")[-1] } |
    Sort-Object -Unique

  foreach ($listenerPid in $portListeners) {
    if ($listenerPid -match "^\d+$") {
      $process = Get-Process -Id ([int]$listenerPid) -ErrorAction SilentlyContinue
      if ($process -and $process.ProcessName -eq "caddy") {
        Write-Host "Stopping Caddy listener on port $port PID $listenerPid"
        Stop-Process -Id ([int]$listenerPid) -Force -ErrorAction SilentlyContinue
      }
    }
  }
}

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null
Remove-Item -LiteralPath $CaddyLog, $CaddyErr -ErrorAction SilentlyContinue

Write-Host "Validating Caddyfile"
& $CaddyExe validate --config $Caddyfile --adapter caddyfile

Write-Host "Starting Caddy reverse proxy for https://$Domain"
Start-Process `
  -FilePath $CaddyExe `
  -ArgumentList @("run", "--config", $Caddyfile, "--adapter", "caddyfile") `
  -WorkingDirectory $RepoRoot `
  -WindowStyle Hidden `
  -RedirectStandardOutput $CaddyLog `
  -RedirectStandardError $CaddyErr

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "HTTPS stack started."
Write-Host "Next.js: http://127.0.0.1:$AppPort"
Write-Host "Public:  https://$Domain"
Write-Host "Logs:"
Write-Host "  $CaddyLog"
Write-Host "  $CaddyErr"
Write-Host ""
Write-Host "Router must forward:"
Write-Host "  External TCP 80  -> 192.168.0.2:80"
Write-Host "  External TCP 443 -> 192.168.0.2:443"
