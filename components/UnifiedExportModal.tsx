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
  // Multi-page support
  totalPages?: number;
  onExportPNGBatch?: () => void;
  onExportJPEGBatch?: () => void;
  onExportCSVBatch?: () => void;
  onExportPNGSequential?: () => void;
  onExportJPEGSequential?: () => void;
  onExportCSVSequential?: () => void;
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
  totalPages = 1,
  onExportPNGBatch,
  onExportJPEGBatch,
  onExportCSVBatch,
  onExportPNGSequential,
  onExportJPEGSequential,
  onExportCSVSequential,
}) => {
  const [localFilename, setLocalFilename] = useState(exportFilename);
  const [exportMode, setExportMode] = useState<'single' | 'batch' | 'sequential'>(
    totalPages > 1 ? 'batch' : 'single'
  );
  const [namingMode, setNamingMode] = useState<'auto' | 'custom' | 'individual'>('auto');
  const [customPattern, setCustomPattern] = useState('{base}-page-{page}');
  const [individualNames, setIndividualNames] = useState<Record<number, string>>({});
  const isMultiPage = totalPages > 1;

  // Available naming patterns
  const namingPatterns = [
    { pattern: '{base}-page-{page}', description: 'menu-page-1', example: 'Simple page numbering' },
    { pattern: '{base}-{page}-of-{total}', description: 'menu-1-of-3', example: 'Page count format' },
    { pattern: '{base}-{date}-pg{page-padded}', description: 'menu-2024-01-15-pg01', example: 'Date with padded numbers' },
    { pattern: '{base}-{datetime}', description: 'menu-2024-01-15T14-30-00', example: 'Full timestamp' }
  ];

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
    if (isMultiPage && exportMode === 'batch' && onExportPNGBatch) {
      onExportPNGBatch();
    } else if (isMultiPage && exportMode === 'sequential' && onExportPNGSequential) {
      onExportPNGSequential();
    } else {
      onExportPNG();
    }
    onClose();
  };

  const handleExportJPEG = () => {
    if (isMultiPage && exportMode === 'batch' && onExportJPEGBatch) {
      onExportJPEGBatch();
    } else if (isMultiPage && exportMode === 'sequential' && onExportJPEGSequential) {
      onExportJPEGSequential();
    } else {
      onExportJPEG();
    }
    onClose();
  };

  const handleExportCSV = () => {
    // For multi-page exports, bypass the column mapping modal and use standard format
    if (isMultiPage && exportMode === 'batch' && onExportCSVBatch) {
      onExportCSVBatch();
      onClose(); // Close modal after starting export
    } else if (isMultiPage && exportMode === 'sequential' && onExportCSVSequential) {
      onExportCSVSequential();
      onClose(); // Close modal after starting export
    } else {
      // Single page export - open column mapping modal for customization
      onExportCSV();
      onClose(); // Close this modal so CSV modal can open cleanly
    }
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
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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

          {/* Multi-page Export Mode Selection */}
          {isMultiPage && (
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Export Mode ({totalPages} pages)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExportMode('single')}
                  className={`p-3 rounded-lg text-xs font-medium transition-all ${
                    exportMode === 'single'
                      ? theme === 'dark'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Current Page Only
                </button>
                <button
                  type="button"
                  onClick={() => setExportMode('batch')}
                  className={`p-3 rounded-lg text-xs font-medium transition-all ${
                    exportMode === 'batch'
                      ? theme === 'dark'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ZIP Archive
                </button>
                <button
                  type="button"
                  onClick={() => setExportMode('sequential')}
                  className={`p-3 rounded-lg text-xs font-medium transition-all ${
                    exportMode === 'sequential'
                      ? theme === 'dark'
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Individual Files
                </button>
              </div>
              <p className={`mt-2 text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {exportMode === 'single' && 'Export only the currently viewed page'}
                {exportMode === 'batch' && 'Download all pages in a single ZIP file'}
                {exportMode === 'sequential' && 'Download each page individually with file dialogs'}
              </p>
            </div>
          )}

          {/* Advanced Naming Options for Multi-Page Exports */}
          {isMultiPage && exportMode !== 'single' && (
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                File Naming ({totalPages} files)
              </label>
              
              {/* Naming Mode Selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setNamingMode('auto')}
                  className={`p-2 rounded text-xs font-medium transition-all ${
                    namingMode === 'auto'
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Auto Pattern
                </button>
                <button
                  type="button"
                  onClick={() => setNamingMode('custom')}
                  className={`p-2 rounded text-xs font-medium transition-all ${
                    namingMode === 'custom'
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Custom Pattern
                </button>
                <button
                  type="button"
                  onClick={() => setNamingMode('individual')}
                  className={`p-2 rounded text-xs font-medium transition-all ${
                    namingMode === 'individual'
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Individual Names
                </button>
              </div>

              {/* Auto Pattern Selection */}
              {namingMode === 'auto' && (
                <div className="space-y-2">
                  {namingPatterns.map((pattern, index) => (
                    <label key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="naming-pattern"
                        checked={customPattern === pattern.pattern}
                        onChange={() => setCustomPattern(pattern.pattern)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {pattern.description}
                        </div>
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {pattern.example}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Custom Pattern Input */}
              {namingMode === 'custom' && (
                <div>
                  <input
                    type="text"
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                    placeholder="{base}-page-{page}"
                    className={`w-full px-3 py-2 rounded border text-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <div className={`mt-2 text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <strong>Variables:</strong> {'{base}'} = filename, {'{page}'} = page number, {'{total}'} = total pages, {'{date}'} = YYYY-MM-DD, {'{datetime}'} = full timestamp
                  </div>
                  <div className={`mt-1 text-xs font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Preview: {customPattern.replace('{base}', localFilename).replace('{page}', '1').replace('{total}', totalPages.toString()).replace('{date}', '2024-01-15').replace('{datetime}', '2024-01-15T14-30-00')}
                  </div>
                </div>
              )}

              {/* Individual Names */}
              {namingMode === 'individual' && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <div key={pageNum} className="flex items-center space-x-2">
                      <span className={`text-sm w-16 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Page {pageNum}:
                      </span>
                      <input
                        type="text"
                        value={individualNames[pageNum] || `${localFilename}-page-${pageNum}`}
                        onChange={(e) => setIndividualNames(prev => ({
                          ...prev,
                          [pageNum]: e.target.value
                        }))}
                        className={`flex-1 px-2 py-1 rounded border text-xs ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-gray-100'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
              {isMultiPage && (
                <>
                  <br /><br />
                  <strong>Multi-page modes:</strong><br />
                  <strong>ZIP Archive:</strong> All pages in one download<br />
                  <strong>Individual Files:</strong> Separate save dialogs per page
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};