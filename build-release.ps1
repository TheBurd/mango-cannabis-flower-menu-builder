# Mango Cannabis Flower Menu Builder - Production Release Script
# This script prepares and builds a production-ready release

Write-Host "🥭 Mango Cannabis Flower Menu Builder - Production Release Build" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Yellow

# Step 1: Clean everything
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Cyan
npm run clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Clean failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Install/verify dependencies
Write-Host "📦 Verifying dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency installation failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Build web app
Write-Host "🔨 Building web application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web build failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Build Electron app (local dist only)
Write-Host "⚡ Building Electron application..." -ForegroundColor Cyan
npm run dist
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Electron build failed!" -ForegroundColor Red
    exit 1
}

# Step 5: Show results
Write-Host ""
Write-Host "✅ Production build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Build outputs:" -ForegroundColor Yellow
Write-Host "   - Web build: ./dist/" -ForegroundColor White
Write-Host "   - Installers: ./release/" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready for testing and release!" -ForegroundColor Green
Write-Host ""

# Step 6: List generated files
if (Test-Path "release") {
    Write-Host "📋 Generated release files:" -ForegroundColor Yellow
    Get-ChildItem "release" -File | ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 1)
        Write-Host "   - $($_.Name) ($size MB)" -ForegroundColor White
    }
}