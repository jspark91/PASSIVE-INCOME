param(
    [string]$ModelDir = "",
    [string]$CheckpointUrl = "https://myshell-public-repo-host.s3.amazonaws.com/openvoice/checkpoints_v2_0417.zip"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
if ([string]::IsNullOrWhiteSpace($ModelDir)) {
    $ModelDir = Join-Path $ProjectRoot "workspace\models\openvoice"
}

$ModelDir = [System.IO.Path]::GetFullPath($ModelDir)
$ZipPath = Join-Path $ModelDir "checkpoints_v2_0417.zip"
$ExtractRoot = Join-Path $ModelDir "_extract"
$TargetDir = Join-Path $ModelDir "checkpoints_v2"

New-Item -ItemType Directory -Force $ModelDir | Out-Null

Write-Host "Downloading OpenVoice V2 checkpoints to $ZipPath"
Invoke-WebRequest -UseBasicParsing -Uri $CheckpointUrl -OutFile $ZipPath

if (Test-Path $ExtractRoot) {
    Remove-Item -LiteralPath $ExtractRoot -Recurse -Force
}
New-Item -ItemType Directory -Force $ExtractRoot | Out-Null

Write-Host "Extracting checkpoint archive"
Expand-Archive -LiteralPath $ZipPath -DestinationPath $ExtractRoot -Force

$ExtractedCheckpoint = Get-ChildItem -Path $ExtractRoot -Directory -Recurse |
    Where-Object { $_.Name -eq "checkpoints_v2" } |
    Select-Object -First 1

if ($null -eq $ExtractedCheckpoint) {
    throw "Could not find checkpoints_v2 in extracted archive."
}

if (Test-Path $TargetDir) {
    Remove-Item -LiteralPath $TargetDir -Recurse -Force
}

Move-Item -LiteralPath $ExtractedCheckpoint.FullName -Destination $TargetDir
Remove-Item -LiteralPath $ExtractRoot -Recurse -Force

Write-Host "OpenVoice V2 checkpoints are ready at $TargetDir"
