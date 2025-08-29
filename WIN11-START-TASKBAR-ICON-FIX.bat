@echo off
echo ================================================================
echo    Windows 11 Start Menu Search & Taskbar Icon Fix
echo ================================================================
echo.

echo Step 1: Killing Windows 11 specific processes...
taskkill /f /im explorer.exe >nul 2>&1
taskkill /f /im SearchHost.exe >nul 2>&1
taskkill /f /im StartMenuExperienceHost.exe >nul 2>&1
taskkill /f /im SearchUI.exe >nul 2>&1
taskkill /f /im Cortana.exe >nul 2>&1

echo Step 2: Clearing Windows 11 Start Menu search cache...
rd /s /q "%localappdata%\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\TempState" >nul 2>&1
rd /s /q "%localappdata%\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\LocalState" >nul 2>&1

echo Step 3: Clearing Windows 11 Search app cache...
rd /s /q "%localappdata%\Packages\Microsoft.Windows.Search_cw5n1h2txyewy\LocalState" >nul 2>&1
rd /s /q "%localappdata%\Packages\Microsoft.Windows.Search_cw5n1h2txyewy\TempState" >nul 2>&1

echo Step 4: Clearing taskbar icon cache...
del /f /s /q "%localappdata%\Microsoft\Windows\Explorer\*taskbar*" >nul 2>&1
del /f /s /q "%appdata%\Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar\*" >nul 2>&1

echo Step 5: Registry refresh for Windows 11 Start Menu...
reg delete "HKEY_CURRENT_USER\Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\Repository\Packages" /f >nul 2>&1

echo Step 6: Restarting Windows 11 shell...
start explorer.exe
timeout /t 5 /nobreak >nul

echo Step 7: Forcing Start Menu database refresh...
powershell -Command "Get-AppxPackage Microsoft.Windows.StartMenuExperienceHost | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register \"$($_.InstallLocation)\AppXManifest.xml\"}" >nul 2>&1

echo.
echo ================================================================
echo Windows 11 icon refresh complete!
echo ================================================================
echo.
echo IMPORTANT: Now do these steps manually:
echo.
echo 1. Right-click on taskbar and select "Taskbar settings"
echo 2. Unpin the old app icon if it's pinned
echo 3. Search for "Mango" in Start Menu
echo 4. Right-click the app and "Pin to taskbar" again
echo.
echo This forces Windows 11 to create a fresh taskbar entry
echo with the correct icon from the newly installed app.
echo.
pause