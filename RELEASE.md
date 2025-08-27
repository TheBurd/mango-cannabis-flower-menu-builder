# 🥭 Mango Cannabis Flower Menu Builder v1.1.0

**Major Feature Release** - Complete Pre-Packaged Menu System, Enhanced CSV Workflows & Improved UX

## 🆕 What's New in v1.1.0

### 📦 **Complete Pre-Packaged Menu System** - **Dedicated Pre-Packaged Mode** - Parallel menu system designed for pre-packaged cannabis products
- **Weight-Based Organization** - Categorization by 3.5g (Eighths), 7g (Quarters), 14g (Half), 28g (Ounces)
- **Product Management** - Brand emphasis, low stock indicators, terpene percentages, net weight specifications
- **Table Layout** - Multi-column product tables with responsive design and visual hierarchy
- **Zoom & Pan Canvas** - Full navigation controls with mouse wheel zoom and drag panning
- **State-Specific Integration** - Currently available for Oklahoma with Michigan/New Mexico support planned

### 🏗️ **Weight-Based Organization System** - **Weight Categories** - Automatic organization by standard cannabis weights (3.5g, 7g, 14g, 28g)
- **Organization Modes** - Weight-first, Brand-first, or Price-first organization strategies
- **Sorting & Filtering** - Dual-level sorting with inventory priority and brand emphasis
- **Visual Headers** - Color-coded weight sections with product counts and professional styling
- **Product Separation** - Automatic separation of flower vs shake/trim products

### 📋 **Rebuilt CSV Import/Export System** - **Guided Import Wizard** - 4-stage process: Upload → Smart Mapping → Real-time Validation → Import Complete
- **Intelligent Auto-Detection** - Recognizes Bulk vs Pre-Packaged formats with automatic mode switching suggestions
- **Smart Field Mapping** - Fuzzy column matching with comprehensive alias support ("THC %" matches "thc percent")
- **Mode-Aware Field Sets** - Different field configurations for Bulk (7 fields) vs Pre-Packaged (10 fields) data
- **Real-Time Validation** - Line-by-line error checking with detailed feedback and correction suggestions
- **Enhanced Export Modal** - All columns auto-selected, visual drag & drop reordering, template mode, live preview
- **Format Detection** - Automatic CSV format analysis with compatibility recommendations

### 🔔 **Toast Notification System** - **Elegant Stacking Animations** - Beautiful notifications with smooth stacking effects and slide transitions
- **Interactive Action Buttons** - Quick action buttons within toasts for enhanced workflow efficiency
- **Smart Color Coding** - Success (green), Warning (yellow), Error (red), Info (blue) with full theme integration
- **Advanced Controls** - Custom duration, persistent notifications, progress bars, and dismiss callbacks
- **Professional Polish** - Consistent with app branding, responsive design, and accessibility compliance

### ❓ **Context-Aware Help System** - **Mode-Sensitive Content** - Different help content for Bulk vs Pre-Packaged modes with rich HTML formatting
- **Visual CSV Examples** - Formatted table examples showing proper CSV structure for each mode
- **Interactive Help Tooltips** - Click ? buttons throughout the app for instant context-sensitive guidance
- **Smart Positioning** - Tooltips auto-position to avoid screen edges with keyboard navigation support
- **Rich Content Support** - Supports React components, tables, formatted text, and interactive elements

### 📑 **Tab-Based Modal Navigation** - **Organized Content Discovery** - Instructions and What's New modals restructured with logical tab organization
- **Icon-Enhanced Navigation** - Visual tab indicators with smooth sliding animations and keyboard navigation
- **Responsive Design** - Adapts perfectly to different screen sizes with horizontal scrolling support
- **Comprehensive Structure** - Quick Start, Product Management, Import/Export, Design Controls, Tips & Shortcuts tabs
- **Cross-Modal Navigation** - Seamless linking between What's New highlights and detailed instructions

### 🤖 **Enhanced Auto-Format Integration** - **Pre-Packaged Integration** - Full auto-format support for tabular pre-packaged product layouts
- **Content Density Calculation** - Intelligent density assessment based on table complexity and column counts
- **Column Multipliers** - Dynamic optimization based on 6-9 column configurations
- **Precision Tolerance** - 1px tolerance for more stable overflow detection with real-time feedback
- **Responsive Styling** - Table cells, headers, and shelf components all scale intelligently

### ⚡ **UI/UX Improvements** - **Dual-Mode State Management** - Seamless switching between Bulk and Pre-Packaged modes with data preservation
- **Enhanced Preview Controls** - Expanded control panels for both menu types with mode-specific options
- **Professional Theming** - Consistent dark/light theme support across all new components
- **Accessibility Features** - Full keyboard navigation, ARIA compliance, and screen reader support
- **Performance Optimizations** - Efficient rendering, minimal DOM updates, and smooth animations

---

## 🔄 **Previous Release Highlights**

### v1.0.3 - Auto-Format & Enhanced Features
- **📈 Expansion Mode** (No Initial Overflow): Aggressively increases font size up to 48px, then optimizes line spacing up to 1.0
- **📉 Reduction Mode** (Overflow Detected): Reduces line spacing first (preserves readability), then font size only if necessary
- **Content Density Aware** - Larger increments/reductions for light content, smaller for dense content
- **Intelligent Prioritization** - Font size first for expansion, line height first for reduction

### ⚡ **Enhanced User Experience**
- **Smart Visual Feedback** - Button changes from orange (overflow) to gray (optimized) with "Optimizing..." state
- **Single Success Toast** - Clean completion notification instead of step-by-step messages
- **Automatic Continuation** - No manual clicking required, system iterates until optimal fit found
- **Full Range Utilization** - Uses complete slider ranges (8-48px font, 0.1-1.0 line height)

### ⚙️ **Improved Defaults & Settings**
- **Shelf Splitting OFF** - Changed default to keep shelves together for cleaner layouts
- **User Column Respect** - Auto-Format works with your chosen column count instead of changing it
- **Text-Only Optimization** - Focuses purely on typography for current layout
- **Ceiling Detection** - Prevents infinite loops by remembering overflow boundaries

**Technical Implementation**: Uses iterative optimization with state tracking, overflow ceiling detection, and automatic phase transitions. The system backs off when hitting overflow limits and smoothly transitions between font size and line height optimization phases.

---

## 🔄 **Previous Update - v1.0.2 Critical Bug Fix**

### 🐛 **CSV Import Functionality Completely Restored**
- **Input Fields Fixed** - All text inputs now work properly after CSV import (strain names, grower, THC, filename, etc.)
- **Improved UX** - Added smooth loading overlay and success notifications instead of popup alerts
- **Better Performance** - Eliminated page reloads for faster, more reliable CSV import process
- **Data Integrity** - CSV import now preserves all data without clearing or corruption
- **Enhanced Stability** - Resolved Electron-specific state management issues for production builds

**Technical Details**: Fixed React state synchronization conflicts in Electron production builds that broke input focus and typing functionality.

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
- **`Mango-Cannabis-Flower-Menu-Builder-Setup-WIN-1.1.0-x64.exe`** *(~81 MB)*
- Creates Start menu shortcuts, handles updates automatically
- Just double-click to install, then launch from Start menu

#### **⚡ Alternative: Portable App**
- **`Mango-Cannabis-Flower-Menu-Builder-WIN-1.1.0-x64.exe`** *(~81 MB)*
- No installation required - Just download and run directly
- Good for testing or if you can't install software

#### **📦 ZIP Archive**
- **`Mango-Cannabis-Flower-Menu-Builder-WIN-1.1.0-x64.zip`** *(~110 MB)*
- Contains the portable app in a compressed archive
- Extract and run the `.exe` file inside

**⚠️ Windows Security Note:** On first launch, you may see a security warning. Click **"More info"** then **"Run anyway"** to launch the app.

---

### 🍎 **macOS Installation**

#### **🎯 Recommended: DMG Installer**

**For Intel Macs (2020 and earlier):**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.1.0-x64.dmg`** *(~105 MB)*

**For Apple Silicon Macs (M1/M2/M3):**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.1.0-arm64.dmg`** *(~100 MB)*

#### **⚡ Alternative: ZIP Archive**

**For Intel Macs:**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.1.0-x64.zip`** *(~101 MB)*

**For Apple Silicon Macs:**
- **`Mango-Cannabis-Flower-Menu-Builder-MAC-1.1.0-arm64.zip`** *(~96 MB)*

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

## 🚀 **Upgrade from v1.0.2**
- **Major Feature**: v1.1.0 introduces the revolutionary Auto-Format Menu for intelligent layout optimization
- **Automatic Updates**: The app will notify you when v1.1.0 is available
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

### v1.1.0 - Auto-Format Menu Feature
#### Added
- **Auto-Format Menu Button** - One-click intelligent optimization for perfect layout fit
- **Dual-Mode Optimization** - Expansion mode (maximizes readability) and Reduction mode (eliminates overflow)
- **Iterative Optimization Engine** - Uses real-time overflow detection as feedback for precise adjustments
- **Content Density Awareness** - Intelligent increment/reduction sizes based on strain count and column density
- **Protected Optimization Process** - All controls disabled during optimization to prevent interference
- **Smart Visual Feedback** - Button color changes and "Optimizing..." state indication
- **Ceiling Detection System** - Prevents infinite loops by tracking overflow boundaries
- **Michigan Infused Flower Shelves** - Exotic Live Resin, Premium Distillate, and Value Distillate infused options with special pricing structure
- **50% OFF Strains Shelf** - Available for all locations with toggle control, top placement, and original shelf tracking

#### Improved
- **Default Shelf Splitting** - Changed to OFF for cleaner layouts (shelves stay together)
- **Optimization Speed** - 25ms iteration delays for lightning-fast convergence
- **User Experience** - Single success toast instead of step-by-step messages
- **Range Utilization** - Uses full slider ranges (8-48px font, 0.1-1.0 line height)
- **Typography Focus** - Respects user's column choice, optimizes only font size and line height
- **Infused Shelf Styling** - Unique gradient backgrounds and subtle pattern overlays for visual distinction
- **Promotional Shelf Design** - Eye-catching red-to-orange gradient for 50% OFF shelf visibility

#### Technical
- **State Tracking** - Comprehensive optimization state management with mode persistence
- **Phase Transitions** - Smooth transitions between font size and line height optimization
- **Overflow Feedback Loop** - Real-time overflow detection drives optimization decisions
- **Automatic Continuation** - No manual intervention required during optimization process

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