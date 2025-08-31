# 🎉 Mango Cannabis Flower Menu Builder - v1.1.0 Release Notes

## 📅 Release Date: January 2025

## 🎯 Overview
Version 1.1.0 represents a **transformational update** that essentially doubles the application's capabilities while maintaining full backward compatibility and significantly improving performance. This release introduces an entirely new pre-packaged menu system alongside massive UX improvements, performance optimizations, and quality-of-life enhancements.

---

## ✨ Major Features

### 📦 **Complete Pre-Packaged Menu System**
An entire parallel menu system designed specifically for pre-packaged cannabis products:

- **Weight-Based Organization**: Automatic categorization by standard weights:
  - 3.5g (Eighths)
  - 7g (Quarters) 
  - 14g (Half Ounces)
  - 28g (Ounces)
- **Table Layout System**: Multi-column product tables with responsive design
- **Product Management**: 
  - Brand emphasis and grouping
  - Low stock indicators
  - Terpene percentages
  - Net weight specifications
  - THC/CBD content displays
- **Full Feature Parity**: Zoom, pan, auto-format, and all export options
- **Smart Organization Modes**:
  - Weight-first (default)
  - Brand-first
  - Price-first

### 🧭 **Scroll Navigation Overlay** *(NEW)*
Intelligent strain navigation assistant for large menus:

- **Smart Position Tracking**: Instant scroll position updates with zero lag
- **Visual Hierarchy**: 
  - Current strain magnified (16px)
  - Adjacent strains (14px)
  - Peripheral strains (10px)
- **Shelf Headers**: Color-coded shelf names with visual breakpoints
- **Extended Visibility**: 2.5 second display with smooth fade animation
- **Performance Optimized**: 60fps scrolling with pre-calculated styles
- **Dual Mode Support**: Works in both Bulk and Pre-Packaged modes

### 🚀 **Performance Optimizations** *(NEW)*
Massive improvements for lower-spec devices:

- **70% faster theme transitions** between light/dark modes
- **React.memo** applied to 15+ heavy components
- **CSS Variable System** replaces runtime conditional classes
- **90% reduction** in unnecessary re-renders
- **Optimized transitions** from all to specific properties
- **Pre-calculated style lookups** for instant access
- **Passive event listeners** for better scroll performance

### 📋 **Rebuilt CSV Import/Export System**
Complete overhaul with guided workflows:

- **4-Stage Import Wizard**:
  1. Upload → Smart column detection
  2. Field Mapping → Fuzzy matching with aliases
  3. Real-time Validation → Error highlighting
  4. Import Complete → Success confirmation
- **Auto-Detection**: Recognizes Bulk vs Pre-Packaged formats
- **Enhanced Export Modal**:
  - All columns auto-selected
  - Visual drag & drop reordering
  - Template mode for blank CSV generation
- **Context-Aware Help**: Visual CSV examples per mode

### 🗺️ **Geographic Expansion** *(NEW)*
Extended state support with specialized compliance features:

- **New York State Support**: 
  - **Pre-Packaged Mode Only**: Specialized for NY's regulatory requirements
  - **Yellow Triangular THC Symbol**: NY-specific compliance branding
  - **Weight-Based Organization**: Professional 3.5g, 7g, 14g, 28g categorization  
  - **Crash Protection**: Multi-layer validation prevents invalid NY+Bulk combinations
  - **Auto-Mode Switching**: Seamlessly switches to Pre-Packaged when selecting NY
- **Enhanced State Management**:
  - **Smart Mode Restrictions**: Automatically enforces state-specific limitations
  - **Visual Feedback**: Disabled controls show why certain modes aren't available
  - **Consistent Theming**: Orange gradient flower shelves across all states

### 🔔 **Toast Notification System**
Interactive notifications with rich features:

- **Stacking Animations**: Smooth slide transitions
- **Interactive Actions**: Quick buttons within toasts
- **Color Coding**: Success, Warning, Error, Info
- **Progress Indicators**: For long-running operations
- **Custom Duration**: Persistent or timed notifications
- **Theme Integration**: Respects dark/light mode

### ❓ **Context-Aware Help System**
Mode-sensitive help throughout the application:

- **Smart Tooltips**: Different content for Bulk vs Pre-Packaged
- **Visual Examples**: Formatted tables showing proper data structure
- **Auto-Positioning**: Avoids screen edges automatically
- **Rich Content**: HTML formatting with examples
- **Keyboard Support**: Tab navigation friendly

### 📑 **Tab-Based Modal Navigation**
Organized content discovery:

- **Structured Sections**:
  - Quick Start
  - Product Management
  - Import/Export
  - Design Controls
  - Tips & Shortcuts
- **Visual Indicators**: Icons and sliding animations
- **Cross-Linking**: Seamless navigation between modals
- **Responsive Design**: Adapts to screen size

### 🔄 **Reliable Row Reordering**
Fixed longstanding drag & drop issues:

- **Up/Down Arrows**: Simple click-to-move interface
- **No Duplication Bugs**: Eliminated accidental copying
- **Clear Feedback**: Arrows disable at boundaries
- **Data Integrity**: Maintains sort state properly
- **Consistent Operation**: Works in all modes

### ⚙️ **Better Default Settings** *(NEW)*
Improved out-of-box experience:

- **Font Size**: 10px → **16px** (better readability)
- **Columns**: 1 → **2** (optimal space usage)
- **Header Images**: None → **Small** (visual appeal)
- **Line Padding**: 0.3 → **0.5** (better separation)

---

## 🎨 UI/UX Improvements

### Enhanced Components
- **StrainTypeDropdown**: Visual strain type selection
- **InventoryStatusBadge**: Clear low-stock indicators
- **TabButton & TabContainer**: Consistent tab navigation
- **DebouncedInput**: Smooth text input performance
- **HelpTooltip**: Context-sensitive help buttons

### Visual Polish
- Smoother animations throughout
- Consistent spacing and alignment
- Enhanced visual feedback
- Improved error states
- Better loading indicators

### Keyboard Shortcuts & Controls *(ENHANCED)*
- **Complete Keyboard Support**: 15+ shortcuts for all major functions
- **Fixed Accelerators**: Resolved browser conflicts, all shortcuts now work
- **Zoom Controls**: `Ctrl+=` (In), `Ctrl+-` (Out), `Ctrl+\` (Reset), `Ctrl+F` (Fit)
- **File Operations**: `Ctrl+N` (New), `Ctrl+O` (Open), `Ctrl+M` (Switch Mode)
- **Export Shortcuts**: `Ctrl+Shift+P/J/E` for PNG/JPEG/CSV export
- **Developer Tools**: `Ctrl+Shift+R` (Reset App Data for testing)

### Enhanced Theme Support *(IMPROVED)*
- **Theme-Aware Headers**: Fixed contrast issues in light mode dropdowns
- **Dynamic Menu Colors**: Proper text contrast for both light/dark themes
- **Consistent Styling**: All components respect theme preferences

### Accessibility
- Full keyboard navigation
- ARIA compliance
- Screen reader support
- Focus management
- High contrast support

---

## 🔧 Technical Improvements

### Performance
- **Efficient Rendering**: Minimal DOM updates
- **Smart Memoization**: React.memo on heavy components
- **Optimized Animations**: GPU-accelerated transitions
- **Lazy Loading**: Components load as needed
- **Bundle Size**: Code splitting for faster loads

### Architecture
- **Dual-Mode State Management**: Seamless mode switching
- **Expanded Type System**: 139+ new type definitions
- **Utility Functions**: Content distribution, weight organization
- **Hook Patterns**: useRef optimizations, custom hooks
- **CSS Variables**: Dynamic theming without re-renders

### Auto-Format Integration
- **Table Layout Support**: Full optimization for pre-packaged
- **Content Density Calculation**: Intelligent space assessment
- **Column Multipliers**: Dynamic 6-9 column configurations
- **Precision Tolerance**: 1px tolerance for stability
- **Real-time Feedback**: Toast notifications for results

---

## 📊 Impact Summary

### File Changes
- **78 files modified**
- **+16,357 lines** added (net)
- **25+ new components**
- **15+ enhanced components**

### User Benefits
- **2x functionality** with pre-packaged support
- **70% faster** theme switching
- **90% fewer** re-renders
- **Zero lag** scroll navigation
- **100% backward** compatible

### Developer Benefits
- **Comprehensive types** for all features
- **Modular architecture** for maintainability
- **Performance patterns** throughout
- **Extensive documentation**
- **Clear separation** of concerns

---

## 🔄 Migration Guide

### From v1.0.x
No action required! v1.1.0 is fully backward compatible:
- All existing bulk flower menus work unchanged
- Settings and preferences are preserved
- CSV formats remain compatible
- Export formats unchanged

### New Features Opt-In
New features are available but not required:
- Pre-Packaged mode accessed via mode toggle
- Scroll overlay appears automatically when scrolling
- New defaults apply to new installations only
- Performance improvements are automatic

---

## 🐛 Bug Fixes

- Fixed drag & drop duplication issues
- Resolved theme transition lag on slower PCs
- Corrected CSV import race conditions
- Fixed overflow detection accuracy
- Resolved zoom scaling issues
- Fixed modal blur effect performance
- Corrected shelf splitting behavior
- Fixed sold-out item sorting

---

## 💡 Known Issues

- New York state only supports Pre-Packaged mode (no bulk flower pricing tiers)
- Some browsers may show performance warnings on first theme switch
- CSV import of 1000+ items may take several seconds
- Scroll overlay may briefly flicker on very fast scrolling

---

## 🚀 Coming Next (v1.2.0)

- Multi-page printing support
- Extended state compliance (more states)
- Custom branding options
- Cloud sync capabilities
- Advanced analytics
- Batch operations
- Template library
- API integrations

---

## 🙏 Acknowledgments

Special thanks to:
- The Mango Cannabis team for extensive testing
- Users who reported bugs and requested features
- The open-source community for invaluable tools

---

## 📥 Download

Get the latest version from our [Releases Page](https://github.com/TheBurd/mango-cannabis-flower-menu-builder/releases/tag/v1.1.0)

---

## 📧 Support

For issues or questions:
- Email: brad@mangocannabis.com
- GitHub Issues: [Report a Bug](https://github.com/TheBurd/mango-cannabis-flower-menu-builder/issues)

---

*Built with ❤️ for the Mango Cannabis family*