@echo off
echo ================================================================
echo             DEBUG: Windows Shortcut Icon Analysis
echo ================================================================
echo.

echo Checking Start Menu shortcut...
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Mango Cannabis\Mango Cannabis Flower Menu Builder.lnk" (
    echo ✓ User Start Menu shortcut exists
) else (
    echo ✗ User Start Menu shortcut NOT found
)

if exist "%ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs\Mango Cannabis\Mango Cannabis Flower Menu Builder.lnk" (
    echo ✓ All Users Start Menu shortcut exists  
) else (
    echo ✗ All Users Start Menu shortcut NOT found
)

echo.
echo Checking installation directory...
if exist "%LOCALAPPDATA%\Programs\Mango Cannabis Flower Menu Builder\Mango Cannabis Flower Menu Builder.exe" (
    echo ✓ App executable found (User install)
    dir "%LOCALAPPDATA%\Programs\Mango Cannabis Flower Menu Builder\assets\icons\appIcon.ico" 2>nul && echo ✓ ICO file found in app dir || echo ✗ ICO file NOT found in app dir
) else if exist "%PROGRAMFILES%\Mango Cannabis Flower Menu Builder\Mango Cannabis Flower Menu Builder.exe" (
    echo ✓ App executable found (System install)
    dir "%PROGRAMFILES%\Mango Cannabis Flower Menu Builder\assets\icons\appIcon.ico" 2>nul && echo ✓ ICO file found in app dir || echo ✗ ICO file NOT found in app dir
) else (
    echo ✗ App executable NOT found in common locations
)

echo.
echo Registry check...
echo   HKCU DefaultIcon:
reg query "HKCU\SOFTWARE\Classes\Applications\Mango Cannabis Flower Menu Builder.exe\DefaultIcon" 2>nul && echo o" Registry icon entry exists (HKCU) || echo o- Registry icon entry missing (HKCU)
reg query "HKLM\SOFTWARE\Classes\Applications\Mango Cannabis Flower Menu Builder.exe\DefaultIcon" 2>nul && echo ✓ Registry icon entry exists || echo ✗ Registry icon entry missing

echo.
echo ================================================================
echo SOLUTION: If shortcut exists but has wrong icon, the issue is
echo that the existing shortcut is pointing to old icon data.
echo The new installer should fix this by recreating shortcuts.
echo ================================================================
pause
