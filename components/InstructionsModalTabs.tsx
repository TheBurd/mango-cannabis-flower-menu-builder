import React, { useCallback, useState, useRef } from 'react';
import { Theme, MenuMode, SupportedStates } from '../types';
import { TabContainer, TabItem } from './common/TabContainer';
import { FeedbackPopup } from './FeedbackPopup';
import { HamburgerMenuIcon } from './common/Icon';
import { APP_VERSION } from '../version';

interface InstructionsModalTabsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  currentMode: MenuMode;
  currentState: SupportedStates;
}

export const InstructionsModalTabs: React.FC<InstructionsModalTabsProps> = ({
  isOpen,
  onClose,
  theme,
  currentMode,
  currentState,
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const feedbackButtonRef = useRef<HTMLButtonElement>(null);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleToggleFeedback = () => {
    setShowFeedbackForm(!showFeedbackForm);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
  };

  if (!isOpen) return null;

  // Tab content components
  const QuickStartTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">dYs? Quick Start Guide</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Get started in 5 simple steps
          </p>
        </div>

        <div className="grid gap-4">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <h3 className="font-semibold">Choose Your State</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-8`}>
              Select Oklahoma, Michigan, New Mexico, or New York from the header dropdown to configure pricing and compliance.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="font-semibold">Select Mode</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-8`}>
              Choose Bulk Flower or Pre-Packaged mode based on your products. Note: New York only supports Pre-Packaged mode due to regulatory requirements.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="font-semibold">Add Your Products</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-8`}>
              Use the + button to add products manually or import CSV data using our enhanced wizard.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <h3 className="font-semibold">Auto-Format</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-8`}>
              Click "Auto-Format Menu" for instant optimization that adjusts font sizes and spacing perfectly.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
              <h3 className="font-semibold">Export Your Menu</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-8`}>
              Export as high-quality PNG, JPEG, or CSV for your dispensary display or data management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductManagementTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            🌿 {currentMode === MenuMode.BULK ? 'Strain' : 'Product'} Management
          </h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Adding, organizing, and managing your {currentMode === MenuMode.BULK ? 'strains' : 'products'}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">Adding {currentMode === MenuMode.BULK ? 'Strains' : 'Products'}:</h3>
          <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Click the <strong>+ Add</strong> button to add individual items</li>
            <li>• Fill in required fields: {currentMode === MenuMode.BULK ? 'name, grower, THC%' : 'name, brand, price'}</li>
            <li>• Select strain type: Indica (I), Sativa (S), or Hybrid (H)</li>
            <li>• Mark items as "Last Jar" or "Sold Out" for special highlighting</li>
            <li>• Use up/down arrows to reorder items within shelves</li>
            <li>• Use the scroll overlay to navigate large menus while scrolling</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">Special Shelf Types:</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-red-600">50% OFF STRAINS</h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Automatically calculates discounted pricing. Select the original shelf to show crossed-out original price.
              </p>
            </div>
            {currentState === SupportedStates.MICHIGAN && (
              <div>
                <h4 className="font-medium text-green-600">Infused Products</h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Special pricing structure with 1g and 5g options. Includes visual pattern overlay.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">🔄 Reordering {currentMode === MenuMode.BULK ? 'Strains' : 'Products'}:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Arrow Controls:</strong> Click up/down arrows on the left of each row to move items</li>
            <li>• <strong>Smart Boundaries:</strong> Arrows disappear when items can't move further</li>
            <li>• <strong>Performance Monitor:</strong> Watch the scroll overlay footer for real-time FPS metrics</li>
            <li>• <strong>Sort Reset:</strong> Manual reordering clears any active sorting</li>
            <li>• <strong>Reliable Operation:</strong> No duplication issues - precise control guaranteed</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">Other Operations:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Copy/Duplicate:</strong> Use arrow buttons to copy items above or below</li>
            <li>• <strong>Sort Options:</strong> Alphabetical, THC%, or custom order</li>
            <li>• <strong>Clear Shelves:</strong> Remove all items from a shelf with the trash button</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const DataManagementTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">📊 CSV Import & Export (ENHANCED!)</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Smart data management with guided workflows
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <h3 className="font-semibold mb-3 text-green-600">🆕 Multi-Page Features:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Create Pages:</strong> Green + button adds empty pages</li>
            <li>• <strong>Duplicate Pages:</strong> Blue duplicate button copies current page</li>
            <li>• <strong>Page Navigation:</strong> Use arrows in bottom-right corner</li>
            <li>• <strong>Multi-CSV Import:</strong> Upload multiple files to create separate pages</li>
            <li>• <strong>Advanced Export:</strong> Export all pages as ZIP or individual files</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'
        }`}>
          <h3 className="font-semibold mb-3 text-purple-600">💾 Project Management:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            
            <li>??? Pre-Packaged editor styled like Bulk: header layout, sort pills, neutral product background.</li>
            <li>• <strong>Save As:</strong> Create new project files (.json format)</li>
            <li>• <strong>Load:</strong> Open existing project files</li>
            <li>• <strong>Recent Projects:</strong> Quick access to recent work</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className="font-semibold mb-3 text-blue-600">📋 Import Process:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
              <span><strong>Upload:</strong> Drag & drop or select CSV files with format detection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
              <span><strong>Smart Mapping:</strong> Visual column matching with auto-suggestions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
              <span><strong>Validation:</strong> Real-time error detection and format checking</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
              <span><strong>Complete:</strong> Progress tracking with success confirmation</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <h3 className="font-semibold mb-3 text-green-600">✨ Smart Features:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Auto-Detection:</strong> Recognizes Bulk vs Pre-Packaged formats</li>
            <li>• <strong>Mode Suggestions:</strong> Recommends switching modes for compatibility</li>
            <li>• <strong>Fuzzy Matching:</strong> "THC %" matches "thc percent" automatically</li>
            <li>• <strong>Preview Rows:</strong> See first 3 rows during mapping process</li>
            <li>• <strong>Error Reporting:</strong> Detailed validation with line-specific feedback</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'
        }`}>
          <h3 className="font-semibold mb-3 text-orange-600">📤 Export Enhancements:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>All Columns Auto-Selected:</strong> No more manual checkbox clicking</li>
            <li>• <strong>Drag & Drop Reordering:</strong> Customize column order visually</li>
            <li>• <strong>Template Mode:</strong> Export headers-only for easy data entry</li>
            <li>• <strong>Live Preview:</strong> See exactly what your CSV will contain</li>
            <li>• <strong>Smart Organization:</strong> Logical grouping and filtering options</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'
        }`}>
          <h3 className="font-semibold mb-3 text-purple-600">❓ Help System:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Context-Aware Guidance:</strong> Different help for Bulk vs Pre-Packaged</li>
            <li>• <strong>Visual Examples:</strong> Formatted table examples of proper CSV structure</li>
            <li>• <strong>Best Practices:</strong> Tips for smooth imports and exports</li>
            <li>• <strong>Interactive Tooltips:</strong> Click ? buttons for instant help</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const DesignControlsTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">🎨 Layout & Design Controls</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Customize your menu appearance and behavior
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">🤖 Auto-Format Menu:</h3>
          <div className="space-y-2 text-sm">
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              Intelligent optimization system that automatically adjusts your menu for perfect fit:
            </p>
            <ul className={`space-y-1 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• <strong>Expansion Mode:</strong> When content fits, gradually increases font size and spacing</li>
              <li>• <strong>Reduction Mode:</strong> When overflow detected, carefully reduces size to fit</li>
              <li>• <strong>Smart Boundaries:</strong> Respects minimum/maximum limits for readability</li>
              <li>• <strong>Real-time Feedback:</strong> Toast notifications show optimization results</li>
            </ul>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">📏 Page & Layout Settings:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Page Sizes:</strong> Letter, A4, Legal, and custom dimensions</li>
            <li>• <strong>Orientation:</strong> Portrait or Landscape modes</li>
            <li>• <strong>Column Layouts:</strong> 1-6 columns with intelligent distribution</li>
            <li>• <strong>Shelf Splitting:</strong> Allow/prevent shelves from breaking across columns</li>
            <li>• <strong>Header Images:</strong> Add branded headers in multiple sizes</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">🔍 Preview Controls:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Zoom:</strong> 10%-300% with mouse wheel or controls</li>
            <li>• <strong>Pan:</strong> Click and drag to move around large menus</li>
            <li>• <strong>Fit to Window:</strong> Auto-calculate optimal zoom level</li>
            <li>• <strong>Center View:</strong> Reset position to center</li>
            <li>• <strong>Grid Background:</strong> Visual guides for alignment</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'
        }`}>
          <h3 className="font-semibold mb-3 text-orange-600">🧭 NEW: Scroll Overlay System:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Smart Position Tracking:</strong> Shows current strains while scrolling</li>
            <li>• <strong>Performance Monitoring:</strong> Real-time FPS, frame time, and strain count</li>
            <li>• <strong>Toggle Control:</strong> Enable/disable via footer with performance indicator</li>
            <li>• <strong>Adaptive Optimization:</strong> Auto-adjusts based on menu size and device performance</li>
            <li>• <strong>Dynamic Performance Levels:</strong> High/Medium/Low with detailed tooltips</li>
            <li>• <strong>Memory Usage:</strong> Live tracking of resource consumption</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">✨ Visual Enhancements:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Theme Support:</strong> Dark and light modes</li>
            <li>• <strong>Font Controls:</strong> Size and line spacing adjustments</li>
            <li>• <strong>THC Icons:</strong> State-compliant regulatory symbols</li>
            <li>• <strong>Overflow Warnings:</strong> Visual indicators for content that may not fit</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const TipsShortcutsTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">💡 Tips, Shortcuts & Export</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Pro tips and keyboard shortcuts for efficient workflow
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">⌨️ Keyboard Shortcuts:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>New {currentMode === MenuMode.BULK ? 'Strain' : 'Product'}</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl+N</code>
              </div>
              <div className="flex justify-between">
                <span>Save/Export</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl+S</code>
              </div>
              <div className="flex justify-between">
                <span>Import CSV</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl+I</code>
              </div>
              <div className="flex justify-between">
                <span>Auto-Format</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl+F</code>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Zoom In</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl++</code>
              </div>
              <div className="flex justify-between">
                <span>Zoom Out</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl+-</code>
              </div>
              <div className="flex justify-between">
                <span>Reset Zoom</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>Ctrl+0</code>
              </div>
              <div className="flex justify-between">
                <span>Instructions</span>
                <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>F1</code>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3">📸 Export Options:</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Image Exports:</h4>
              <ul className={`space-y-1 text-sm ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• <strong>PNG:</strong> Lossless quality, transparent background support</li>
                <li>• <strong>JPEG:</strong> Smaller file size, perfect for printing</li>
                <li>• <strong>Quality Settings:</strong> Adjustable compression levels</li>
                <li>• <strong>Resolution:</strong> High-DPI support for crisp prints</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">CSV Exports:</h4>
              <ul className={`space-y-1 text-sm ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• <strong>Data Export:</strong> Current menu contents</li>
                <li>• <strong>Template Export:</strong> Headers only for bulk entry</li>
                <li>• <strong>Custom Columns:</strong> Choose exactly what to export</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <h3 className="font-semibold mb-3 text-green-600">🚀 Pro Workflow Tips:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Use <strong>Auto-Format</strong> as your final step for perfect sizing</li>
            <li>• Import CSV templates to quickly populate new shelves</li>
            <li>• Enable "Allow Shelf Splitting" for maximum space utilization</li>
            <li>• Click up/down arrows to reorder items - more reliable than drag & drop</li>
            <li>• <strong>Scroll quickly</strong> to see navigation overlay with strain positions</li>
            <li>• Manual reordering clears sort state - perfect for custom arrangements</li>
            <li>• Mark low-stock items as "Last Jar" for customer awareness</li>
            <li>• Export both PNG and CSV for complete dispensary workflow</li>
            <li>• Use the context-sensitive help tooltips (? buttons) when stuck</li>
            <li>• <strong>New defaults:</strong> 16px font, 2 columns, small images for better menus</li>
            <li>• <strong>Theme switching</strong> is now 70% faster on all devices</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className="font-semibold mb-3 text-blue-600">🏛️ State Compliance:</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Oklahoma:</strong> Both Bulk and Pre-Packaged modes, extensive shelf options</div>
            <div><strong>Michigan:</strong> Both Bulk and Pre-Packaged modes, includes Infused product support</div>
            <div><strong>New Mexico:</strong> Both Bulk and Pre-Packaged modes, state-specific pricing tiers</div>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Each state includes appropriate THC regulatory symbols and pricing structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    {
      id: 'quick-start',
      label: 'Quick Start',
      icon: <span className="text-lg">🚀</span>,
      content: <QuickStartTab />
    },
    {
      id: 'product-management',
      label: currentMode === MenuMode.BULK ? 'Strain Management' : 'Product Management',
      icon: <span className="text-lg">🌿</span>,
      content: <ProductManagementTab />
    },
    {
      id: 'data-management',
      label: 'Import & Export',
      icon: <span className="text-lg">📊</span>,
      content: <DataManagementTab />
    },
    {
      id: 'design-controls',
      label: 'Design & Controls',
      icon: <span className="text-lg">🎨</span>,
      content: <DesignControlsTab />
    },
    {
      id: 'tips-shortcuts',
      label: 'Tips & Shortcuts',
      icon: <span className="text-lg">💡</span>,
      content: <TipsShortcutsTab />
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`max-w-5xl w-full max-h-[90vh] rounded-lg shadow-2xl overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <h1 className="text-xl font-semibold">
            Instructions & Help
          </h1>
          <button
            onClick={onClose}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Tab Container */}
        <div className="flex-1 min-h-0">
          <TabContainer
            tabs={tabs}
            defaultActiveTab="quick-start"
            theme={theme}
            className="h-full"
          />
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                🥭 Mango Cannabis Flower Menu Builder v{APP_VERSION}
              </div>
              <button
                ref={feedbackButtonRef}
                onClick={handleToggleFeedback}
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  showFeedbackForm 
                    ? 'text-orange-500 hover:text-orange-600' 
                    : theme === 'dark' 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                <span>📧</span>
                {showFeedbackForm ? 'Hide Feedback' : 'Leave Feedback'}
              </button>
            </div>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-orange-600 hover:bg-orange-500 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
            >
              Close
            </button>
          </div>
        </div>

        {/* Feedback Popup */}
        <FeedbackPopup 
          theme={theme}
          isOpen={showFeedbackForm}
          onClose={handleCloseFeedback}
          triggerRef={feedbackButtonRef}
        />
      </div>
    </div>
  );
};



