# 🥭 Mango Cannabis Flower Menu Builder v1.0.2

**Critical Bug Fix Release!** 🐛 **CSV Import Functionality Completely Restored**

## 🆕 What's New in v1.0.2

### 🐛 **Critical Bug Fix - Input Fields Restored**
- **Input Fields Fixed** - All text inputs now work properly after CSV import (strain names, grower, THC, filename, etc.)
- **Improved UX** - Added smooth loading overlay and success notifications instead of popup alerts
- **Better Performance** - Eliminated page reloads for faster, more reliable CSV import process
- **Data Integrity** - CSV import now preserves all data without clearing or corruption
- **Enhanced Stability** - Resolved Electron-specific state management issues for production builds

**Technical Details**: Fixed React state synchronization conflicts in Electron production builds that broke input focus and typing functionality. The issue was caused by `flushSync` and page reload mechanisms that disrupted React's event handling in the Electron environment. The new implementation uses direct state updates with loading overlays for a smoother, more reliable experience.

---

## 🔄 **Previous Update - v1.0.1 Features**

### 🎨 **Layout Enhancements**
- **6-Column Support** - Create ultra-wide menus for large displays and digital screens
- **Sequential Shelf Filling** - Shelves now fill columns left-to-right instead of balancing heights for better organization
- **Optimized 16:9 Dimensions** - Perfect artboard sizing for digital screens (3300x1856px landscape, 1872x3328px portrait)
- **Default Shelf Splitting** - New menus now have shelf splitting enabled by default for better content distribution

### 🖥️ **Artboard & Display Improvements**
- **Smart Overflow Detection** - Visual warnings when content extends beyond artboard boundaries
- **Enhanced Zoom Controls** - Mouse-position-based scroll zooming for precision navigation around your cursor
- **Improved Artboard Positioning** - True center alignment with better visual feedback
- **Overflow Warning Overlay** - Clear indicators when content needs adjustment

### 👤 **User Experience Enhancements**
- **"What's New" Modal** - Comprehensive changelog and feature announcements with smart notifications
- **Smart Notification System** - Tracks viewed versions with subtle glow animations for new updates
- **Enhanced Feedback System** - Upload screenshots of issues (up to 3 images, 5MB each) with drag & drop support
- **Modal Blur Effects** - Beautiful depth-of-field backgrounds for focused interactions
- **Updated Instructions** - Comprehensive help documentation with v1.0.1 feature information

### 🔧 **Technical Improvements**
- **Performance Optimizations** - Faster rendering and smoother interactions
- **Bug Fixes** - Resolved zoom scaling issues and overflow detection accuracy
- **UI Polish** - Consistent styling and improved visual hierarchy
- **Better Memory Management** - Improved image preview cleanup and event handling

---

## 📥 Download & Install

### 🪟 **Windows Installation**

#### **🎯 Recommended: Full Installer**
- **`Mango-Cannabis-Flower-Menu-Builder-Setup-WIN-1.0.2-x64.exe`** *(~81 MB)*
- Creates Start menu shortcuts, handles updates automatically
- Just double-click to install, then launch from Start menu

#### **⚡ Alternative: Portable App**
- **`Mango-Cannabis-Flower-Menu-Builder-WIN-1.0.2-x64.exe`** *(~81 MB)*
- No installation required - Just download and run directly
- Good for testing or if you can't install software

#### **📦 ZIP Archive**
- **`Mango-Cannabis-Flower-Menu-Builder-WIN-1.0.2-x64.zip`** *(~110 MB)*
- Contains the portable app in a compressed archive
- Extract and run the `.exe` file inside

**⚠️ Windows Security Note:** On first launch, you may see a security warning. Click **"More info"** then **"Run anyway"** to launch the app.

---

### 🍎 **macOS Installation**

#### **🎯 Recommended: DMG Installer**

**For Intel Macs (2020 and earlier):**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.0.2-x64.dmg`** *(~105 MB)*

**For Apple Silicon Macs (M1/M2/M3):**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.0.2-arm64.dmg`** *(~100 MB)*

#### **⚡ Alternative: ZIP Archive**

**For Intel Macs:**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.0.2-x64.zip`** *(~101 MB)*

**For Apple Silicon Macs:**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.0.2-arm64.zip`** *(~96 MB)*

**Installation Steps:**
1. **DMG**: Double-click the `.dmg` file → Drag app to Applications folder → Launch from Applications
2. **ZIP**: Double-click the `.zip` file → Move extracted app to Applications folder → Launch from Applications

**⚠️ macOS Security Note:** On first launch, you may see a security warning. Go to **System Preferences → Security & Privacy → General** and click **"Open Anyway"** to run the app.

---

## 🌟 Core Features
- **CSV Import/Export** - Now fully functional after import operations
- **6-column layout support** - Perfect for ultra-wide displays
- **Multi-state compliance** (Oklahoma, Michigan, New Mexico)
- **Professional menu design** with Mango Cannabis branding
- **High-quality PNG/JPEG export** for printing and digital displays
- **Live preview** with enhanced pan/zoom controls
- **Dark/light theme support**
- **Image feedback system** - Report issues with visual proof
- **Smart notifications** - Stay informed about new features

## 🚀 **Upgrade from v1.0.1**
- **Critical Fix**: v1.0.2 resolves the CSV import issue that prevented strain/shelf modifications
- **Automatic Updates**: The app will notify you when v1.0.2 is available
- **Manual Download**: Download the new version using the links above
- **Settings Preserved**: Your preferences and theme settings will be maintained

## 🆘 **Need Help?**
- **In-App Help**: Click the **?** button in the header for comprehensive instructions
- **Bug Reports**: Use the enhanced feedback system with image attachments (Help → Instructions → Leave Feedback)
- **Direct Contact**: Email [brad@mangocannabis.com](mailto:brad@mangocannabis.com)

Built specifically for Mango Cannabis Management team.

---

## 🔧 Technical Files

The following files support the auto-update system and are required for the app to function properly:
- `*.blockmap` files - For efficient delta updates
- `latest-mac.yml` - macOS update metadata  
- `latest.yml` - Windows update metadata

**Note:** Download only the main installer/app files above. The technical files are automatically used by the app's update system.

---

## 📋 **Full Changelog**

### v1.0.2 - Critical Bug Fix
#### Fixed
- **Input Field Responsiveness** - All text inputs now work properly after CSV import (strain names, grower, THC, filename, etc.)
- **React State Synchronization** - Resolved conflicts in Electron production builds that broke input focus and typing
- **CSV Import Process** - Eliminated page reloads and `flushSync` issues that disrupted React event handling
- **Data Persistence** - CSV import now preserves all data without clearing or corruption

#### Improved
- **Loading UX** - Added smooth loading overlay during CSV import process
- **Success Notifications** - Replaced popup alerts with elegant toast notifications
- **Performance** - Faster CSV import without page reload delays
- **Stability** - Enhanced reliability in Electron production environment

### v1.0.1 - Enhanced User Experience Release
#### Added
- 6-column layout support for ultra-wide menus
- Sequential shelf filling (left-to-right column distribution)
- Smart overflow detection with visual warnings
- Mouse-position-based scroll zooming
- Image upload support in feedback system (up to 3 images, 5MB each)
- "What's New" modal with comprehensive changelog
- Smart notification system with version tracking
- Modal blur effects for better focus
- Enhanced instructions with v1.0.1 features

#### Improved
- Artboard positioning now truly centered
- Zoom controls more precise and intuitive
- Overflow detection accuracy (90% threshold, 8+ strain minimum)
- Preview panel flex layout for proper resizing
- Memory management for image previews
- UI consistency and visual hierarchy

#### Fixed
- Passive event listener issues with wheel zoom
- Infinite loop in FeedbackPopup image cleanup
- Double scaling issues in zoom functionality
- Artboard centering around proper coordinates

#### Technical
- Optimized 16:9 artboard dimensions (3300x1856px landscape, 1872x3328px portrait)
- Default shelf splitting enabled for new menus
- Enhanced error handling and user feedback
- Improved performance and rendering speed 