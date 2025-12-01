import React, { useCallback, useState, useRef } from 'react';
import { Theme } from '../types';
import { TabContainer, TabItem } from './common/TabContainer';
import { FeedbackPopup } from './FeedbackPopup';
import { APP_VERSION } from '../version';

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

  const releaseCards = [
    {
      title: 'Shelf Configurator',
      color: 'border-lime-400',
      bg: theme === 'dark' ? 'bg-lime-900/20 text-gray-200 border-opacity-70' : 'bg-lime-50 text-gray-700',
      points: [
        'Add/remove/reorder shelves, set colors/text/pricing per state and mode.',
        'Save/load configs with export/import for reuse across clients.',
        'Gear icon in toolbar jumps straight into configuration.',
        'Shelf edits keep menu items; defaults reset now require a quick double-confirm.'
      ]
    },
    {
      title: 'Unified Search & Interactive Overlay',
      color: 'border-sky-400',
      bg: theme === 'dark' ? 'bg-sky-900/20 text-gray-200 border-opacity-70' : 'bg-sky-50 text-gray-700',
      points: [
        'Search bars in Bulk + Pre-Packaged with field switcher (name/brand/type/shelf/any).',
        'Overlay stays visible on hover; click any item to auto-scroll the editor.',
        'Clear empty-state messaging and sorting guardrails while filtering.'
      ]
    },
    {
      title: 'Pre-Packaged UI Refresh',
      color: 'border-amber-400',
      bg: theme === 'dark' ? 'bg-amber-900/20 text-gray-200 border-opacity-70' : 'bg-amber-50 text-gray-700',
      points: [
        'Bulk-style headers with pill sort buttons and aligned clear/toggle stack.',
        'Neutral product canvas (no shelf bleed) plus tightened spacing.',
        'Custom colors now flow through tabs/headers consistently.'
      ]
    },
    {
      title: 'CSV Imports & Shelves',
      color: 'border-emerald-400',
      bg: theme === 'dark' ? 'bg-emerald-900/20 text-gray-200 border-opacity-70' : 'bg-emerald-50 text-gray-700',
      points: [
        'Imports respect your current shelf configuration.',
        'Option to auto-create missing shelves when enabled.',
        'Clear feedback when CSV shelf names do not match.'
      ]
    }
  ];

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
  const HighlightsTab = () => {
    return (
      <div className={`p-6 overflow-y-auto max-h-[60vh] ${
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">What's New in v{APP_VERSION}</h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Release highlights at a glance
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {releaseCards.map((card) => (
              <div
                key={card.title}
                className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 ${card.color} ${card.bg} shadow-sm`}
              >
                <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {card.points.map((point) => (
                    <li key={point} className="leading-snug">- {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const PreviousReleasesTab = () => (
    <div className={`p-6 overflow-y-auto max-h-[60vh] ${
      theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
    }`}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Previous Releases</h2>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Recent updates and improvements
          </p>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.1.1 - Multi-Page & Project Tools</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>- Hamburger project menu with Save/Load/Recent shortcuts (Electron + browser).</li>
            <li>- Multi-page navigation with import/export wizard support for multi-page projects.</li>
            <li>- Recent Projects list and 30s auto-save (with change detection across edits).</li>
            <li>- Improved save/load reliability, cache clearing on launch, and version consistency.</li>
            <li>- Bug fixes: strain updates persisted, Class dropdown stacking, save enablement.</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.1.0 - Complete Pre-Packaged System</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>- Complete pre-packaged menu system with weight categories.</li>
            <li>- Enhanced CSV import with 4-stage wizard and smart mapping.</li>
            <li>- New York state support with regulatory compliance.</li>
            <li>- Toast notification system with animations.</li>
            <li>- Smart reordering with up/down arrows.</li>
            <li>- Advanced scroll navigation overlay.</li>
            <li>- Performance optimizations for large menus.</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.0.3 - Auto-Format & Enhanced Features</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>- Intelligent Auto-Format Menu system.</li>
            <li>- New shelf types (Michigan Infused, 50% OFF).</li>
            <li>- Enhanced UX improvements.</li>
            <li>- 6-column support and layout enhancements.</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.0.2 - Critical CSV Bug Fix</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>- Fixed race condition preventing strain/shelf modifications.</li>
            <li>- Improved CSV import reliability.</li>
            <li>- Enhanced documentation and debugging.</li>
          </ul>
        </div>

        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="font-semibold mb-2">v1.0.1 - Enhanced UX & 6-Column Support</h3>
          <ul className={`space-y-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>- 6-column layout support with sequential filling.</li>
            <li>- Smart overflow detection and warnings.</li>
            <li>- What's New modal and notification system.</li>
            <li>- Image feedback system and drag & drop.</li>
          </ul>
        </div>
      </div>
    </div>
  );
  const tabs: TabItem[] = [
    {
      id: 'highlights',
      label: `v${APP_VERSION} Highlights`,
      icon: <span className="text-lg">🥭</span>,
      content: <HighlightsTab />
    },
    {
      id: 'previous',
      label: 'Previous Releases',
      icon: <span className="text-lg">📜</span>,
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
            What's New in v{APP_VERSION}
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
                🥭 Flower Menu Builder v{APP_VERSION}
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

