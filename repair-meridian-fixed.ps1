param(
  [string]$ProjectPath = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

$ProjectPath = (Resolve-Path $ProjectPath).Path
$PatchRoot = Join-Path $PSScriptRoot "patch"

if (-not (Test-Path (Join-Path $ProjectPath "package.json"))) {
  throw "This is not the project root: $ProjectPath"
}

if (-not (Test-Path $PatchRoot)) {
  throw "The patch folder is missing next to repair-meridian.ps1: $PatchRoot"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $ProjectPath ".meridian-repair-backup-$timestamp"

Write-Host ""
Write-Host "Meridian repair" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath"
Write-Host "Patch:   $PatchRoot"
Write-Host "Backup:  $backupRoot"
Write-Host ""

$legacyRoutes = @(
  "src/app/onderzoek/tegenspraak",
  "src/app/artikelen/ceuta-mei-2021"
)

foreach ($legacy in $legacyRoutes) {
  $legacyPath = Join-Path $ProjectPath $legacy

  if (Test-Path -LiteralPath $legacyPath) {
    $backupPath = Join-Path $backupRoot $legacy
    New-Item -ItemType Directory -Force -Path (Split-Path $backupPath) | Out-Null
    Copy-Item -LiteralPath $legacyPath -Destination $backupPath -Recurse -Force
    Remove-Item -LiteralPath $legacyPath -Recurse -Force
    Write-Host "Removed old fixed route: $legacy"
  }
}

$files = Get-ChildItem -LiteralPath $PatchRoot -Recurse -File

foreach ($file in $files) {
  $relative = $file.FullName.Substring($PatchRoot.Length)
  $relative = $relative.TrimStart([char]92, [char]47)
  $destination = Join-Path $ProjectPath $relative

  if (Test-Path -LiteralPath $destination) {
    $backup = Join-Path $backupRoot $relative
    New-Item -ItemType Directory -Force -Path (Split-Path $backup) | Out-Null
    Copy-Item -LiteralPath $destination -Destination $backup -Force
  }

  New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
  Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
  Write-Host "Copied: $relative"
}

$nextPath = Join-Path $ProjectPath ".next"

if (Test-Path -LiteralPath $nextPath) {
  Remove-Item -LiteralPath $nextPath -Recurse -Force
  Write-Host "Removed .next cache"
}

Write-Host ""
Write-Host "Repair complete." -ForegroundColor Green
Write-Host ""
Write-Host "Run these checks:"
Write-Host 'Test-Path -LiteralPath "src/app/data/research.ts"'
Write-Host 'Test-Path -LiteralPath "src/app/components/homepage/FeaturedResearch.tsx"'
Write-Host 'Test-Path -LiteralPath "src/app/onderzoek/[slug]/page.tsx"'
Write-Host 'Test-Path -LiteralPath "src/app/components/Layout/SiteHeader.tsx"'
Write-Host ""
Write-Host "Then run:"
Write-Host "npm run dev"
