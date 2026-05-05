param(
  [string] $Version = "0.1.0",
  [string[]] $Runtimes = @("win-x64"),
  [string] $Configuration = "Release",
  [switch] $NoBuild
)

$ErrorActionPreference = "Stop"

function Assert-ChildPath([string] $Root, [string] $Path) {
  $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
  $pathFull = [System.IO.Path]::GetFullPath($Path)

  if (-not $pathFull.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to operate outside $rootFull`: $pathFull"
  }
}

$root = Split-Path -Parent $PSScriptRoot
$project = Join-Path $root "windows-host\DesktopCalendar.Host\DesktopCalendar.Host.csproj"
$installerDir = Join-Path $root "installer"
$artifactRoot = Join-Path $root "artifacts"
$publishRoot = Join-Path $artifactRoot "publish"
$stageRoot = Join-Path $artifactRoot "packages"
$distDir = Join-Path $root "dist"
$resolvedRuntimes = @($Runtimes | ForEach-Object {
  $_ -split ","
} | ForEach-Object {
  $_.Trim()
} | Where-Object {
  $_
})

if ($resolvedRuntimes.Count -eq 0) {
  throw "At least one runtime is required"
}

foreach ($path in @($project, $installerDir)) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Cannot find $path"
  }
}

$pathsToReset = @($stageRoot, $distDir)
if (-not $NoBuild) {
  $pathsToReset += $publishRoot
}

foreach ($path in $pathsToReset) {
  Assert-ChildPath $root $path
  if (Test-Path -LiteralPath $path) {
    Remove-Item -LiteralPath $path -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $path | Out-Null
}

if ($NoBuild) {
  New-Item -ItemType Directory -Force -Path $publishRoot | Out-Null
}

$createdPackages = @()

foreach ($runtime in $resolvedRuntimes) {
  $publishDir = Join-Path $publishRoot $runtime
  $packageName = "DesktopCalendar-$Version-$runtime"
  $stageDir = Join-Path $stageRoot $packageName
  $zipPath = Join-Path $distDir "$packageName.zip"

  Assert-ChildPath $root $publishDir
  Assert-ChildPath $root $stageDir
  Assert-ChildPath $root $zipPath

  if (-not $NoBuild) {
    dotnet publish $project `
      --configuration $Configuration `
      --runtime $runtime `
      --self-contained true `
      --output $publishDir `
      -p:PublishSingleFile=false `
      -p:Version=$Version `
      -p:FileVersion="$Version.0" `
      -p:AssemblyVersion="$Version.0"
  }

  if (-not (Test-Path -LiteralPath (Join-Path $publishDir "DesktopCalendar.exe"))) {
    throw "Publish output for $runtime is missing DesktopCalendar.exe"
  }

  New-Item -ItemType Directory -Force -Path $stageDir | Out-Null
  Copy-Item -Path (Join-Path $publishDir "*") -Destination $stageDir -Recurse -Force
  Copy-Item -Path (Join-Path $installerDir "*") -Destination $stageDir -Recurse -Force

  $packageInfo = @"
Desktop Calendar $Version
Runtime: $runtime
Built: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")

Run Install-DesktopCalendar.ps1 to install.
"@
  Set-Content -LiteralPath (Join-Path $stageDir "PACKAGE.txt") -Value $packageInfo -Encoding UTF8

  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }

  Compress-Archive -Path (Join-Path $stageDir "*") -DestinationPath $zipPath -Force
  $hash = Get-FileHash -LiteralPath $zipPath -Algorithm SHA256
  $createdPackages += [pscustomobject]@{
    Runtime = $runtime
    Path = $zipPath
    Sha256 = $hash.Hash
  }
}

$hashLines = $createdPackages | ForEach-Object {
  "$($_.Sha256)  $(Split-Path -Leaf $_.Path)"
}
Set-Content -LiteralPath (Join-Path $distDir "SHA256SUMS.txt") -Value $hashLines -Encoding ASCII

$manifest = [pscustomobject]@{
  name = "Desktop Calendar"
  version = $Version
  builtAt = (Get-Date).ToUniversalTime().ToString("o")
  packages = @($createdPackages | ForEach-Object {
    [pscustomobject]@{
      runtime = $_.Runtime
      file = (Split-Path -Leaf $_.Path)
      sha256 = $_.Sha256
    }
  })
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $distDir "release-manifest.json") -Encoding UTF8

Write-Host "Created Desktop Calendar packages:"
$createdPackages | ForEach-Object {
  Write-Host " - $($_.Path)"
}
