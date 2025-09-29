import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './common/Button';
import { DownloadIcon, UploadIcon, SortAscendingIcon, SortDescendingIcon, FlowerJarIcon, TrashXmarkIcon } from './common/Icon';
import { SortCriteria, Theme, MenuMode } from '../types';

interface ToolbarProps {
  onClearAllShelves: () => void;
  onClearAllLastJars: () => void;
  onClearAllSoldOut: () => void;
  hasSoldOutItems: boolean;
  onOpenExportModal: () => void; // Single export handler
  onImportCSVRequest: () => void;
  isExporting: boolean;
  globalSortCriteria: SortCriteria | null;
  onUpdateGlobalSortCriteria: (key: SortCriteria['key']) => void;
  theme: Theme;
  menuMode: MenuMode;
  // Page-aware sorting
  currentPageNumber: number;
  pageManager: any; // Will be PageManager type
}

const CONFIRMATION_TIMEOUT = 3000; // 3 seconds

const SortButton: React.FC<{
  label: string;
  sortKey: SortCriteria['key'];
  currentPageNumber: number;
  pageManager: any;
  onClick: () => void;
}> = ({ label, sortKey, currentPageNumber, pageManager, onClick }) => {
  // Get current page's global sort criteria
  const currentPageSort = pageManager.getPageGlobalSort(currentPageNumber);
  const isActive = currentPageSort?.key === sortKey;
  const direction = isActive ? currentPageSort.direction : null;
  const buttonColor = isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-500 hover:bg-gray-400';

  return (
    <Button
      onClick={onClick}
      variant="custom"
      size="sm"
      className={`flex items-center space-x-1.5 text-white text-xs !py-1 px-2 ${buttonColor}`}
      title={`Sort by ${label}`}
    >
      <span>{label}</span>
      {isActive && direction === 'asc' && <SortAscendingIcon className="w-3.5 h-3.5" />}
      {isActive && direction === 'desc' && <SortDescendingIcon className="w-3.5 h-3.5" />}
    </Button>
  );
};


export const Toolbar: React.FC<ToolbarProps> = ({
  onClearAllShelves,
  onClearAllLastJars,
  onClearAllSoldOut,
  hasSoldOutItems,
  onOpenExportModal,
  onImportCSVRequest,
  isExporting,
  globalSortCriteria,
  onUpdateGlobalSortCriteria,
  theme,
  menuMode,
  currentPageNumber,
  pageManager,
}) => {
  const [confirmClearShelves, setConfirmClearShelves] = useState(false);
  const [confirmClearLastJars, setConfirmClearLastJars] = useState(false);
  const [confirmClearSoldOut, setConfirmClearSoldOut] = useState(false);

  const handleClearShelvesClick = useCallback(() => {
    if (confirmClearShelves) {
      onClearAllShelves();
      setConfirmClearShelves(false);
    } else {
      setConfirmClearShelves(true);
    }
  }, [confirmClearShelves, onClearAllShelves]);

  const handleClearLastJarsClick = useCallback(() => {
    if (confirmClearLastJars) {
      onClearAllLastJars();
      setConfirmClearLastJars(false);
    } else {
      setConfirmClearLastJars(true);
    }
  }, [confirmClearLastJars, onClearAllLastJars]);

  const handleClearSoldOutClick = useCallback(() => {
    if (confirmClearSoldOut) {
      onClearAllSoldOut();
      setConfirmClearSoldOut(false);
    } else {
      setConfirmClearSoldOut(true);
    }
  }, [confirmClearSoldOut, onClearAllSoldOut]);

  useEffect(() => {
    let timerShelves: number;
    if (confirmClearShelves) {
      timerShelves = window.setTimeout(() => setConfirmClearShelves(false), CONFIRMATION_TIMEOUT);
    }
    return () => clearTimeout(timerShelves);
  }, [confirmClearShelves]);

  useEffect(() => {
    let timerLastJars: number;
    if (confirmClearLastJars) {
      timerLastJars = window.setTimeout(() => setConfirmClearLastJars(false), CONFIRMATION_TIMEOUT);
    }
    return () => clearTimeout(timerLastJars);
  }, [confirmClearLastJars]);

  useEffect(() => {
    let timerSoldOut: number;
    if (confirmClearSoldOut) {
      timerSoldOut = window.setTimeout(() => setConfirmClearSoldOut(false), CONFIRMATION_TIMEOUT);
    }
    return () => clearTimeout(timerSoldOut);
  }, [confirmClearSoldOut]);
  
  const sortOptions: Array<{ label: string; key: SortCriteria['key'] }> = [
    { label: "Name", key: "name" },
    { label: "Grower", key: "grower" },
    { label: "Class", key: "type" },
    { label: "THC%", key: "thc" },
    { label: menuMode === MenuMode.PREPACKAGED ? "Low Stock" : "Last Jar", key: "isLastJar" },
    { label: "Sold Out", key: "isSoldOut" },
  ];

  return (
    <div className={`no-print sticky top-0 z-40 p-3 shadow-md border-b ${
      theme === 'dark'
        ? 'bg-gray-700 border-gray-600'
        : 'bg-white border-gray-300'
    }`}>
      {/* Single row: All controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button 
          onClick={handleClearShelvesClick} 
          variant="danger"
          size="sm" 
          className={`flex items-center space-x-2 min-w-[150px] justify-center ${confirmClearShelves ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'}`}
        >
          <TrashXmarkIcon className="w-5 h-5" />
          <span>{confirmClearShelves ? "Are you sure?" : "Clear All Shelves"}</span>
        </Button>
        <Button 
          onClick={handleClearLastJarsClick} 
          variant="warning"
          size="sm" 
          className={`flex items-center space-x-2 min-w-[170px] justify-center ${confirmClearLastJars ? 'bg-yellow-600 hover:bg-yellow-700 text-gray-900' : 'bg-yellow-500 hover:bg-yellow-600 text-gray-800'}`}
        >
          <FlowerJarIcon className="w-5 h-5" />
          <span>{confirmClearLastJars ? "Are you sure?" : (menuMode === MenuMode.PREPACKAGED ? "Clear All Low Stock" : "Clear All Last Jars")}</span>
        </Button>

        {/* Clear All Sold Out Button - only show if there are sold out items */}
        {hasSoldOutItems && (
          <Button 
            onClick={handleClearSoldOutClick} 
            variant="danger"
            size="sm" 
            className={`flex items-center space-x-2 min-w-[170px] justify-center ${confirmClearSoldOut ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            <TrashXmarkIcon className="w-5 h-5" />
            <span>{confirmClearSoldOut ? "Are you sure?" : "Clear All Sold Out"}</span>
          </Button>
        )}

        <div className="h-6 border-l border-gray-600 mx-1"></div> {/* Divider */}

        {/* Global Sort Options - moved inline */}
        <div className={`flex items-center space-x-2 px-3 py-2 border rounded-md h-[36px] ${
          theme === 'dark'
            ? 'border-gray-600 bg-gray-700/50'
            : 'border-gray-300 bg-gray-100/50'
        }`}>
          <span className={`text-xs font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>Global Sort:</span>
          {sortOptions.map(opt => (
              <SortButton
                key={opt.key}
                label={opt.label}
                sortKey={opt.key}
                currentPageNumber={currentPageNumber}
                pageManager={pageManager}
                onClick={() => onUpdateGlobalSortCriteria(opt.key)}
              />
          ))}
        </div>

        <div className="h-6 border-l border-gray-600 mx-1"></div> {/* Divider */}
        
        {/* File Operations Group */}
        <div className={`flex items-center space-x-2 px-3 py-2 border rounded-md h-[36px] ${
          theme === 'dark'
            ? 'border-gray-600 bg-gray-700/50'
            : 'border-gray-300 bg-gray-100/50'
        }`}>
          <Button
            onClick={onImportCSVRequest}
            variant="custom"
            size="sm"
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-white"
            disabled={isExporting}
            title="Import CSV file(s) - supports single or multiple files"
          >
            <UploadIcon className="w-4 h-4" />
            <span>{menuMode === MenuMode.BULK ? 'Import CSV(s)' : 'Import CSV(s)'}</span>
          </Button>

          <Button
            onClick={onOpenExportModal}
            variant="custom"
            size="sm"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white"
            disabled={isExporting}
            title="Export menu in various formats"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
