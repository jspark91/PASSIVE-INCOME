param(
  [string]$Domain = $env:DDNS_DUCKDNS_DOMAIN,
  [string]$Token = $env:DDNS_DUCKDNS_TOKEN,
  [string]$Ip = "",
  [string]$ConfigPath = "$env:USERPROFILE\.ethnic-house-duckdns.json",
  [string]$LogPath = "$env:USERPROFILE\passive-income-run\duckdns-update.log"
)

$ErrorActionPreference = "Stop"

if (Test-Path -LiteralPath $ConfigPath) {
  $config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json

  if (!$Domain -and $config.domain) {
    $Domain = [string]$config.domain
  }

  if (!$Token -and $config.token) {
    $Token = [string]$config.token
  }
}

if (!$Domain) {
  throw "DuckDNS domain is missing. Use -Domain or set DDNS_DUCKDNS_DOMAIN."
}

if (!$Token) {
  throw "DuckDNS token is missing. Use -Token, set DDNS_DUCKDNS_TOKEN, or create $ConfigPath."
}

$Domain = $Domain.Trim().ToLowerInvariant()
$Domain = $Domain -replace "\.duckdns\.org$", ""

$encodedDomain = [Uri]::EscapeDataString($Domain)
$encodedToken = [Uri]::EscapeDataString($Token)
$updateUrl = "https://www.duckdns.org/update?domains=$encodedDomain&token=$encodedToken"

if ($Ip) {
  $updateUrl = "$updateUrl&ip=$([Uri]::EscapeDataString($Ip))"
}

$response = Invoke-WebRequest -Uri $updateUrl -UseBasicParsing -TimeoutSec 30
$content = ($response.Content | Out-String).Trim()

$logDir = Split-Path -Parent $LogPath
if ($logDir) {
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logLine = "$timestamp domain=$Domain.duckdns.org response=$content"
Add-Content -LiteralPath $LogPath -Value $logLine

if ($content -notmatch "^OK") {
  throw "DuckDNS update failed: $content"
}

Write-Host "DuckDNS updated: $Domain.duckdns.org"
Write-Host "Response: $content"
Write-Host "Log: $LogPath"
