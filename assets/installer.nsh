; Mango Cannabis Flower Menu Builder - Custom NSIS Installer Enhancements
; This script adds custom installer behavior to electron-builder's default NSIS installer

; Custom welcome page text
!define MUI_WELCOMEPAGE_TITLE "Welcome to Mango Cannabis Menu Builder"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of Mango Cannabis Flower Menu Builder.$\r$\n$\r$\nProfessional cannabis flower menu builder with dynamic pricing, state compliance, and beautiful export capabilities.$\r$\n$\r$\nClick Next to continue."

; Finish page customizations with more professional messaging
!define MUI_FINISHPAGE_TITLE "Installation Complete!"
!define MUI_FINISHPAGE_TEXT "Mango Cannabis Flower Menu Builder has been successfully installed.$\r$\n$\r$\nYou can now create professional cannabis menus with state compliance features, dynamic pricing, and beautiful export options.$\r$\n$\r$\nClick Finish to close this wizard."

; NSIS installer customizations for Mango Cannabis Flower Menu Builder
; This script adds a GitHub releases link to the Start Menu

!macro customInstall
    ; Create a link to GitHub releases in the Start Menu
    CreateDirectory "$SMPROGRAMS\Mango Cannabis"
    CreateShortcut "$SMPROGRAMS\Mango Cannabis\Visit GitHub Releases.lnk" "https://github.com/TheBurd/mango-cannabis-flower-menu-builder/releases" "" "" "" SW_SHOWNORMAL "" "Check for updates and download releases from GitHub"
!macroend

!macro customUnInstall
    ; Remove the GitHub releases link
    Delete "$SMPROGRAMS\Mango Cannabis\Visit GitHub Releases.lnk"
    RMDir "$SMPROGRAMS\Mango Cannabis"
!macroend 