import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * PANEL INTEGRATION ARCHITECTURE
 * ==============================
 * 
 * This App component now supports conditional rendering of panels based on menu mode:
 * 
 * BULK FLOWER MODE (MenuMode.BULK):
 * - Uses FlowerShelvesPanel for strain management
 * - Uses MenuPreviewPanel for bulk flower menu preview
 * - Data: bulkShelves (Shelf[] with strains)
 * 
 * PRE-PACKAGED MODE (MenuMode.PREPACKAGED):
 * - Uses PrePackagedPanel for product management
 * - Uses PrePackagedCanvas for pre-packaged menu preview with zoom/pan
 * - Data: prePackagedShelves (PrePackagedShelf[] with products)
 * 
 * STATE MANAGEMENT:
 * - Dual state system maintains both bulk and pre-packaged data separately
 * - Mode switching preserves data in both modes
 * - Generic handlers (handleAddItem, handleUpdateItem, etc.) work with both modes
 * - Specific aliases (handleAddProduct, handleUpdateProduct, etc.) for PrePackaged components
 * - Backward compatibility maintained with existing handler names
 * 
 * SORTING SYSTEM:
 * - sortStrains() for bulk flower data
 * - sortPrePackagedProducts() for pre-packaged data
 * - processedShelves useMemo handles both modes with proper type safety
 * 
 * INTEGRATION COMPLETE: Full PrePackaged system now operational
 */

// Type declaration for Electron API
declare global {
  interface Window {
    electronAPI?: {
      onMenuCommand: (callback: (event: any, data: { command: string; data?: any }) => void) => void;
      removeAllListeners: () => void;
      showConfirmDialog: (message: string, detail?: string) => Promise<boolean>;
      updateMenuState: (updates: any) => void;
      readFile: (filePath: string) => Promise<string>;
      updateDynamicMenus: (menuData: { shelves: Array<{id: string, name: string}>, darkMode: boolean, fiftyPercentOffEnabled: boolean }) => Promise<void>;
      // Update-related methods
      checkForUpdates: () => Promise<any>;
      downloadUpdate: () => Promise<boolean>;
      installUpdate: () => Promise<boolean>;
      getUpdateInfo: () => Promise<any>;
      getCurrentVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<boolean>;
      onUpdateAvailable: (callback: (event: any, updateInfo: { version: string; releaseDate: string; releaseNotes: string }) => void) => void;
      onDownloadProgress: (callback: (event: any, progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => void) => void;
      onUpdateDownloaded: (callback: (event: any, updateInfo: { version: string }) => void) => void;
      onUpdateDebug?: (callback: (event: any, debug: { type: string; message: string; [key: string]: any }) => void) => void;
      onUpdateNotAvailable?: (callback: (event: any, info: any) => void) => void;
      removeUpdateListeners: () => void;
    };
  }
}
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { InstructionsModalTabs } from './components/InstructionsModalTabs';
import { WelcomeModal } from './components/WelcomeModal';
import { WhatsNewModalTabs } from './components/WhatsNewModalTabs';
import { CsvImportModal } from './components/CsvImportModal';
import { CsvExportModal } from './components/CsvExportModal';
import { UnifiedExportModal } from './components/UnifiedExportModal';
import { FlowerShelvesPanel } from './components/FlowerShelvesPanel';
import { MenuPreviewPanel } from './components/MenuPreviewPanel';
import { PrePackagedPanel } from './components/PrePackagedPanel';
import { PrePackagedCanvas } from './components/PrePackagedCanvas';
import { UpdateNotification } from './components/UpdateNotification';
import { DebugConsole } from './components/DebugConsole';
import { FiftyPercentOffToggle } from './components/FiftyPercentOffToggle';
import { ToastProvider, useToast } from './components/ToastContainer';
import { Shelf, Strain, PreviewSettings, SupportedStates, StrainType, ArtboardSize, SortCriteria, Theme, MenuMode, PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, PrePackagedWeight } from './types';
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
  STRAIN_TYPES_ORDERED,
  getShelfHierarchy,
  getDefaultPrePackagedShelves
} from './constants';
import { getOverflowDrivenAutoFormat, AutoFormatState } from './utils/autoFormat';




export interface ExportAction {
  type: 'png' | 'jpeg';
  filename: string;
  artboardSize: ArtboardSize; 
  timestamp: number; // To trigger effect even if other params are same
}

const sortStrains = (strains: Strain[], criteria: SortCriteria | null, currentState?: SupportedStates): Strain[] => {
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
      case 'isSoldOut':
        valA = a.isSoldOut;
        valB = b.isSoldOut;
        break;
      case 'originalShelf':
        if (currentState) {
          const hierarchy = getShelfHierarchy(currentState);
          valA = a.originalShelf ? (hierarchy[a.originalShelf] ?? 999) : 999;
          valB = b.originalShelf ? (hierarchy[b.originalShelf] ?? 999) : 999;
        } else {
          valA = a.originalShelf || '';
          valB = b.originalShelf || '';
        }
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

const sortPrePackagedProducts = (products: PrePackagedProduct[], criteria: PrePackagedSortCriteria | SortCriteria | null, currentState?: SupportedStates): PrePackagedProduct[] => {
  if (!criteria) return products;

  const sortedProducts = [...products]; // Create a copy to sort

  sortedProducts.sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (criteria.key) {
      case 'name':
        valA = a.name?.toLowerCase() || '';
        valB = b.name?.toLowerCase() || '';
        break;
      case 'brand':
        valA = a.brand?.toLowerCase() || '';
        valB = b.brand?.toLowerCase() || '';
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
      case 'terpenes':
        // Nulls are considered "lesser"
        valA = a.terpenes === null ? -Infinity : a.terpenes;
        valB = b.terpenes === null ? -Infinity : b.terpenes;
        break;
      case 'price':
        valA = a.price;
        valB = b.price;
        break;
      case 'isLowStock':
        // Sort low stock items first when sorting asc, last when sorting desc
        valA = a.isLowStock ? '1' : '0';
        valB = b.isLowStock ? '1' : '0';
        break;
      case 'isLastJar':
        // Map isLastJar key to isLowStock field for pre-packaged products (UI consistency)
        valA = a.isLowStock ? '1' : '0';
        valB = b.isLowStock ? '1' : '0';
        break;
      case 'isSoldOut':
        valA = a.isSoldOut;
        valB = b.isSoldOut;
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
  return sortedProducts;
};


const AppContent: React.FC = () => {
  const { addToast } = useToast();
  // Initialize state from localStorage or default
  const [currentAppState, setCurrentAppState] = useState<SupportedStates>(() => {
    const savedState = localStorage.getItem('mango-selected-state');
    if (savedState && Object.values(SupportedStates).includes(savedState as SupportedStates)) {
      return savedState as SupportedStates;
    }
    return SupportedStates.OKLAHOMA; // Default fallback
  });

  // Menu mode state - determines if using bulk flower or pre-packaged products (Oklahoma only)
  const [menuMode, setMenuMode] = useState<MenuMode>(() => {
    const savedMode = localStorage.getItem('mango-oklahoma-menu-mode');
    if (savedMode && Object.values(MenuMode).includes(savedMode as MenuMode)) {
      return savedMode as MenuMode;
    }
    return MenuMode.PREPACKAGED; // Default to pre-packaged mode
  });

  // Startup validation: Auto-correct invalid NY+Bulk combinations
  useEffect(() => {
    if (currentAppState === SupportedStates.NEW_YORK && menuMode === MenuMode.BULK) {
      // Silent auto-correction on startup for invalid combinations
      setMenuMode(MenuMode.PREPACKAGED);
      localStorage.setItem('mango-menu-mode', MenuMode.PREPACKAGED);
    }
  }, [currentAppState, menuMode]);
  
  // Bulk flower shelves state
  const [bulkShelves, setBulkShelves] = useState<Shelf[]>(() => {
    // Check if we have imported bulk flower data from CSV import
    const importedData = localStorage.getItem('mango-imported-bulk-shelves');
    console.log('Checking for imported bulk data:', importedData ? 'Found' : 'Not found');
    if (importedData) {
      try {
        const parsedShelves = JSON.parse(importedData);
        console.log('Successfully parsed imported bulk shelves:', parsedShelves.length, 'shelves');
        localStorage.removeItem('mango-imported-bulk-shelves'); // Clean up
        return parsedShelves;
      } catch (error) {
        console.error('Error loading imported bulk shelves:', error);
      }
    }
    const savedFiftyPercentOffEnabled = localStorage.getItem('mango-fifty-percent-off-enabled') === 'true';
    const defaultShelves = getDefaultShelves(currentAppState, savedFiftyPercentOffEnabled);
    console.log('Using default bulk shelves:', defaultShelves.length, 'shelves');
    return defaultShelves;
  });

  // Pre-packaged shelves state
  const [prePackagedShelves, setPrePackagedShelves] = useState<PrePackagedShelf[]>(() => {
    // Check if we have imported pre-packaged data from CSV import
    const importedData = localStorage.getItem('mango-imported-prepackaged-shelves');
    console.log('Checking for imported pre-packaged data:', importedData ? 'Found' : 'Not found');
    if (importedData) {
      try {
        const parsedShelves = JSON.parse(importedData);
        console.log('Successfully parsed imported pre-packaged shelves:', parsedShelves.length, 'shelves');
        localStorage.removeItem('mango-imported-prepackaged-shelves'); // Clean up
        return parsedShelves;
      } catch (error) {
        console.error('Error loading imported pre-packaged shelves:', error);
      }
    }
    const defaultShelves = getDefaultPrePackagedShelves(currentAppState);
    console.log('Using default pre-packaged shelves:', defaultShelves.length, 'shelves');
    return defaultShelves;
  });

  // Current active shelves based on mode - this maintains backward compatibility
  const shelves = useMemo(() => {
    return menuMode === MenuMode.BULK ? bulkShelves : prePackagedShelves as unknown as Shelf[];
  }, [menuMode, bulkShelves, prePackagedShelves]);

  // Setter for current shelves based on mode
  const setShelves = useCallback((updater: React.SetStateAction<Shelf[]> | React.SetStateAction<PrePackagedShelf[]>) => {
    if (menuMode === MenuMode.BULK) {
      setBulkShelves(updater as React.SetStateAction<Shelf[]>);
    } else {
      setPrePackagedShelves(updater as React.SetStateAction<PrePackagedShelf[]>);
    }
  }, [menuMode]);
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
  
  // 50% OFF shelf toggle state
  const [fiftyPercentOffEnabled, setFiftyPercentOffEnabled] = useState<boolean>(() => {
    const savedState = localStorage.getItem('mango-fifty-percent-off-enabled');
    return savedState === 'true';
  });
  
  const [newlyAddedStrainId, setNewlyAddedStrainId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [initMessage, setInitMessage] = useState<string>('');
  const [skippedRows, setSkippedRows] = useState<{rowIndex: number, rowData: any, reason: string}[]>([]);
  const [showSkippedModal, setShowSkippedModal] = useState<boolean>(false);
  const [showImportDetailsModal, setShowImportDetailsModal] = useState<boolean>(false);
  const [importClassificationData, setImportClassificationData] = useState<{shakeCount: number, flowerCount: number, totalCount: number} | null>(null);
  
  // Modal states
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [showWhatsNew, setShowWhatsNew] = useState<boolean>(false);
  const [showCsvImportModal, setShowCsvImportModal] = useState<boolean>(false);
  const [showCsvExportModal, setShowCsvExportModal] = useState<boolean>(false);
  const [showUnifiedExportModal, setShowUnifiedExportModal] = useState<boolean>(false);
  const [hasViewedWhatsNew, setHasViewedWhatsNew] = useState<boolean>(() => {
    const viewedVersion = localStorage.getItem('mango-whats-new-viewed-version');
    return viewedVersion === '1.0.2'; // Check if current version has been viewed
  });
  const [hasContentOverflow, setHasContentOverflow] = useState<boolean>(false);
  const [autoFormatState, setAutoFormatState] = useState<AutoFormatState | null>(null);
  const [shouldContinueOptimization, setShouldContinueOptimization] = useState<boolean>(false);
  const [isUpdatingPageCount, setIsUpdatingPageCount] = useState<boolean>(false);

  // Global sort criteria state - moved here to prevent initialization order issues
  const [globalSortCriteria, setGlobalSortCriteria] = useState<SortCriteria | null>(null);

  // DEPRECATED: Multi-page auto creation logic - disabled but preserved for future development
  useEffect(() => {
    // DISABLED: Multi-page functionality completely disabled
    return;
    
    /* PRESERVED FOR FUTURE DEVELOPMENT:
    const handlePageCountNeeded = (event: any) => {
      const { pagesNeeded, currentPages, hasOverflow, naturalWidth, availableWidth } = event.detail;
      
      const isReasonableChange = Math.abs(pagesNeeded - currentPages) <= 2;
      const isGenuineOverflow = naturalWidth > availableWidth * 1.2;
      
      if (!isUpdatingPageCount && previewSettings.autoPageBreaks && pagesNeeded !== currentPages && isReasonableChange && isGenuineOverflow) {
        setIsUpdatingPageCount(true);
        setPreviewSettings(prev => ({
          ...prev,
          pageCount: Math.min(pagesNeeded, 5),
          currentPage: Math.min(prev.currentPage, Math.min(pagesNeeded, 5))
        }));
        
        setTimeout(() => setIsUpdatingPageCount(false), 750);
      }
    };

    window.addEventListener('pageCountNeeded', handlePageCountNeeded);
    return () => window.removeEventListener('pageCountNeeded', handlePageCountNeeded);
    */
  }, []);

  // Theme toggle handler
  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('mango-theme', newTheme);
  }, []);

  // Menu mode change handler
  const handleMenuModeChange = useCallback((newMode: MenuMode) => {
    if (newMode === menuMode) return; // No change needed
    
    // Block Bulk mode for New York state
    if (newMode === MenuMode.BULK && currentAppState === SupportedStates.NEW_YORK) {
      alert('New York only supports Pre-Packaged mode. Bulk Flower mode is not available in this state.');
      return;
    }
    
    // Check if current mode has content before switching
    const currentModeHasContent = menuMode === MenuMode.BULK
      ? bulkShelves.some(shelf => shelf.strains.length > 0)
      : prePackagedShelves.some(shelf => shelf.products.length > 0);
    
    if (currentModeHasContent) {
      const confirmMessage = `You have items in your current ${menuMode} menu.\n\n` +
        `⚠️ WARNING: Switching to ${newMode} WILL DELETE your current ${menuMode.toLowerCase()} menu data.\n\n` +
        `Are you sure you want to continue?`;
      
      if (!confirm(confirmMessage)) {
        return; // User cancelled, don't change mode
      }
    }
    
    setMenuMode(newMode);
    localStorage.setItem('mango-oklahoma-menu-mode', newMode);
  }, [menuMode, bulkShelves, prePackagedShelves]);

  // Instructions modal handler
  const handleShowInstructions = useCallback(() => {
    setShowInstructions(true);
  }, []);

  // What's New modal handler
  const handleShowWhatsNew = useCallback(() => {
    setShowWhatsNew(true);
    // Mark this version as viewed
    if (!hasViewedWhatsNew) {
      setHasViewedWhatsNew(true);
      localStorage.setItem('mango-whats-new-viewed-version', '1.0.2');
    }
  }, [hasViewedWhatsNew]);

  // Update notification handler
  const handleUpdateDismissed = useCallback(() => {
    setUpdateDismissed(true);
    // Reset all manual check states
    setIsManualCheck(false);
    setIsCheckingForUpdates(false);
    setNoUpdatesFound(false);
    setUpdateError(null);
    setUpdateErrorUrl(null);
    // Note: We don't save to localStorage so the notification will show again next app launch
  }, []);

  // Manual check for updates handler
  const handleManualCheckForUpdates = useCallback(async () => {
    if (!window.electronAPI) return;
    
    // Reset states and show checking popup
    setUpdateDismissed(false);
    setIsManualCheck(true);
    setIsCheckingForUpdates(true);
    setNoUpdatesFound(false);
    setUpdateAvailable(false);
    setIsUpdateDownloaded(false);
    
    try {
      console.log('Starting manual update check...');
      const result = await window.electronAPI.checkForUpdates();
      console.log('Manual check result:', result);
      
      // Set timeout to complete the check
      manualCheckTimeoutRef.current = setTimeout(() => {
        setIsCheckingForUpdates(false);
        
        // If no update was found by now, show "no updates" message
        // The updateAvailable state will be set by the event handler if there's an update
        setTimeout(() => {
          setUpdateAvailable(currentUpdateAvailable => {
            if (!currentUpdateAvailable) {
              setNoUpdatesFound(true);
            }
            return currentUpdateAvailable;
          });
        }, 50); // Brief delay to let update events settle
      }, 1500); // 1.5 second minimum check time for UX
      
    } catch (error) {
      console.error('Manual check failed:', error);
      setTimeout(() => {
        setIsCheckingForUpdates(false);
        setNoUpdatesFound(true);
      }, 1500);
    }
  }, []);

  // Auto-format handler with optimized binary search
  const handleAutoFormat = useCallback(() => {
    // Prevent auto-formatting during page count updates to avoid infinite loops
    if (isUpdatingPageCount) {
      addToast({
        type: 'warning',
        title: 'Auto-Format Paused',
        message: 'Auto-formatting is paused during page updates. Try again in a moment.',
        duration: 3000
      });
      return;
    }

    // Calculate content data for intelligent auto-formatting based on current mode
    const shelfCount = menuMode === MenuMode.BULK
      ? bulkShelves.filter(shelf => shelf.strains.length > 0).length
      : prePackagedShelves.filter(shelf => shelf.products.length > 0).length;
    
    const totalItems = menuMode === MenuMode.BULK
      ? bulkShelves.reduce((total, shelf) => total + shelf.strains.length, 0)
      : prePackagedShelves.reduce((total, shelf) => total + shelf.products.length, 0);
    
    const contentData = {
      shelfCount,
      totalStrains: totalItems, // Keep same property name for backward compatibility
      hasContentOverflow,
      menuMode: menuMode === MenuMode.BULK ? 'bulk' as const : 'prepackaged' as const,
      showTerpenes: previewSettings.showTerpenes,
      showLowStock: previewSettings.showLowStock,
      showNetWeight: previewSettings.showNetWeight
    };
    
    // Use the original overflow-driven auto-format that works reliably
    const startTime = performance.now();
    const result = getOverflowDrivenAutoFormat(previewSettings, contentData, autoFormatState || undefined);
    const optimizationTime = (performance.now() - startTime).toFixed(1);
    
    if (result.success && result.settings) {
      setPreviewSettings(prev => ({ ...prev, ...result.settings }));
      
      // Update auto-format state if optimization should continue
      if (result.shouldContinue) {
        // Create new state based on the optimization phase returned
        const newState: AutoFormatState = {
          phase: result.optimizationPhase as AutoFormatState['phase'] || 'font-size',
          mode: autoFormatState?.mode || (hasContentOverflow ? 'reduction' : 'expansion'),
          isOptimizing: true,
          // Update ceiling flags based on result OR preserve from existing state
          hitFontSizeCeiling: result.hitFontSizeCeiling ?? autoFormatState?.hitFontSizeCeiling ?? false,
          hitLineHeightCeiling: result.hitLineHeightCeiling ?? autoFormatState?.hitLineHeightCeiling ?? false,
          // Track iteration count for switching to binary search after 3 iterations
          iterationCount: ((autoFormatState?.iterationCount || 0) + 1)
        };
        setAutoFormatState(newState);
        setShouldContinueOptimization(true);
        // Don't show intermediate messages during optimization
      } else {
        // Optimization complete - show final message
        setAutoFormatState(null);
        setShouldContinueOptimization(false);
        addToast({
          type: 'info',
          title: 'Auto-Format Complete',
          message: `${result.message} (Optimized in ${optimizationTime}ms)`,
          duration: 4000
        });
      }
    } else {
      setAutoFormatState(null);
      setShouldContinueOptimization(false);
      
      addToast({
        type: 'warning',
        title: 'Auto-Format Issue',
        message: result.message,
        duration: 5000
      });
    }
  }, [previewSettings, menuMode, bulkShelves, prePackagedShelves, hasContentOverflow, autoFormatState, isUpdatingPageCount, addToast]);

  // Automatic continuation of optimization
  useEffect(() => {
    if (shouldContinueOptimization && autoFormatState?.isOptimizing) {
      // Wait for UI to re-render and overflow detection to update
      const continueTimeout = setTimeout(() => {
        setShouldContinueOptimization(false);
        handleAutoFormat();
      }, 25); // 25ms delay for UI to update - very fast iteration
      
      return () => clearTimeout(continueTimeout);
    }
  }, [shouldContinueOptimization, autoFormatState?.isOptimizing, handleAutoFormat]);

  // Handle overflow detection from preview
  const handleOverflowDetected = useCallback((hasOverflow: boolean) => {
    setHasContentOverflow(hasOverflow);
  }, []);





  // Drag and drop handlers (deprecated in v1.1.0 - replaced with up/down arrows)
  // Keeping function stub for potential future use
  const handleDragStart = useCallback((strainId: string, shelfId: string, strainIndex: number) => {
    // Deprecated - drag functionality replaced with up/down arrow buttons in v1.1.0
    console.log('Drag functionality has been replaced with up/down arrow buttons');
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
        
        // Update shelves with reset sort criteria
        newShelves[fromShelfIndex] = { 
          ...fromShelf, 
          strains: newFromStrains,
          sortCriteria: null // Reset sort criteria when moving strain
        };
        newShelves[toShelfIndex] = { 
          ...toShelf, 
          strains: newToStrains,
          sortCriteria: null // Reset sort criteria when moving strain
        };
        
        return newShelves;
      });
    });
    setDragState(null);
  }, []);

  // Add a ref to prevent multiple concurrent strain reorder operations
  const isStrainReorderingRef = useRef(false);
  
  const handleReorderStrain = useCallback((shelfId: string, fromIndex: number, toIndex: number) => {
    // Prevent multiple concurrent reorder operations
    if (isStrainReorderingRef.current) {
      console.log('Strain reorder already in progress, ignoring');
      return;
    }
    
    // Clear drag state immediately
    setDragState(null);
    
    if (fromIndex === toIndex) {
      console.log('No strain reorder needed: same position');
      return;
    }
    
    console.log(`Starting strain reorder in shelf ${shelfId}: ${fromIndex} → ${toIndex}`);
    isStrainReorderingRef.current = true;
    
    recordChange(() => {
      setShelves(prevShelves => {
        const newShelves = [...prevShelves];
        const shelfIndex = newShelves.findIndex(s => s.id === shelfId);
        
        if (shelfIndex === -1) {
          console.error('Shelf not found:', shelfId);
          isStrainReorderingRef.current = false;
          return prevShelves;
        }
        
        const shelf = newShelves[shelfIndex];
        const currentStrains = [...shelf.strains];
        
        console.log('Before strain reorder - count:', currentStrains.length);
        console.log('Before strain reorder - names:', currentStrains.map(s => s.name));
        
        // Validate indices
        if (fromIndex < 0 || fromIndex >= currentStrains.length || toIndex < 0 || toIndex > currentStrains.length) {
          console.error(`Invalid strain indices: fromIndex=${fromIndex}, toIndex=${toIndex}, length=${currentStrains.length}`);
          isStrainReorderingRef.current = false;
          return prevShelves;
        }
        
        // Perform simple reorder - remove from source and insert at target
        const [removed] = currentStrains.splice(fromIndex, 1);
        currentStrains.splice(toIndex, 0, removed);
        
        console.log('After strain reorder - count:', currentStrains.length);
        console.log('After strain reorder - names:', currentStrains.map(s => s.name));
        
        newShelves[shelfIndex] = { 
          ...shelf, 
          strains: currentStrains,
          sortCriteria: null // Reset sort criteria when reordering strain
        };
        
        // Clear the reordering flag after state update
        setTimeout(() => {
          isStrainReorderingRef.current = false;
          console.log('Strain reorder operation completed');
        }, 100);
        
        return newShelves;
      });
    });
  }, []); // Remove dependencies to prevent recreation

  // Simple up/down move handlers for strains (replaces drag & drop)
  const handleMoveStrainUp = useCallback((shelfId: string, strainIndex: number) => {
    if (strainIndex <= 0) return; // Can't move up if already at top
    handleReorderStrain(shelfId, strainIndex, strainIndex - 1);
  }, [handleReorderStrain]);

  const handleMoveStrainDown = useCallback((shelfId: string, strainIndex: number) => {
    const shelf = shelves.find(s => s.id === shelfId);
    if (!shelf || strainIndex >= shelf.strains.length - 1) return; // Can't move down if already at bottom
    handleReorderStrain(shelfId, strainIndex, strainIndex + 1);
  }, [handleReorderStrain, shelves]);

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

  const shelvesRef = useRef<HTMLDivElement | null>(null);
  const [lastInteractedShelfId, setLastInteractedShelfId] = useState<string | null>(null);
  // const [dragState, setDragState] = useState<{ strainId: string; shelfId: string; strainIndex: number } | null>(null); // Deprecated in v1.1.0
  const [updateDismissed, setUpdateDismissed] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateVersion, setUpdateVersion] = useState<string>('');
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState<boolean>(false);
  const [updateDownloadProgress, setUpdateDownloadProgress] = useState<number>(0);
  const [updateDownloadProgressFull, setUpdateDownloadProgressFull] = useState<{ percent: number; transferred: number; total: number; bytesPerSecond: number } | null>(null);
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState<boolean>(false);
  const [isManualCheck, setIsManualCheck] = useState<boolean>(false);
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState<boolean>(false);
  const [noUpdatesFound, setNoUpdatesFound] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateErrorUrl, setUpdateErrorUrl] = useState<string | null>(null);
  const manualCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Helper function to check if the menu has any content
  const hasMenuContent = useCallback((): boolean => {
    if (menuMode === MenuMode.BULK) {
      return bulkShelves.some(shelf => shelf.strains.length > 0);
    } else {
      return prePackagedShelves.some(shelf => shelf.products.length > 0);
    }
  }, [menuMode, bulkShelves, prePackagedShelves]);

  // Helper function to check if there are any sold out items
  const hasSoldOutItems = useCallback((): boolean => {
    if (menuMode === MenuMode.BULK) {
      return bulkShelves.some(shelf => shelf.strains.some(strain => strain.isSoldOut));
    } else {
      return prePackagedShelves.some(shelf => shelf.products.some(product => product.isSoldOut));
    }
  }, [menuMode, bulkShelves, prePackagedShelves]);

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
    
    // Auto-switch to Pre-Packaged mode if switching to New York (which doesn't support Bulk mode)
    if (newState === SupportedStates.NEW_YORK && menuMode === MenuMode.BULK) {
      setMenuMode(MenuMode.PREPACKAGED);
      localStorage.setItem('mango-menu-mode', MenuMode.PREPACKAGED);
    }
  }, [currentAppState, hasMenuContent, menuMode]);

  // Welcome modal handlers
  const handleWelcomeStateSelect = useCallback((selectedState: SupportedStates) => {
    setCurrentAppState(selectedState);
    localStorage.setItem('mango-selected-state', selectedState);
    localStorage.setItem('mango-has-seen-welcome', 'true');
    
    // Auto-switch to Pre-Packaged mode if selecting New York (which doesn't support Bulk mode)
    if (selectedState === SupportedStates.NEW_YORK && menuMode === MenuMode.BULK) {
      setMenuMode(MenuMode.PREPACKAGED);
      localStorage.setItem('mango-menu-mode', MenuMode.PREPACKAGED);
    }
    
    setShowWelcomeModal(false);
  }, [menuMode]);

  const handleWelcomeModalClose = useCallback(() => {
    localStorage.setItem('mango-has-seen-welcome', 'true');
    setShowWelcomeModal(false);
  }, []);

  // 50% OFF shelf toggle handler
  const handleFiftyPercentOffToggle = useCallback((enabled: boolean) => {
    setFiftyPercentOffEnabled(enabled);
    localStorage.setItem('mango-fifty-percent-off-enabled', enabled.toString());
  }, []);

  useEffect(() => {
    // Update shelves based on current mode when state or 50% off toggle changes
    if (menuMode === MenuMode.BULK) {
      setBulkShelves(getDefaultShelves(currentAppState, fiftyPercentOffEnabled));
    } else {
      setPrePackagedShelves(getDefaultPrePackagedShelves(currentAppState));
    }
    setGlobalSortCriteria(null); // Reset global sort on state change
  }, [currentAppState, fiftyPercentOffEnabled, menuMode]);

  const recordChange = (updater: () => void) => {
    setGlobalSortCriteria(null);
    updater();
  };
  
  useEffect(() => {
    if (newlyAddedStrainId) {
      const timer = setTimeout(() => setNewlyAddedStrainId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedStrainId]);

  // Show warning toast for skipped rows
  useEffect(() => {
    if (skippedRows.length > 0) {
      addToast({
        type: 'warning',
        title: 'Some rows were skipped during import',
        message: `${skippedRows.length} row${skippedRows.length > 1 ? 's' : ''} couldn't be imported`,
        duration: 8000, // 8 seconds for warning
        actions: [
          {
            label: 'View Details',
            onClick: () => setShowSkippedModal(true),
            variant: 'primary'
          }
        ]
      });
    }
  }, [skippedRows.length, addToast]);

  // Set up update event listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const handleUpdateAvailable = (_event: any, updateInfo: { version: string; releaseDate: string; releaseNotes: string }) => {
      console.log('🎉 Update available event received:', updateInfo);
      console.log('📄 This should NOT trigger any downloads automatically');
      
      setUpdateAvailable(true);
      setUpdateVersion(updateInfo.version);
      setIsUpdateDownloaded(false);
      setIsDownloadingUpdate(false);
      
      // Clear manual check timeout if it's running
      if (manualCheckTimeoutRef.current) {
        clearTimeout(manualCheckTimeoutRef.current);
        manualCheckTimeoutRef.current = null;
      }
      
      // If this was a manual check, clear the checking state
      setIsCheckingForUpdates(false);
    };

    const handleDownloadProgress = (_event: any, progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => {
      console.log('📦 Download progress:', progress);
      setIsDownloadingUpdate(true); // Ensure downloading state is set
      setUpdateDownloadProgress(progress.percent);
      setUpdateDownloadProgressFull(progress);
    };

    const handleUpdateDownloaded = (_event: any, info: { version: string }) => {
      console.log('✅ Update download completed!', info);
      setIsDownloadingUpdate(false);
      setIsUpdateDownloaded(true);
      setUpdateDownloadProgress(100);
      setUpdateDownloadProgressFull(null); // Clear progress since download is complete
      console.log('📌 States after download completion: downloading=false, downloaded=true');
    };

    const handleUpdateNotAvailable = (_event: any, info: any) => {
      console.log('No updates available:', info);
      
      // Reset update states to ensure we show current running version
      setUpdateAvailable(false);
      setIsUpdateDownloaded(false);
      setIsDownloadingUpdate(false);
      
      // If this was a manual check, immediately stop checking and show "no updates"
      if (isManualCheck && isCheckingForUpdates) {
        if (manualCheckTimeoutRef.current) {
          clearTimeout(manualCheckTimeoutRef.current);
          manualCheckTimeoutRef.current = null;
        }
        setIsCheckingForUpdates(false);
        setNoUpdatesFound(true);
        
        // No need to set version for "no updates" display since we simplified the message
      }
    };

    const handleUpdateDebug = (_event: any, debug: { type: string; message: string; [key: string]: any }) => {
      // Debug messages now handled by DebugConsole component
      console.log('Update Debug:', debug);
    };

    const handleUpdateError = (_event: any, errorInfo: { message: string; originalError: string; manualDownloadUrl: string }) => {
      console.error('Update error received:', errorInfo);
      setUpdateError(errorInfo.message);
      setUpdateErrorUrl(errorInfo.manualDownloadUrl);
      setIsDownloadingUpdate(false);
      setIsCheckingForUpdates(false);
    };

          window.electronAPI.onUpdateAvailable(handleUpdateAvailable);
      window.electronAPI.onDownloadProgress(handleDownloadProgress);
      window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded);
      window.electronAPI.onUpdateDebug?.(handleUpdateDebug);
      window.electronAPI.onUpdateNotAvailable?.(handleUpdateNotAvailable);
      window.electronAPI.onUpdateError?.(handleUpdateError);

    return () => {
      window.electronAPI?.removeUpdateListeners();
    };
  }, []);


  // Generic item addition handler that works for both modes
  const handleAddItem = useCallback((shelfId: string) => {
    const newItemId = crypto.randomUUID();
    handleShelfInteraction(shelfId); // Track interaction
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        // Add strain to bulk shelf
        setBulkShelves(prevShelves =>
          prevShelves.map(shelf =>
            shelf.id === shelfId
              ? {
                  ...shelf,
                  strains: [
                    ...shelf.strains,
                    {
                      id: newItemId,
                      name: '',
                      grower: '',
                      thc: null,
                      type: StrainType.HYBRID,
                      isLastJar: false,
                      isSoldOut: false,
                    },
                  ],
                  sortCriteria: null // Reset sort criteria when adding strain
                }
              : shelf
          )
        );
      } else {
        // Add product to pre-packaged shelf
        setPrePackagedShelves(prevShelves =>
          prevShelves.map(shelf =>
            shelf.id === shelfId
              ? {
                  ...shelf,
                  products: [
                    ...shelf.products,
                    {
                      id: newItemId,
                      name: '',
                      brand: '',
                      type: StrainType.HYBRID,
                      thc: null,
                      terpenes: null,
                      // weight: removed - now handled at shelf level
                      price: 0,
                      isLowStock: false,
                      isSoldOut: false,
                    },
                  ],
                  sortCriteria: null // Reset sort criteria when adding product
                }
              : shelf
          )
        );
      }
    });
    setNewlyAddedStrainId(newItemId);
  }, [handleShelfInteraction, menuMode]);

  // Backward compatibility alias for existing code
  const handleAddStrain = handleAddItem;

  // Generic item update handler that works for both modes
  const handleUpdateItem = useCallback((shelfId: string, itemId: string, updatedItem: Partial<Strain> | Partial<PrePackagedProduct>) => {
    // Input changes should be immediate and not use recordChange to avoid disrupting input flow
    if (menuMode === MenuMode.BULK) {
      // Update strain in bulk shelf
      setBulkShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? {
                ...shelf,
                strains: shelf.strains.map(strain =>
                  strain.id === itemId ? { ...strain, ...updatedItem } : strain
                ),
                sortCriteria: null // Reset sort criteria when updating strain
              }
            : shelf
        )
      );
    } else {
      // Update product in pre-packaged shelf
      setPrePackagedShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId
            ? {
                ...shelf,
                products: shelf.products.map(product =>
                  product.id === itemId ? { ...product, ...updatedItem } : product
                ),
                sortCriteria: null // Reset sort criteria when updating product
              }
            : shelf
        )
      );
    }
  }, [menuMode]);

  // Backward compatibility alias for existing code
  const handleUpdateStrain = useCallback((shelfId: string, strainId: string, updatedStrain: Partial<Strain>) => {
    handleUpdateItem(shelfId, strainId, updatedStrain);
  }, [handleUpdateItem]);

  // Generic item removal handler that works for both modes
  const handleRemoveItem = useCallback((shelfId: string, itemId: string) => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        // Remove strain from bulk shelf
        setBulkShelves(prevShelves =>
          prevShelves.map(shelf =>
            shelf.id === shelfId
              ? { 
                  ...shelf, 
                  strains: shelf.strains.filter(s => s.id !== itemId),
                  sortCriteria: null // Reset sort criteria when removing strain
                }
              : shelf
          )
        );
      } else {
        // Remove product from pre-packaged shelf
        setPrePackagedShelves(prevShelves =>
          prevShelves.map(shelf =>
            shelf.id === shelfId
              ? { 
                  ...shelf, 
                  products: shelf.products.filter(p => p.id !== itemId),
                  sortCriteria: null // Reset sort criteria when removing product
                }
              : shelf
          )
        );
      }
    });
  }, [menuMode]);

  // Backward compatibility alias for existing code
  const handleRemoveStrain = useCallback((shelfId: string, strainId: string) => {
    handleRemoveItem(shelfId, strainId);
  }, [handleRemoveItem]);

  // Generic item copy handler that works for both modes
  const handleCopyItem = useCallback((shelfId: string, itemId: string, direction: 'above' | 'below') => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        // Copy strain in bulk shelf
        setBulkShelves(prevShelves => {
          const shelfIndex = prevShelves.findIndex(s => s.id === shelfId);
          if (shelfIndex === -1) return prevShelves;

          const currentShelf = prevShelves[shelfIndex];
          const strainIndex = currentShelf.strains.findIndex(s => s.id === itemId);
          if (strainIndex === -1) return prevShelves;

          const strainToCopy = { ...currentShelf.strains[strainIndex], id: crypto.randomUUID() };
          const newStrains = [...currentShelf.strains];

          if (direction === 'above') {
            newStrains.splice(strainIndex, 0, strainToCopy);
          } else {
            newStrains.splice(strainIndex + 1, 0, strainToCopy);
          }
          
          const updatedShelves = [...prevShelves];
          updatedShelves[shelfIndex] = { 
            ...currentShelf, 
            strains: newStrains,
            sortCriteria: null // Reset sort criteria when copying strain
          };
          return updatedShelves;
        });
      } else {
        // Copy product in pre-packaged shelf
        setPrePackagedShelves(prevShelves => {
          const shelfIndex = prevShelves.findIndex(s => s.id === shelfId);
          if (shelfIndex === -1) return prevShelves;

          const currentShelf = prevShelves[shelfIndex];
          const productIndex = currentShelf.products.findIndex(p => p.id === itemId);
          if (productIndex === -1) return prevShelves;

          const productToCopy = { ...currentShelf.products[productIndex], id: crypto.randomUUID() };
          const newProducts = [...currentShelf.products];

          if (direction === 'above') {
            newProducts.splice(productIndex, 0, productToCopy);
          } else {
            newProducts.splice(productIndex + 1, 0, productToCopy);
          }
          
          const updatedShelves = [...prevShelves];
          updatedShelves[shelfIndex] = { 
            ...currentShelf, 
            products: newProducts,
            sortCriteria: null // Reset sort criteria when copying product
          };
          return updatedShelves;
        });
      }
    });
  }, [menuMode]);

  // Backward compatibility alias for existing code
  const handleCopyStrain = useCallback((shelfId: string, strainId: string, direction: 'above' | 'below') => {
    handleCopyItem(shelfId, strainId, direction);
  }, [handleCopyItem]);

  // Generic shelf clearing handler that works for both modes
  const handleClearShelfItems = useCallback((shelfId: string) => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        // Clear strains from bulk shelf
        setBulkShelves(prevShelves =>
          prevShelves.map(shelf =>
            shelf.id === shelfId 
              ? { 
                  ...shelf, 
                  strains: [],
                  sortCriteria: null // Reset sort criteria when clearing shelf
                } 
              : shelf
          )
        );
      } else {
        // Clear products from pre-packaged shelf
        setPrePackagedShelves(prevShelves =>
          prevShelves.map(shelf =>
            shelf.id === shelfId 
              ? { 
                  ...shelf, 
                  products: [],
                  sortCriteria: null // Reset sort criteria when clearing shelf
                } 
              : shelf
          )
        );
      }
    });
  }, [menuMode]);

  // Backward compatibility alias for existing code
  const handleClearShelfStrains = useCallback((shelfId: string) => {
    handleClearShelfItems(shelfId);
  }, [handleClearShelfItems]);

  // PrePackaged Panel specific handler aliases
  const handleAddProduct = handleAddItem;
  const handleUpdateProduct = useCallback((shelfId: string, productId: string, updatedProduct: Partial<PrePackagedProduct>) => {
    handleUpdateItem(shelfId, productId, updatedProduct);
  }, [handleUpdateItem]);
  const handleRemoveProduct = useCallback((shelfId: string, productId: string) => {
    handleRemoveItem(shelfId, productId);
  }, [handleRemoveItem]);
  const handleCopyProduct = useCallback((shelfId: string, productId: string, direction: 'above' | 'below') => {
    handleCopyItem(shelfId, productId, direction);
  }, [handleCopyItem]);
  const handleClearShelfProducts = useCallback((shelfId: string) => {
    handleClearShelfItems(shelfId);
  }, [handleClearShelfItems]);

  // State for PrePackaged Panel (matching FlowerShelvesPanel pattern)
  const [newlyAddedProductId, setNewlyAddedProductId] = useState<string | null>(null);
  const [prePackagedDragState, setPrePackagedDragState] = useState<{ productId: string; shelfId: string; productIndex: number } | null>(null);

  // PrePackaged sorting handler
  const handleUpdatePrePackagedShelfSortCriteria = useCallback((shelfId: string, key: PrePackagedSortCriteria['key']) => {
    recordChange(() => {
      setPrePackagedShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (shelf.id === shelfId) {
            const currentCriteria = shelf.sortCriteria;
            let newDirection: 'asc' | 'desc' = 'asc';
            
            if (currentCriteria && currentCriteria.key === key) {
              newDirection = currentCriteria.direction === 'asc' ? 'desc' : 'asc';
            }
            
            return {
              ...shelf,
              sortCriteria: { key, direction: newDirection }
            };
          }
          return shelf;
        })
      );
    });
  }, []);

  // PrePackaged drag and drop handlers
  const handleMoveProduct = useCallback((fromShelfId: string, toShelfId: string, productIndex: number, targetIndex?: number) => {
    // Clear drag state immediately to prevent stuck states
    setPrePackagedDragState(null);
    
    recordChange(() => {
      setPrePackagedShelves(prevShelves => {
        // Find source shelf and product
        const sourceShelf = prevShelves.find(s => s.id === fromShelfId);
        const targetShelf = prevShelves.find(s => s.id === toShelfId);
        
        if (!sourceShelf || !targetShelf || productIndex >= sourceShelf.products.length) {
          return prevShelves;
        }

        const productToMove = sourceShelf.products[productIndex];
        const updatedShelves = [...prevShelves];
        
        // Remove from source
        const sourceIndex = updatedShelves.findIndex(s => s.id === fromShelfId);
        updatedShelves[sourceIndex] = {
          ...sourceShelf,
          products: sourceShelf.products.filter((_, i) => i !== productIndex)
        };
        
        // Add to target
        const targetIndex = updatedShelves.findIndex(s => s.id === toShelfId);
        const insertIndex = targetIndex !== undefined ? targetIndex : targetShelf.products.length;
        const newProducts = [...targetShelf.products];
        newProducts.splice(insertIndex, 0, productToMove);
        
        updatedShelves[targetIndex] = {
          ...targetShelf,
          products: newProducts
        };
        
        return updatedShelves;
      });
    });
  }, []);

  // Add a ref to prevent multiple concurrent reorder operations
  const isReorderingRef = useRef(false);
  
  const handleReorderProduct = useCallback((shelfId: string, fromIndex: number, toIndex: number) => {
    // Prevent multiple concurrent reorder operations
    if (isReorderingRef.current) {
      console.log('Reorder already in progress, ignoring');
      return;
    }
    
    // Clear drag state immediately to prevent stuck states
    setPrePackagedDragState(null);
    
    if (fromIndex === toIndex) {
      console.log('No reorder needed: same position');
      return; // No change needed
    }
    
    console.log(`Starting reorder in shelf ${shelfId}: ${fromIndex} → ${toIndex}`);
    isReorderingRef.current = true;
    
    // Use a more direct state update approach to prevent duplicate calls
    setPrePackagedShelves(prevShelves => {
      console.log('=== REORDER STATE UPDATE START ===');
      console.log('Prev shelves count:', prevShelves.length);
      
      const targetShelf = prevShelves.find(s => s.id === shelfId);
      if (!targetShelf) {
        console.error('Target shelf not found:', shelfId);
        isReorderingRef.current = false;
        return prevShelves;
      }
      
      console.log('Target shelf product count:', targetShelf.products.length);
      console.log('Target shelf products:', targetShelf.products.map(p => ({ id: p.id, name: p.name })));
      
      // Check for duplicate IDs in the current shelf
      const productIds = targetShelf.products.map(p => p.id);
      const uniqueIds = new Set(productIds);
      if (productIds.length !== uniqueIds.size) {
        console.error('DUPLICATE IDs DETECTED BEFORE REORDER:', productIds);
      }
      
      // Validate indices
      if (fromIndex < 0 || fromIndex >= targetShelf.products.length || toIndex < 0 || toIndex > targetShelf.products.length) {
        console.error(`Invalid indices: fromIndex=${fromIndex}, toIndex=${toIndex}, length=${targetShelf.products.length}`);
        isReorderingRef.current = false;
        return prevShelves;
      }
      
      // Create new array with reordered products
      const newProducts = [...targetShelf.products];
      const [removed] = newProducts.splice(fromIndex, 1);
      newProducts.splice(toIndex, 0, removed);
      
      console.log('After reorder - products count:', newProducts.length);
      console.log('After reorder - products:', newProducts.map(p => ({ id: p.id, name: p.name })));
      
      // Check for duplicate IDs after reorder
      const newProductIds = newProducts.map(p => p.id);
      const newUniqueIds = new Set(newProductIds);
      if (newProductIds.length !== newUniqueIds.size) {
        console.error('DUPLICATE IDs DETECTED AFTER REORDER:', newProductIds);
      }
      
      // Create the result with updated shelf
      const result = prevShelves.map(shelf => {
        if (shelf.id === shelfId) {
          return {
            ...shelf,
            products: newProducts,
            sortCriteria: null // Clear sort criteria since user manually reordered
          };
        }
        return shelf;
      });
      
      console.log('=== REORDER STATE UPDATE END ===');
      
      // Clear the reordering flag
      setTimeout(() => {
        isReorderingRef.current = false;
      }, 50);
      
      return result;
    });
    
    // Use recordChange to track this as a user action
    recordChange(() => {});
  }, []); // Remove dependencies to prevent recreation

  // Simple up/down move handlers for products (replaces drag & drop)
  const handleMoveProductUp = useCallback((shelfId: string, productIndex: number) => {
    if (productIndex <= 0) return; // Can't move up if already at top
    handleReorderProduct(shelfId, productIndex, productIndex - 1);
  }, [handleReorderProduct]);

  const handleMoveProductDown = useCallback((shelfId: string, productIndex: number) => {
    const shelf = prePackagedShelves.find(s => s.id === shelfId);
    if (!shelf || productIndex >= shelf.products.length - 1) return; // Can't move down if already at bottom
    handleReorderProduct(shelfId, productIndex, productIndex + 1);
  }, [handleReorderProduct, prePackagedShelves]);

  const handlePrePackagedDragStart = useCallback((productId: string, shelfId: string, productIndex: number) => {
    setPrePackagedDragState({ productId, shelfId, productIndex });
    
    // Set a timeout to auto-clear stuck drag state after 30 seconds
    setTimeout(() => {
      setPrePackagedDragState(current => {
        if (current && current.productId === productId) {
          console.warn('Clearing stuck drag state for product:', productId);
          return null;
        }
        return current;
      });
    }, 30000);
  }, []);

  const handlePrePackagedDragEnd = useCallback((productId: string) => {
    // Clear drag state when drag ends for the specific product
    setPrePackagedDragState(current => {
      if (current && current.productId === productId) {
        return null;
      }
      return current;
    });
  }, []);

  // Generic clear all shelves handler that works for both modes
  const handleClearAllShelves = useCallback(() => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        // Clear all strains from bulk shelves
        setBulkShelves(prevShelves =>
          prevShelves.map(shelf => ({ 
            ...shelf, 
            strains: [],
            sortCriteria: null // Reset sort criteria when clearing all shelves
          }))
        );
      } else {
        // Clear all products from pre-packaged shelves
        setPrePackagedShelves(prevShelves =>
          prevShelves.map(shelf => ({ 
            ...shelf, 
            products: [],
            sortCriteria: null // Reset sort criteria when clearing all shelves
          }))
        );
      }
    });
  }, [menuMode]);

  // Generic clear all last jars handler that works for both modes
  const handleClearAllLastJars = useCallback(() => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        // Clear all last jar flags from bulk shelves
        setBulkShelves(prevShelves =>
          prevShelves.map(shelf => ({
            ...shelf,
            strains: shelf.strains.map(strain => ({ ...strain, isLastJar: false })),
            sortCriteria: null // Reset sort criteria when clearing last jars
          }))
        );
      } else {
        // Clear all last jar flags from pre-packaged shelves
        setPrePackagedShelves(prevShelves =>
          prevShelves.map(shelf => ({
            ...shelf,
            products: shelf.products.map(product => ({ ...product, isLastJar: false })),
            sortCriteria: null // Reset sort criteria when clearing last jars
          }))
        );
      }
    });
  }, [menuMode]);

  // Generic clear all sold out handler that works for both modes
  const handleClearAllSoldOut = useCallback(() => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        // Clear all sold out flags from bulk shelves
        setBulkShelves(prevShelves =>
          prevShelves.map(shelf => ({
            ...shelf,
            strains: shelf.strains.map(strain => ({ ...strain, isSoldOut: false })),
            sortCriteria: null // Reset sort criteria when clearing sold out
          }))
        );
      } else {
        // Clear all sold out flags from pre-packaged shelves
        setPrePackagedShelves(prevShelves =>
          prevShelves.map(shelf => ({
            ...shelf,
            products: shelf.products.map(product => ({ ...product, isSoldOut: false })),
            sortCriteria: null // Reset sort criteria when clearing sold out
          }))
        );
      }
    });
  }, [menuMode]);
  
  const handleUpdatePreviewSettings = useCallback((newSettings: Partial<PreviewSettings>) => {
     // For preview settings, we don't want to reset sorts, so don't use recordChange
     setPreviewSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Multi-page management helpers
  const handleAddPage = useCallback(() => {
    setIsUpdatingPageCount(true);
    setPreviewSettings(prev => ({
      ...prev,
      pageCount: prev.pageCount + 1
    }));
    // Clear the flag after a short delay to allow UI to stabilize
    setTimeout(() => setIsUpdatingPageCount(false), 500);
  }, []);

  const handleRemovePage = useCallback((pageNumber: number) => {
    setIsUpdatingPageCount(true);
    setPreviewSettings(prev => ({
      ...prev,
      pageCount: Math.max(1, prev.pageCount - 1),
      currentPage: prev.currentPage > prev.pageCount - 1 ? prev.pageCount - 1 : prev.currentPage
    }));
    // Clear the flag after a short delay to allow UI to stabilize
    setTimeout(() => setIsUpdatingPageCount(false), 500);
  }, []);

  const handleGoToPage = useCallback((pageNumber: number) => {
    setPreviewSettings(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(pageNumber, prev.pageCount))
    }));
  }, []);

  const handleToggleAutoPageBreaks = useCallback(() => {
    setIsUpdatingPageCount(true);
    setPreviewSettings(prev => ({
      ...prev,
      autoPageBreaks: !prev.autoPageBreaks
    }));
    // Clear the flag after a short delay to allow UI to stabilize
    setTimeout(() => setIsUpdatingPageCount(false), 500);
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

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setPreviewSettings(prev => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel * 1.2, 3.0)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setPreviewSettings(prev => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel / 1.2, 0.1)
    }));
  }, []);

  const handleResetZoom = useCallback(() => {
    setPreviewSettings(INITIAL_PREVIEW_SETTINGS);
  }, []);

  const handleFitToWindow = useCallback(() => {
    setPreviewSettings(prev => ({
      ...prev,
      fitToWindowTrigger: prev.fitToWindowTrigger ? prev.fitToWindowTrigger + 1 : 1
    }));
  }, []);

  const handleResetAppData = useCallback(async () => {
    // Reset all app data with confirmation - same logic as menu command handler
    const confirmReset = await showElectronConfirm(
      'Reset App Data',
      'This will clear all saved data including menus, settings, and preferences. The app will restart to show the Welcome screen. This action cannot be undone.\n\nDo you want to continue?'
    );
    if (confirmReset) {
      // Clear ALL localStorage keys
      const allKeysToRemove = [
        'mango-selected-state',
        'mango-oklahoma-menu-mode',
        'mango-menu-mode',
        'mango-imported-bulk-shelves',
        'mango-fifty-percent-off-enabled',
        'mango-imported-prepackaged-shelves',
        'mango-theme',
        'mango-has-seen-welcome',
        'mango-whats-new-viewed-version'
      ];
      
      allKeysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset all React state to initial values
      setCurrentAppState(SupportedStates.OKLAHOMA);
      setMenuMode(MenuMode.BULK);
      setBulkShelves(getDefaultShelves(SupportedStates.OKLAHOMA));
      setPrePackagedShelves(getDefaultPrePackagedShelves(SupportedStates.OKLAHOMA));
      setPreviewSettings(INITIAL_PREVIEW_SETTINGS);
      setTheme('dark');
      setFiftyPercentOffEnabled(false);
      setHasViewedWhatsNew(false);
      setShelvesPanelWidth(DEFAULT_SHELVES_PANEL_WIDTH);
      setExportFilename('mango-menu');
      setIsExporting(false);
      setExportAction(null);
      setShowExportOverlay(false);
      
      // Show welcome modal (app fresh state)
      setShowWelcomeModal(true);
      
      // Force app reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
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

  // Global ESC key handler for canceling drag operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Cancel any active drag operations (deprecated in v1.1.0)
        // Keeping for pre-packaged drag state if still in use
        if (prePackagedDragState) {
          setPrePackagedDragState(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prePackagedDragState]);

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

  const handleOpenExportModal = useCallback(() => {
    setShowUnifiedExportModal(true);
  }, []);

  const handleExportCSV = useCallback(() => {
    setShowCsvExportModal(true);
  }, []);

  const handleExportCSVLegacy = useCallback(() => {
    let header: string[];
    let rows: string[][];

    if (menuMode === MenuMode.BULK) {
      // Bulk flower CSV format
      header = ["Category", "Strain Name", "Grow/Brand", "THC Percentage", "Class", "lastjar", "originalShelf"];
      
      rows = bulkShelves.flatMap(shelf => {
        if (shelf.strains.length === 0) return [];
        // Use sorted strains for CSV export based on current criteria
        const activeSortCriteria = shelf.sortCriteria || globalSortCriteria;
        const strainsToExport = sortStrains([...shelf.strains], activeSortCriteria, currentAppState);

        return strainsToExport.map(strain => {
          const thcPercentageString = strain.thc === null ? "-" : `${strain.thc.toFixed(THC_DECIMAL_PLACES)}%`;
          const classString = APP_STRAIN_TYPE_TO_CSV_SUFFIX[strain.type] || 'H';
          
          return [
            shelf.name,
            strain.name || "Unnamed Strain",
            strain.grower || "",
            thcPercentageString,
            classString,
            strain.isLastJar ? "lastjar" : "",
            strain.originalShelf || ""
          ].map(field => `"${String(field).replace(/"/g, '""')}"`);
        });
      });
    } else {
      // Pre-packaged CSV format
      header = ["Category", "Product Name", "Brand", "Type", "THC Percentage", "Terpenes Percentage", "Price", "Net Weight", "Low Stock", "Notes", "Original Shelf"];
      
      rows = prePackagedShelves.flatMap(shelf => {
        if (shelf.products.length === 0) return [];
        
        return shelf.products.map(product => {
          const thcPercentageString = product.thc === null ? "-" : `${product.thc.toFixed(THC_DECIMAL_PLACES)}%`;
          const terpenesPercentageString = (product.terpenes === null || product.terpenes === undefined) ? "-" : `${product.terpenes.toFixed(THC_DECIMAL_PLACES)}%`;
          const classString = APP_STRAIN_TYPE_TO_CSV_SUFFIX[product.type] || 'H';
          
          return [
            shelf.name,
            product.name || "Unnamed Product",
            product.brand || "",
            classString,
            thcPercentageString,
            terpenesPercentageString,
            `$${product.price.toFixed(2)}`,
            product.netWeight || "",
            product.isLowStock ? "TRUE" : "FALSE",
            product.notes || "",
            product.originalShelf || ""
          ].map(field => `"${String(field).replace(/"/g, '""')}"`);
        });
      });
    }

    if (rows.length === 0) {
      alert(`No ${menuMode.toLowerCase()} data to export.`);
      return;
    }

    const csvContent = [header.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const modePrefix = menuMode === MenuMode.BULK ? 'bulk-flower' : 'pre-packaged';
      const filenameToUse = (exportFilename || `mango-${modePrefix}-export`) + '.csv';
      link.setAttribute("href", url);
      link.setAttribute("download", filenameToUse);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [menuMode, bulkShelves, prePackagedShelves, exportFilename, globalSortCriteria, currentAppState]);

  const handleImportCSVRequest = useCallback(() => {
    setShowCsvImportModal(true);
  }, []);

  const handleNewMenu = useCallback(() => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        setBulkShelves(getDefaultShelves(currentAppState, fiftyPercentOffEnabled));
      } else {
        setPrePackagedShelves(getDefaultPrePackagedShelves(currentAppState));
      }
    });
  }, [menuMode, currentAppState, fiftyPercentOffEnabled]);
  
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

      // Detect CSV format by analyzing the header
      const headerLine = lines[0];
      const headerCells = headerLine.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').toLowerCase());
      
      const isBulkFlowerFormat = headerCells.includes('strain name') || headerCells.includes('grow/brand');
      const isPrePackagedFormat = headerCells.includes('product name') || headerCells.includes('size') || headerCells.includes('price');
      
      let detectedMode: MenuMode;
      if (isBulkFlowerFormat && !isPrePackagedFormat) {
        detectedMode = MenuMode.BULK;
      } else if (isPrePackagedFormat && !isBulkFlowerFormat) {
        detectedMode = MenuMode.PREPACKAGED;
      } else {
        // Ambiguous or unknown format - ask user or default to current mode
        const userChoice = confirm(
          `Could not automatically detect CSV format.\n\n` +
          `Click OK to import as ${MenuMode.BULK} format, or Cancel to import as ${MenuMode.PREPACKAGED} format.`
        );
        detectedMode = userChoice ? MenuMode.BULK : MenuMode.PREPACKAGED;
      }

      // Switch to detected mode if different from current mode
      if (detectedMode !== menuMode) {
        const switchConfirm = confirm(
          `This CSV appears to be in ${detectedMode} format, but you're currently in ${menuMode} mode.\n\n` +
          `Would you like to switch to ${detectedMode} mode to import this data?`
        );
        
        if (switchConfirm) {
          setMenuMode(detectedMode);
          localStorage.setItem('mango-menu-mode', detectedMode);
        } else {
          detectedMode = menuMode; // Use current mode if user doesn't want to switch
        }
      }

      if (detectedMode === MenuMode.BULK) {
        // Process as bulk flower CSV
        const importedStrainsByShelf: Record<string, Strain[]> = {};
        let importedCount = 0;
        let skippedRowCount = 0;

        // Create a temporary map for faster shelf lookup by name
        const shelfNameMap = new Map(bulkShelves.map(s => [s.name.toLowerCase(), s.id]));

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
          const csvOriginalShelf = cells.length > 6 ? cells[6] : '';
          
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
            ...(csvOriginalShelf && { originalShelf: csvOriginalShelf })
          };

          if (!importedStrainsByShelf[targetShelfId]) {
            importedStrainsByShelf[targetShelfId] = [];
          }
          importedStrainsByShelf[targetShelfId].push(newStrain);
          importedCount++;
        }
        
        // Show loading overlay and update bulk shelves
        setIsInitializing(true);
        setInitMessage('Processing bulk flower CSV import...');
        
        setTimeout(() => {
          const newShelvesData = bulkShelves.map(shelf => ({
            ...shelf,
            strains: importedStrainsByShelf[shelf.id] || [], 
            sortCriteria: null
          }));
          
          console.log('Updating bulk shelves with imported data:', newShelvesData.length, 'shelves');
          console.log('Total strains imported:', newShelvesData.reduce((total, shelf) => total + shelf.strains.length, 0));
          
          setGlobalSortCriteria(null);
          setBulkShelves(newShelvesData);
          
          setTimeout(() => {
            setIsInitializing(false);
            setInitMessage('');
            
            addToast({
              type: 'success',
              title: 'Bulk Flower CSV Import Complete',
              message: `${importedCount} strains loaded.${skippedRowCount > 0 ? ` ${skippedRowCount} rows skipped.` : ''}`,
              duration: 5000
            });
          }, 800);
          
        }, 300);

      } else {
        // Process as pre-packaged CSV
        const importedProductsByShelf: Record<string, PrePackagedProduct[]> = {};
        let importedCount = 0;
        let skippedRowCount = 0;

        // Create a temporary map for faster shelf lookup by name
        const shelfNameMap = new Map(prePackagedShelves.map(s => [s.name.toLowerCase(), s.id]));

        for (let i = 1; i < lines.length; i++) {
          const rawLine = lines[i];
          const cells = rawLine.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          
          if (cells.length < 8) {
              console.warn(`SKIPPING Row ${i + 1}: Not enough cells for pre-packaged format (found ${cells.length}, expected at least 8). Line: "${rawLine}"`);
              skippedRowCount++;
              continue;
          }

          const csvCategory = cells[0].toLowerCase();
          const csvProductName = cells[1];
          const csvBrand = cells[2];
          const csvClassString = cells[3];
          const csvThcPercentString = cells[4];
          const csvCbdPercentString = cells[5];
          const csvSize = cells[6];
          const csvPriceString = cells[7];
          const csvLastJar = cells.length > 8 ? cells[8]?.toLowerCase() === 'lastjar' : false;
          
          const targetShelfId = shelfNameMap.get(csvCategory);
          if (!targetShelfId) {
            console.warn(`SKIPPING Row ${i + 1}: Product "${csvProductName}" for unknown category "${cells[0]}" in ${currentAppState}.`);
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

          let cbdValue: number | null = null;
          if (csvCbdPercentString && csvCbdPercentString !== "-") {
              const cbdNumericMatch = csvCbdPercentString.match(/(\d*\.?\d+)/);
              if (cbdNumericMatch && cbdNumericMatch[1]) {
                  cbdValue = parseFloat(cbdNumericMatch[1]);
                  if (isNaN(cbdValue)) cbdValue = null;
              }
          }

          let priceValue: number = 0;
          if (csvPriceString) {
              const priceNumericMatch = csvPriceString.replace(/[$,]/g, '').match(/(\d*\.?\d+)/);
              if (priceNumericMatch && priceNumericMatch[1]) {
                  priceValue = parseFloat(priceNumericMatch[1]);
                  if (isNaN(priceValue)) priceValue = 0;
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
          
          const newProduct: PrePackagedProduct = {
            id: crypto.randomUUID(),
            name: csvProductName || 'Unnamed Product',
            brand: csvBrand || '',
            type: strainType,
            thc: thcValue,
            terpenes: null, // TODO: Parse from CSV if available
            // weight: removed - now handled at shelf level
            price: priceValue,
            netWeight: '', // TODO: Parse from CSV if available
            isLowStock: false, // Default to false, TODO: Parse from CSV if available
            notes: '', // TODO: Parse from CSV if available
            originalShelf: csvCategory
          };

          if (!importedProductsByShelf[targetShelfId]) {
            importedProductsByShelf[targetShelfId] = [];
          }
          importedProductsByShelf[targetShelfId].push(newProduct);
          importedCount++;
        }
        
        // Show loading overlay and update pre-packaged shelves
        setIsInitializing(true);
        setInitMessage('Processing pre-packaged CSV import...');
        
        setTimeout(() => {
          const newShelvesData = prePackagedShelves.map(shelf => ({
            ...shelf,
            products: importedProductsByShelf[shelf.id] || [], 
            sortCriteria: null
          }));
          
          console.log('Updating pre-packaged shelves with imported data:', newShelvesData.length, 'shelves');
          console.log('Total products imported:', newShelvesData.reduce((total, shelf) => total + shelf.products.length, 0));
          
          setGlobalSortCriteria(null);
          setPrePackagedShelves(newShelvesData);
          
          setTimeout(() => {
            setIsInitializing(false);
            setInitMessage('');
            
            addToast({
              type: 'success',
              title: 'Pre-packaged CSV Import Complete',
              message: `${importedCount} products loaded.${skippedRowCount > 0 ? ` ${skippedRowCount} rows skipped.` : ''}`,
              duration: 5000
            });
          }, 800);
          
        }, 300);
      }
    };
    reader.onerror = () => {
      alert("Error reading CSV file.");
       if (csvImportInputRef.current) {
        csvImportInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }, [menuMode, bulkShelves, prePackagedShelves, currentAppState]);

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

  // New CSV modal handlers
  const handleCsvImport = useCallback((data: any[], mapping: any) => {
    // Invert the mapping to get field -> csvColumn mapping
    const fieldToColumn: Record<string, string> = {};
    Object.entries(mapping).forEach(([csvColumn, appField]) => {
      fieldToColumn[appField as string] = csvColumn;
    });
    
    // Convert the imported data using the column mapping
    if (menuMode === MenuMode.BULK) {
      const importedStrainsByShelf: Record<string, Strain[]> = {};
      let importedCount = 0;
      const skippedRowsData: {rowIndex: number, rowData: any, reason: string}[] = [];

      // Get the shelf name map for quick lookup
      const shelfNameMap = new Map(bulkShelves.map(s => [s.name.toLowerCase(), s.id]));

      data.forEach((row, index) => {
        try {
          const shelfName = fieldToColumn.shelf ? row[fieldToColumn.shelf] : '';
          const strainName = fieldToColumn.name ? row[fieldToColumn.name] : '';
          
          if (!shelfName || !strainName) {
            const reason = `Missing required data: ${!shelfName ? 'shelf/category' : ''} ${!shelfName && !strainName ? 'and' : ''} ${!strainName ? 'strain name' : ''}`;
            skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
            console.warn(`Skipping row ${index + 2}: ${reason}`);
            return;
          }

          const targetShelfId = shelfNameMap.get(shelfName.toLowerCase());
          if (!targetShelfId) {
            const reason = `Unknown shelf/category "${shelfName}"`;
            skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
            console.warn(`Skipping row ${index + 2}: ${reason}`);
            return;
          }

          // Parse THC value
          let thcValue: number | null = null;
          const thcStr = fieldToColumn.thc ? row[fieldToColumn.thc] : '';
          if (thcStr && thcStr !== '-') {
            const thcMatch = thcStr.match(/(\d*\.?\d+)/);
            if (thcMatch) {
              thcValue = parseFloat(thcMatch[1]);
            }
          }

          // Parse strain type
          let strainType: StrainType = StrainType.HYBRID;
          const typeStr = fieldToColumn.type ? row[fieldToColumn.type] : '';
          if (typeStr) {
            const normalizedType = typeStr.toUpperCase().replace(/[\s-./]/g, '');
            strainType = CSV_STRAIN_TYPE_MAP[normalizedType] || StrainType.HYBRID;
          }

          const newStrain: Strain = {
            id: crypto.randomUUID(),
            name: strainName,
            grower: fieldToColumn.grower ? row[fieldToColumn.grower] || '' : '',
            thc: thcValue,
            type: strainType,
            isLastJar: fieldToColumn.lastJar ? (row[fieldToColumn.lastJar] || '').toLowerCase() === 'lastjar' : false,
            isSoldOut: fieldToColumn.soldOut ? ['soldout', 'true', '1', 'yes', 'out of stock', 'unavailable', 'empty', 'oos', 'out'].includes((row[fieldToColumn.soldOut] || '').toLowerCase().trim()) : false,
            originalShelf: fieldToColumn.originalShelf ? row[fieldToColumn.originalShelf] || '' : '',
          };

          if (!importedStrainsByShelf[targetShelfId]) {
            importedStrainsByShelf[targetShelfId] = [];
          }
          importedStrainsByShelf[targetShelfId].push(newStrain);
          importedCount++;
        } catch (error) {
          const reason = `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
          console.warn(`Error processing row ${index + 2}:`, error);
        }
      });

      // Update shelves with imported data
      setBulkShelves(prev => prev.map(shelf => ({
        ...shelf,
        strains: [...shelf.strains, ...(importedStrainsByShelf[shelf.id] || [])]
      })));

      // Set skipped rows data and messages
      setSkippedRows(skippedRowsData);
      addToast({
        type: 'success',
        title: 'Bulk Flower CSV Import Complete',
        message: `${importedCount} strains loaded.`,
        duration: 5000
      });
    } else {
      // Pre-packaged import logic
      const importedProductsByShelf: Record<string, PrePackagedProduct[]> = {};
      let importedCount = 0;
      let shakeCount = 0;
      let flowerCount = 0;
      const skippedRowsData: {rowIndex: number, rowData: any, reason: string}[] = [];

      const shelfNameMap = new Map(prePackagedShelves.map(s => [s.name.toLowerCase(), s.id]));

      data.forEach((row, index) => {
        try {
          const shelfName = fieldToColumn.shelf ? row[fieldToColumn.shelf] : '';
          const productName = fieldToColumn.name ? row[fieldToColumn.name] : '';
          
          if (!shelfName || !productName) {
            const reason = `Missing required data: ${!shelfName ? 'weight category' : ''} ${!shelfName && !productName ? 'and' : ''} ${!productName ? 'product name' : ''}`;
            skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
            console.warn(`Skipping row ${index + 2}: ${reason}`);
            return;
          }

          // Intelligent shake detection: Check if product name contains "shake"
          const isShake = productName.toLowerCase().includes('shake');
          
          // Smart shelf name generation with weight format handling
          let smartShelfName = shelfName;
          if (isShake) {
            // For shake products, try variations: "28g Shake", "28 Shake"
            smartShelfName = shelfName.includes('g') ? `${shelfName} Shake` : `${shelfName}g Shake`;
          } else {
            // For flower products, try variations: "3.5g Flower", "3.5 Flower"  
            smartShelfName = shelfName.includes('g') ? `${shelfName} Flower` : `${shelfName}g Flower`;
          }

          // Try multiple fallback strategies for finding the correct shelf
          let targetShelfId = 
            // 1. Try smart classified name
            shelfNameMap.get(smartShelfName.toLowerCase()) ||
            // 2. Try original name
            shelfNameMap.get(shelfName.toLowerCase()) ||
            // 3. Try with 'g' suffix if not present  
            (!shelfName.includes('g') ? shelfNameMap.get(`${shelfName}g`.toLowerCase()) : null) ||
            // 4. Try without 'g' suffix if present
            (shelfName.includes('g') ? shelfNameMap.get(shelfName.replace('g', '').toLowerCase()) : null);
          
          if (!targetShelfId) {
            const reason = `Unknown weight category "${shelfName}" (tried "${smartShelfName}")`;
            skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
            console.warn(`Skipping row ${index + 2}: ${reason}. Available shelves: ${Array.from(shelfNameMap.keys()).join(', ')}`);
            return;
          }

          // Parse numeric values
          let thcValue: number | null = null;
          const thcStr = fieldToColumn.thc ? row[fieldToColumn.thc] : '';
          if (thcStr && thcStr !== '-') {
            const thcMatch = thcStr.match(/(\d*\.?\d+)/);
            if (thcMatch) thcValue = parseFloat(thcMatch[1]);
          }

          let terpenesValue: number | null = null;
          const terpenesStr = fieldToColumn.terpenes ? row[fieldToColumn.terpenes] : '';
          if (terpenesStr && terpenesStr !== '-') {
            const terpenesMatch = terpenesStr.match(/(\d*\.?\d+)/);
            if (terpenesMatch) terpenesValue = parseFloat(terpenesMatch[1]);
          }

          let price = 0;
          const priceStr = fieldToColumn.price ? row[fieldToColumn.price] : '';
          if (priceStr) {
            price = parseFloat(priceStr.replace(/[$,]/g, '')) || 0;
          }

          // Parse strain type
          let strainType: StrainType = StrainType.HYBRID;
          const typeStr = fieldToColumn.type ? row[fieldToColumn.type] : '';
          if (typeStr) {
            const normalizedType = typeStr.toUpperCase().replace(/[\s-./]/g, '');
            strainType = CSV_STRAIN_TYPE_MAP[normalizedType] || StrainType.HYBRID;
          }

          const newProduct: PrePackagedProduct = {
            id: crypto.randomUUID(),
            name: productName,
            brand: fieldToColumn.brand ? row[fieldToColumn.brand] || '' : '',
            thc: thcValue,
            terpenes: terpenesValue,
            type: strainType,
            price: price,
            netWeight: fieldToColumn.netWeight ? row[fieldToColumn.netWeight] || '' : '',
            isLowStock: fieldToColumn.isLowStock ? ['true', '1', 'yes', 'last 5 units', 'last5units', 'last 5', 'last5', 'final units', 'remaining units', 'low inventory', 'last few', 'limited stock', 'low stock'].includes((row[fieldToColumn.isLowStock] || '').toLowerCase().trim()) : false,
            isSoldOut: fieldToColumn.soldOut ? ['soldout', 'true', '1', 'yes', 'out of stock', 'unavailable', 'empty', 'oos', 'out'].includes((row[fieldToColumn.soldOut] || '').toLowerCase().trim()) : false,
            notes: fieldToColumn.notes ? row[fieldToColumn.notes] || '' : '',
          };

          if (!importedProductsByShelf[targetShelfId]) {
            importedProductsByShelf[targetShelfId] = [];
          }
          importedProductsByShelf[targetShelfId].push(newProduct);
          importedCount++;
          
          // Track shake vs flower classification
          if (isShake) {
            shakeCount++;
          } else {
            flowerCount++;
          }
        } catch (error) {
          const reason = `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
          skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
          console.warn(`Error processing row ${index + 2}:`, error);
        }
      });

      // Update shelves with imported data
      setPrePackagedShelves(prev => prev.map(shelf => ({
        ...shelf,
        products: [...shelf.products, ...(importedProductsByShelf[shelf.id] || [])]
      })));

      // Set skipped rows data and messages
      setSkippedRows(skippedRowsData);
      addToast({
        type: 'success',
        title: 'Pre-packaged CSV Import Complete',
        message: `${importedCount} products loaded.`,
        duration: 5000,
        actions: shakeCount > 0 || flowerCount > 0 ? [
          {
            label: 'View Classification Details',
            onClick: () => setShowImportDetailsModal(true),
            variant: 'secondary' as const
          }
        ] : undefined
      });
      
      // Store classification data for details modal
      setImportClassificationData({ shakeCount, flowerCount, totalCount: importedCount });
    }

    setShowCsvImportModal(false);
    recordChange(() => {});
  }, [menuMode, bulkShelves, prePackagedShelves, recordChange]);

  const handleCsvExport = useCallback((csvContent: string, columns: string[]) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFilename || 'mango-menu'}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowCsvExportModal(false);
  }, [exportFilename]);

  const handleMenuModeSwitch = useCallback((newMode: MenuMode) => {
    const currentData = menuMode === MenuMode.BULK ? 
      bulkShelves.some(shelf => shelf.strains.length > 0) :
      prePackagedShelves.some(shelf => shelf.products.length > 0);

    if (currentData) {
      const confirmMessage = `You have items in your current ${menuMode} menu.\n\n` +
        `⚠️ WARNING: Switching to ${newMode} WILL DELETE your current ${menuMode.toLowerCase()} menu data.\n\n` +
        `Are you sure you want to continue?`;
        
      if (confirm(confirmMessage)) {
        setMenuMode(newMode);
        localStorage.setItem('mango-menu-mode', newMode);
        recordChange(() => {});
      }
    } else {
      setMenuMode(newMode);
      localStorage.setItem('mango-menu-mode', newMode);
    }
  }, [menuMode, bulkShelves, prePackagedShelves, recordChange]);

  // Function to update dynamic menu items
  const updateDynamicMenus = useCallback(() => {
    if (window.electronAPI?.updateDynamicMenus) {
      const menuData = {
        shelves: shelves.map(shelf => ({ id: shelf.id, name: shelf.name })),
        darkMode: theme === 'dark',
        fiftyPercentOffEnabled: fiftyPercentOffEnabled
      };
      window.electronAPI.updateDynamicMenus(menuData).catch(error => {
        console.error('Error updating dynamic menus:', error);
      });
    }
  }, [shelves, theme, fiftyPercentOffEnabled]);

  const processedShelves = useMemo(() => {
    if (menuMode === MenuMode.BULK) {
      // Process bulk flower shelves with strain sorting
      return bulkShelves.map(shelf => {
        // If sortCriteria is explicitly null (from manual reordering), don't sort
        const activeSortCriteria = shelf.sortCriteria === null ? null : (shelf.sortCriteria || globalSortCriteria);
        return {
          ...shelf,
          strains: sortStrains(shelf.strains, activeSortCriteria, currentAppState) 
        };
      });
    } else {
      // Process pre-packaged shelves with product sorting
      return prePackagedShelves.map(shelf => {
        // If sortCriteria is explicitly null (from manual reordering), don't sort
        const activeSortCriteria = shelf.sortCriteria === null ? null : (shelf.sortCriteria || globalSortCriteria);
        return {
          ...shelf,
          products: sortPrePackagedProducts(shelf.products, activeSortCriteria, currentAppState) 
        };
      }) as unknown as Shelf[]; // Type assertion for backward compatibility
    }
  }, [menuMode, bulkShelves, prePackagedShelves, globalSortCriteria, currentAppState]);

  // Update dynamic menus when shelves or theme changes
  useEffect(() => {
    updateDynamicMenus();
  }, [updateDynamicMenus]);

  // No longer needed - we handle CSV import without page reload

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
              `You have ${menuMode === MenuMode.BULK ? 'strains' : 'products'} in your menu. Creating a new menu will clear all current progress.`
            );
            if (!confirmed) return;
          }
          recordChange(() => {
            if (menuMode === MenuMode.BULK) {
              setBulkShelves(getDefaultShelves(currentAppState, fiftyPercentOffEnabled));
            } else {
              setPrePackagedShelves(getDefaultPrePackagedShelves(currentAppState));
            }
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
            'new_mexico': SupportedStates.NEW_MEXICO,
            'new_york': SupportedStates.NEW_YORK
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
            'lastjar': 'isLastJar',
            'originalshelf': 'originalShelf'
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

        case 'switch-menu-mode':
          // Block mode switching if trying to switch to Bulk in New York
          if (menuMode === MenuMode.PREPACKAGED && currentAppState === SupportedStates.NEW_YORK) {
            alert('New York only supports Pre-Packaged mode. Bulk Flower mode is not available in this state.');
            break;
          }
          const newMode = menuMode === MenuMode.BULK ? MenuMode.PREPACKAGED : MenuMode.BULK;
          handleMenuModeChange(newMode);
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

        case 'toggle-fifty-percent-off':
          handleFiftyPercentOffToggle(!fiftyPercentOffEnabled);
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
          alert('🥭 Mango Cannabis Flower Menu Builder v1.1.0\n\nMango Cannabis Flower Menu Builder with dynamic pricing, state compliance, and beautiful export capabilities.\n\nDeveloped by Mango Cannabis\nContact: brad@mangocannabis.com');
          break;

        case 'reset-welcome':
          localStorage.removeItem('mango-has-seen-welcome');
          setShowWelcomeModal(true);
          break;

        case 'check-for-updates-manual':
          handleManualCheckForUpdates();
          break;

        case 'reset-app-data':
          // Reset all app data with confirmation
          const confirmReset = await showElectronConfirm(
            'Reset App Data',
            'This will clear all saved data including menus, settings, and preferences. The app will restart to show the Welcome screen. This action cannot be undone.\n\nDo you want to continue?'
          );
          if (confirmReset) {
            // Clear ALL localStorage keys
            const allKeysToRemove = [
              'mango-selected-state',
              'mango-oklahoma-menu-mode',
              'mango-menu-mode',
              'mango-imported-bulk-shelves',
              'mango-fifty-percent-off-enabled',
              'mango-imported-prepackaged-shelves',
              'mango-theme',
              'mango-has-seen-welcome',
              'mango-whats-new-viewed-version'
            ];
            
            allKeysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Reset all React state to initial values
            setCurrentAppState(SupportedStates.OKLAHOMA);
            setMenuMode(MenuMode.BULK);
            setBulkShelves(getDefaultShelves(SupportedStates.OKLAHOMA));
            setPrePackagedShelves(getDefaultPrePackagedShelves(SupportedStates.OKLAHOMA));
            setPreviewSettings(INITIAL_PREVIEW_SETTINGS);
            setTheme('dark');
            setFiftyPercentOffEnabled(false);
            setHasViewedWhatsNew(false);
            setShelvesPanelWidth(DEFAULT_SHELVES_PANEL_WIDTH);
            setExportFilename('mango-menu');
            setIsExporting(false);
            setExportAction(null);
            setShowExportOverlay(false);
            
            // Show welcome modal (app fresh state)
            setShowWelcomeModal(true);
            
            // Force app reload to ensure clean state
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
          break;

        case 'clear-localstorage':
          // Clear all app-specific localStorage data for clean release builds
          const confirmClear = await showElectronConfirm(
            'Clear localStorage data?',
            'This will remove all saved settings including theme, state, and welcome status. The app will reset to default state.'
          );
          if (confirmClear) {
            const keysToRemove = ['mango-selected-state', 'mango-theme', 'mango-has-seen-welcome'];
            keysToRemove.forEach(key => localStorage.removeItem(key));
            alert('✅ localStorage cleared! The app will reload with default settings.');
            window.location.reload();
          }
          break;

        case 'reset-welcome-state':
          localStorage.removeItem('mango-has-seen-welcome');
          setShowWelcomeModal(true);
          break;

        case 'auto-format-menu':
          handleAutoFormat();
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
    recordChange,
    handleManualCheckForUpdates,
    handleResetAppData,
    menuMode,
    bulkShelves,
    prePackagedShelves,
    fiftyPercentOffEnabled
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
        onShowWhatsNew={handleShowWhatsNew}
        hasViewedWhatsNew={hasViewedWhatsNew}
        menuMode={menuMode}
        onMenuModeChange={handleMenuModeChange}
        onExportPNG={() => triggerImageExport('png')}
        onExportJPEG={() => triggerImageExport('jpeg')}
        onExportCSV={handleExportCSV}
        onNewMenu={handleNewMenu}
        onOpenCSV={handleImportCSVRequest}
        onAutoFormat={handleAutoFormat}
        onClearAll={handleClearAllShelves}
        onGlobalSort={handleUpdateGlobalSortCriteria}
        onClearAllShelves={handleClearAllShelves}
        onClearAllLastJars={handleClearAllLastJars}
        onClearAllSoldOut={handleClearAllSoldOut}
        onAddStrain={handleAddStrain}
        onCheckUpdates={handleManualCheckForUpdates}
        onJumpToShelf={handleScrollToShelf}
        shelves={processedShelves.map(shelf => ({ id: shelf.id, name: shelf.name }))}
        hasUnsavedWork={hasMenuContent()}
        hasSoldOutItems={hasSoldOutItems()}
        onToggleFiftyPercentOff={handleFiftyPercentOffToggle}
        fiftyPercentOffEnabled={fiftyPercentOffEnabled}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitToWindow={handleFitToWindow}
        onResetAppData={handleResetAppData}
      />
      <Toolbar
        onClearAllShelves={handleClearAllShelves}
        onClearAllLastJars={handleClearAllLastJars}
        onClearAllSoldOut={handleClearAllSoldOut}
        hasSoldOutItems={hasSoldOutItems()}
        onOpenExportModal={handleOpenExportModal}
        onImportCSVRequest={handleImportCSVRequest}
        isExporting={isExporting}
        globalSortCriteria={globalSortCriteria}
        onUpdateGlobalSortCriteria={handleUpdateGlobalSortCriteria}
        theme={theme}
        menuMode={menuMode}
      />
      <main ref={mainContainerRef} className={`flex flex-1 overflow-hidden pt-2 px-2 pb-2 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <div className="flex flex-col" style={{ width: `${shelvesPanelWidth}px`, flexShrink: 0 }}>
          {menuMode === MenuMode.BULK && (
            <FiftyPercentOffToggle
              enabled={fiftyPercentOffEnabled}
              onToggle={handleFiftyPercentOffToggle}
              theme={theme}
            />
          )}
          {menuMode === MenuMode.BULK ? (
            <FlowerShelvesPanel
              ref={shelvesRef}
              style={{ flex: 1 }}
              shelves={processedShelves as Shelf[]} // Use processed (sorted) bulk shelves
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
              onMoveStrainUp={handleMoveStrainUp}
              onMoveStrainDown={handleMoveStrainDown}
              currentState={currentAppState}
              isControlsDisabled={autoFormatState?.isOptimizing || false}
            />
          ) : (
            <PrePackagedPanel
              ref={shelvesRef}
              style={{ flex: 1 }}
              shelves={processedShelves as PrePackagedShelf[]} // Use processed (sorted) pre-packaged shelves
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onRemoveProduct={handleRemoveProduct}
              onCopyProduct={handleCopyProduct}
              onClearShelfProducts={handleClearShelfProducts}
              newlyAddedProductId={newlyAddedProductId}
              onUpdateShelfSortCriteria={handleUpdatePrePackagedShelfSortCriteria}
              onScrollToShelf={handleScrollToShelf}
              theme={theme}
              onMoveProduct={handleMoveProduct}
              onMoveProductUp={handleMoveProductUp}
              onMoveProductDown={handleMoveProductDown}
              currentState={currentAppState}
              isControlsDisabled={autoFormatState?.isOptimizing || false}
            />
          )}
        </div>
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
        <div className="flex-1 min-w-0">
          <MenuPreviewPanel
            shelves={processedShelves} // Use processed shelves for both modes
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
            onOverflowDetected={handleOverflowDetected}
            onAutoFormat={handleAutoFormat}
            hasContentOverflow={hasContentOverflow}
            isOptimizing={autoFormatState?.isOptimizing || false}
            onAddPage={handleAddPage}
            onRemovePage={handleRemovePage}
            onGoToPage={handleGoToPage}
            onToggleAutoPageBreaks={handleToggleAutoPageBreaks}
            isControlsDisabled={autoFormatState?.isOptimizing || false}
          />
        </div>
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
        <InstructionsModalTabs
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          theme={theme}
          currentMode={menuMode}
          currentState={currentAppState}
        />
        <WhatsNewModalTabs
          isOpen={showWhatsNew}
          onClose={() => setShowWhatsNew(false)}
          theme={theme}
        />
        <WelcomeModal
          isOpen={showWelcomeModal}
          onStateSelect={handleWelcomeStateSelect}
          onClose={handleWelcomeModalClose}
          theme={theme}
        />
        <CsvImportModal
          isOpen={showCsvImportModal}
          onClose={() => setShowCsvImportModal(false)}
          theme={theme}
          menuMode={menuMode}
          onImport={handleCsvImport}
          onModeSwitch={handleMenuModeSwitch}
        />
        
        {/* Skipped Rows Modal */}
        {showSkippedModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowSkippedModal(false)}
          >
            <div className={`max-w-4xl w-full max-h-[90vh] rounded-lg shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            }`}>
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
              }`}>
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span>Strains Not Imported ({skippedRows.length})</span>
                </h2>
                <button
                  onClick={() => setShowSkippedModal(false)}
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
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  The following strains could not be imported. Review the data and reasons below:
                </p>
                
                <div className="space-y-4">
                  {skippedRows.map((skippedRow, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' 
                          ? 'border-gray-600 bg-gray-700/30' 
                          : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-red-500">
                          Row {skippedRow.rowIndex}
                        </h3>
                        <span className={`text-sm px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {skippedRow.reason}
                        </span>
                      </div>
                      
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <strong>Row Data:</strong>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(skippedRow.rowData).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-medium mr-2">{key}:</span>
                              <span className={`${!value ? 'text-red-500 italic' : ''}`}>
                                {value || '(empty)'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t flex justify-end ${
                theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
              }`}>
                <button
                  onClick={() => setShowSkippedModal(false)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Import Classification Details Modal */}
        {showImportDetailsModal && importClassificationData && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowImportDetailsModal(false)}
          >
            <div className={`max-w-2xl w-full rounded-lg shadow-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            }`}>
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
              }`}>
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Smart Classification Results</span>
                </h2>
                <button
                  onClick={() => setShowImportDetailsModal(false)}
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
              <div className={`px-6 py-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Import Summary</h3>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-500">{importClassificationData.totalCount}</div>
                          <div className="text-sm text-gray-500">Total Products</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-500">{importClassificationData.flowerCount}</div>
                          <div className="text-sm text-gray-500">Flower Products</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-500">{importClassificationData.shakeCount}</div>
                          <div className="text-sm text-gray-500">Shake Products</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">How Smart Classification Works</h3>
                    <div className="space-y-3 text-sm">
                      <div className={`p-3 rounded-lg border-l-4 border-purple-500 ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                        <div className="font-medium">🧠 Automatic Detection</div>
                        <div className="mt-1">Products with "shake" in the name are automatically categorized under Shake shelves (e.g., "28g Shake")</div>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 border-green-500 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                        <div className="font-medium">🌸 Default to Flower</div>
                        <div className="mt-1">All other products are categorized under Flower shelves (e.g., "28g Flower", "3.5g Flower")</div>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <div className="font-medium">⚙️ Manual Override</div>
                        <div className="mt-1">You can override by using "3.5g Shake" or "28g Flower" directly in your weight/category column</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowImportDetailsModal(false)}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <CsvExportModal
          isOpen={showCsvExportModal}
          onClose={() => setShowCsvExportModal(false)}
          theme={theme}
          menuMode={menuMode}
          bulkShelves={processedShelves as Shelf[]}
          prePackagedShelves={processedShelves as PrePackagedShelf[]}
          onExport={handleCsvExport}
        />
        
        <UnifiedExportModal
          isOpen={showUnifiedExportModal}
          onClose={() => setShowUnifiedExportModal(false)}
          theme={theme}
          menuMode={menuMode}
          exportFilename={exportFilename}
          onExportFilenameChange={setExportFilename}
          onExportPNG={() => triggerImageExport('png')}
          onExportJPEG={() => triggerImageExport('jpeg')}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
        />
        {!updateDismissed && (
          <UpdateNotification
            onUpdateDismissed={handleUpdateDismissed}
            updateAvailable={updateAvailable}
            updateDownloaded={isUpdateDownloaded}
            updateVersion={updateVersion}
            theme={theme}
            isManualCheck={isManualCheck}
            isCheckingForUpdates={isCheckingForUpdates}
            noUpdatesFound={noUpdatesFound}
            isDownloading={isDownloadingUpdate}
            downloadProgress={updateDownloadProgressFull}
            updateError={updateError}
            updateErrorUrl={updateErrorUrl}
          />
        )}
        
        <DebugConsole theme={theme} />
        
        {/* Loading/Initialization Overlay */}
        {isInitializing && (
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-50"
            role="alertdialog"
            aria-live="assertive"
            aria-busy="true"
            aria-label="Initializing application"
          >
            <div className="bg-white p-8 rounded-lg shadow-xl text-gray-800 flex flex-col items-center space-y-4 max-w-md mx-4">
              <svg className="animate-spin h-12 w-12 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl font-semibold text-center">{initMessage}</span>
            </div>
          </div>
        )}

        {/* Note: Old toasts have been replaced with unified ToastContainer system */}
      </div>
    );
  };

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
