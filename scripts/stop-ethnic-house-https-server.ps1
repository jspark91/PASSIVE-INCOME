param(
  [int]$AppPort = 3000,
  [string]$RunDir = "$env:USERPROFILE\passive-income-run"
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$Caddyfile = Join-Path $RepoRoot "Caddyfile"

$caddyProcesses = Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -like "*caddy*" -and
    $_.CommandLine -like "*$Caddyfile*"
  }

foreach ($process in $caddyProcesses) {
  Write-Host "Stopping Caddy PID $($process.ProcessId)"
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

& (Join-Path $PSScriptRoot "stop-ethnic-house-server.ps1") -Port $AppPort -RunDir $RunDir
