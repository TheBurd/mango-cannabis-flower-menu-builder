import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../types';

interface DebugMessage {
  timestamp: string;
  type: string;
  message: string;
  data?: any;
}

interface DebugConsoleProps {
  theme: Theme;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<DebugMessage[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Listen for debug messages
    const handleDebugMessage = (_event: any, data: any) => {
      const newMessage: DebugMessage = {
        timestamp: new Date().toLocaleTimeString(),
        type: data.type || 'info',
        message: data.message || 'Unknown message',
        data: data
      };
      
      setMessages(prev => [...prev, newMessage]);
    };

    window.electronAPI?.onUpdateDebug?.(handleDebugMessage);

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    // Handle backtick key to toggle console
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Only toggle if not typing in an input/textarea
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          event.preventDefault();
          setIsVisible(prev => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  const clearLog = () => {
    setMessages([]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return theme === 'dark' ? 'text-red-400' : 'text-red-600';
      case 'available': return theme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'checking': return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
      case 'not-available': return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
      default: return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    }
  };

  if (!isVisible) return null;

  const bgClasses = theme === 'dark' 
    ? 'bg-gray-900 border-gray-700' 
    : 'bg-white border-gray-300';
  
  const textClasses = theme === 'dark' 
    ? 'text-gray-100' 
    : 'text-gray-900';

  const headerBgClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-gray-50 border-gray-200';

  const logBgClasses = theme === 'dark'
    ? 'bg-gray-800'
    : 'bg-gray-50';

  return (
    <div className="fixed inset-4 z-50 flex items-center justify-center">
      <div className="w-full max-w-4xl h-3/4 flex flex-col">
        <div 
          className={`${bgClasses} border rounded-lg shadow-2xl overflow-hidden flex flex-col h-full`}
          style={{
            backdropFilter: 'blur(8px)',
            boxShadow: theme === 'dark' 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' 
              : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Header */}
          <div className={`${headerBgClasses} border-b px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className={`ml-4 text-sm font-medium ${textClasses}`}>Auto-Updater Debug Console</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearLog}
                className={`text-xs px-3 py-1 rounded ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
              >
                Clear
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Log Area */}
          <div 
            ref={logRef}
            className={`${logBgClasses} flex-1 p-4 overflow-y-auto font-mono text-sm select-text`}
            style={{ userSelect: 'text' }}
          >
            {messages.length === 0 ? (
              <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} italic`}>
                No debug messages yet. Press ` (backtick) to toggle this console.
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-2 leading-relaxed">
                  <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    [{msg.timestamp}]
                  </span>
                  {' '}
                  <span className={`font-semibold ${getTypeColor(msg.type)}`}>
                    [{msg.type.toUpperCase()}]
                  </span>
                  {' '}
                  <span className={textClasses}>
                    {msg.message}
                  </span>
                  {msg.data && msg.data.info && (
                    <div className={`ml-4 mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {JSON.stringify(msg.data.info, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={`${headerBgClasses} border-t px-4 py-2`}>
            <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Press ` (backtick) to toggle • {messages.length} messages • Text is selectable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 