$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root "index.html"

if (-not (Test-Path -LiteralPath $indexPath)) {
  throw "Cannot find $indexPath"
}

$resolvedIndex = (Resolve-Path -LiteralPath $indexPath).Path
$fileUrl = ([System.Uri]$resolvedIndex).AbsoluteUri

$edge = Get-Command msedge.exe -ErrorAction SilentlyContinue
$edgeCandidates = @(
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)
$edgePath = $null

if ($edge) {
  $edgePath = $edge.Source
} else {
  foreach ($candidate in $edgeCandidates) {
    if ($candidate -and (Test-Path -LiteralPath $candidate)) {
      $edgePath = $candidate
      break
    }
  }
}

if ($edgePath) {
  Start-Process -FilePath $edgePath -ArgumentList @("--app=$fileUrl", "--start-maximized")
  exit 0
}

Start-Process -FilePath "explorer.exe" -ArgumentList $fileUrl
