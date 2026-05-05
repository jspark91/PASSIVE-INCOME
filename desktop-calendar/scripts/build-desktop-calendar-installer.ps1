param(
  [string] $Configuration = "Release",
  [string] $Runtime = "win-x64",
  [switch] $FrameworkDependent
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$project = Join-Path $root "windows-host\DesktopCalendar.Host\DesktopCalendar.Host.csproj"
$publishDir = Join-Path $root "artifacts\publish\$Runtime"

if (-not (Test-Path -LiteralPath $project)) {
  throw "Cannot find $project"
}

$selfContained = -not $FrameworkDependent

dotnet publish $project `
  --configuration $Configuration `
  --runtime $Runtime `
  --self-contained $selfContained `
  --output $publishDir `
  -p:PublishSingleFile=false

Write-Host "Published Desktop Calendar to $publishDir"
