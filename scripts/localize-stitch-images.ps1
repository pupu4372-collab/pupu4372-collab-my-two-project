$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sourceAssets = Join-Path $root "stitch-export\assets"
$assetDir = Join-Path $root "public\stitch"
$mapPath = Join-Path $root "stitch-export\assets\asset-map.tsv"
$publicMapPath = Join-Path $root "public\stitch\url-map.json"

New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

# Sync existing downloads into public/stitch. This script intentionally does
# not download missing images, so it stays fast and deterministic.
Get-ChildItem $sourceAssets -Filter "asset-*.jpg" | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $assetDir $_.Name) -Force
}

$urlToLocal = @{}
if (Test-Path $mapPath) {
  Get-Content $mapPath | ForEach-Object {
    if ($_ -match '^(asset-\d+\.jpg)\t(.+)$') {
      $file = $matches[1]
      $url = $matches[2].Trim()
      if ($url -notmatch '^https://lh3\.googleusercontent\.com/') { return }
      $urlToLocal[$url] = "/stitch/$file"
    }
  }
}

$files = @(
  Get-ChildItem (Join-Path $root "stitch-export") -Filter "*.html" -File
  Get-ChildItem (Join-Path $root "src") -Recurse -Include *.tsx,*.ts -File
)

$remoteUrls = New-Object System.Collections.Generic.HashSet[string]
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }
  [regex]::Matches($content, 'https://lh3\.googleusercontent\.com/[^"''\s)>]+') | ForEach-Object {
    [void]$remoteUrls.Add($_.Value)
  }
}

Write-Host "Unique remote URLs: $($remoteUrls.Count) | Mapped: $($urlToLocal.Count)"

$filesUpdated = 0
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }
  $newContent = $content
  foreach ($entry in $urlToLocal.GetEnumerator()) {
    $newContent = $newContent.Replace($entry.Key, $entry.Value)
  }
  if ($newContent -ne $content) {
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
    $filesUpdated++
  }
}

$urlToLocal.GetEnumerator() | Sort-Object Key | ForEach-Object {
  [ordered]@{ url = $_.Key; local = $_.Value }
} | ConvertTo-Json -Depth 1 | Set-Content -Path $publicMapPath

Write-Host "Synced assets to public/stitch"
Write-Host "Files updated: $filesUpdated"
