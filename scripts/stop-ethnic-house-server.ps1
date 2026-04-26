param(
  [int]$Port = 3000,
  [string]$RunDir = "$env:USERPROFILE\passive-income-run"
)

$ErrorActionPreference = "Stop"

$existing = Get-CimInstance Win32_Process |
  Where-Object {
    $_.CommandLine -like "*$RunDir*" -and
    $_.CommandLine -like "*next*" -and
    $_.CommandLine -like "*start*"
  }

foreach ($process in $existing) {
  Write-Host "Stopping ETHNIC HOUSE server PID $($process.ProcessId)"
  Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
}

$portListeners = netstat -ano |
  Select-String ":$Port " |
  Select-String "LISTENING" |
  ForEach-Object { ($_ -split "\s+")[-1] } |
  Sort-Object -Unique

foreach ($listenerPid in $portListeners) {
  if ($listenerPid -match "^\d+$") {
    Write-Host "Stopping listener on port $Port PID $listenerPid"
    Stop-Process -Id ([int]$listenerPid) -Force -ErrorAction SilentlyContinue
  }
}
