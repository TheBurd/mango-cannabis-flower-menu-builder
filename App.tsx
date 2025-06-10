import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

// Type declaration for Electron API
declare global {
  interface Window {
    electronAPI?: {
      onMenuCommand: (callback: (event: any, data: { command: string; data?: any }) => void) => void;
      removeAllListeners: () => void;
      showConfirmDialog: (message: string, detail?: string) => Promise<boolean>;
      updateMenuState: (updates: any) => void;
      readFile: (filePath: string) => Promise<string>;
      updateDynamicMenus: (menuData: { shelves: Array<{id: string, name: string}>, darkMode: boolean }) => Promise<void>;
      // Update-related methods
      checkForUpdates: () => Promise<any>;
      downloadUpdate: () => Promise<boolean>;
      installUpdate: () => Promise<boolean>;
      getUpdateInfo: () => Promise<any>;
      onUpdateAvailable: (callback: (event: any, updateInfo: { version: string; releaseDate: string; releaseNotes: string }) => void) => void;
      onDownloadProgress: (callback: (event: any, progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => void) => void;
      onUpdateDownloaded: (callback: (event: any, updateInfo: { version: string }) => void) => void;
      onUpdateDebug?: (callback: (event: any, debug: { type: string; message: string; [key: string]: any }) => void) => void;
      removeUpdateListeners: () => void;
    };
  }
}
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { InstructionsModal } from './components/InstructionsModal';
import { WelcomeModal } from './components/WelcomeModal';
import { FlowerShelvesPanel } from './components/FlowerShelvesPanel';
import { MenuPreviewPanel } from './components/MenuPreviewPanel';
import { UpdateNotification } from './components/UpdateNotification';
import { Shelf, Strain, PreviewSettings, SupportedStates, StrainType, ArtboardSize, SortCriteria, Theme } from './types';
import { 
  INITIAL_PREVIEW_SETTINGS, 
  getDefaultShelves, 
  DEFAULT_SHELVES_PANEL_WIDTH, 
  MIN_SHELVES_PANEL_WIDTH, 
  MIN_PREVIEW_PANEL_WIDTH, 
  DIVIDER_WIDTH,
  CSV_STRAIN_TYPE_MAP,
  APP_STRAIN_TYPE_TO_CSV_SUFFIX,
  THC_DECIMAL_PLACES,
  STRAIN_TYPES_ORDERED
} from './constants';




export interface ExportAction {
  type: 'png' | 'jpeg';
  filename: string;
  artboardSize: ArtboardSize; 
  timestamp: number; // To trigger effect even if other params are same
}

const sortStrains = (strains: Strain[], criteria: SortCriteria | null): Strain[] => {
  if (!criteria) return strains;

  const sortedStrains = [...strains]; // Create a copy to sort

  sortedStrains.sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (criteria.key) {
      case 'name':
        valA = a.name?.toLowerCase() || '';
        valB = b.name?.toLowerCase() || '';
        break;
      case 'grower':
        valA = a.grower?.toLowerCase() || '';
        valB = b.grower?.toLowerCase() || '';
        break;
      case 'type':
        valA = STRAIN_TYPES_ORDERED.indexOf(a.type);
        valB = STRAIN_TYPES_ORDERED.indexOf(b.type);
        break;
      case 'thc':
        // Nulls are considered "lesser"
        valA = a.thc === null ? -Infinity : a.thc;
        valB = b.thc === null ? -Infinity : b.thc;
        break;
      case 'isLastJar':
        valA = a.isLastJar;
        valB = b.isLastJar;
        break;
      default:
        return 0;
    }

    if (valA < valB) {
      return criteria.direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return criteria.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  return sortedStrains;
};


const App: React.FC = () => {
  // Initialize state from localStorage or default
  const [currentAppState, setCurrentAppState] = useState<SupportedStates>(() => {
    const savedState = localStorage.getItem('mango-selected-state');
    if (savedState && Object.values(SupportedStates).includes(savedState as SupportedStates)) {
      return savedState as SupportedStates;
    }
    return SupportedStates.OKLAHOMA; // Default fallback
  });
  
  const [shelves, setShelves] = useState<Shelf[]>(() => getDefaultShelves(currentAppState));
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>(INITIAL_PREVIEW_SETTINGS);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('mango-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });
  
  // Welcome modal state for first-time users
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    const hasSeenWelcome = localStorage.getItem('mango-has-seen-welcome');
    return !hasSeenWelcome; // Show if user hasn't seen it before
  });
  
  const [newlyAddedStrainId, setNewlyAddedStrainId] = useState<string | null>(null);

  // Theme toggle handler
  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('mango-theme', newTheme);
  }, []);

  // Instructions modal handler
  const handleShowInstructions = useCallback(() => {
    setShowInstructions(true);
  }, []);

  // Update notification handler
  const handleUpdateDismissed = useCallback(() => {
    setUpdateDismissed(true);
    // Note: We don't save to localStorage so the notification will show again next app launch
  }, []);

  // Update click handler (from header button)
  const handleUpdateClick = useCallback(async () => {
    if (!window.electronAPI) return;
    
    // Use functional state updates to avoid dependency issues
    setIsDownloadingUpdate(currentDownloading => {
      if (!currentDownloading) {
        setIsUpdateDownloaded(currentDownloaded => {
          if (!currentDownloaded) {
            // Start download
            window.electronAPI!.downloadUpdate().catch(error => {
              console.error('Error downloading update:', error);
              setIsDownloadingUpdate(false);
            });
            return false;
          } else {
            // Install update
            window.electronAPI!.installUpdate().catch(error => {
              console.error('Error installing update:', error);
            });
            return currentDownloaded;
          }
        });
        return true;
      }
      return currentDownloading;
    });
  }, []);



  // Drag and drop handlers
  const handleDragStart = useCallback((strainId: string, shelfId: string, strainIndex: number) => {
    setDragState({ strainId, shelfId, strainIndex });
  }, []);



  const handleMoveStrain = useCallback((fromShelfId: string, toShelfId: string, strainIndex: number, targetIndex?: number) => {
    recordChange(() => {
      setShelves(prevShelves => {
        const newShelves = [...prevShelves];
        const fromShelfIndex = newShelves.findIndex(s => s.id === fromShelfId);
        const toShelfIndex = newShelves.findIndex(s => s.id === toShelfId);
        
        if (fromShelfIndex === -1 || toShelfIndex === -1) return prevShelves;
        
        const fromShelf = newShelves[fromShelfIndex];
        const toShelf = newShelves[toShelfIndex];
        
        // Remove strain from source shelf
        const strainToMove = fromShelf.strains[strainIndex];
        if (!strainToMove) return prevShelves;
        
        const newFromStrains = [...fromShelf.strains];
        newFromStrains.splice(strainIndex, 1);
        
        // Add strain to target shelf
        const newToStrains = [...toShelf.strains];
        const insertIndex = targetIndex !== undefined ? targetIndex : newToStrains.length;
        newToStrains.splice(insertIndex, 0, strainToMove);
        
        // Update shelves
        newShelves[fromShelfIndex] = { ...fromShelf, strains: newFromStrains };
        newShelves[toShelfIndex] = { ...toShelf, strains: newToStrains };
        
        return newShelves;
      });
    });
    setDragState(null);
  }, []);

  const handleReorderStrain = useCallback((shelfId: string, fromIndex: number, toIndex: number) => {
    recordChange(() => {
      setShelves(prevShelves => {
        const newShelves = [...prevShelves];
        const shelfIndex = newShelves.findIndex(s => s.id === shelfId);
        
        if (shelfIndex === -1) return prevShelves;
        
        const shelf = newShelves[shelfIndex];
        const newStrains = [...shelf.strains];
        
        // Adjust toIndex if moving within the same array
        const adjustedToIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
        
        // Remove strain from original position
        const [strainToMove] = newStrains.splice(fromIndex, 1);
        
        // Insert strain at new position
        newStrains.splice(adjustedToIndex, 0, strainToMove);
        
        newShelves[shelfIndex] = { ...shelf, strains: newStrains };
        return newShelves;
      });
    });
    setDragState(null);
  }, []);

  // Update document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const [shelvesPanelWidth, setShelvesPanelWidth] = useState<number>(DEFAULT_SHELVES_PANEL_WIDTH);
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const isResizing = useRef<boolean>(false);

  const [exportFilename, setExportFilename] = useState<string>('mango-menu');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportAction, setExportAction] = useState<ExportAction | null>(null);
  const csvImportInputRef = useRef<HTMLInputElement | null>(null);
  const [showExportOverlay, setShowExportOverlay] = useState<boolean>(false);

  const [globalSortCriteria, setGlobalSortCriteria] = useState<SortCriteria | null>(null);
  const shelvesRef = useRef<HTMLDivElement | null>(null);
  const [lastInteractedShelfId, setLastInteractedShelfId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [dragState, setDragState] = useState<{ strainId: string; shelfId: string; strainIndex: number } | null>(null);
  const [updateDismissed, setUpdateDismissed] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateVersion, setUpdateVersion] = useState<string>('');
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState<boolean>(false);
  const [updateDownloadProgress, setUpdateDownloadProgress] = useState<number>(0);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);

  // Helper function to check if the menu has any content
  const hasMenuContent = useCallback((): boolean => {
    return shelves.some(shelf => shelf.strains.length > 0);
  }, [shelves]);

  // Helper function to show Electron confirmation dialog
  const showElectronConfirm = useCallback(async (message: string, detail: string = ''): Promise<boolean> => {
    if (window.electronAPI) {
      return await window.electronAPI.showConfirmDialog(message, detail);
    } else {
      return confirm(`${message}\n\n${detail}`);
    }
  }, []);

  // Track last interacted shelf
  const handleShelfInteraction = useCallback((shelfId: string) => {
    setLastInteractedShelfId(shelfId);
  }, []);



  // Scroll to shelf handler for tabs
  const handleScrollToShelf = useCallback((shelfId: string) => {
    if (shelvesRef.current) {
      const shelfElement = shelvesRef.current.querySelector(`[data-shelf-id="${shelfId}"]`);
      if (shelfElement) {
        shelfElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  }, []);

  // State change handler with confirmation
  const handleStateChange = useCallback((newState: SupportedStates) => {
    if (newState === currentAppState) return; // No change needed
    
    if (hasMenuContent()) {
      const confirmMessage = `You have strains in your current ${currentAppState} menu.\n\n` +
        `Switching to ${newState} will clear your current progress.\n\n` +
        `Are you sure you want to continue?`;
      
      if (!confirm(confirmMessage)) {
        return; // User cancelled, don't change state
      }
    }
    
    setCurrentAppState(newState);
    // Save the selected state to localStorage
    localStorage.setItem('mango-selected-state', newState);
  }, [currentAppState, hasMenuContent]);

  // Welcome modal handlers
  const handleWelcomeStateSelect = useCallback((selectedState: SupportedStates) => {
    setCurrentAppState(selectedState);
    localStorage.setItem('mango-selected-state', selectedState);
    localStorage.setItem('mango-has-seen-welcome', 'true');
    setShowWelcomeModal(false);
  }, []);

  const handleWelcomeModalClose = useCallback(() => {
    localStorage.setItem('mango-has-seen-welcome', 'true');
    setShowWelcomeModal(false);
  }, []);

  useEffect(() => {
    setShelves(getDefaultShelves(currentAppState));
    setGlobalSortCriteria(null); // Reset global sort on state change
  }, [currentAppState]);

  const recordChange = (updater: () => void) => {
    updater();
    setGlobalSortCriteria(null);
    setShelves(prevShelves => 
      prevShelves.map(shelf => ({ ...shelf, sortCriteria: null }))
    );
  };
  
  useEffect(() => {
    if (newlyAddedStrainId) {
      const timer = setTimeout(() => setNewlyAddedStrainId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedStrainId]);

  // Set up update event listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleUpdateAvailable = (_event: any, updateInfo: { version: string; releaseDate: string; releaseNotes: string }) => {
      setUpdateAvailable(true);
      setUpdateVersion(updateInfo.version);
      setIsUpdateDownloaded(false);
      setIsDownloadingUpdate(false);
    };

    const handleDownloadProgress = (_event: any, progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => {
      setUpdateDownloadProgress(progress.percent);
    };

    const handleUpdateDownloaded = (_event: any, info: { version: string }) => {
      setIsDownloadingUpdate(false);
      setIsUpdateDownloaded(true);
      setUpdateDownloadProgress(100);
    };

    const handleUpdateDebug = (_event: any, debug: { type: string; message: string; [key: string]: any }) => {
      const timestamp = new Date().toLocaleTimeString();
      const debugMessage = `[${timestamp}] ${debug.type}: ${debug.message}`;
      setDebugInfo(prev => [...prev.slice(-9), debugMessage]); // Keep last 10 messages
      console.log('Update Debug:', debug);
    };

    window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
    window.electronAPI.onDownloadProgress(handleDownloadProgress);
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);
    window.electronAPI.onUpdateDebug?.(handleUpdateDebug);

    // Also manually trigger an update check for debugging
    const triggerManualCheck = async () => {
      const timestamp = new Date().toLocaleTimeString();
      setDebugInfo(prev => [...prev.slice(-9), `[${timestamp}] startup: Triggering manual update check...`]);
      try {
        const result = await window.electronAPI!.checkForUpdates();
        setDebugInfo(prev => [...prev.slice(-9), `[${timestamp}] startup: Manual check result: ${JSON.stringify(result)}`]);
      } catch (error) {
        setDebugInfo(prev => [...prev.slice(-9), `[${timestamp}] startup: Manual check failed: ${error}`]);
      }
    };
    
    // Trigger check after a short delay
    const timer = setTimeout(triggerManualCheck, 2000);

    return () => {
      clearTimeout(timer);
      window.electronAPI?.removeUpdateListeners();
    };
  }, []);


  const handleAddStrain = useCallback((shelfId: string) => {
    const newStrainId = crypto.randomUUID();
    handleShelfInteraction(shelfId); // Track interaction
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? {
                ...shelf,
                strains: [
                  ...shelf.strains,
                  {
                    id: newStrainId,
                    name: '',
                    grower: '',
                    thc: null,
                    type: StrainType.HYBRID,
                    isLastJar: false,
                  },
                ],
              }
            : shelf
        )
      );
    });
    setNewlyAddedStrainId(newStrainId);
  }, [handleShelfInteraction]);

  const handleUpdateStrain = useCallback((shelfId: string, strainId: string, updatedStrain: Partial<Strain>) => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? {
                ...shelf,
                strains: shelf.strains.map(strain =>
                  strain.id === strainId ? { ...strain, ...updatedStrain } : strain
                ),
              }
            : shelf
        )
      );
    });
  }, []);

  const handleRemoveStrain = useCallback((shelfId: string, strainId: string) => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? { ...shelf, strains: shelf.strains.filter(s => s.id !== strainId) }
            : shelf
        )
      );
    });
  }, []);

  const handleCopyStrain = useCallback((shelfId: string, strainId: string, direction: 'above' | 'below') => {
    recordChange(() => {
      setShelves(prevShelves => {
        const shelfIndex = prevShelves.findIndex(s => s.id === shelfId);
        if (shelfIndex === -1) return prevShelves;

        const currentShelf = prevShelves[shelfIndex];
        const strainIndex = currentShelf.strains.findIndex(s => s.id === strainId);
        if (strainIndex === -1) return prevShelves;

        const strainToCopy = { ...currentShelf.strains[strainIndex], id: crypto.randomUUID() };
        const newStrains = [...currentShelf.strains];

        if (direction === 'above') {
          newStrains.splice(strainIndex, 0, strainToCopy);
        } else {
          newStrains.splice(strainIndex + 1, 0, strainToCopy);
        }
        
        const updatedShelves = [...prevShelves];
        updatedShelves[shelfIndex] = { ...currentShelf, strains: newStrains };
        return updatedShelves;
      });
    });
  }, []);

  const handleClearShelfStrains = useCallback((shelfId: string) => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId ? { ...shelf, strains: [] } : shelf
        )
      );
    });
  }, []);

  const handleClearAllShelves = useCallback(() => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf => ({ ...shelf, strains: [] }))
      );
    });
  }, []);

  const handleClearAllLastJars = useCallback(() => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf => ({
          ...shelf,
          strains: shelf.strains.map(strain => ({ ...strain, isLastJar: false })),
        }))
      );
    });
  }, []);
  
  const handleUpdatePreviewSettings = useCallback((newSettings: Partial<PreviewSettings>) => {
     // For preview settings, we don't want to reset sorts, so don't use recordChange
     setPreviewSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleUpdateGlobalSortCriteria = useCallback((key: SortCriteria['key']) => {
    // Applying a global sort will reset shelf-specific sorts and any previous global sort.
    // It does not use recordChange directly to avoid double-resetting sorts.
    setGlobalSortCriteria(prevCriteria => {
      if (prevCriteria && prevCriteria.key === key) {
        return { ...prevCriteria, direction: prevCriteria.direction === 'asc' ? 'desc' : 'asc' };
      }
      let defaultDirection: 'asc' | 'desc' = 'asc';
      if (key === 'thc' || key === 'isLastJar') {
        defaultDirection = 'desc';
      }
      return { key, direction: defaultDirection };
    });
    setShelves(prevShelves => prevShelves.map(s => ({ ...s, sortCriteria: null })));
  }, []);

  const handleUpdateShelfSortCriteria = useCallback((shelfId: string, key: SortCriteria['key']) => {
    // Applying a shelf sort will reset global sort.
    // It does not use recordChange directly to avoid double-resetting sorts.
    setShelves(prevShelves =>
      prevShelves.map(shelf => {
        if (shelf.id === shelfId) {
          if (shelf.sortCriteria && shelf.sortCriteria.key === key) {
            return {
              ...shelf,
              sortCriteria: { ...shelf.sortCriteria, direction: shelf.sortCriteria.direction === 'asc' ? 'desc' : 'asc' },
            };
          }
          let defaultDirection: 'asc' | 'desc' = 'asc';
          if (key === 'thc' || key === 'isLastJar') {
            defaultDirection = 'desc';
          }
          return { ...shelf, sortCriteria: { key, direction: defaultDirection } };
        }
        return shelf;
      })
    );
    setGlobalSortCriteria(null); // Clear global sort
  }, []);


  const handleMouseDownOnDivider = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.classList.add('dragging-divider');

    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isResizing.current || !mainContainerRef.current) return;

      const containerRect = mainContainerRef.current.getBoundingClientRect();
      let newWidth = event.clientX - containerRect.left;
      const totalWidth = mainContainerRef.current.offsetWidth;
      
      if (newWidth < MIN_SHELVES_PANEL_WIDTH) {
        newWidth = MIN_SHELVES_PANEL_WIDTH;
      } else if (totalWidth - newWidth - DIVIDER_WIDTH < MIN_PREVIEW_PANEL_WIDTH) {
        newWidth = totalWidth - MIN_PREVIEW_PANEL_WIDTH - DIVIDER_WIDTH;
      }
      setShelvesPanelWidth(newWidth);
    };

    const handleGlobalMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.classList.remove('dragging-divider');
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

  }, []);

  const triggerImageExport = useCallback((type: 'png' | 'jpeg') => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true); // Show overlay
    setExportAction({
      type,
      filename: exportFilename || 'mango-menu',
      artboardSize: previewSettings.artboardSize, 
      timestamp: Date.now(),
    });
  }, [isExporting, exportFilename, previewSettings.artboardSize]);

  const handleExportCSV = useCallback(() => {
    const header = ["Category", "Strain Name", "Grow/Brand", "THC Percentage", "Class", "lastjar"];
    
    const rows = shelves.flatMap(shelf => {
      if (shelf.strains.length === 0) return [];
      // Use sorted strains for CSV export based on current criteria
      const activeSortCriteria = shelf.sortCriteria || globalSortCriteria;
      const strainsToExport = sortStrains([...shelf.strains], activeSortCriteria);

      return strainsToExport.map(strain => {
        const thcPercentageString = strain.thc === null ? "-" : `${strain.thc.toFixed(THC_DECIMAL_PLACES)}%`;
        const classString = APP_STRAIN_TYPE_TO_CSV_SUFFIX[strain.type] || 'H';
        
        return [
          shelf.name,
          strain.name || "Unnamed Strain",
          strain.grower || "",
          thcPercentageString,
          classString,
          strain.isLastJar ? "lastjar" : ""
        ].map(field => `"${String(field).replace(/"/g, '""')}"`);
      });
    });

    if (rows.length === 0) {
      alert("No strain data to export.");
      return;
    }

    const csvContent = [header.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const filenameToUse = (exportFilename || 'mango-menu-export') + '.csv';
      link.setAttribute("href", url);
      link.setAttribute("download", filenameToUse);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [shelves, exportFilename, globalSortCriteria]);

  const handleImportCSVRequest = useCallback(() => {
    csvImportInputRef.current?.click();
  }, []);
  
  const processImportedCSVFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      if (!csvData) {
        alert("Failed to read CSV file.");
        return;
      }

      const lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        alert("CSV file is empty or contains only a header.");
        return;
      }

      const importedStrainsByShelf: Record<string, Strain[]> = {};
      let importedCount = 0;
      let skippedRowCount = 0;

      // Create a temporary map for faster shelf lookup by name
      const shelfNameMap = new Map(shelves.map(s => [s.name.toLowerCase(), s.id]));

      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        const cells = rawLine.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        if (cells.length < 5) {
            console.warn(`SKIPPING Row ${i + 1}: Not enough cells (found ${cells.length}, expected at least 5). Line: "${rawLine}"`);
            skippedRowCount++;
            continue;
        }

        const csvCategory = cells[0].toLowerCase(); // Normalize category name for lookup
        const csvStrainName = cells[1];
        const csvGrower = cells[2];
        const csvThcPercentString = cells[3];
        const csvClassString = cells[4];
        const csvLastJar = cells.length > 5 ? cells[5]?.toLowerCase() === 'lastjar' : false;
        
        const targetShelfId = shelfNameMap.get(csvCategory);
        if (!targetShelfId) {
          console.warn(`SKIPPING Row ${i + 1}: Strain "${csvStrainName}" for unknown category "${cells[0]}" in ${currentAppState}.`);
          skippedRowCount++;
          continue;
        }

        let thcValue: number | null = null;
        if (csvThcPercentString && csvThcPercentString !== "-") {
            const thcNumericMatch = csvThcPercentString.match(/(\d*\.?\d+)/);
            if (thcNumericMatch && thcNumericMatch[1]) {
                thcValue = parseFloat(thcNumericMatch[1]);
                if (isNaN(thcValue)) thcValue = null;
            }
        }

        let strainType: StrainType = StrainType.HYBRID;
        const rawClass = csvClassString ? csvClassString.trim() : "";
        if (rawClass) {
            const normalizedClass = rawClass.toUpperCase().replace(/[\s-./]/g, '');
            const mappedType = CSV_STRAIN_TYPE_MAP[normalizedClass];
            if (mappedType) {
              strainType = mappedType;
            }
        }
        
        const newStrain: Strain = {
          id: crypto.randomUUID(),
          name: csvStrainName || 'Unnamed Strain',
          grower: csvGrower || '',
          thc: thcValue,
          type: strainType,
          isLastJar: csvLastJar,
        };

        if (!importedStrainsByShelf[targetShelfId]) {
          importedStrainsByShelf[targetShelfId] = [];
        }
        importedStrainsByShelf[targetShelfId].push(newStrain);
        importedCount++;
      }
      
      // Use recordChange for CSV import to ensure sorts are reset
      recordChange(() => {
        setShelves(prevShelves => 
          prevShelves.map(shelf => ({
            ...shelf,
            strains: importedStrainsByShelf[shelf.id] || [], 
            // sortCriteria will be reset by recordChange
          }))
        );
        // globalSortCriteria will be reset by recordChange
      });

      alert(`CSV Import Complete: ${importedCount} strains loaded.${skippedRowCount > 0 ? ` ${skippedRowCount} rows skipped (see console for details).` : ''}`);
      if (csvImportInputRef.current) {
        csvImportInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      alert("Error reading CSV file.");
       if (csvImportInputRef.current) {
        csvImportInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }, [shelves, recordChange, currentAppState]);

  // Function to load CSV from file path (for Electron native dialog)
  const loadCSVFromFilePath = useCallback(async (filePath: string) => {
          try {
        if (window.electronAPI?.readFile) {
          const csvData = await window.electronAPI.readFile(filePath);
        
        // Create a fake File object to reuse the existing processing logic
        const fileName = filePath.split(/[\\/]/).pop() || 'imported.csv';
        const file = new File([csvData], fileName, { type: 'text/csv' });
        
        // Process the file using the existing CSV processing logic
        processImportedCSVFile(file);
      } else {
        throw new Error('Electron file reading API not available');
      }
    } catch (error) {
      console.error('Error loading CSV from file path:', error);
      alert('Error loading CSV file: ' + (error instanceof Error ? error.message : String(error)));
    }
  }, [processImportedCSVFile]);

  // Function to update dynamic menu items
  const updateDynamicMenus = useCallback(() => {
    if (window.electronAPI?.updateDynamicMenus) {
      const menuData = {
        shelves: shelves.map(shelf => ({ id: shelf.id, name: shelf.name })),
        darkMode: theme === 'dark'
      };
      window.electronAPI.updateDynamicMenus(menuData).catch(error => {
        console.error('Error updating dynamic menus:', error);
      });
    }
  }, [shelves, theme]);

  const processedShelves = useMemo(() => {
    return shelves.map(shelf => {
      const activeSortCriteria = shelf.sortCriteria || globalSortCriteria;
      return {
        ...shelf,
        strains: sortStrains(shelf.strains, activeSortCriteria) 
      };
    });
  }, [shelves, globalSortCriteria]);

  // Update dynamic menus when shelves or theme changes
  useEffect(() => {
    updateDynamicMenus();
  }, [updateDynamicMenus]);

  // Electron menu command handlers
  useEffect(() => {
    if (!window.electronAPI) {
      return;
    }

    const handleMenuCommand = async (_event: any, { command, data }: { command: string; data?: any }) => {

      switch (command) {
        case 'new-menu':
          if (hasMenuContent()) {
            const confirmed = await showElectronConfirm(
              'Clear current menu?',
              'You have strains in your menu. Creating a new menu will clear all current progress.'
            );
            if (!confirmed) return;
          }
          recordChange(() => {
            setShelves(getDefaultShelves(currentAppState));
          });
          break;

        case 'open-menu':
          handleImportCSVRequest();
          break;

        case 'open-menu-file':
          if (data && typeof data === 'string') {
            loadCSVFromFilePath(data);
          }
          break;

        case 'switch-state':
          const stateMap: Record<string, SupportedStates> = {
            'oklahoma': SupportedStates.OKLAHOMA,
            'michigan': SupportedStates.MICHIGAN,
            'new_mexico': SupportedStates.NEW_MEXICO
          };
          const newState = stateMap[data];
          if (newState) {
            handleStateChange(newState);
          }
          break;

        case 'export-csv':
          handleExportCSV();
          break;

        case 'export-png':
          triggerImageExport('png');
          break;

        case 'export-jpeg':
          triggerImageExport('jpeg');
          break;

        case 'quit-app':
          if (hasMenuContent()) {
            const confirmed = await showElectronConfirm(
              'Quit application?',
              'You have unsaved changes. Are you sure you want to quit?'
            );
            if (!confirmed) return;
          }
          // Let Electron handle the actual quit
          window.electronAPI?.updateMenuState({ shouldQuit: true });
          break;

        case 'add-strain-last':
          if (lastInteractedShelfId && shelves.find(s => s.id === lastInteractedShelfId)) {
            handleAddStrain(lastInteractedShelfId);
            handleShelfInteraction(lastInteractedShelfId);
          } else if (shelves.length > 0) {
            handleAddStrain(shelves[0].id);
            handleShelfInteraction(shelves[0].id);
          }
          break;

        case 'add-strain-to-shelf':
          if (data && shelves.find(s => s.id === data)) {
            handleAddStrain(data);
            handleShelfInteraction(data);
          }
          break;

        case 'global-sort':
          const sortMap: Record<string, SortCriteria['key']> = {
            'name': 'name',
            'grower': 'grower',
            'class': 'type',
            'thc': 'thc',
            'lastjar': 'isLastJar'
          };
          const sortKey = sortMap[data];
          if (sortKey) {
            handleUpdateGlobalSortCriteria(sortKey);
          }
          break;

        case 'clear-all-shelves':
          const confirmed = await showElectronConfirm(
            'Clear all shelves?',
            'This will remove all strains from all shelves. This action cannot be undone.'
          );
          if (confirmed) {
            handleClearAllShelves();
          }
          break;

        case 'clear-all-last-jars':
          handleClearAllLastJars();
          break;

        case 'toggle-dark-mode':
          const newTheme = data ? 'dark' : 'light';
          handleThemeChange(newTheme);
          break;

        case 'jump-to-shelf':
          if (data && shelves.find(s => s.id === data)) {
            // Scroll to the specific shelf
            const shelfElement = document.querySelector(`[data-shelf-id="${data}"]`);
            if (shelfElement) {
              shelfElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
          break;

        case 'zoom-in':
          setPreviewSettings(prev => ({
            ...prev,
            zoomLevel: Math.min(prev.zoomLevel * 1.2, 3.0)
          }));
          break;

        case 'zoom-out':
          setPreviewSettings(prev => ({
            ...prev,
            zoomLevel: Math.max(prev.zoomLevel / 1.2, 0.1)
          }));
          break;

        case 'set-zoom':
          setPreviewSettings(prev => ({
            ...prev,
            zoomLevel: data
          }));
          break;

        case 'fit-to-window':
          // Trigger fit-to-window by setting a flag that MenuPreviewPanel can detect
          setPreviewSettings(prev => ({
            ...prev,
            fitToWindowTrigger: prev.fitToWindowTrigger ? prev.fitToWindowTrigger + 1 : 1
          }));
          break;

        case 'reset-zoom':
          setPreviewSettings(INITIAL_PREVIEW_SETTINGS);
          break;

        case 'set-page-size':
          const sizeMap: Record<string, ArtboardSize> = {
            'letter-portrait': ArtboardSize.LETTER_PORTRAIT,
            'letter-landscape': ArtboardSize.LETTER_LANDSCAPE,
            'screen-16-9-landscape': ArtboardSize.SCREEN_16_9_LANDSCAPE,
            'screen-16-9-portrait': ArtboardSize.SCREEN_16_9_PORTRAIT
          };
          const artboardSize = sizeMap[data];
          if (artboardSize) {
            setPreviewSettings(prev => ({ ...prev, artboardSize }));
          }
          break;

        case 'set-header-image':
          const headerMap: Record<string, any> = {
            'none': 'NONE',
            'large': 'LARGE',
            'small': 'SMALL'
          };
          const headerSize = headerMap[data];
          if (headerSize) {
            setPreviewSettings(prev => ({ ...prev, headerImageSize: headerSize }));
          }
          break;

        case 'set-columns':
          setPreviewSettings(prev => ({ ...prev, columns: data }));
          break;

        case 'toggle-shelf-splitting':
          setPreviewSettings(prev => ({ ...prev, forceShelfFit: !data }));
          break;

        case 'toggle-thc-icon':
          setPreviewSettings(prev => ({ ...prev, showThcIcon: data }));
          break;

        case 'reset-workspace':
          setShelvesPanelWidth(DEFAULT_SHELVES_PANEL_WIDTH);
          break;

        case 'show-instructions':
          setShowInstructions(true);
          break;

        case 'show-about':
          alert('🥭 Mango Cannabis Flower Menu Builder v1.0.0\n\nMango Cannabis Flower Menu Builder with dynamic pricing, state compliance, and beautiful export capabilities.\n\nDeveloped by Mango Cannabis\nContact: brad@mangocannabis.com');
          break;

        case 'reset-welcome':
          localStorage.removeItem('mango-has-seen-welcome');
          setShowWelcomeModal(true);
          break;

        case 'test-connection':
          alert('Menu communication is working!');
          break;

        default:
          // Unknown menu command - no action needed
      }
    };

    window.electronAPI.onMenuCommand(handleMenuCommand);

    // Update menu state when theme changes and signal ready
    window.electronAPI.updateMenuState({ 
      darkMode: theme === 'dark',
      showThcIcon: previewSettings.showThcIcon,
      allowShelfSplitting: !previewSettings.forceShelfFit,
      ready: true // Signal that React app is ready for menu commands
    });

    return () => {
      window.electronAPI?.removeAllListeners();
    };
  }, [
    hasMenuContent, 
    showElectronConfirm, 
    handleImportCSVRequest, 
    handleStateChange, 
    handleExportCSV, 
    triggerImageExport, 
    lastInteractedShelfId, 
    shelves, 
    handleAddStrain, 
    handleShelfInteraction,
    handleUpdateGlobalSortCriteria, 
    handleClearAllShelves, 
    handleClearAllLastJars, 
    handleThemeChange, 
    theme, 
    previewSettings, 
    currentAppState, 
    recordChange
  ]);

      return (
      <div className={`flex flex-col h-screen font-sans antialiased ${
        theme === 'dark' 
          ? 'bg-gray-900 text-gray-50' 
          : 'bg-gray-50 text-gray-900'
      }`}>
      <Header 
        appName="Flower Menu Builder" 
        currentState={currentAppState} 
        onStateChange={handleStateChange} 
        theme={theme} 
        onThemeChange={handleThemeChange} 
        onShowInstructions={handleShowInstructions}
      />
      <Toolbar
        onClearAllShelves={handleClearAllShelves}
        onClearAllLastJars={handleClearAllLastJars}
        exportFilename={exportFilename}
        onExportFilenameChange={setExportFilename}
        onExportPNG={() => triggerImageExport('png')}
        onExportJPEG={() => triggerImageExport('jpeg')}
        onExportCSV={handleExportCSV}
        onImportCSVRequest={handleImportCSVRequest}
        isExporting={isExporting}
        globalSortCriteria={globalSortCriteria}
        onUpdateGlobalSortCriteria={handleUpdateGlobalSortCriteria}
        theme={theme}
      />
      <main ref={mainContainerRef} className={`flex flex-1 overflow-hidden pt-2 px-2 pb-2 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <FlowerShelvesPanel
          ref={shelvesRef}
          style={{ width: `${shelvesPanelWidth}px`, flexShrink: 0 }}
          shelves={processedShelves} // Use processed (sorted) shelves
          onAddStrain={handleAddStrain}
          onUpdateStrain={handleUpdateStrain}
          onRemoveStrain={handleRemoveStrain}
          onCopyStrain={handleCopyStrain}
          onClearShelfStrains={handleClearShelfStrains}
          newlyAddedStrainId={newlyAddedStrainId}
          onUpdateShelfSortCriteria={handleUpdateShelfSortCriteria}
          onScrollToShelf={handleScrollToShelf}
          theme={theme}
          onMoveStrain={handleMoveStrain}
          onReorderStrain={handleReorderStrain}
          dragState={dragState}
          onDragStart={handleDragStart}
        />
        <div
          className={`panel-divider ${isResizing.current ? 'dragging' : ''}`}
          onMouseDown={handleMouseDownOnDivider}
          role="separator"
          aria-label="Resize panels"
          aria-orientation="vertical"
          aria-controls="flower-shelves-panel menu-preview-panel"
          aria-valuenow={shelvesPanelWidth}
          aria-valuemin={MIN_SHELVES_PANEL_WIDTH}
          aria-valuemax={mainContainerRef.current ? mainContainerRef.current.offsetWidth - MIN_PREVIEW_PANEL_WIDTH - DIVIDER_WIDTH : undefined}
        >
        </div>
        <MenuPreviewPanel
          shelves={processedShelves} // Use processed (sorted) shelves
          settings={previewSettings}
          onSettingsChange={handleUpdatePreviewSettings}
          exportAction={exportAction}
          onExportComplete={() => {
            setExportAction(null);
            setIsExporting(false);
            setShowExportOverlay(false); // Hide overlay
          }}
          currentState={currentAppState}
          theme={theme}
        />
      </main>
      <input
        type="file"
        ref={csvImportInputRef}
        accept=".csv"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImportedCSVFile(e.target.files[0]);
          }
        }}
      />
      {showExportOverlay && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50"
          role="alertdialog"
          aria-live="assertive"
          aria-busy="true"
          aria-label="Exporting image, please wait"
        >
          <div className="bg-white p-8 rounded-lg shadow-xl text-gray-800 flex items-center space-x-4">
            <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-semibold">Exporting your masterpiece...</span>
          </div>
        </div>
              )}
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          theme={theme}
        />
        <WelcomeModal
          isOpen={showWelcomeModal}
          onStateSelect={handleWelcomeStateSelect}
          onClose={handleWelcomeModalClose}
          theme={theme}
        />
        {!updateDismissed && (
          <UpdateNotification
            onUpdateDismissed={handleUpdateDismissed}
            updateAvailable={updateAvailable}
            updateDownloaded={isUpdateDownloaded}
            updateVersion={updateVersion}
            theme={theme}
          />
        )}
        
        {/* Debug Panel */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="mb-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            🔍 Debug Updates
          </button>
          
          {window.electronAPI && (
            <button
              onClick={async () => {
                const timestamp = new Date().toLocaleTimeString();
                setDebugInfo(prev => [...prev.slice(-9), `[${timestamp}] manual: Manually checking for updates...`]);
                                 try {
                   const result = await window.electronAPI!.checkForUpdates();
                   setDebugInfo(prev => [...prev.slice(-9), `[${timestamp}] manual: Check result: ${JSON.stringify(result)}`]);
                 } catch (error) {
                   setDebugInfo(prev => [...prev.slice(-9), `[${timestamp}] manual: Check failed: ${error}`]);
                 }
              }}
              className="block w-full mb-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              🔄 Manual Check
            </button>
          )}
          
          {showDebugPanel && (
            <div className="w-80 max-h-60 overflow-y-auto bg-gray-800 text-green-400 p-4 rounded-lg text-xs font-mono">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">Auto-Updater Debug</h3>
                <button
                  onClick={() => setDebugInfo([])}
                  className="text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              {debugInfo.length === 0 ? (
                <p className="text-gray-500">No debug info yet...</p>
              ) : (
                debugInfo.map((info, index) => (
                  <div key={index} className="mb-1 break-words">
                    {info}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

export default App;
