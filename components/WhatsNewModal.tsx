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
          <h2 className="text-2xl font-bold text-orange-500">🎉 What's New in v1.1.0</h2>
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
            
            {/* Main Feature */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🚀 Auto-Format Menu</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The game-changing feature you've been waiting for! One-click intelligent optimization that automatically finds the perfect font size and line spacing for your menu layout.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
                  theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <h4 className="font-semibold text-green-600 mb-2">📈 Expansion Mode</h4>
                  <p className="text-sm">When no overflow detected, maximizes font size up to 48px and optimizes line spacing for maximum readability and visual impact.</p>
                </div>
                <div className={`p-4 rounded-lg border-l-4 border-red-500 ${
                  theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                }`}>
                  <h4 className="font-semibold text-red-600 mb-2">📉 Reduction Mode</h4>
                  <p className="text-sm">When overflow detected, intelligently reduces line spacing first, then font size only if needed to eliminate overflow.</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-l-4 border-orange-400 ${
                theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
              }`}>
                <p className="text-sm">
                  <strong>✨ Smart Features:</strong> Real-time feedback, automatic iteration, visual button states, and protected controls during optimization. Works with any column count you choose!
                </p>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* New Shelf Types */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🏷️ New Shelf Types & Features</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
                  theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <h4 className="font-semibold text-green-600 mb-2">🌿 Michigan Infused Flower</h4>
                  <p className="text-sm mb-2">Three new specialized shelf types for Michigan locations:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li><strong>Exotic Live Resin Infused</strong> - Premium tier with gradient styling</li>
                    <li><strong>Premium Distillate Infused</strong> - Mid-tier options</li>
                    <li><strong>Value Distillate Infused</strong> - Budget-friendly choices</li>
                  </ul>
                  <p className="text-xs mt-2 opacity-75">Features per-gram and 5g pricing structure with subtle background patterns.</p>
                </div>

                <div className={`p-4 rounded-lg border-l-4 border-red-500 ${
                  theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                }`}>
                  <h4 className="font-semibold text-red-600 mb-2">🏷️ 50% OFF Strains</h4>
                  <p className="text-sm mb-2">New promotional shelf for all locations:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li><strong>Toggle Control</strong> - Easy on/off switch in left panel</li>
                    <li><strong>Top Placement</strong> - Appears at top for maximum visibility</li>
                    <li><strong>Original Shelf Tracking</strong> - Remembers source shelf</li>
                    <li><strong>Eye-Catching Design</strong> - Red-to-orange gradient</li>
                  </ul>
                  <p className="text-xs mt-2 opacity-75">Includes "Original Shelf" as a sorting option to maintain organization.</p>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Enhanced Features */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">⚡ Enhanced Features</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">🎯 Expanded Ranges</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Font Size:</strong> Now up to 48px (was 24px)</li>
                    <li><strong>Line Spacing:</strong> Full 0.1-1.0 range</li>
                    <li><strong>Better Defaults:</strong> Shelf splitting now OFF by default</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🔧 User Experience</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Protected Controls:</strong> Disabled during optimization</li>
                    <li><strong>Visual Feedback:</strong> Color-coded button states</li>
                    <li><strong>Fast Processing:</strong> 25ms iteration delays</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Getting Started */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🎯 Getting Started</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <strong>Add your strains</strong> to the appropriate shelves
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <strong>Choose your column count</strong> (2-3 columns recommended)
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <strong>Click Auto-Format Menu</strong> for instant optimization
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <strong>Export your perfectly formatted menu</strong> as PNG or JPEG
                  </div>
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