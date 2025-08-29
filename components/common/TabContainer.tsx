import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, ReactNode } from 'react';
import { Theme } from '../../types';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabContainerProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  theme: Theme;
  className?: string;
  onTabChange?: (tabId: string) => void;
}

export const TabContainer: React.FC<TabContainerProps> = ({
  tabs,
  defaultActiveTab,
  theme,
  className = '',
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(() => 
    defaultActiveTab || tabs.find(tab => !tab.disabled)?.id || tabs[0]?.id || ''
  );
  
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Set initial indicator position and size immediately on mount
  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeIndex !== -1 && indicatorRef.current && tabsRef.current[activeIndex]) {
      const activeButton = tabsRef.current[activeIndex];
      if (activeButton) {
        const { offsetLeft, offsetWidth } = activeButton;
        indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
        indicatorRef.current.style.width = `${offsetWidth}px`;
      }
    }
  }, []); // Run only on mount

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeIndex !== -1 && indicatorRef.current && tabsRef.current[activeIndex]) {
      const activeButton = tabsRef.current[activeIndex];
      if (activeButton) {
        const { offsetLeft, offsetWidth } = activeButton;
        indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
        indicatorRef.current.style.width = `${offsetWidth}px`;
      }
    }
  }, [activeTab, tabs]);

  const handleTabClick = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tab.disabled) return;
    
    setActiveTab(tabId);
    onTabChange?.(tabId);
  }, [tabs, onTabChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleTabClick(tabId);
        return;
    }

    // Find next non-disabled tab
    let attempts = 0;
    while (tabs[nextIndex]?.disabled && attempts < tabs.length) {
      nextIndex = e.key === 'ArrowLeft' || e.key === 'Home' 
        ? (nextIndex > 0 ? nextIndex - 1 : tabs.length - 1)
        : (nextIndex < tabs.length - 1 ? nextIndex + 1 : 0);
      attempts++;
    }

    if (!tabs[nextIndex]?.disabled) {
      tabsRef.current[nextIndex]?.focus();
    }
  }, [tabs, handleTabClick]);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Tab Navigation */}
      <div className={`relative border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => {tabsRef.current[index] = el;}}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              disabled={tab.disabled}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors transition-background-color duration-200
                whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2
                ${activeTab === tab.id
                  ? theme === 'dark'
                    ? 'text-orange-400 bg-gray-800/50'
                    : 'text-orange-600 bg-orange-50/50'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
                ${tab.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
                ${theme === 'dark' 
                  ? 'focus:ring-orange-500' 
                  : 'focus:ring-orange-400'
                }
              `}
            >
              {tab.icon && (
                <span className="flex-shrink-0">
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Active tab indicator */}
        <div
          ref={indicatorRef}
          className={`absolute bottom-0 h-0.5 transition-transform transition-colors duration-200 ease-out ${
            theme === 'dark' ? 'bg-orange-400' : 'bg-orange-600'
          }`}
          style={{ width: '0px', transform: 'translateX(0px)' }}
        />
      </div>

      {/* Tab Content */}
      <div 
        className="flex-1 min-h-0"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <div className="h-full transition-opacity duration-150">
          {activeTabContent}
        </div>
      </div>
    </div>
  );
};