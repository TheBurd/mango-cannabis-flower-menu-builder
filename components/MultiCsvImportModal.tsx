import React, { useState, useCallback, useMemo } from 'react';
import { Theme, MenuMode } from '../types';
import { HelpTooltip } from './common/HelpTooltip';

interface MultiCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  menuMode: MenuMode;
  onImport: (files: MultiCsvImportData[], shouldSplitIntoPages: boolean) => void;
}

interface MultiCsvImportData {
  filename: string;
  data: ImportData[];
  mappingConfig: ColumnMapping;
}

interface ImportData {
  [key: string]: string;
}

interface ColumnMapping {
  [csvColumn: string]: string; // Maps CSV column to app field
}

interface CsvFileInfo {
  file: File;
  content: string;
  headers: string[];
  data: ImportData[];
  mappingConfig: ColumnMapping;
  isValid: boolean;
  errors: string[];
}

type ImportStage = 'upload' | 'mapping' | 'validation' | 'complete';

export const MultiCsvImportModal: React.FC<MultiCsvImportModalProps> = ({
  isOpen,
  onClose,
  theme,
  menuMode,
  onImport,
}) => {
  const [stage, setStage] = useState<ImportStage>('upload');
  const [csvFiles, setCsvFiles] = useState<CsvFileInfo[]>([]);
  const [splitIntoPages, setSplitIntoPages] = useState(true);
  const [processingIndex, setProcessingIndex] = useState(0);

  // Auto-detect delimiter
  const detectDelimiter = useCallback((csvContent: string) => {
    const firstLine = csvContent.split('\n')[0];
    const delimiters = [',', ';', '\t', '|'];
    let bestDelimiter = ',';
    let maxColumns = 0;

    for (const delim of delimiters) {
      const columns = firstLine.split(delim).length;
      if (columns > maxColumns) {
        maxColumns = columns;
        bestDelimiter = delim;
      }
    }

    return bestDelimiter;
  }, []);

  // Parse CSV content
  const parseCsvData = useCallback((content: string, delim: string) => {
    const lines = content.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length <= 1) return { headers: [], data: [] };

    const rawHeaders = lines[0].split(delim).map(header => 
      header.trim().replace(/^"|"$/g, '')
    );
    
    const headers = rawHeaders.map((header, index) => {
      if (!header || header.trim() === '') {
        if (index === 0) return 'Category';
        return `Column${index + 1}`;
      }
      return header;
    });

    const data = lines.slice(1).map(line => {
      const cells = line.split(delim).map(cell => 
        cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
      );
      
      const row: ImportData = {};
      headers.forEach((header, index) => {
        row[header] = cells[index] || '';
      });
      
      return row;
    });

    return { headers, data };
  }, []);

  // Basic mapping suggestions - simplified for multi-file import
  const suggestBasicMappings = useCallback((headers: string[]): ColumnMapping => {
    const suggestions: ColumnMapping = {};
    
    // Simple header name matching for common patterns
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      
      if (normalizedHeader.includes('strain') || normalizedHeader.includes('product') || normalizedHeader.includes('name')) {
        if (!Object.values(suggestions).includes('name')) {
          suggestions[header] = 'name';
        }
      } else if (normalizedHeader.includes('category') || normalizedHeader.includes('shelf')) {
        if (!Object.values(suggestions).includes('shelf')) {
          suggestions[header] = 'shelf';
        }
      } else if (normalizedHeader.includes('brand') || normalizedHeader.includes('grower')) {
        if (!Object.values(suggestions).includes(menuMode === MenuMode.BULK ? 'grower' : 'brand')) {
          suggestions[header] = menuMode === MenuMode.BULK ? 'grower' : 'brand';
        }
      } else if (normalizedHeader.includes('thc')) {
        if (!Object.values(suggestions).includes('thc')) {
          suggestions[header] = 'thc';
        }
      } else if (normalizedHeader.includes('price') && menuMode === MenuMode.PREPACKAGED) {
        if (!Object.values(suggestions).includes('price')) {
          suggestions[header] = 'price';
        }
      }
    });

    return suggestions;
  }, [menuMode]);

  // Handle multiple file upload
  const handleFilesUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const processedFiles: CsvFileInfo[] = [];

    for (const file of files) {
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const delimiter = detectDelimiter(content);
        const { headers, data } = parseCsvData(content, delimiter);
        const mappingConfig = suggestBasicMappings(headers);

        // Basic validation
        const errors: string[] = [];
        if (headers.length === 0) {
          errors.push('No headers found');
        }
        if (data.length === 0) {
          errors.push('No data rows found');
        }

        processedFiles.push({
          file,
          content,
          headers,
          data,
          mappingConfig,
          isValid: errors.length === 0,
          errors
        });
      } catch (error) {
        processedFiles.push({
          file,
          content: '',
          headers: [],
          data: [],
          mappingConfig: {},
          isValid: false,
          errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`]
        });
      }
    }

    setCsvFiles(processedFiles);
    setStage('mapping');
  }, [detectDelimiter, parseCsvData, suggestBasicMappings]);

  // Update mapping for a specific file
  const updateFileMapping = useCallback((fileIndex: number, csvColumn: string, appField: string) => {
    setCsvFiles(prev => prev.map((fileInfo, index) => {
      if (index !== fileIndex) return fileInfo;

      const newMapping = { ...fileInfo.mappingConfig };
      
      // Remove any existing mapping to this app field
      Object.keys(newMapping).forEach(key => {
        if (newMapping[key] === appField && key !== csvColumn) {
          delete newMapping[key];
        }
      });
      
      if (appField === '') {
        delete newMapping[csvColumn];
      } else {
        newMapping[csvColumn] = appField;
      }

      return {
        ...fileInfo,
        mappingConfig: newMapping
      };
    }));
  }, []);

  // Validate all files
  const validateAllFiles = useCallback(() => {
    const errors: string[] = [];
    const validFiles = csvFiles.filter(file => file.isValid && Object.keys(file.mappingConfig).length > 0);

    if (validFiles.length === 0) {
      errors.push('At least one valid file with column mappings is required');
    }

    // Check for required fields
    validFiles.forEach((file, index) => {
      const mappedFields = Object.values(file.mappingConfig);
      const hasName = mappedFields.includes('name');
      const hasShelf = mappedFields.includes('shelf');

      if (!hasName) {
        errors.push(`File ${index + 1} (${file.file.name}): Missing required "name" field mapping`);
      }
      if (!hasShelf) {
        errors.push(`File ${index + 1} (${file.file.name}): Missing required "shelf/category" field mapping`);
      }
    });

    return errors;
  }, [csvFiles]);

  // Handle import
  const handleImport = useCallback(() => {
    const validationErrors = validateAllFiles();
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return;
    }

    const validFiles = csvFiles.filter(file => file.isValid && Object.keys(file.mappingConfig).length > 0);
    const importData: MultiCsvImportData[] = validFiles.map(file => ({
      filename: file.file.name,
      data: file.data,
      mappingConfig: file.mappingConfig
    }));

    onImport(importData, splitIntoPages);
    setStage('complete');
    
    // Close modal after short delay
    setTimeout(() => {
      resetModal();
      onClose();
    }, 1500);
  }, [csvFiles, splitIntoPages, onImport, validateAllFiles, onClose]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setStage('upload');
    setCsvFiles([]);
    setSplitIntoPages(true);
    setProcessingIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Get mapping fields based on menu mode
  const mappingFields = useMemo(() => {
    const baseFields = [
      { key: 'shelf', label: 'Shelf/Category', required: true },
      { key: 'name', label: menuMode === MenuMode.BULK ? 'Strain Name' : 'Product Name', required: true },
    ];

    if (menuMode === MenuMode.BULK) {
      return [
        ...baseFields,
        { key: 'grower', label: 'Grower/Brand', required: false },
        { key: 'thc', label: 'THC %', required: false },
        { key: 'type', label: 'Strain Type', required: false },
        { key: 'lastJar', label: 'Last Jar', required: false },
        { key: 'soldOut', label: 'Sold Out', required: false },
      ];
    } else {
      return [
        ...baseFields,
        { key: 'brand', label: 'Brand', required: false },
        { key: 'thc', label: 'THC %', required: false },
        { key: 'terpenes', label: 'Terpenes %', required: false },
        { key: 'type', label: 'Strain Type', required: false },
        { key: 'price', label: 'Price', required: true },
        { key: 'isLowStock', label: 'Low Stock', required: false },
        { key: 'soldOut', label: 'Sold Out', required: false },
        { key: 'notes', label: 'Notes', required: false },
      ];
    }
  }, [menuMode]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`max-w-7xl w-full max-h-[95vh] rounded-lg shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div>
            <h2 className="text-xl font-semibold">Import Multiple CSV Files</h2>
            <div className="flex items-center mt-1">
              <div className="flex space-x-2">
                {(['upload', 'mapping', 'validation', 'complete'] as ImportStage[]).map((stepName, index) => (
                  <div
                    key={stepName}
                    className={`w-3 h-3 rounded-full ${
                      stage === stepName
                        ? 'bg-orange-500'
                        : (['upload', 'mapping', 'validation', 'complete'] as ImportStage[]).indexOf(stage) > index
                          ? 'bg-green-500'
                          : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className={`ml-3 text-sm capitalize ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stage === 'upload' && 'Upload Files'}
                {stage === 'mapping' && 'Map Columns'}
                {stage === 'validation' && 'Review & Validate'}
                {stage === 'complete' && 'Import Complete'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={`px-6 py-6 max-h-[calc(95vh-180px)] overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Stage 1: Upload */}
          {stage === 'upload' && (
            <div className="text-center py-12">
              <div className={`w-24 h-24 mx-auto mb-6 border-2 border-dashed rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Choose Multiple CSV Files</h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Select multiple CSV files to import {menuMode === MenuMode.BULK ? 'bulk flower' : 'pre-packaged'} data
              </p>
              <input
                type="file"
                accept=".csv"
                multiple
                onChange={handleFilesUpload}
                className="hidden"
                id="multi-csv-file-input"
              />
              <label
                htmlFor="multi-csv-file-input"
                className={`inline-flex items-center px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Select Multiple CSV Files
              </label>
              
              {/* Split into pages option */}
              <div className="mt-8 p-4 rounded-lg border">
                <label className="flex items-center justify-center space-x-3">
                  <input
                    type="checkbox"
                    checked={splitIntoPages}
                    onChange={(e) => setSplitIntoPages(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Split files into separate pages on import
                  </span>
                </label>
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {splitIntoPages 
                    ? 'Each CSV file will create a new page in your menu'
                    : 'All CSV files will be combined into the current page'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Stage 2: Mapping */}
          {stage === 'mapping' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Map Columns for Each File</h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure column mappings for each CSV file. Required fields are marked with *
              </p>

              <div className="space-y-8">
                {csvFiles.map((fileInfo, fileIndex) => (
                  <div key={fileIndex} className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50/50'
                  }`}>
                    <h4 className="font-medium mb-3 flex items-center">
                      <span className="mr-2">{fileInfo.file.name}</span>
                      {fileInfo.isValid ? (
                        <span className="text-green-500 text-sm">✓</span>
                      ) : (
                        <span className="text-red-500 text-sm">⚠</span>
                      )}
                    </h4>
                    
                    {fileInfo.errors.length > 0 && (
                      <div className={`mb-3 p-2 rounded text-sm ${
                        theme === 'dark' ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
                      }`}>
                        {fileInfo.errors.map((error, i) => (
                          <div key={i}>• {error}</div>
                        ))}
                      </div>
                    )}

                    {fileInfo.isValid && (
                      <div className="space-y-2">
                        {fileInfo.headers.map((header, headerIndex) => (
                          <div key={headerIndex} className="flex items-center space-x-4">
                            <div className="flex-1 text-sm">
                              <span className="font-medium">{header}</span>
                              <span className={`ml-2 text-xs ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                Sample: {fileInfo.data[0]?.[header] || 'N/A'}
                              </span>
                            </div>
                            <div className="w-4">→</div>
                            <div className="flex-1">
                              <select
                                value={fileInfo.mappingConfig[header] || ''}
                                onChange={(e) => updateFileMapping(fileIndex, header, e.target.value)}
                                className={`w-full p-2 rounded text-sm border ${
                                  theme === 'dark'
                                    ? 'bg-gray-600 border-gray-500 text-gray-100'
                                    : 'bg-white border-gray-300 text-gray-900'
                                }`}
                              >
                                <option value="">Don't import</option>
                                {mappingFields.map((field) => (
                                  <option key={field.key} value={field.key}>
                                    {field.label}{field.required ? ' *' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stage 3: Complete */}
          {stage === 'complete' && (
            <div className="text-center py-12">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Import Successful!</h3>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {csvFiles.filter(f => f.isValid).length} files imported successfully
                {splitIntoPages && ' as separate pages'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {stage === 'mapping' && `${csvFiles.length} files loaded`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className={`px-4 py-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            {stage === 'mapping' && (
              <button
                onClick={handleImport}
                disabled={csvFiles.filter(f => f.isValid).length === 0}
                className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                Import {csvFiles.filter(f => f.isValid).length} Files
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};