$ErrorActionPreference = 'Stop'

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) {
  $nodeCommand.Source
} else {
  Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}

if (-not (Test-Path -LiteralPath $nodePath)) {
  throw 'No se encontró Node.js para actualizar el catálogo.'
}

$scriptPath = Join-Path $PSScriptRoot 'update-lumbreras-catalog.mjs'
& $nodePath $scriptPath
if ($LASTEXITCODE -ne 0) {
  throw 'No se pudo actualizar el catálogo Lumbreras.'
}
