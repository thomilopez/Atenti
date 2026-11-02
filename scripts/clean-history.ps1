<#
.SYNOPSIS
  Limpia del historial de git las Google API keys (AIzaSy...) y fuerza el push.

.REQUISITO
  git-filter-repo (el script lo instala con pip si falta).

.ADVERTENCIA
  Reescribe TODO el historial y cambia los hashes de los commits.
  Después hay que forzar el push y TODO el equipo debe re-clonar el repo
  (no alcanza con pull). Hacelo con el working tree limpio.

.EJEMPLO
  powershell -ExecutionPolicy Bypass -File scripts/clean-history.ps1
  powershell -ExecutionPolicy Bypass -File scripts/clean-history.ps1 -Yes
#>
param(
  [string]$RemoteUrl = "https://github.com/thomilopez/Atenti.git",
  [switch]$Yes
)

$ErrorActionPreference = "Stop"

Write-Host "== Limpieza de historial de git ==" -ForegroundColor Cyan

# 1) Working tree limpio (sin cambios en archivos trackeados)
$status = git status --porcelain --untracked-files=no
if ($status) {
  Write-Error "Hay cambios sin commitear en archivos trackeados. Commit o descartá antes de continuar."
  exit 1
}

# 2) Asegurar git-filter-repo
try {
  git filter-repo --version | Out-Null
} catch {
  Write-Host "Instalando git-filter-repo..." -ForegroundColor Yellow
  pip install git-filter-repo
}

# 3) Archivo temporal con la regla de reemplazo (regex para cualquier Google API key)
$replacements = Join-Path $env:TEMP "atenti-replacements.txt"
@'
regex:AIzaSy[A-Za-z0-9_-]{33}==>REMOVED
'@ | Set-Content -LiteralPath $replacements -Encoding UTF8

# 4) Confirmación
if (-not $Yes) {
  Write-Host ""
  Write-Host "ESTO REESCRIBE TODO EL HISTORIAL Y CAMBIA LOS HASHES." -ForegroundColor Yellow
  Write-Host "Luego: force-push y todo el equipo debe re-clonar el repo." -ForegroundColor Yellow
  $resp = Read-Host "Escribí SI para continuar"
  if ($resp -ne "SI") {
    Remove-Item -LiteralPath $replacements -ErrorAction SilentlyContinue
    Write-Host "Cancelado."
    exit 0
  }
}

# 5) Reescribir historial
Write-Host "Reescribiendo historial..." -ForegroundColor Cyan
git filter-repo --replace-text $replacements --force
Remove-Item -LiteralPath $replacements -ErrorAction SilentlyContinue

# 6) Restaurar remoto y forzar push
Write-Host "Restaurando remoto y forzando push..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $RemoteUrl
git push --force --all origin
git push --force --tags origin

Write-Host ""
Write-Host "Listo. Historial reescrito y pusheado." -ForegroundColor Green
Write-Host "Avisá al equipo que haga un 'git clone' nuevo (no pull)." -ForegroundColor Yellow
Write-Host "Verificá que ya no queden keys: git grep -n AIzaSy" -ForegroundColor Yellow
