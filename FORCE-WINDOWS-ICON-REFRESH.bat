@echo off
echo ================================================================
echo         FORCE WINDOWS ICON REFRESH - Run as Administrator
echo ================================================================
echo.

echo Step 1: Killing Windows processes...
taskkill /f /im explorer.exe >nul 2>&1
taskkill /f /im SearchUI.exe >nul 2>&1
taskkill /f /im StartMenuExperienceHost.exe >nul 2>&1

echo Step 2: Clearing all icon caches...
del /f /s /q "%localappdata%\IconCache.db" >nul 2>&1
del /f /s /q "%localappdata%\Microsoft\Windows\Explorer\iconcache*" >nul 2>&1
del /f /s /q "%localappdata%\Microsoft\Windows\Explorer\thumbcache*" >nul 2>&1

echo Step 3: Clearing Start Menu cache...
del /f /s /q "%localappdata%\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\TempState\*" >nul 2>&1

echo Step 4: Clearing Search index cache...
del /f /s /q "%localappdata%\Packages\Microsoft.Windows.Search_cw5n1h2txyewy\LocalState\*" >nul 2>&1

echo Step 5: Registry refresh for file associations...
reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.exe\UserChoice" /f >nul 2>&1

echo Step 6: Rebuilding icon database...
ie4uinit.exe -show >nul 2>&1

echo Step 7: Restarting Windows processes...
start explorer.exe
timeout /t 3 /nobreak >nul

echo.
echo ================================================================
echo Icon refresh complete! Please wait 30-60 seconds for Windows
echo to rebuild the search index and icon cache.
echo ================================================================
echo.
echo Try searching for "Mango" or "Cannabis" in Windows Search now.
echo If still showing old icon, try:
echo 1. Reboot your computer (nuclear option)
echo 2. Clear Windows Search completely (see instructions below)
echo.
pause

echo.
echo ================================================================
echo         NUCLEAR OPTION: Complete Search Index Rebuild
echo ================================================================
echo If icon still not showing, run these commands manually:
echo.
echo 1. Open PowerShell as Administrator and run:
echo    Get-WindowsCapability -Online ^| Where-Object Name -like 'Microsoft.Windows.Search*' ^| Remove-WindowsCapability -Online
echo    Add-WindowsCapability -Online -Name 'Microsoft.Windows.Search~~~~0.0.1.0'
echo.
echo 2. Or go to Settings ^> Search ^> Searching Windows ^> Advanced Search Indexer Settings
echo    Click "Advanced" ^> "Rebuild"
echo.
pause