#!/usr/bin/env pwsh
# Mango Cannabis Flower Menu Builder - PowerShell Runner
# This script helps avoid the 'q' declaration issue in PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "🥭 Mango Cannabis Flower Menu Builder - Commands" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  dev       - Start development server (Vite)" -ForegroundColor Cyan
    Write-Host "  build     - Build for production" -ForegroundColor Cyan
    Write-Host "  electron  - Start Electron app" -ForegroundColor Cyan
    Write-Host "  dist      - Build and package Electron app" -ForegroundColor Cyan
    Write-Host "  clean     - Clean build directories" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\run.ps1 <command>" -ForegroundColor Yellow
    Write-Host "Example: .\run.ps1 dev" -ForegroundColor Green
}

function Run-Command {
    param([string]$NpmCommand)
    
    Write-Host "🚀 Running: npm run $NpmCommand" -ForegroundColor Green
    try {
        & npm run $NpmCommand
    }
    catch {
        Write-Host "❌ Error running command: $NpmCommand" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

switch ($Command.ToLower()) {
    "help" { Show-Help }
    "dev" { Run-Command "dev" }
    "build" { Run-Command "build" }
    "electron" { Run-Command "electron-dev" }
    "dist" { Run-Command "dist" }
    "clean" { Run-Command "clean" }
    default { 
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Show-Help 
    }
} 