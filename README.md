# 🥭 Mango Cannabis Menu Builder

> **Professional cannabis flower menu builder with dynamic pricing, state compliance, and beautiful export capabilities.**

[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](https://github.com/mangocannabis/menu-builder)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/built%20with-React-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

Create stunning dispensary menus with real-time strain management, THC compliance indicators, and multi-format export options. Built specifically for cannabis businesses operating across multiple state regulations.

## ✨ Features

### 🌿 **Strain Management**
- **Real-time editing** - Add, edit, and organize cannabis strains instantly
- **Smart categorization** - Organize strains by shelf/price tier
- **Last jar tracking** - Visual indicators for low inventory items
- **Strain type indicators** - Clear visual markers for Sativa, Indica, Hybrid varieties
- **Bulk operations** - Import/export via CSV, clear all shelves, copy strains

### 🎨 **Professional Menu Design**
- **Multiple layouts** - Letter Portrait/Landscape, 16:9 Screen formats
- **Dynamic columns** - 1-4 column layouts that adapt to content
- **Custom headers** - Beautiful Mango Cannabis branded headers in multiple sizes
- **Responsive typography** - Scalable fonts that maintain readability
- **THC compliance icons** - State-specific regulatory symbols

### 📊 **State Compliance**
- **Multi-state support** - Oklahoma, Michigan, New Mexico configurations
- **Regulatory compliance** - THC icons and formatting per state requirements
- **Pricing tiers** - Customizable pricing structures (g, eighth, quarter, half, oz)

### 📤 **Export Options**
- **High-quality images** - PNG and JPEG export at print resolution
- **CSV data export** - Spreadsheet-compatible strain data
- **Native file dialogs** - Professional file operations
- **Batch processing** - Export multiple formats simultaneously

### ⚡ **Advanced Controls**
- **Interactive preview** - Pan, zoom, and fit-to-window controls
- **Keyboard shortcuts** - `Ctrl+F` (fit to window), `Ctrl+=/−` (zoom)
- **Live sorting** - Sort by name, grower, THC%, strain type, or last jar status
- **Dark/light themes** - Professional appearance in any environment
- **Dynamic menus** - Context-aware Electron menus that adapt to content

## 🚀 Quick Start

### For End Users

1. **Download** the latest release from the [Releases page](https://github.com/mangocannabis/menu-builder/releases)
2. **Install** by running `Mango Cannabis Menu Builder Setup 1.0.0.exe`
3. **Launch** the application from your Start menu
4. **Import** your strain data via CSV or start building manually
5. **Export** your professional menu as PNG, JPEG, or CSV

### Sample Workflow
1. Select your state (Oklahoma, Michigan, or New Mexico)
2. Import existing strain data or add strains manually to shelves
3. Adjust layout settings (columns, header size, typography)
4. Use fit-to-window (`Ctrl+F`) to preview your menu
5. Export as high-resolution image for printing or digital display

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (included with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/mangocannabis/menu-builder.git
cd menu-builder

# Install dependencies
npm install

# Start development server
npm run dev

# Run Electron app in development
npm run electron-dev
```

### Available Scripts

```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run electron-dev # Run Electron app with hot reload
npm run dist         # Build and package Electron app
npm test             # Run test suite (if implemented)
```

### Building for Distribution

```bash
# Build installer and portable app
npm run dist

# Output files:
# - release-new/Mango Cannabis Menu Builder Setup 1.0.0.exe (installer)
# - release-new/win-unpacked/Mango Cannabis Menu Builder.exe (portable)
```

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop**: Electron 28
- **Build**: Vite, electron-builder
- **Export**: dom-to-image for high-quality image generation
- **State Management**: React hooks and context

### Key Components

```
src/
├── App.tsx                 # Main application logic and state
├── components/
│   ├── Header.tsx          # App header with state selector
│   ├── Toolbar.tsx         # Main toolbar with actions
│   ├── FlowerShelvesPanel.tsx # Left panel for strain management
│   ├── MenuPreviewPanel.tsx   # Right panel for menu preview
│   ├── PreviewArtboard.tsx    # Exportable menu layout
│   └── common/             # Reusable UI components
├── types.ts               # TypeScript interfaces
├── constants.ts           # App configuration and defaults
└── utils/                 # Helper functions and utilities
```

### State Management
- **Shelves**: Array of pricing tiers containing strain data
- **Preview Settings**: Layout, typography, and display options
- **App State**: Current region, theme, and global sort criteria
- **Export State**: Image generation and file operations

## 📁 File Formats

### CSV Import/Export Structure
```csv
Category,Strain Name,Grower/Brand,THC %,Class,Last Jar
"Top Shelf","Wedding Cake","Green House","24.5","Hybrid","No"
"Mid Shelf","Blue Dream","Local Grower","18.2","Sativa-Hybrid","Yes"
```

### Supported Export Formats
- **PNG**: High-resolution images (300 DPI equivalent)
- **JPEG**: Compressed images for web use
- **CSV**: Spreadsheet-compatible data export

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|---------|
| `Ctrl+F` | Fit menu to window |
| `Ctrl+=` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+N` | New menu |
| `Ctrl+O` | Open CSV file |
| `Ctrl+Q` | Quit application |

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain component modularity
- Update tests for new features
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏢 About Mango Cannabis

Mango Cannabis is committed to providing professional tools for cannabis businesses. This menu builder reflects our dedication to quality, compliance, and user experience in the cannabis industry.

**Developer**: Brad Forsythe ([brad@mangocannabis.com](mailto:brad@mangocannabis.com))  
**Company**: Mango Cannabis  
**Copyright**: © 2024 Mango Cannabis

---

## 🐛 Support

Having issues? We're here to help:

- **Bug Reports**: [Open an issue](https://github.com/mangocannabis/menu-builder/issues)
- **Feature Requests**: [Request a feature](https://github.com/mangocannabis/menu-builder/issues)
- **Email Support**: [brad@mangocannabis.com](mailto:brad@mangocannabis.com)

---

*Built with ❤️ for the cannabis community* 