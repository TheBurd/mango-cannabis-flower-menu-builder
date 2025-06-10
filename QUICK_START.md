# 🥭 Mango Cannabis Flower Menu Builder - Quick Start

## 🚀 Getting Started

### Easy Commands (Avoiding 'q' Declaration Issues)
Use our batch runner to avoid PowerShell issues:

```bash
# Show available commands
.\run.bat help

# Start development server
.\run.bat dev

# Build for production  
.\run.bat build

# Start Electron app
.\run.bat electron

# Build and package app
.\run.bat dist

# Clean build files
.\run.bat clean
```

### Traditional npm commands (if you prefer)
```bash
npm run dev       # Development server
npm run build     # Build for production
npm run electron-dev  # Electron development
npm run dist      # Package app
```

## ✨ New Features & Improvements

### 🎨 **App Icon & Branding**
- Now uses `appIcon.png` for all app icons and taskbar
- Proper app title: "Mango Cannabis Flower Menu Builder"
- Enhanced window management and startup experience
- Better packaging with desktop shortcuts

### 🔧 **Electron Enhancements**
- **Larger default window:** 1400x900 (was 1200x800)
- **Better window management:** Center on startup, proper focus
- **Platform-specific optimizations:** Windows/macOS improvements
- **External link handling:** Prevents security issues
- **Enhanced app metadata:** Better descriptions and packaging

### 📦 **Build Improvements**
- Multiple installer types (NSIS installer + portable)
- Better app icons for all platforms (Windows .ico, macOS .icns, Linux .png)
- Enhanced installer with desktop/start menu shortcuts
- Proper app categorization (Business/Office)

### 🛠️ **PowerShell 'q' Declaration Fix**
The 'q' declaration issue you experienced is typically caused by:

1. **PowerShell execution policy restrictions**
2. **Terminal encoding issues**
3. **npm script interactions**

**Solutions:**
- ✅ **Use our batch runner:** `.\run.bat dev` (recommended)
- ✅ **Enable PowerShell scripts:** `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- ✅ **Use cmd instead:** `cmd` then `npm run dev`

## 🎯 **Welcome Modal Features**
- **First-time setup:** Automatically guides new users to select state
- **State persistence:** Remembers your last state selection
- **Beautiful interface:** Scrollable modal with state information
- **Reset option:** Menu command to show welcome again

## 🚀 **Development Workflow**

### Quick Development
```bash
.\run.bat dev      # Start Vite dev server
.\run.bat electron # Start Electron (in another terminal)
```

### Production Build
```bash
.\run.bat dist     # Build and package everything
```

### Clean Slate
```bash
.\run.bat clean    # Remove all build files
.\run.bat build    # Fresh build
```

## 📋 **App Features**
- ✅ Multi-state compliance (Oklahoma, Michigan, New Mexico)
- ✅ Drag & drop strain management
- ✅ Professional menu exports (PNG, JPEG, CSV)
- ✅ Dynamic pricing and THC compliance
- ✅ Dark/light mode themes
- ✅ Welcome modal for first-time users
- ✅ State persistence across sessions

## 🔗 **File Structure**
```
├── assets/
│   ├── icons/
│   │   ├── appIcon.png     # Main app icon (new!)
│   │   ├── appIcon.ico     # Windows icon
│   │   └── appIcon.icns    # macOS icon
├── components/
│   ├── WelcomeModal.tsx    # First-time welcome (new!)
│   └── ...
├── run.bat                 # Easy command runner (new!)
├── run.ps1                 # PowerShell version (new!)
└── ...
```

## 💡 **Tips**
- Use `.\run.bat help` to see all available commands
- The welcome modal only shows on first launch (or after reset)
- App automatically remembers your state selection
- Better window management and startup experience
- Enhanced packaging with proper icons and shortcuts

Happy menu building! 🌿📄 