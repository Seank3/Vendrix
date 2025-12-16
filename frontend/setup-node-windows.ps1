# PowerShell script to download and setup Node.js on Windows (portable)
# Run this script in PowerShell: .\setup-node-windows.ps1

$NODE_VERSION = "v20.6.0"
$NODE_DIR = "node-${NODE_VERSION}-win-x64"
$ZIP_FILE = "${NODE_DIR}.zip"
$NODE_URL = "https://nodejs.org/dist/${NODE_VERSION}/${ZIP_FILE}"

Write-Host "📦 Downloading Node.js ${NODE_VERSION}..." -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $NODE_URL -OutFile $ZIP_FILE -UseBasicParsing
    Write-Host "✅ Download complete" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Extracting..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $ZIP_FILE -DestinationPath "." -Force
    Write-Host "✅ Extraction complete" -ForegroundColor Green
} catch {
    Write-Host "❌ Extraction failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Node.js extracted to ${NODE_DIR}\" -ForegroundColor Green
Write-Host ""

# Add to PATH for current session
$env:PATH = "$PWD\${NODE_DIR};$env:PATH"

Write-Host "Verifying installation..." -ForegroundColor Cyan
try {
    $nodeVersion = & "$PWD\${NODE_DIR}\node.exe" -v
    $npmVersion = & "$PWD\${NODE_DIR}\npm.cmd" -v
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Verification failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 To use Node.js in this PowerShell session, it's already added to PATH" -ForegroundColor Yellow
Write-Host ""
Write-Host "To make it permanent, add to your PowerShell profile:" -ForegroundColor Yellow
Write-Host "  `$env:PATH = `"$PWD\${NODE_DIR};`$env:PATH`"" -ForegroundColor Gray
Write-Host ""
Write-Host "Or add manually via System Properties > Environment Variables" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Setup complete! Now run:" -ForegroundColor Green
Write-Host "  cd frontend" -ForegroundColor Cyan
Write-Host "  npm install" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan

