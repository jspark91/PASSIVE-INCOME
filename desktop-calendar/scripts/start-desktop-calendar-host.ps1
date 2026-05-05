$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$project = Join-Path $root "windows-host\DesktopCalendar.Host\DesktopCalendar.Host.csproj"

if (-not (Test-Path -LiteralPath $project)) {
  throw "Cannot find $project"
}

dotnet run --project $project
