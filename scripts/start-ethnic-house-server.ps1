param(
  [int]$Port = 3000,
  [string]$HostName = "0.0.0.0",
  [string]$RunDir = "$env:USERPROFILE\passive-income-run",
  [string]$SiteUrl = ""
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$NodeRoot = Join-Path $RepoRoot ".tools\node-v20.20.2-win-x64"
$NodeExe = Join-Path $NodeRoot "node.exe"
$NpmCmd = Join-Path $NodeRoot "npm.cmd"

if (!(Test-Path $NodeExe)) {
  throw "Portable Node was not found at $NodeExe"
}

New-Item -ItemType Directory -Force -Path $RunDir | Out-Null

$localIp = (
  Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      $_.IPAddress -notlike "169.254.*" -and
      $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1 -ExpandProperty IPAddress
)

if (!$SiteUrl) {
  if ($localIp) {
    $SiteUrl = "http://$localIp`:$Port"
  } else {
    $SiteUrl = "http://localhost:$Port"
  }
}

Write-Host "Syncing source to $RunDir"
robocopy $RepoRoot $RunDir /E /XD .git .next node_modules .tools /XF .env .env.local .env.production.local | Out-Host
if ($LASTEXITCODE -gt 7) {
  throw "robocopy failed with exit code $LASTEXITCODE"
}

$env:PATH = "$NodeRoot;$env:PATH"
$env:NEXT_PUBLIC_SITE_URL = $SiteUrl

Push-Location $RunDir
try {
  Write-Host "Installing dependencies"
  & $NpmCmd install

  Write-Host "Building with NEXT_PUBLIC_SITE_URL=$env:NEXT_PUBLIC_SITE_URL"
  & $NpmCmd run build

  $existing = Get-CimInstance Win32_Process |
    Where-Object {
      $_.CommandLine -like "*$RunDir*" -and
      $_.CommandLine -like "*next*" -and
      $_.CommandLine -like "*start*"
    }

  foreach ($process in $existing) {
    Write-Host "Stopping existing server PID $($process.ProcessId)"
    Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
  }

  $portListeners = netstat -ano |
    Select-String ":$Port " |
    Select-String "LISTENING" |
    ForEach-Object { ($_ -split "\s+")[-1] } |
    Sort-Object -Unique

  foreach ($listenerPid in $portListeners) {
    if ($listenerPid -match "^\d+$") {
      Write-Host "Stopping existing listener on port $Port PID $listenerPid"
      Stop-Process -Id ([int]$listenerPid) -Force -ErrorAction SilentlyContinue
    }
  }

  $nextBin = Join-Path $RunDir "node_modules\next\dist\bin\next"
  $stdout = Join-Path $RunDir ".next-start.log"
  $stderr = Join-Path $RunDir ".next-start.err.log"
  Remove-Item -LiteralPath $stdout, $stderr -ErrorAction SilentlyContinue

  Write-Host "Starting ETHNIC HOUSE server on $HostName`:$Port"
  Start-Process `
    -FilePath $NodeExe `
    -ArgumentList @($nextBin, "start", "--hostname", $HostName, "--port", "$Port") `
    -WorkingDirectory $RunDir `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr

  Start-Sleep -Seconds 3

  $healthUrl = "http://127.0.0.1:$Port"
  $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing

  Write-Host ""
  Write-Host "Server started."
  Write-Host "Local:   http://127.0.0.1:$Port"
  if ($localIp) {
    Write-Host "LAN:     http://$localIp`:$Port"
  }
  Write-Host "SiteUrl: $SiteUrl"
  Write-Host "Status:  $($response.StatusCode)"
  Write-Host ""
  Write-Host "Logs:"
  Write-Host "  $stdout"
  Write-Host "  $stderr"
}
finally {
  Pop-Location
}
