import React, { useState, useEffect } from 'react';
import { Theme, MenuMode } from '../types';
import { Button } from './common/Button';
import { DownloadIcon, TableCellsIcon } from './common/Icon';

interface UnifiedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  menuMode: MenuMode;
  exportFilename: string;
  onExportFilenameChange: (filename: string) => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onExportCSV: () => void;
  isExporting: boolean;
}

export const UnifiedExportModal: React.FC<UnifiedExportModalProps> = ({
  isOpen,
  onClose,
  theme,
  menuMode,
  exportFilename,
  onExportFilenameChange,
  onExportPNG,
  onExportJPEG,
  onExportCSV,
  isExporting,
}) => {
  const [localFilename, setLocalFilename] = useState(exportFilename);

  // Sync local filename with parent when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilename(exportFilename);
    }
  }, [isOpen, exportFilename]);

  // Update parent filename on change
  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilename = e.target.value;
    setLocalFilename(newFilename);
    onExportFilenameChange(newFilename);
  };

  const handleExportPNG = () => {
    onExportPNG();
    onClose();
  };

  const handleExportJPEG = () => {
    onExportJPEG();
    onClose();
  };

  const handleExportCSV = () => {
    onExportCSV();
    onClose(); // Close this modal so CSV modal can open cleanly
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50">
      <div className={`relative max-w-lg w-full mx-4 rounded-xl shadow-2xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Export Menu
            </h2>
            <button
              onClick={onClose}
              disabled={isExporting}
              className={`p-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filename Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Export Filename
            </label>
            <input
              type="text"
              value={localFilename}
              onChange={handleFilenameChange}
              placeholder="mango-menu"
              disabled={isExporting}
              className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-100'
                  : 'bg-gray-50 border-gray-300 placeholder-gray-500 text-gray-900'
              } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <p className={`mt-1 text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              This filename will be used for all export formats
            </p>
          </div>

          {/* Export Options */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* PNG Export */}
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 hover:bg-sky-900/30 hover:border-sky-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-sky-50 hover:border-sky-500'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-sky-600/20 group-hover:bg-sky-600/30'
                      : 'bg-sky-100 group-hover:bg-sky-200'
                  }`}>
                    <DownloadIcon className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-sky-400' : 'text-sky-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    PNG
                  </span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    High Quality
                  </span>
                </div>
              </button>

              {/* JPEG Export */}
              <button
                onClick={handleExportJPEG}
                disabled={isExporting}
                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 hover:bg-teal-900/30 hover:border-teal-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-teal-50 hover:border-teal-500'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-teal-600/20 group-hover:bg-teal-600/30'
                      : 'bg-teal-100 group-hover:bg-teal-200'
                  }`}>
                    <DownloadIcon className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-teal-400' : 'text-teal-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    JPEG
                  </span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Compressed
                  </span>
                </div>
              </button>

              {/* CSV Export */}
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className={`relative group p-4 rounded-xl border-2 transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 hover:bg-lime-900/30 hover:border-lime-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-lime-50 hover:border-lime-500'
                } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-lime-600/20 group-hover:bg-lime-600/30'
                      : 'bg-lime-100 group-hover:bg-lime-200'
                  }`}>
                    <TableCellsIcon className={`w-6 h-6 ${
                      theme === 'dark' ? 'text-lime-400' : 'text-lime-600'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    CSV
                  </span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Spreadsheet
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Info Text */}
          <div className={`p-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
          }`}>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <strong>PNG:</strong> Best for printing and high-quality displays<br />
              <strong>JPEG:</strong> Smaller file size, good for digital sharing<br />
              <strong>CSV:</strong> Export data for spreadsheets and inventory tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};