import React, { useState, useRef } from 'react';
import { Theme } from '../types';
import { FeedbackPopup } from './FeedbackPopup';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose, theme }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const feedbackButtonRef = useRef<HTMLButtonElement>(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleToggleFeedback = () => {
    setShowFeedbackForm(!showFeedbackForm);
  };

  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={`max-w-4xl w-full max-h-[90vh] rounded-lg shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <h2 className="text-2xl font-bold text-orange-500">🎉 What's New in v1.0.2</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            aria-label="Close what's new modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="p-6 space-y-6">
            
            {/* v1.0.2 Bug Fix */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-red-500">🐛 Critical Bug Fix - v1.0.2</h3>
              <div className={`p-4 rounded-lg border-l-4 border-red-400 ${
                theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
              }`}>
                <h4 className="font-semibold mb-2 text-red-600">CSV Import Functionality Restored</h4>
                <p className="text-sm leading-relaxed mb-3">
                  Fixed a critical bug where users couldn't modify strains or shelves after importing CSV data. 
                  This was caused by a race condition in the state management system that prevented proper UI updates.
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li><strong>Strain Management:</strong> Add, edit, and delete strains now works properly after CSV import</li>
                  <li><strong>Shelf Operations:</strong> All shelf management features restored post-import</li>
                  <li><strong>Data Integrity:</strong> CSV import no longer breaks the app's interactive functionality</li>
                </ul>
              </div>
            </section>

            {/* Previous Release Overview */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🔄 Previous Release - v1.0.1</h3>
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
              }`}>
                <p className="text-sm leading-relaxed">
                  Version 1.0.1 brought significant improvements to layout flexibility, user experience, and visual feedback. 
                  This update focused on enhanced column layouts, smarter overflow detection, and improved zoom controls 
                  for a more professional menu building experience.
                </p>
              </div>
            </section>

            {/* Layout Enhancements */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">📐 Layout Enhancements</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">✨ 6-Column Support</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Extended column options from 1-4 to 1-6 columns</li>
                    <li>Perfect for high-resolution displays and large format printing</li>
                    <li>Automatically adjusts content to fit more strains per page</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">🔄 Improved Shelf Splitting</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Sequential column filling instead of balanced heights</li>
                    <li>More natural left-to-right content flow</li>
                    <li>Better space utilization for varying shelf sizes</li>
                    <li>Default enabled for optimal layout</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Artboard & Display */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🖼️ Artboard & Display</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">📏 Optimized 16:9 Artboards</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Updated to 3300x1856px (landscape) and 1872x3328px (portrait)</li>
                    <li>Matches high-resolution header image dimensions</li>
                    <li>Better quality for large format displays and printing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">⚠️ Smart Overflow Detection</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Real-time detection when content extends beyond artboard</li>
                    <li>Subtle shelf overlay warnings for problematic layouts</li>
                    <li>Helpful suggestions for layout optimization</li>
                    <li>Warnings hidden during export for clean output</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Experience */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🎯 User Experience</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">🔍 Enhanced Zoom Controls</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Mouse wheel zooming now centers around cursor position</li>
                    <li>UI zoom buttons center around preview window</li>
                    <li>Fixed "Fit to Window" and "Reset Zoom" positioning</li>
                    <li>Improved artboard centering and navigation</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">🎨 UI Improvements</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Unified preview control heights and styling</li>
                    <li>Compact dropdown variants for better space usage</li>
                    <li>Repositioned Global Sort controls for better workflow</li>
                    <li>Consistent visual feedback throughout the app</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Technical Improvements */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">⚙️ Technical Improvements</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">🔧 Performance & Stability</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Improved CSS column layout with <code className={`px-1 py-0.5 rounded text-xs ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>column-fill: auto</code></li>
                    <li>Enhanced overflow detection using ResizeObserver</li>
                    <li>Better memory management for large menus</li>
                    <li>Optimized rendering performance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">🛠️ Bug Fixes</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Fixed shelf headers getting stuck in wrong columns</li>
                    <li>Resolved double scaling issues in zoom calculations</li>
                    <li>Corrected artboard positioning and centering</li>
                    <li>Improved export quality and consistency</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Coming Soon */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🔮 Looking Ahead</h3>
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-purple-50'
              }`}>
                <p className="text-sm leading-relaxed mb-3">
                  We're continuously working to improve Flower Menu Builder based on your feedback. 
                  Here's what's on our roadmap for future releases:
                </p>
                <ul className="text-sm space-y-2 list-disc list-inside mb-4">
                  <li><strong>User Profiles & Cloud Storage:</strong> Create local user profiles and connect with mangocannabis.com Google Drive accounts to save and sync your flower menu projects across devices</li>
                  <li><strong>Custom Shelf Creation:</strong> Build your own custom shelves with personalized pricing tiers and naming conventions</li>
                  <li><strong>Pre-Packaged Flower Support:</strong> Enhanced features for states transitioning to pre-packaged flower requirements</li>
                  <li><strong>Advanced Templates:</strong> Pre-built menu templates for different dispensary styles and state requirements</li>
                  <li><strong>Batch Operations:</strong> Import/export multiple menu configurations and bulk strain management tools</li>
                  <li><strong>Enhanced Analytics:</strong> Track popular strains, pricing trends, and menu performance insights</li>
                </ul>
                <div className={`p-3 rounded border-l-4 border-orange-400 ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-orange-50'
                }`}>
                  <p className="text-sm">
                    <strong>💡 Have ideas or feedback?</strong> Use the "Leave Feedback" button below to contact <strong>brad@mangocannabis.com</strong> directly. 
                    Your input helps shape the future of Flower Menu Builder!
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-between items-center ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              🥭 Flower Menu Builder v1.0.2
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
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Awesome!
          </button>
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