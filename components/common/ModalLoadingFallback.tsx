import React from 'react';

interface ModalLoadingFallbackProps {
  theme?: 'light' | 'dark';
}

/**
 * A lightweight loading fallback for lazy-loaded modals.
 * Shows a centered spinner overlay while the modal component loads.
 */
export const ModalLoadingFallback: React.FC<ModalLoadingFallbackProps> = ({ theme = 'light' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`p-6 rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
};
