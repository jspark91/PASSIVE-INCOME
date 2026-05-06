$ErrorActionPreference = "Stop"

$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$PreviousPythonPath = $env:PYTHONPATH
$env:PYTHONPATH = Join-Path $ProjectRoot ""

try {
    Push-Location $ProjectRoot
    python -m compileall -q app tests
    python -m unittest discover -s tests
}
finally {
    Pop-Location
    $env:PYTHONPATH = $PreviousPythonPath
}
