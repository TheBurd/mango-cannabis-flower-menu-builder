import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Theme, MenuMode, StrainType } from '../types';
import { CSV_STRAIN_TYPE_MAP } from '../constants';
import { HelpTooltip } from './common/HelpTooltip';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  menuMode: MenuMode;
  onImport: (data: ImportData[], mappingConfig: ColumnMapping) => void;
  onModeSwitch?: (newMode: MenuMode) => void;
}

interface ImportData {
  [key: string]: string;
}

interface ColumnMapping {
  [csvColumn: string]: string; // Maps CSV column to app field
}

interface MappingField {
  key: string;
  label: string;
  required: boolean;
  description: string;
  aliases: string[];
}

const BULK_FIELDS: MappingField[] = [
  { key: 'shelf', label: 'Shelf/Category', required: true, description: 'Shelf or category name', aliases: ['category', 'shelf', 'tier', 'section', 'group'] },
  { key: 'name', label: 'Strain Name', required: true, description: 'Name of the strain', aliases: ['strain name', 'strain', 'product', 'flower', 'name', 'product name'] },
  { key: 'grower', label: 'Grower/Brand', required: false, description: 'Producer or brand name', aliases: ['brand', 'grower', 'grow/brand', 'grower/brand', 'company', 'producer', 'cultivator'] },
  { key: 'thc', label: 'THC %', required: false, description: 'THC percentage', aliases: ['thc', 'thc%', 'thc percent', 'thc percentage', 'thc %'] },
  { key: 'type', label: 'Strain Type', required: false, description: 'Strain classification', aliases: ['class', 'type', 'strain type', 'classification'] },
  { key: 'lastJar', label: 'Last Jar', required: false, description: 'Last jar indicator', aliases: ['last jar', 'lastjar', 'final', 'remaining', 'last'] },
  { key: 'originalShelf', label: 'Original Shelf', required: false, description: 'Original shelf reference', aliases: ['original shelf', 'original', 'source shelf', 'source'] },
];

const PREPACKAGED_FIELDS: MappingField[] = [
  { key: 'shelf', label: 'Weight Category', required: true, description: 'Weight-based category', aliases: ['category', 'shelf', 'weight', 'size'] },
  { key: 'name', label: 'Product Name', required: true, description: 'Name of the product', aliases: ['product name', 'strain', 'name', 'flower'] },
  { key: 'brand', label: 'Brand', required: false, description: 'Producer or brand name', aliases: ['brand', 'grower', 'company', 'producer'] },
  { key: 'thc', label: 'THC %', required: false, description: 'THC percentage', aliases: ['thc', 'thc%', 'thc percent'] },
  { key: 'terpenes', label: 'Terpenes %', required: false, description: 'Terpenes percentage', aliases: ['terpenes', 'terp', 'terp%', 'terpene'] },
  { key: 'type', label: 'Strain Type', required: false, description: 'Strain classification', aliases: ['class', 'type', 'strain type'] },
  { key: 'price', label: 'Price', required: true, description: 'Product price', aliases: ['price', 'cost', 'amount'] },
  { key: 'netWeight', label: 'Net Weight', required: false, description: 'Net weight specification', aliases: ['net weight', 'weight', 'net wt', 'netweight'] },
  { key: 'isLowStock', label: 'Low Stock', required: false, description: 'Low stock status', aliases: ['low stock', 'lowstock', 'stock status', 'inventory'] },
  { key: 'notes', label: 'Notes', required: false, description: 'Additional notes', aliases: ['notes', 'comments', 'remarks', 'description'] },
];

// Help content generators
const getBulkFlowerHelpContent = () => (
  <div className="space-y-4">
    <div>
      <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">📋 Required Columns</h4>
      <ul className="space-y-1 text-sm">
        <li>• <strong>Shelf/Category:</strong> The pricing tier (e.g., "Premium Flower", "Value Flower")</li>
        <li>• <strong>Strain Name:</strong> The name of the cannabis strain</li>
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">🔧 Optional Columns</h4>
      <ul className="space-y-1 text-sm">
        <li>• <strong>Grower/Brand:</strong> Producer name</li>
        <li>• <strong>THC %:</strong> THC percentage (numbers only, e.g., "24.5")</li>
        <li>• <strong>Class:</strong> Strain type (S/Sativa, I/Indica, H/Hybrid)</li>
        <li>• <strong>Last Jar:</strong> Any value indicates last jar (e.g., "LastJar", "Yes")</li>
        <li>• <strong>Original Shelf:</strong> Previous shelf reference</li>
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">💡 Best Practices</h4>
      <ul className="space-y-1 text-sm">
        <li>• Use clear column headers (first row)</li>
        <li>• Match shelf names to your existing pricing tiers</li>
        <li>• THC values as numbers only (no % symbol)</li>
        <li>• Save as CSV format from Excel/Sheets</li>
        <li>• Keep strain names consistent</li>
        <li>• Remove empty rows before importing</li>
        <li>• Auto-mapping works best with standard header names</li>
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-2">📝 Example Format</h4>
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="px-2 py-1 text-left font-medium">Category</th>
              <th className="px-2 py-1 text-left font-medium">Strain Name</th>
              <th className="px-2 py-1 text-left font-medium">Grower/Brand</th>
              <th className="px-2 py-1 text-left font-medium">THC %</th>
              <th className="px-2 py-1 text-left font-medium">Class</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <td className="px-2 py-1">Premium Flower</td>
              <td className="px-2 py-1">Blue Dream</td>
              <td className="px-2 py-1">Acme Farms</td>
              <td className="px-2 py-1">22.5</td>
              <td className="px-2 py-1">H</td>
            </tr>
            <tr>
              <td className="px-2 py-1">Value Flower</td>
              <td className="px-2 py-1">OG Kush</td>
              <td className="px-2 py-1">Green Valley</td>
              <td className="px-2 py-1">18.0</td>
              <td className="px-2 py-1">I</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const getPrePackagedHelpContent = () => (
  <div className="space-y-4">
    <div>
      <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">📋 Required Columns</h4>
      <ul className="space-y-1 text-sm">
        <li>• <strong>Weight Category:</strong> Product weight tier (e.g., "1g Flower", "3.5g Flower")</li>
        <li>• <strong>Product Name:</strong> Name of the pre-packaged product</li>
        <li>• <strong>Price:</strong> Product price (numbers only, e.g., "25.00")</li>
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">🔧 Optional Columns</h4>
      <ul className="space-y-1 text-sm">
        <li>• <strong>Brand:</strong> Producer or brand name</li>
        <li>• <strong>THC %:</strong> THC percentage (numbers only)</li>
        <li>• <strong>Terpenes %:</strong> Terpene percentage</li>
        <li>• <strong>Class:</strong> Strain type (S/Sativa, I/Indica, H/Hybrid)</li>
        <li>• <strong>Net Weight:</strong> Actual weight specification</li>
        <li>• <strong>Low Stock:</strong> Stock status (TRUE/FALSE or Yes/No)</li>
        <li>• <strong>Notes:</strong> Additional product information</li>
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">💡 Best Practices</h4>
      <ul className="space-y-1 text-sm">
        <li>• Group products by weight categories</li>
        <li>• Use consistent weight naming (1g, 3.5g, 7g, etc.)</li>
        <li>• Price as numbers only (no $ symbol)</li>
        <li>• Boolean values: TRUE/FALSE or Yes/No</li>
        <li>• Include brand for better organization</li>
        <li>• Remove empty rows before importing</li>
        <li>• Auto-mapping works best with standard header names</li>
      </ul>
    </div>
    
    <div>
      <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-2">📝 Example Format</h4>
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th className="px-2 py-1 text-left font-medium">Category</th>
              <th className="px-2 py-1 text-left font-medium">Product Name</th>
              <th className="px-2 py-1 text-left font-medium">Brand</th>
              <th className="px-2 py-1 text-left font-medium">Price</th>
              <th className="px-2 py-1 text-left font-medium">THC %</th>
              <th className="px-2 py-1 text-left font-medium">Class</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <td className="px-2 py-1">1g Flower</td>
              <td className="px-2 py-1">Gelato</td>
              <td className="px-2 py-1">Cookie Co</td>
              <td className="px-2 py-1">12.00</td>
              <td className="px-2 py-1">26.8</td>
              <td className="px-2 py-1">I</td>
            </tr>
            <tr>
              <td className="px-2 py-1">3.5g Flower</td>
              <td className="px-2 py-1">Wedding Cake</td>
              <td className="px-2 py-1">Select</td>
              <td className="px-2 py-1">45.00</td>
              <td className="px-2 py-1">24.2</td>
              <td className="px-2 py-1">H</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

type ImportStage = 'upload' | 'mapping' | 'validation' | 'complete';

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  theme,
  menuMode,
  onImport,
  onModeSwitch,
}) => {
  const [stage, setStage] = useState<ImportStage>('upload');
  const [csvData, setCsvData] = useState<string>('');
  const [parsedData, setParsedData] = useState<ImportData[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [detectedMode, setDetectedMode] = useState<MenuMode | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [delimiter, setDelimiter] = useState<string>(',');

  const mappingFields = useMemo(() => 
    menuMode === MenuMode.BULK ? BULK_FIELDS : PREPACKAGED_FIELDS, 
    [menuMode]
  );

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
    
    // Handle empty headers by using position-based fallbacks
    const originalHeaders = rawHeaders.map((header, index) => {
      if (!header || header.trim() === '') {
        // For the first column (index 0), assume it's the category/shelf column
        if (index === 0) {
          return 'Category';
        }
        // For other empty headers, use generic column names
        return `Column${index + 1}`;
      }
      return header;
    });
    
    const headers = originalHeaders.map(header => header.toLowerCase());

    const data = lines.slice(1).map(line => {
      const cells = line.split(delim).map(cell => 
        cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
      );
      
      const row: ImportData = {};
      originalHeaders.forEach((header, index) => {
        row[header] = cells[index] || '';
      });
      
      return row;
    });

    return { headers: originalHeaders, lowercaseHeaders: headers, data };
  }, []);

  // Auto-detect CSV format
  const detectCsvFormat = useCallback((headers: string[]) => {
    const isBulkFlower = headers.some(h => 
      ['strain name', 'strain', 'grower', 'grow/brand'].includes(h.toLowerCase())
    );
    const isPrePackaged = headers.some(h => 
      ['product name', 'price', 'size', 'weight'].includes(h.toLowerCase())
    );

    if (isBulkFlower && !isPrePackaged) return MenuMode.BULK;
    if (isPrePackaged && !isBulkFlower) return MenuMode.PREPACKAGED;
    return null; // Ambiguous
  }, []);

  // Auto-suggest column mappings
  const suggestMappings = useCallback((headers: string[]) => {
    const suggestions: ColumnMapping = {};
    
    mappingFields.forEach(field => {
      const matchingHeader = headers.find(header => {
        const normalizedHeader = header.toLowerCase().trim();
        return field.aliases.some(alias => {
          const normalizedAlias = alias.toLowerCase().trim();
          
          // Skip empty headers or aliases to avoid false positives
          if (!normalizedHeader || !normalizedAlias) {
            return false;
          }
          
          const match = normalizedHeader === normalizedAlias || 
                 (normalizedHeader.length > 0 && normalizedAlias.length > 0 && 
                  (normalizedHeader.includes(normalizedAlias) || normalizedAlias.includes(normalizedHeader))) ||
                 normalizedHeader.replace(/[\s_-]/g, '') === normalizedAlias.replace(/[\s_-]/g, '');
          return match;
        });
      });
      
      if (matchingHeader) {
        suggestions[matchingHeader] = field.key;
      }
    });

    return suggestions;
  }, [mappingFields]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      setCsvData(content);
      const detectedDelim = detectDelimiter(content);
      setDelimiter(detectedDelim);

      const { headers, lowercaseHeaders, data } = parseCsvData(content, detectedDelim);
      setCsvHeaders(headers);
      setParsedData(data);

      const format = detectCsvFormat(lowercaseHeaders);
      setDetectedMode(format);

      const suggestions = suggestMappings(lowercaseHeaders);
      
      // Convert suggestions to use original header names as keys
      const originalSuggestions: ColumnMapping = {};
      Object.entries(suggestions).forEach(([lowercaseHeader, appField]) => {
        const originalHeader = headers[lowercaseHeaders.indexOf(lowercaseHeader)];
        if (originalHeader) {
          originalSuggestions[originalHeader] = appField;
        }
      });
      setColumnMapping(originalSuggestions);

      setStage('mapping');
    };
    reader.readAsText(file);
  }, [detectDelimiter, parseCsvData, detectCsvFormat, suggestMappings]);

  // Handle column mapping change
  const handleMappingChange = useCallback((csvColumn: string, appField: string) => {
    setColumnMapping(prev => {
      const newMapping = { ...prev };
      
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
      
      return newMapping;
    });
  }, []);

  // Validate mapping and data
  const validateData = useCallback(() => {
    const errors: string[] = [];
    const mappedFields = Object.values(columnMapping);
    
    // Check required fields are mapped
    const requiredFields = mappingFields.filter(f => f.required);
    requiredFields.forEach(field => {
      if (!mappedFields.includes(field.key)) {
        errors.push(`Required field "${field.label}" is not mapped`);
      }
    });

    // Validate data types and formats
    parsedData.slice(0, 10).forEach((row, index) => {
      Object.entries(columnMapping).forEach(([csvColumn, appField]) => {
        const value = row[csvColumn];
        
        if (appField === 'thc' || appField === 'terpenes') {
          if (value && value !== '-' && isNaN(parseFloat(value))) {
            errors.push(`Row ${index + 2}: Invalid number format in ${appField}: "${value}"`);
          }
        }
        
        if (appField === 'price' && value) {
          const cleanPrice = value.replace(/[$,]/g, '');
          if (isNaN(parseFloat(cleanPrice))) {
            errors.push(`Row ${index + 2}: Invalid price format: "${value}"`);
          }
        }
        
        if (appField === 'type' && value) {
          const normalizedType = value.toUpperCase().replace(/[\s-./]/g, '');
          if (!CSV_STRAIN_TYPE_MAP[normalizedType]) {
            errors.push(`Row ${index + 2}: Unknown strain type: "${value}"`);
          }
        }
      });
    });

    setValidationErrors(errors);
    setStage('validation');
  }, [columnMapping, mappingFields, parsedData]);

  // Reset modal state
  const resetModal = useCallback(() => {
    setStage('upload');
    setCsvData('');
    setParsedData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setDetectedMode(null);
    setValidationErrors([]);
    setDelimiter(',');
  }, []);

  // Handle import
  const handleImport = useCallback(() => {
    if (validationErrors.length > 0) return;
    
    onImport(parsedData, columnMapping);
    setStage('complete');
    
    // Close modal after short delay
    setTimeout(() => {
      resetModal();
      onClose();
    }, 1500);
  }, [validationErrors, parsedData, columnMapping, onImport, onClose, resetModal]);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [resetModal, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`max-w-6xl w-full max-h-[95vh] rounded-lg shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div>
            <h2 className="text-xl font-semibold">Import CSV Data</h2>
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
                {stage === 'upload' && 'Upload File'}
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
              <h3 className="text-lg font-medium mb-2">Choose CSV File</h3>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a CSV file to import {menuMode === MenuMode.BULK ? 'bulk flower' : 'pre-packaged'} data
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label
                htmlFor="csv-file-input"
                className={`inline-flex items-center px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Select CSV File
              </label>
            </div>
          )}

          {/* Stage 2: Mapping */}
          {stage === 'mapping' && (
            <div>
              {/* Format Detection */}
              {detectedMode && detectedMode !== menuMode && onModeSwitch && (
                <div className={`p-4 rounded-lg border mb-6 ${
                  theme === 'dark' 
                    ? 'bg-yellow-900/20 border-yellow-600 text-yellow-200' 
                    : 'bg-yellow-50 border-yellow-300 text-yellow-800'
                }`}>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="font-medium">Format Mismatch Detected</h4>
                      <p className="text-sm mt-1">
                        This CSV appears to be in {detectedMode} format, but you're in {menuMode} mode.
                      </p>
                    </div>
                    <button
                      onClick={() => onModeSwitch(detectedMode)}
                      className={`ml-auto px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-yellow-800 hover:bg-yellow-700 text-yellow-100'
                          : 'bg-yellow-600 hover:bg-yellow-500 text-white'
                      }`}
                    >
                      Switch to {detectedMode}
                    </button>
                  </div>
                </div>
              )}

              {/* Data Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Data Preview</h3>
                <div className={`border rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          {csvHeaders.map((header, index) => (
                            <th key={index} className="px-4 py-2 text-left text-sm font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 3).map((row, rowIndex) => (
                          <tr key={rowIndex} className={`border-t ${
                            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                          }`}>
                            {csvHeaders.map((header, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-2 text-sm">
                                {row[header] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className={`text-sm mt-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Showing first 3 rows of {parsedData.length} total rows
                </p>
              </div>

              {/* Column Mapping */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Map Columns</h3>
                <p className={`text-sm mb-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Map CSV columns to application fields. Required fields are marked with *
                </p>
                <div className="space-y-3">
                  {csvHeaders.map((csvColumn) => (
                    <div key={csvColumn} className={`flex items-center p-3 rounded-lg border ${
                      theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50/50'
                    }`}>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{csvColumn}</div>
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Sample: {parsedData[0]?.[csvColumn] || 'N/A'}
                        </div>
                      </div>
                      <div className="w-4 mx-4">→</div>
                      <div className="flex-1">
                        <select
                          value={columnMapping[csvColumn] || ''}
                          onChange={(e) => handleMappingChange(csvColumn, e.target.value)}
                          className={`w-full p-2 rounded-md text-sm border focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
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
              </div>
            </div>
          )}

          {/* Stage 3: Validation */}
          {stage === 'validation' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Review & Validate</h3>
              
              {validationErrors.length > 0 ? (
                <div className={`p-4 rounded-lg border mb-6 ${
                  theme === 'dark' 
                    ? 'bg-red-900/20 border-red-600 text-red-200' 
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}>
                  <h4 className="font-medium mb-2">Validation Errors</h4>
                  <ul className="space-y-1 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={`p-4 rounded-lg border mb-6 ${
                  theme === 'dark' 
                    ? 'bg-green-900/20 border-green-600 text-green-200' 
                    : 'bg-green-50 border-green-300 text-green-800'
                }`}>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h4 className="font-medium">Validation Passed</h4>
                  </div>
                  <p className="text-sm mt-1">
                    Ready to import {parsedData.length} rows of data
                  </p>
                </div>
              )}

              {/* Mapping Summary */}
              <div className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50/50'
              }`}>
                <h4 className="font-medium mb-3">Mapping Summary</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(columnMapping).map(([csvColumn, appField]) => {
                    const field = mappingFields.find(f => f.key === appField);
                    return (
                      <div key={csvColumn} className="flex justify-between">
                        <span className="font-medium">{csvColumn}</span>
                        <span>→ {field?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Stage 4: Complete */}
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
                {parsedData.length} rows imported successfully
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            {/* Help Button - Show during upload and mapping stages when users need format guidance */}
            {(stage === 'upload' || stage === 'mapping') && (
              <HelpTooltip
                key={menuMode} // Force re-render when mode changes
                title={`${menuMode === MenuMode.BULK ? 'Bulk Flower' : 'Pre-Packaged'} CSV Import Help`}
                content={menuMode === MenuMode.BULK ? getBulkFlowerHelpContent() : getPrePackagedHelpContent()}
                theme={theme}
              />
            )}
            
            {/* Status Text */}
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {stage === 'mapping' && `${csvHeaders.length} columns found`}
              {stage === 'validation' && `${Object.keys(columnMapping).length} columns mapped`}
            </div>
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
                onClick={validateData}
                disabled={Object.keys(columnMapping).length === 0}
                className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                Continue
              </button>
            )}
            {stage === 'validation' && (
              <button
                onClick={handleImport}
                disabled={validationErrors.length > 0}
                className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                Import Data
              </button>
            )}
            {stage === 'validation' && validationErrors.length === 0 && (
              <button
                onClick={() => setStage('mapping')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Back to Mapping
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};