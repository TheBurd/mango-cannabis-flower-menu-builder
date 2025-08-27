import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Theme, MenuMode, Strain, PrePackagedProduct, StrainType } from '../types';
import { APP_STRAIN_TYPE_TO_CSV_SUFFIX } from '../constants';

interface CsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  menuMode: MenuMode;
  bulkShelves?: { id: string; name: string; strains: Strain[] }[];
  prePackagedShelves?: { id: string; name: string; products: PrePackagedProduct[] }[];
  onExport: (csvContent: string, columns: string[]) => void;
}

interface ColumnConfig {
  key: string;
  label: string;
  required: boolean;
  description: string;
}

const BULK_COLUMNS: ColumnConfig[] = [
  { key: 'category', label: 'Category', required: true, description: 'Shelf/Category name' },
  { key: 'strain', label: 'Strain Name', required: true, description: 'Name of the strain' },
  { key: 'grower', label: 'Grower/Brand', required: false, description: 'Producer or brand name' },
  { key: 'thc', label: 'THC %', required: false, description: 'THC percentage' },
  { key: 'class', label: 'Class', required: false, description: 'Strain type (S/I/H)' },
  { key: 'lastJar', label: 'Last Jar', required: false, description: 'Last jar indicator' },
  { key: 'originalShelf', label: 'Original Shelf', required: false, description: 'Original shelf name' },
];

const PREPACKAGED_COLUMNS: ColumnConfig[] = [
  { key: 'category', label: 'Category', required: true, description: 'Weight category' },
  { key: 'productName', label: 'Product Name', required: true, description: 'Name of the product' },
  { key: 'brand', label: 'Brand', required: false, description: 'Producer or brand name' },
  { key: 'thc', label: 'THC %', required: false, description: 'THC percentage' },
  { key: 'terpenes', label: 'Terpenes %', required: false, description: 'Terpenes percentage' },
  { key: 'class', label: 'Class', required: false, description: 'Strain type (S/I/H)' },
  { key: 'price', label: 'Price', required: true, description: 'Product price' },
  { key: 'netWeight', label: 'Net Weight', required: false, description: 'Net weight specification' },
  { key: 'lowStock', label: 'Low Stock', required: false, description: 'Low stock indicator' },
  { key: 'notes', label: 'Notes', required: false, description: 'Additional notes' },
];

export const CsvExportModal: React.FC<CsvExportModalProps> = ({
  isOpen,
  onClose,
  theme,
  menuMode,
  bulkShelves = [],
  prePackagedShelves = [],
  onExport,
}) => {
  const columnOptions = useMemo(() => 
    menuMode === MenuMode.BULK ? BULK_COLUMNS : PREPACKAGED_COLUMNS, 
    [menuMode]
  );

  const [selectedColumns, setSelectedColumns] = useState<string[]>(() =>
    columnOptions.map(col => col.key) // Auto-check ALL columns by default
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columnOptions.map(col => col.key) // Include ALL columns in order
  );
  const [exportType, setExportType] = useState<'data' | 'template'>('data');

  // Reset column selection when menu mode changes
  useEffect(() => {
    setSelectedColumns(columnOptions.map(col => col.key));
    setColumnOrder(columnOptions.map(col => col.key));
  }, [columnOptions]);

  const handleColumnToggle = useCallback((columnKey: string) => {
    const column = columnOptions.find(col => col.key === columnKey);
    if (column?.required) return; // Can't unselect required columns

    setSelectedColumns(prev => {
      const newSelected = prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey];
      
      // Update order to include/exclude the column
      setColumnOrder(currentOrder => {
        if (prev.includes(columnKey)) {
          // Removing column
          return currentOrder.filter(key => key !== columnKey);
        } else {
          // Adding column - insert at appropriate position
          const columnIndex = columnOptions.findIndex(col => col.key === columnKey);
          const insertIndex = currentOrder.findIndex(key => {
            const keyIndex = columnOptions.findIndex(col => col.key === key);
            return keyIndex > columnIndex;
          });
          const newOrder = [...currentOrder];
          if (insertIndex === -1) {
            newOrder.push(columnKey);
          } else {
            newOrder.splice(insertIndex, 0, columnKey);
          }
          return newOrder;
        }
      });

      return newSelected;
    });
  }, [columnOptions]);

  const handleDragStart = useCallback((e: React.DragEvent, columnKey: string) => {
    e.dataTransfer.setData('text/plain', columnKey);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumnKey: string) => {
    e.preventDefault();
    const sourceColumnKey = e.dataTransfer.getData('text/plain');
    if (sourceColumnKey === targetColumnKey) return;

    setColumnOrder(prev => {
      const newOrder = [...prev];
      const sourceIndex = newOrder.indexOf(sourceColumnKey);
      const targetIndex = newOrder.indexOf(targetColumnKey);
      
      newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, sourceColumnKey);
      
      return newOrder;
    });
  }, []);

  const generateCsvContent = useCallback(() => {
    const headers = columnOrder.map(key => {
      const column = columnOptions.find(col => col.key === key);
      return column?.label || key;
    });

    if (exportType === 'template') {
      return headers.join(',') + '\n';
    }

    const rows: string[][] = [];

    if (menuMode === MenuMode.BULK) {
      bulkShelves.forEach(shelf => {
        shelf.strains.forEach(strain => {
          const row = columnOrder.map(key => {
            switch (key) {
              case 'category': return shelf.name;
              case 'strain': return strain.name || '';
              case 'grower': return strain.grower || '';
              case 'thc': return strain.thc !== null ? strain.thc.toString() : '';
              case 'class': return APP_STRAIN_TYPE_TO_CSV_SUFFIX[strain.type] || 'H';
              case 'lastJar': return strain.isLastJar ? 'LastJar' : '';
              case 'originalShelf': return strain.originalShelf || '';
              default: return '';
            }
          });
          rows.push(row);
        });
      });
    } else {
      prePackagedShelves.forEach(shelf => {
        shelf.products.forEach(product => {
          const row = columnOrder.map(key => {
            switch (key) {
              case 'category': return shelf.name;
              case 'productName': return product.name || '';
              case 'brand': return product.brand || '';
              case 'thc': return product.thc !== null ? product.thc.toString() : '';
              case 'terpenes': return product.terpenes !== null ? product.terpenes.toString() : '';
              case 'class': return APP_STRAIN_TYPE_TO_CSV_SUFFIX[product.type] || 'H';
              case 'price': return product.price.toString();
              case 'netWeight': return product.netWeight || '';
              case 'lowStock': return product.isLowStock ? 'TRUE' : 'FALSE';
              case 'notes': return product.notes || '';
              default: return '';
            }
          });
          rows.push(row);
        });
      });
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }, [columnOrder, columnOptions, exportType, menuMode, bulkShelves, prePackagedShelves]);

  const handleExport = useCallback(() => {
    const csvContent = generateCsvContent();
    onExport(csvContent, columnOrder);
    onClose();
  }, [generateCsvContent, columnOrder, onExport, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`max-w-4xl w-full max-h-[90vh] rounded-lg shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <h2 className="text-xl font-semibold">
            Export {menuMode === MenuMode.BULK ? 'Bulk Flower' : 'Pre-Packaged'} CSV
          </h2>
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

        {/* Content */}
        <div className={`px-6 py-4 max-h-[calc(90vh-120px)] overflow-y-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Export Type Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Export Type</h3>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="data"
                  checked={exportType === 'data'}
                  onChange={(e) => setExportType(e.target.value as 'data' | 'template')}
                  className="mr-2 text-orange-600 focus:ring-orange-500"
                />
                <span>Export Current Data</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="template"
                  checked={exportType === 'template'}
                  onChange={(e) => setExportType(e.target.value as 'data' | 'template')}
                  className="mr-2 text-orange-600 focus:ring-orange-500"
                />
                <span>Export Template (Headers Only)</span>
              </label>
            </div>
          </div>

          {/* Column Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Select Columns</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columnOptions.map((column) => (
                <label
                  key={column.key}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedColumns.includes(column.key)
                      ? theme === 'dark'
                        ? 'bg-orange-900/20 border-orange-600'
                        : 'bg-orange-50 border-orange-300'
                      : theme === 'dark'
                        ? 'border-gray-600 hover:bg-gray-700'
                        : 'border-gray-300 hover:bg-gray-50'
                  } ${column.required ? 'opacity-75' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                    disabled={column.required}
                    className="mr-3 mt-1 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                  />
                  <div>
                    <div className="font-medium">
                      {column.label}
                      {column.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {column.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Column Order */}
          {selectedColumns.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Column Order</h3>
              <div className={`p-4 rounded-lg border-2 border-dashed ${
                theme === 'dark' ? 'border-gray-600 bg-gray-900/50' : 'border-gray-300 bg-gray-50/50'
              }`}>
                <p className={`text-sm mb-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Drag columns to reorder them in the CSV export
                </p>
                <div className="flex flex-wrap gap-2">
                  {columnOrder
                    .filter(columnKey => columnOptions.some(col => col.key === columnKey)) // Only show valid columns
                    .map((columnKey, index) => {
                    const column = columnOptions.find(col => col.key === columnKey);
                    return (
                      <div
                        key={columnKey}
                        draggable
                        onDragStart={(e) => handleDragStart(e, columnKey)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, columnKey)}
                        className={`px-3 py-2 rounded-md cursor-move select-none transition-colors ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                            : 'bg-white hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        <span className="mr-2 text-gray-400">⋮⋮</span>
                        {index + 1}. {column?.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedColumns.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Preview</h3>
              <div className={`p-4 rounded-lg border font-mono text-sm overflow-x-auto ${
                theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="whitespace-nowrap">
                  {columnOrder
                    .filter(key => columnOptions.some(col => col.key === key)) // Only show valid columns
                    .map(key => {
                    const column = columnOptions.find(col => col.key === key);
                    return column?.label;
                  }).join(', ')}
                  {exportType === 'data' && (
                    <>
                      <br />
                      <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                        [Sample data row would appear here...]
                      </span>
                    </>
                  )}
                </div>
              </div>
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
            {selectedColumns.length} columns selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={selectedColumns.length === 0}
              className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'bg-orange-600 hover:bg-orange-500 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};