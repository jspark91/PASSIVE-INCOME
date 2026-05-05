param(
  [string] $InstallDir = "$env:LOCALAPPDATA\Programs\DesktopCalendar",
  [switch] $NoBuild
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$runtime = "win-x64"
$publishDir = Join-Path $root "artifacts\publish\$runtime"
$buildScript = Join-Path $PSScriptRoot "build-desktop-calendar-installer.ps1"

if (-not $NoBuild) {
  & $buildScript -Runtime $runtime
}

if (-not (Test-Path -LiteralPath $publishDir)) {
  throw "Cannot find publish output at $publishDir"
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item -Path (Join-Path $publishDir "*") -Destination $InstallDir -Recurse -Force

$exePath = Join-Path $InstallDir "DesktopCalendar.exe"
if (-not (Test-Path -LiteralPath $exePath)) {
  throw "Cannot find installed executable at $exePath"
}

$shell = New-Object -ComObject WScript.Shell
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("DesktopDirectory")) "Desktop Calendar.lnk"
$shortcut = $shell.CreateShortcut($desktopShortcut)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = $InstallDir
$shortcut.Description = "Desktop Calendar"
$shortcut.Save()

$runKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
New-Item -Path $runKey -Force | Out-Null
Set-ItemProperty -Path $runKey -Name "DesktopCalendar" -Value "`"$exePath`""

Start-Process -FilePath $exePath -WorkingDirectory $InstallDir

Write-Host "Installed Desktop Calendar to $InstallDir"
Write-Host "Created shortcut: $desktopShortcut"
Write-Host "Enabled Windows startup: DesktopCalendar"
