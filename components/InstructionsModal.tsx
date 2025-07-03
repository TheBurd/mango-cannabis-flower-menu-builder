import React, { useState, useRef } from 'react';
import { Theme } from '../types';
import { FeedbackPopup } from './FeedbackPopup';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose, theme }) => {
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
          <h2 className="text-2xl font-bold text-orange-500">🥭 How to Use Flower Menu Builder</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            }`}
            aria-label="Close instructions"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="p-6 space-y-6">
            
            {/* Quick Start */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🚀 Quick Start</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-orange-400 min-w-[20px]">1.</span>
                  <span><strong>Choose your state</strong> from the header dropdown (Oklahoma, Michigan, New Mexico)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-orange-400 min-w-[20px]">2.</span>
                  <span><strong>Add strains</strong> to shelves by clicking the + button on each shelf</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-orange-400 min-w-[20px]">3.</span>
                  <span><strong>Use Auto-Format</strong> to automatically optimize your layout for perfect fit</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-orange-400 min-w-[20px]">4.</span>
                  <span><strong>Customize further</strong> using the preview controls on the right if needed</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-orange-400 min-w-[20px]">5.</span>
                  <span><strong>Export your menu</strong> as PNG, JPEG, or CSV when ready</span>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Auto-Format Feature */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🚀 Auto-Format Menu (NEW!)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">📈 Expansion Mode</h4>
                  <p className="text-sm mb-2">When your menu has no overflow, Auto-Format maximizes readability:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Increases font size up to 48px for maximum impact</li>
                    <li>Optimizes line spacing up to 1.0 for perfect readability</li>
                    <li>Uses real-time overflow detection as feedback</li>
                    <li>Automatically finds the perfect balance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">📉 Reduction Mode</h4>
                  <p className="text-sm mb-2">When your menu has overflow, Auto-Format eliminates it intelligently:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Reduces line spacing first (preserves readability)</li>
                    <li>Only reduces font size if absolutely necessary</li>
                    <li>Makes larger adjustments for dense content</li>
                    <li>Suggests increasing columns if optimization fails</li>
                  </ul>
                </div>
              </div>
              <div className={`mt-4 p-3 rounded-lg border-l-4 border-orange-400 ${
                theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50'
              }`}>
                <p className="text-sm">
                  <strong>💡 Pro Tip:</strong> The Auto-Format button changes color based on your menu status - 
                  <span className="text-orange-600"> orange when overflow detected</span>, 
                  <span className="text-gray-600"> gray when optimized</span>. 
                  All controls are disabled during optimization to prevent interference.
                </p>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* New Shelf Types */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🏷️ Special Shelf Types (NEW!)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">🌿 Michigan Infused Flower</h4>
                  <p className="text-sm mb-2">Michigan locations now have specialized infused flower shelves:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Exotic Live Resin Infused:</strong> Premium tier with gradient styling</li>
                    <li><strong>Premium Distillate Infused:</strong> Mid-tier options</li>
                    <li><strong>Value Distillate Infused:</strong> Budget-friendly choices</li>
                    <li><strong>Special Pricing:</strong> Per-gram and 5g structure</li>
                    <li><strong>Visual Pattern:</strong> Subtle background pattern for distinction</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">🏷️ 50% OFF Strains</h4>
                  <p className="text-sm mb-2">All locations can now use a promotional shelf for marked-down strains:</p>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Toggle Control:</strong> Easy on/off switch in left panel</li>
                    <li><strong>Top Placement:</strong> Appears at top for maximum visibility</li>
                    <li><strong>Original Shelf Tracking:</strong> Remembers source shelf</li>
                    <li><strong>Eye-Catching Design:</strong> Red-to-orange gradient</li>
                    <li><strong>Special Sorting:</strong> Includes "Original Shelf" option</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Strain Management */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🌿 Managing Strains</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Adding Strains</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Click the <strong>+ Add Strain</strong> button on any shelf</li>
                    <li>Fill in strain name, grower, THC%, and type</li>
                    <li>Check "Last Jar" for low inventory items</li>
                    <li>Use copy buttons to duplicate strains above/below</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bulk Operations</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Import CSV:</strong> Upload spreadsheet data</li>
                    <li><strong>Export CSV:</strong> Download your strain data</li>
                    <li><strong>Clear All:</strong> Remove all strains from shelves</li>
                    <li><strong>Sort:</strong> Organize by name, grower, THC%, type</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Layout & Design */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🎨 Menu Design</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Page Layout</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Page Size:</strong> Letter Portrait/Landscape, 16:9 Screen</li>
                    <li><strong>Columns:</strong> 1-6 columns (auto-adjusts to content)</li>
                    <li><strong>Headers:</strong> Large, Small, or None</li>
                    <li><strong>THC Icons:</strong> State-specific compliance symbols</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Typography</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Font Size:</strong> Adjust base text size (8-48px) or use Auto-Format</li>
                    <li><strong>Line Spacing:</strong> Control padding between items (0.1-1.0)</li>
                    <li><strong>Auto-Format:</strong> One-click intelligent optimization for perfect fit</li>
                    <li><strong>Shelf Splitting:</strong> Allow/prevent shelves across columns (default: OFF)</li>
                    <li><strong>Responsive:</strong> Text scales with zoom level</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Preview Controls */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">🔍 Preview Controls</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Layout Optimization</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Auto-Format Menu:</strong> One-click intelligent optimization</li>
                    <li><strong>Font Size Control:</strong> Precise adjustment (8-48px range)</li>
                    <li><strong>Line Spacing:</strong> Fine-tune padding (0.1-1.0 range)</li>
                    <li><strong>Columns:</strong> 1-6 column layouts for any display size</li>
                    <li><strong>Overflow Detection:</strong> Real-time warnings with optimization suggestions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Navigation & View</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Pan:</strong> Click and drag to move around</li>
                    <li><strong>Zoom:</strong> Mouse wheel (around cursor) or +/- buttons</li>
                    <li><strong>Fit to Window:</strong> Auto-size to screen</li>
                    <li><strong>Reset:</strong> Return to default view</li>
                    <li><strong>Protected Mode:</strong> Controls lock during Auto-Format optimization</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Keyboard Shortcuts */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">⌨️ Keyboard Shortcuts</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Navigation</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Ctrl+F:</strong> Fit to window</li>
                    <li><strong>Ctrl + / Ctrl -:</strong> Zoom in/out</li>
                    <li><strong>Mouse Wheel:</strong> Zoom around cursor</li>
                    <li><strong>Click + Drag:</strong> Pan around artboard</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">File Operations</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li><strong>Ctrl+N:</strong> New menu (clear all)</li>
                    <li><strong>Ctrl+O:</strong> Open CSV file</li>
                    <li><strong>Ctrl+S:</strong> Export menu (PNG)</li>
                    <li><strong>Esc:</strong> Close modals</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Export Options */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">📤 Export Options</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">PNG Export</h4>
                  <p className="text-sm">High-quality images perfect for printing. Supports transparency and maintains crisp text at any size.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">JPEG Export</h4>
                  <p className="text-sm">Compressed images ideal for web use, email, or social media. Smaller file sizes with good quality.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">CSV Export</h4>
                  <p className="text-sm">Download your strain data to use in this app later, for inventory management, POS systems, or backup. Maintains sort order.</p>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* State Compliance */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">📋 State Compliance</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Oklahoma</h4>
                  <p className="text-sm">THC triangle symbol with red border. Supports Top, Mid, and Bottom shelf pricing.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Michigan</h4>
                  <p className="text-sm">Green THC triangle with specific MI regulations. Includes Premium and Value tiers.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">New Mexico</h4>
                  <p className="text-sm">Red THC diamond symbol. Supports various shelf configurations for state compliance.</p>
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* CSV Format */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">📊 CSV Import Format</h3>
              <div className={`p-4 rounded-lg font-mono text-sm ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
              }`}>
                <div className="mb-2">Required columns:</div>
                <div><strong>Category</strong>, <strong>Strain Name</strong>, <strong>Grower/Brand</strong>, <strong>THC %</strong>, <strong>Class</strong>, <strong>Last Jar</strong></div>
                <div className="mt-2 text-xs opacity-75">
                  Example: "Top Shelf","Wedding Cake","Green House","24.5%","Hybrid","No"
                </div>
              </div>
            </section>

            {/* Horizontal Divider */}
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Tips & Tricks */}
            <section>
              <h3 className="text-xl font-semibold mb-3 text-orange-500">💡 Tips & Tricks</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Auto-Format Best Practices</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Start with Auto-Format for instant optimization</li>
                    <li>Choose your column count first, then auto-format</li>
                    <li>Use 50% OFF toggle before auto-formatting for best results</li>
                    <li>Auto-Format works best with 20-50 strains per menu</li>
                    <li>Let optimization complete before making manual adjustments</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Workflow Efficiency</h4>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Use shelf tabs to quickly jump between sections</li>
                    <li>Copy similar strains to save time on data entry</li>
                    <li>Sort globally before fine-tuning individual shelves</li>
                    <li>Save CSV backups of your strain data regularly</li>
                    <li>Preview at 100% zoom before exporting</li>
                  </ul>
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
              🥭 Mango Cannabis Flower Menu Builder v1.0.3
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
            Got it!
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