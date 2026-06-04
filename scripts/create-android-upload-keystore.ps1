# Creates Play Console upload keystore + android/keystore.properties (local only).
# Usage:
#   .\scripts\create-android-upload-keystore.ps1 -StorePassword "your-store-pass" -KeyPassword "your-key-pass"

param(
  [Parameter(Mandatory = $true)]
  [string]$StorePassword,
  [Parameter(Mandatory = $true)]
  [string]$KeyPassword
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $root "android"
$keystorePath = Join-Path $androidDir "ksajupet-upload.keystore"
$propsPath = Join-Path $androidDir "keystore.properties"

$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $keytool) {
  $jdk21 = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot\bin\keytool.exe"
  if (Test-Path $jdk21) { $keytool = $jdk21 } else { throw "keytool not found. Install JDK 21." }
}

if (Test-Path $keystorePath) {
  throw "Keystore already exists: $keystorePath"
}

$dname = "CN=K-Saju Pet, OU=Mobile, O=KsajuPet, L=Seoul, ST=Seoul, C=KR"
& $keytool -genkeypair -v -storetype PKCS12 -keystore $keystorePath -alias upload `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -storepass $StorePassword -keypass $KeyPassword -dname $dname

@"
storeFile=ksajupet-upload.keystore
storePassword=$StorePassword
keyAlias=upload
keyPassword=$KeyPassword
"@ | Set-Content -Path $propsPath -Encoding UTF8

Write-Host "Created:"
Write-Host "  $keystorePath"
Write-Host "  $propsPath"
Write-Host ""
Write-Host "Back up the keystore and passwords securely. Loss = cannot update the app on Play."
