param(
  [string] $InstallDir = "$env:LOCALAPPDATA\Programs\DesktopCalendar"
)

$ErrorActionPreference = "Stop"

$installPath = [System.IO.Path]::GetFullPath($InstallDir)

Get-Process -Name "DesktopCalendar" -ErrorAction SilentlyContinue | Stop-Process -Force

$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
if (Test-Path -LiteralPath $runKey) {
  Remove-ItemProperty -Path $runKey -Name "DesktopCalendar" -ErrorAction SilentlyContinue
}

$desktopShortcut = Join-Path ([Environment]::GetFolderPath("DesktopDirectory")) "Desktop Calendar.lnk"
if (Test-Path -LiteralPath $desktopShortcut) {
  Remove-Item -LiteralPath $desktopShortcut -Force
}

Set-Location $env:TEMP

if (Test-Path -LiteralPath $installPath) {
  Remove-Item -LiteralPath $installPath -Recurse -Force
}

Write-Host "Desktop Calendar uninstalled"
