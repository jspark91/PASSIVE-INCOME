param(
  [string] $InstallDir = "$env:LOCALAPPDATA\Programs\DesktopCalendar",
  [switch] $NoStartup,
  [switch] $NoLaunch
)

$ErrorActionPreference = "Stop"

function Get-FullPath([string] $Path) {
  return [System.IO.Path]::GetFullPath($Path)
}

function Test-WebView2Runtime {
  $keys = @(
    "HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
    "HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
  )

  foreach ($key in $keys) {
    if (Test-Path -LiteralPath $key) {
      return $true
    }
  }

  return $false
}

$sourceDir = Get-FullPath $PSScriptRoot
$installPath = Get-FullPath $InstallDir
$sourceExe = Join-Path $sourceDir "DesktopCalendar.exe"

if (-not (Test-Path -LiteralPath $sourceExe)) {
  throw "Cannot find DesktopCalendar.exe in $sourceDir. Extract the full zip before running this installer."
}

Get-Process -Name "DesktopCalendar" -ErrorAction SilentlyContinue | Stop-Process -Force

if ($sourceDir -ne $installPath) {
  if (Test-Path -LiteralPath $installPath) {
    Remove-Item -LiteralPath $installPath -Recurse -Force
  }

  New-Item -ItemType Directory -Force -Path $installPath | Out-Null
  Copy-Item -Path (Join-Path $sourceDir "*") -Destination $installPath -Recurse -Force
}

$exePath = Join-Path $installPath "DesktopCalendar.exe"
$shell = New-Object -ComObject WScript.Shell
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("DesktopDirectory")) "Desktop Calendar.lnk"
$shortcut = $shell.CreateShortcut($desktopShortcut)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = $installPath
$shortcut.Description = "Desktop Calendar"
$shortcut.Save()

if (-not $NoStartup) {
  $runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
  New-Item -Path $runKey -Force | Out-Null
  Set-ItemProperty -Path $runKey -Name "DesktopCalendar" -Value "`"$exePath`""
}

if (-not (Test-WebView2Runtime)) {
  Write-Warning "Microsoft Edge WebView2 Runtime was not detected. Install it from https://developer.microsoft.com/microsoft-edge/webview2/ if the app opens blank."
}

if (-not $NoLaunch) {
  Start-Process -FilePath $exePath -WorkingDirectory $installPath
}

Write-Host "Desktop Calendar installed to $installPath"
Write-Host "Shortcut created at $desktopShortcut"
if (-not $NoStartup) {
  Write-Host "Windows startup enabled for DesktopCalendar"
}
