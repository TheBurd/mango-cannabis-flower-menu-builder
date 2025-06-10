@echo off
REM Mango Cannabis Flower Menu Builder - Batch Runner
REM This helps avoid PowerShell 'q' declaration issues

setlocal

if "%1"=="" (
    goto :show_help
)

if /i "%1"=="help" goto :show_help
if /i "%1"=="dev" goto :run_dev
if /i "%1"=="build" goto :run_build
if /i "%1"=="electron" goto :run_electron
if /i "%1"=="dist" goto :run_dist
if /i "%1"=="clean" goto :run_clean

echo ❌ Unknown command: %1
goto :show_help

:show_help
echo.
echo 🥭 Mango Cannabis Flower Menu Builder - Commands
echo.
echo Available commands:
echo   dev       - Start development server (Vite)
echo   build     - Build for production
echo   electron  - Start Electron app
echo   dist      - Build and package Electron app
echo   clean     - Clean build directories
echo.
echo Usage: run.bat ^<command^>
echo Example: run.bat dev
echo.
goto :end

:run_dev
echo 🚀 Starting development server...
npm run dev
goto :end

:run_build
echo 🏗️ Building for production...
npm run build
goto :end

:run_electron
echo ⚡ Starting Electron app...
npm run electron-dev
goto :end

:run_dist
echo 📦 Building and packaging app...
npm run dist
goto :end

:run_clean
echo 🧹 Cleaning build directories...
npm run clean
goto :end

:end
endlocal 