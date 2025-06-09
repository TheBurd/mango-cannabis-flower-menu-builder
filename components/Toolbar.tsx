
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './common/Button';
import { RefreshIcon, TrashIcon, SparklesIcon, DownloadIcon, UploadIcon, SortAscendingIcon, SortDescendingIcon } from './common/Icon'; 
import { SortCriteria } from '../types';

interface ToolbarProps {
  onRefreshPreview: () => void;
  onClearAllShelves: () => void;
  onClearAllLastJars: () => void;
  hasUnrefreshedChanges: boolean;
  exportFilename: string;
  onExportFilenameChange: (name: string) => void;
  onExportPNG: () => void;
  onExportJPEG: () => void;
  onExportCSV: () => void;
  onImportCSVRequest: () => void;
  isExporting: boolean;
  globalSortCriteria: SortCriteria | null;
  onUpdateGlobalSortCriteria: (key: SortCriteria['key']) => void;
}

const CONFIRMATION_TIMEOUT = 3000; // 3 seconds

const SortButton: React.FC<{
  label: string;
  sortKey: SortCriteria['key'];
  currentSortCriteria: SortCriteria | null;
  onClick: () => void;
}> = ({ label, sortKey, currentSortCriteria, onClick }) => {
  const isActive = currentSortCriteria?.key === sortKey;
  const direction = isActive ? currentSortCriteria.direction : null;
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
  onRefreshPreview,
  onClearAllShelves,
  onClearAllLastJars,
  hasUnrefreshedChanges,
  exportFilename,
  onExportFilenameChange,
  onExportPNG,
  onExportJPEG,
  onExportCSV,
  onImportCSVRequest,
  isExporting,
  globalSortCriteria,
  onUpdateGlobalSortCriteria,
}) => {
  const [confirmClearShelves, setConfirmClearShelves] = useState(false);
  const [confirmClearLastJars, setConfirmClearLastJars] = useState(false);

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
  
  const sortOptions: Array<{ label: string; key: SortCriteria['key'] }> = [
    { label: "Name", key: "name" },
    { label: "Grower", key: "grower" },
    { label: "Class", key: "type" },
    { label: "THC%", key: "thc" },
    { label: "Last Jar", key: "isLastJar" },
  ];

  return (
    <div className="no-print sticky top-0 z-40 bg-gray-700 p-3 shadow-md flex flex-col gap-3 border-b border-gray-600">
      {/* Top row: Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button 
          onClick={onRefreshPreview} 
          variant="secondary" 
          size="sm" 
          className="flex items-center space-x-2"
        >
          <RefreshIcon className="w-5 h-5" />
          <span>Refresh Preview</span>
        </Button>
        <Button 
          onClick={handleClearShelvesClick} 
          variant="danger"
          size="sm" 
          className={`flex items-center space-x-2 min-w-[150px] justify-center ${confirmClearShelves ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'}`}
        >
          <TrashIcon className="w-5 h-5" />
          <span>{confirmClearShelves ? "Are you sure?" : "Clear All Shelves"}</span>
        </Button>
        <Button 
          onClick={handleClearLastJarsClick} 
          variant="warning"
          size="sm" 
          className={`flex items-center space-x-2 min-w-[170px] justify-center ${confirmClearLastJars ? 'bg-yellow-600 hover:bg-yellow-700 text-gray-900' : 'bg-yellow-500 hover:bg-yellow-600 text-gray-800'}`}
        >
          <SparklesIcon className="w-5 h-5" />
          <span>{confirmClearLastJars ? "Are you sure?" : "Clear All Last Jars"}</span>
        </Button>

        <div className="h-6 border-l border-gray-600 mx-1"></div> {/* Divider */}
        
        {/* File Operations Group */}
        <div className="flex items-center space-x-2 p-2 border border-gray-600 rounded-md bg-gray-700/50">
          <Button
            onClick={onImportCSVRequest}
            variant="custom"
            size="sm"
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-white"
            disabled={isExporting}
            title="Import strains from CSV file"
          >
            <UploadIcon className="w-4 h-4" />
            <span>Import CSV</span>
          </Button>

          <div className="flex items-center space-x-2">
            <label htmlFor="exportFilename" className="text-xs text-gray-300 font-medium whitespace-nowrap">Export As:</label>
            <input
              type="text"
              id="exportFilename"
              value={exportFilename}
              onChange={(e) => onExportFilenameChange(e.target.value)}
              placeholder="mango-menu"
              className="bg-gray-600 text-gray-100 placeholder-gray-400 px-2 py-1 rounded-md text-xs border border-gray-500 focus:ring-orange-500 focus:border-orange-500 w-32"
              disabled={isExporting}
            />
          </div>
          <Button
            onClick={onExportPNG}
            variant="custom"
            size="sm"
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white"
            disabled={isExporting}
            title="Export as PNG image"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>{isExporting ? '...' : 'PNG'}</span>
          </Button>
          <Button
            onClick={onExportJPEG}
            variant="custom"
            size="sm"
            className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white"
            disabled={isExporting}
            title="Export as JPEG image"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>{isExporting ? '...' : 'JPEG'}</span>
          </Button>
          <Button
            onClick={onExportCSV}
            variant="custom"
            size="sm"
            className="flex items-center space-x-2 bg-lime-600 hover:bg-lime-500 text-white"
            disabled={isExporting}
            title="Export strains as CSV file"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>{isExporting ? '...' : 'CSV'}</span>
          </Button>
        </div>
      </div>
      {/* Bottom row: Global Sort Options */}
      <div className="flex items-center space-x-2 p-2 border border-gray-600 rounded-md bg-gray-700/50 mt-1">
        <span className="text-xs text-gray-300 font-medium mr-2">Global Sort:</span>
        {sortOptions.map(opt => (
            <SortButton
              key={opt.key}
              label={opt.label}
              sortKey={opt.key}
              currentSortCriteria={globalSortCriteria}
              onClick={() => onUpdateGlobalSortCriteria(opt.key)}
            />
        ))}
        {/* Removed the "Clear Global (apply shelf sort)" button */}
      </div>
    </div>
  );
};
