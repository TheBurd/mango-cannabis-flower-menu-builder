import React, { useCallback, useState, useRef } from 'react';
import { Theme } from '../types';
import { TabContainer, TabItem } from './common/TabContainer';
import { FeedbackPopup } from './FeedbackPopup';

interface WhatsNewModalTabsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const WhatsNewModalTabs: React.FC<WhatsNewModalTabsProps> = ({
  isOpen,
  onClose,
  theme,
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
  const HighlightsTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">🎉 What's New in v1.1.0</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Complete Pre-Packaged Menu System, Enhanced CSV Workflows & Improved UX
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📦</span>
              <h3 className="font-semibold text-orange-600">Pre-Packaged System</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete parallel menu system for pre-packaged products with weight-based organization (3.5g, 7g, 14g, 28g).
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🏗️</span>
              <h3 className="font-semibold text-purple-600">Weight Organization</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Weight categorization with brand grouping, product separation, and visual hierarchy.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📋</span>
              <h3 className="font-semibold text-blue-600">Advanced CSV System</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete rebuild: 4-stage wizard, smart field mapping, real-time validation, and enhanced export.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔔</span>
              <h3 className="font-semibold text-green-600">Toast Notifications</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Notifications with stacking animations, action buttons, and theming.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-indigo-900/20 border border-indigo-700' : 'bg-indigo-50 border border-indigo-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">❓</span>
              <h3 className="font-semibold text-indigo-600">Smart Help System</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Context-aware tooltips with mode-sensitive content, visual examples, and auto-positioning.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-pink-900/20 border border-pink-700' : 'bg-pink-50 border border-pink-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📑</span>
              <h3 className="font-semibold text-pink-600">Tab Navigation</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete modal overhaul with tab-based organization, smooth animations, and keyboard navigation.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-teal-900/20 border border-teal-700' : 'bg-teal-50 border border-teal-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔄</span>
              <h3 className="font-semibold text-teal-600">Smart Reordering</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Simple up/down arrows replace drag & drop. No more duplication bugs - just click to move items up or down in both Bulk and Pre-Packaged modes.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-amber-900/20 border border-amber-700' : 'bg-amber-50 border border-amber-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧭</span>
              <h3 className="font-semibold text-amber-600">Scroll Navigator</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Smart overlay shows magnified strain names while scrolling. Includes shelf headers with visual breakpoints for easy navigation through large menus.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🗽</span>
              <h3 className="font-semibold text-yellow-600">New York Support</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Complete New York state support with yellow triangular THC symbol, Pre-Packaged mode specialization, and regulatory compliance features.
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            theme === 'dark' ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="font-semibold text-red-600">Performance Mode</h3>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              70% faster theme transitions for lower-spec PCs. Optimized with React.memo, CSS variables, and minimized re-renders for smooth 60fps operation.
            </p>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-300'
        }`}>
          <div className="text-center">
            <h3 className="font-semibold text-yellow-600 mb-2">🎯 Plus: Better Defaults & UX Polish</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Improved default settings (16px font, 2 columns, small images), enhanced auto-format for both menu types, and comprehensive accessibility features
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ImportExportTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">📦 Complete Pre-Packaged Menu System</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Entire parallel menu system designed for pre-packaged cannabis products
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'
        }`}>
          <h3 className="font-semibold mb-3 text-orange-600">🏗️ Weight-Based Organization:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <strong>3.5g Eighths</strong><br/>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Premium flower eighths with price tiers</span>
            </div>
            <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <strong>7g Quarters</strong><br/>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Quarter ounce packages</span>
            </div>
            <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <strong>14g Half Oz</strong><br/>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Half ounce packages</span>
            </div>
            <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <strong>28g Ounces</strong><br/>
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Full ounce packages</span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className="font-semibold mb-3 text-blue-600">📋 Product Management:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Table Layout:</strong> Multi-column product tables with responsive design</li>
            <li>• <strong>Brand Emphasis:</strong> Enhanced brand visibility for brand-focused displays</li>
            <li>• <strong>Low Stock Indicators:</strong> Visual highlighting and icons for inventory management</li>
            <li>• <strong>Terpene Percentages:</strong> Optional terpene content display</li>
            <li>• <strong>Net Weight Specs:</strong> Detailed weight specifications beyond standard categories</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <h3 className="font-semibold mb-3 text-green-600">🖱️ Canvas Experience:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• <strong>Zoom & Pan:</strong> Identical navigation to Bulk mode (10%-300% zoom)</li>
            <li>• <strong>Mouse Controls:</strong> Wheel zoom with cursor positioning, click & drag panning</li>
            <li>• <strong>Auto-Format Integration:</strong> Full optimization support for table layouts</li>
            <li>• <strong>Export Capabilities:</strong> PNG, JPEG, and CSV export with high quality</li>
            <li>• <strong>State Integration:</strong> Currently available for Oklahoma dispensaries</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className="font-semibold mb-3 text-blue-600">Import Wizard Journey:</h3>
          <ol className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>1. Upload:</strong> Modern file selection with format detection</li>
            <li><strong>2. Mapping:</strong> Visual column matching with smart suggestions</li>
            <li><strong>3. Validation:</strong> Real-time error checking with detailed feedback</li>
            <li><strong>4. Complete:</strong> Success confirmation with import summary</li>
          </ol>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <h3 className="font-semibold mb-3 text-green-600">Features:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Auto-detects Bulk vs Pre-Packaged formats</li>
            <li>• Suggests mode switching for better compatibility</li>
            <li>• Fuzzy matching for column headers</li>
            <li>• Preview first 3 rows during mapping</li>
            <li>• Comprehensive error reporting</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-orange-900/20 border border-orange-700' : 'bg-orange-50 border border-orange-200'
        }`}>
          <h3 className="font-semibold mb-3 text-orange-600">Export Enhancements:</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• All columns automatically selected</li>
            <li>• Drag & drop column reordering</li>
            <li>• Template mode for empty CSV generation</li>
            <li>• Live preview of export content</li>
            <li>• Better column organization</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const UserExperienceTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">⚡ User Experience Improvements</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Improved interactions and assistance features
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🔔</span> Toast Notification System:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Elegant stacking with smooth animations</li>
            <li>• Progress bars for auto-dismiss timers</li>
            <li>• Action buttons for quick responses</li>
            <li>• Color-coded types: Success (green), Warning (yellow), Error (red), Info (blue)</li>
            <li>• Persistent notifications for critical messages</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>❓</span> Help System Updates:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Context-aware content that changes based on your current mode</li>
            <li>• Rich examples with formatted tables and best practices</li>
            <li>• Smart positioning that avoids screen edges</li>
            <li>• Auto-close when switching contexts</li>
            <li>• Keyboard navigation support</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🔄</span> Improved Item Reordering:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Replaced drag & drop with reliable up/down arrow controls</li>
            <li>• Fixed item duplication issues completely</li>
            <li>• Clear visual indicators show when items can't move further</li>
            <li>• Maintains data integrity while reordering</li>
            <li>• Works seamlessly across all shelves and modes</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🎨</span> Interface Enhancements:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• New dropdown components for strain types</li>
            <li>• Improved inventory status badges</li>
            <li>• Better input field layouts and spacing</li>
            <li>• Enhanced visual feedback throughout</li>
            <li>• Foundation laid for future multi-page support</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>📑</span> Modal Organization:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Tab-based navigation for Instructions and What's New</li>
            <li>• Icon-enhanced tabs for visual clarity</li>
            <li>• Responsive design adapts to screen size</li>
            <li>• Better content organization and discoverability</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-amber-900/20 border border-amber-700' : 'bg-amber-50 border border-amber-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🧭</span> Scroll Overlay:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Smart overlay appears while scrolling to show current position</li>
            <li>• Magnified strain names with visual hierarchy (16px current, 14px adjacent)</li>
            <li>• Color-coded shelf headers with visual breakpoints</li>
            <li>• Toggleable footer with performance indicator</li>
            <li>• Adaptive frame skipping for smooth scrolling on large menus</li>
            <li>• 2.5 second visibility with smooth fade-out animation</li>
            <li>• Instant position tracking with zero lag</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🚀</span> Performance Optimizations:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• 70% faster theme transitions for lower-spec devices</li>
            <li>• React.memo applied to 15+ heavy components</li>
            <li>• CSS variable system replaces runtime conditional classes</li>
            <li>• Optimized transitions from all to specific properties</li>
            <li>• 90% reduction in unnecessary re-renders</li>
            <li>• Pre-calculated style lookups for instant access</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-purple-900/20 border border-purple-700' : 'bg-purple-50 border border-purple-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>📊</span> Smart Performance Monitoring:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Dynamic performance level detection (High/Medium/Low)</li>
            <li>• Real-time FPS and frame time monitoring in tooltips</li>
            <li>• Automatic optimization based on menu size</li>
            <li>• Performance resets when clearing/reducing menus</li>
            <li>• Live metrics: FPS counter, strain count, memory usage</li>
            <li>• Tooltips for all performance states with detailed stats</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>🏛️</span> Pre-Packaged Mode Expansion:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Pre-Packaged mode now available for ALL states</li>
            <li>• Michigan and New Mexico gain full pre-packaged support</li>
            <li>• Consistent weight-based shelf structure across states</li>
            <li>• 28g, 14g, 7g, 3.5g categories for Flower and Shake</li>
            <li>• Mode toggle now visible for all state selections</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-cyan-900/20 border border-cyan-700' : 'bg-cyan-50 border border-cyan-200'
        }`}>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>⚙️</span> Better Default Settings:
          </h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Font size increased to 16px for better readability</li>
            <li>• Default 2-column layout for optimal space usage</li>
            <li>• Header images default to "Small" for visual appeal</li>
            <li>• Line padding increased to 0.5 for better separation</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const PreviousReleasesTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">🔄 Previous Releases</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Recent updates and improvements
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.0.3 - Auto-Format & Enhanced Features</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Intelligent Auto-Format Menu system</li>
            <li>• New shelf types (Michigan Infused, 50% OFF)</li>
            <li>• Enhanced UX improvements</li>
            <li>• 6-column support and layout enhancements</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.0.2 - Critical CSV Bug Fix</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• Fixed race condition preventing strain/shelf modifications</li>
            <li>• Improved CSV import reliability</li>
            <li>• Enhanced documentation and debugging</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.0.1 - Enhanced UX & 6-Column Support</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>• 6-column layout support with sequential filling</li>
            <li>• Smart overflow detection and warnings</li>
            <li>• What's New modal and notification system</li>
            <li>• Image feedback system and drag & drop</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    {
      id: 'highlights',
      label: 'v1.1.0 Highlights',
      icon: <span className="text-lg">🎉</span>,
      content: <HighlightsTab />
    },
    {
      id: 'import-export',
      label: 'Import/Export',
      icon: <span className="text-lg">📊</span>,
      content: <ImportExportTab />
    },
    {
      id: 'ux-improvements',
      label: 'UX Improvements',
      icon: <span className="text-lg">⚡</span>,
      content: <UserExperienceTab />
    },
    {
      id: 'previous',
      label: 'Previous Releases',
      icon: <span className="text-lg">🔄</span>,
      content: <PreviousReleasesTab />
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`max-w-4xl w-full max-h-[85vh] rounded-lg shadow-2xl overflow-hidden flex flex-col ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <h1 className="text-xl font-semibold">
            What's New in v1.1.0
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
            defaultActiveTab="highlights"
            theme={theme}
            className="h-full"
          />
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                🥭 Flower Menu Builder v1.1.0
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
              Got it!
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