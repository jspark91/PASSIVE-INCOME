param(
  [Parameter(Mandatory = $true)]
  [string]$Domain,

  [Parameter(Mandatory = $true)]
  [string]$Token,

  [int]$IntervalMinutes = 5,
  [string]$ConfigPath = "$env:USERPROFILE\.ethnic-house-duckdns.json",
  [string]$TaskName = "ETHNIC HOUSE DuckDNS Update"
)

$ErrorActionPreference = "Stop"

if ($IntervalMinutes -lt 5) {
  throw "Use an interval of 5 minutes or more."
}

$Domain = $Domain.Trim().ToLowerInvariant()
$Domain = $Domain -replace "\.duckdns\.org$", ""

$config = [ordered]@{
  domain = $Domain
  token = $Token
}

$config | ConvertTo-Json | Set-Content -LiteralPath $ConfigPath -Encoding UTF8

$updateScript = Join-Path $PSScriptRoot "update-duckdns.ps1"
$argument = "-NoProfile -ExecutionPolicy Bypass -File `"$updateScript`" -ConfigPath `"$ConfigPath`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $argument
$repeatTrigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)
$startupTrigger = New-ScheduledTaskTrigger -AtStartup

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger @($repeatTrigger, $startupTrigger) `
  -Description "Updates the ETHNIC HOUSE DuckDNS public IP record." `
  -Force | Out-Null

& $updateScript -ConfigPath $ConfigPath

Write-Host ""
Write-Host "DuckDNS scheduled task installed."
Write-Host "Task:   $TaskName"
Write-Host "Domain: $Domain.duckdns.org"
Write-Host "Every:  $IntervalMinutes minutes"
Write-Host "Config: $ConfigPath"
Write-Host ""
Write-Host "Use this as the public site URL when router forwarding is ready:"
Write-Host "  http://$Domain.duckdns.org"
