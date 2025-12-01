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
      getUpdateSettings?: () => Promise<{ allowPrerelease?: boolean }>;
      setUpdateSettings?: (settings: { allowPrerelease?: boolean }) => Promise<{ allowPrerelease?: boolean }>;
      onUpdateSettingsChanged?: (callback: (event: any, settings: { allowPrerelease?: boolean }) => void) => void;
      removeUpdateSettingsListeners?: () => void;
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
import { HeaderMenuModal } from './components/HeaderMenuModal';
import { UnifiedExportModal } from './components/UnifiedExportModal';
import { FlowerShelvesPanel } from './components/FlowerShelvesPanel';
import { MenuPreviewPanel } from './components/MenuPreviewPanel';
import { PrePackagedPanel } from './components/PrePackagedPanel';
import { PrePackagedCanvas } from './components/PrePackagedCanvas';
import { ShelfConfiguratorModal } from './components/ShelfConfiguratorModal';
import { UpdateNotification } from './components/UpdateNotification';
import { DebugConsole } from './components/DebugConsole';
import { FiftyPercentOffToggle } from './components/FiftyPercentOffToggle';
import { ToastProvider, useToast } from './components/ToastContainer';
import { Shelf, Strain, PreviewSettings, SupportedStates, StrainType, ArtboardSize, SortCriteria, Theme, MenuMode, PrePackagedShelf, PrePackagedProduct, PrePackagedSortCriteria, PrePackagedWeight, AnyShelf, AnySortCriteria } from './types';
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
import { PageManager } from './utils/PageManager';
import { ZipExporter, SequentialExporter } from './utils/ZipExporter';
import { SessionManager, ProjectData, ProjectState } from './utils/SessionManager';
import { APP_VERSION } from './version';
import { shelfConfigStore } from './utils/shelfConfigStore';




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
        valA = a.isLastJar ? 1 : 0;
        valB = b.isLastJar ? 1 : 0;
        break;
      case 'isSoldOut':
        valA = a.isSoldOut ? 1 : 0;
        valB = b.isSoldOut ? 1 : 0;
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
        valA = a.isLowStock ? 1 : 0;
        valB = b.isLowStock ? 1 : 0;
        break;
      case 'isLastJar':
        // Map isLastJar key to isLowStock field for pre-packaged products (UI consistency)
        valA = a.isLowStock ? 1 : 0;
        valB = b.isLowStock ? 1 : 0;
        break;
      case 'isSoldOut':
        // Sort sold out items properly (use boolean directly)
        valA = a.isSoldOut ? 1 : 0;
        valB = b.isSoldOut ? 1 : 0;
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

const getConfiguredBulkShelves = (state: SupportedStates, fiftyPercentOffEnabled: boolean): Shelf[] => {
  const stored = shelfConfigStore.get(state, MenuMode.BULK) as Shelf[] | null;
  if (stored && Array.isArray(stored)) {
    return stored.map((shelf) => ({ ...shelf, strains: shelf.strains || [] }));
  }
  return getDefaultShelves(state, fiftyPercentOffEnabled);
};

const getConfiguredPrepackagedShelves = (state: SupportedStates): PrePackagedShelf[] => {
  const stored = shelfConfigStore.get(state, MenuMode.PREPACKAGED) as PrePackagedShelf[] | null;
  if (stored && Array.isArray(stored)) {
    return stored.map((shelf) => ({ ...shelf, products: shelf.products || [] }));
  }
  return getDefaultPrePackagedShelves(state);
};

const buildEmptyShelvesForMode = (state: SupportedStates, mode: MenuMode, fiftyPercentOffEnabled: boolean) => {
  if (mode === MenuMode.BULK) {
    return getConfiguredBulkShelves(state, fiftyPercentOffEnabled).map((shelf) => ({ ...shelf, strains: [] }));
  }
  return getConfiguredPrepackagedShelves(state).map((shelf) => ({ ...shelf, products: [] }));
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
    const defaultShelves = getConfiguredBulkShelves(currentAppState, savedFiftyPercentOffEnabled);
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
    const defaultShelves = getConfiguredPrepackagedShelves(currentAppState);
    console.log('Using default pre-packaged shelves:', defaultShelves.length, 'shelves');
    return defaultShelves;
  });

  // Page manager for multi-page functionality - initialized before shelves useMemo
  const [pageManager] = useState(() => new PageManager());
  
  // Session manager for project persistence and auto-save
  const [sessionManager] = useState(() => new SessionManager());
  
  // Auto-save state - defaults to false, loads from localStorage
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('mango-auto-save-enabled');
    return saved === 'true'; // Default to false if not set
  });
  
  // Project state management
  const [projectState, setProjectState] = useState<ProjectState>(() => ({
    currentProjectPath: null,
    currentProjectName: 'Untitled Project',
    hasUnsavedChanges: false,
    lastSaveTime: null,
    lastAutoSaveTime: null,
    isNewProject: true
  }));
  
  // Force re-render trigger for page changes
  const [pageChangeCounter, setPageChangeCounter] = useState(0);
  const forcePageUpdate = useCallback(() => {
    setPageChangeCounter(prev => prev + 1);
  }, []);

  const syncMenuMode = useCallback((mode: MenuMode) => {
    pageManager.setMode(mode);
    setMenuMode(mode);
    localStorage.setItem('mango-oklahoma-menu-mode', mode);
    localStorage.setItem('mango-menu-mode', mode);
  }, [pageManager]);

  // Current active shelves based on current page - always maintain consistent structure
  const shelves = useMemo(() => {
    const currentPage = pageManager.getCurrentPage();
    if (currentPage && currentPage.shelves.length > 0) {
      // Use page-specific shelves if they exist and have content
      return currentPage.shelves;
    }
    // Always return default shelf structure to maintain consistent hooks
    // Empty pages have default shelves with no content, not no shelves
    return menuMode === MenuMode.BULK ? bulkShelves : prePackagedShelves as unknown as Shelf[];
  }, [pageManager, pageChangeCounter, menuMode, bulkShelves, prePackagedShelves]);

  // Setter for current shelves - PageManager as single source of truth
  const setShelves = useCallback((updater: React.SetStateAction<Shelf[]> | React.SetStateAction<PrePackagedShelf[]>) => {
    const currentPageNumber = pageManager.getCurrentPageNumber();

    // Calculate new shelves value
    let newShelves: AnyShelf[];
    if (typeof updater === 'function') {
      const currentShelves = shelves as AnyShelf[];
      newShelves = (updater as (prev: AnyShelf[]) => AnyShelf[])(currentShelves);
    } else {
      newShelves = updater as AnyShelf[];
    }

    // Update PageManager content and keep per-shelf sort overrides in sync
    pageManager.updatePageShelves(currentPageNumber, newShelves);
    newShelves.forEach(shelf => {
      const shelfSort = (shelf as Shelf | PrePackagedShelf).sortCriteria ?? null;
      pageManager.updatePageShelfSort(currentPageNumber, shelf.id, shelfSort as AnySortCriteria | null);
    });

    // Mark project as having unsaved changes
    sessionManager.markDirty();
    setProjectState(sessionManager.getProjectState());

    // Force re-render to update UI
    forcePageUpdate();
  }, [pageManager, shelves, sessionManager, forcePageUpdate]);
  
  // Global default settings for new pages
  const [globalDefaultSettings] = useState<PreviewSettings>(INITIAL_PREVIEW_SETTINGS);
  
  // Current page settings from PageManager
  const previewSettings = useMemo(() => {
    return pageManager.getPageSettings(pageManager.getCurrentPageNumber(), globalDefaultSettings);
  }, [pageManager, globalDefaultSettings, pageChangeCounter]);
  
  // Set preview settings for current page only
  const setPreviewSettings = useCallback((updater: React.SetStateAction<PreviewSettings> | Partial<PreviewSettings>) => {
    const currentPageNumber = pageManager.getCurrentPageNumber();
    
    let newSettings: Partial<PreviewSettings>;
    if (typeof updater === 'function') {
      const currentSettings = pageManager.getPageSettings(currentPageNumber, globalDefaultSettings);
      newSettings = (updater as (prev: PreviewSettings) => PreviewSettings)(currentSettings);
    } else {
      newSettings = updater;
    }
    
    // Save settings to current page only
    pageManager.updatePageSettings(currentPageNumber, newSettings);
    
    // Mark project as having unsaved changes
    sessionManager.markDirty();
    setProjectState(sessionManager.getProjectState());
    
    // Force re-render to update UI controls
    forcePageUpdate();
  }, [pageManager, globalDefaultSettings, sessionManager, forcePageUpdate]);
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
  const [shelfConfigVersion, setShelfConfigVersion] = useState<number>(0);

  const configuredShelvesForModal = useMemo(() => {
      // Prefer the live shelves (so newly imported/created shelves remain present), but strip items for the modal.
      if (menuMode === MenuMode.BULK) {
        if (bulkShelves.length > 0) {
          return bulkShelves.map((shelf) => ({ ...shelf, strains: [] }));
        }
        return getConfiguredBulkShelves(currentAppState, fiftyPercentOffEnabled).map((shelf) => ({ ...shelf, strains: [] }));
      }
      if (prePackagedShelves.length > 0) {
        return prePackagedShelves.map((shelf) => ({ ...shelf, products: [] }));
      }
      return getConfiguredPrepackagedShelves(currentAppState).map((shelf) => ({ ...shelf, products: [] }));
  }, [menuMode, currentAppState, fiftyPercentOffEnabled, shelfConfigVersion, bulkShelves, prePackagedShelves]);

  const defaultShelvesForModal = useMemo(() => {
    return menuMode === MenuMode.BULK
      ? getDefaultShelves(currentAppState, fiftyPercentOffEnabled)
      : getDefaultPrePackagedShelves(currentAppState);
  }, [menuMode, currentAppState, fiftyPercentOffEnabled]);

  const [newlyAddedStrainId, setNewlyAddedStrainId] = useState<string | null>(null);
  const [pendingScrollTarget, setPendingScrollTarget] = useState<{ mode: 'bulk' | 'prepackaged'; shelfId: string; itemId: string } | null>(null);
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
  const [showHeaderMenu, setShowHeaderMenu] = useState<boolean>(false);
  const [showShelfConfigurator, setShowShelfConfigurator] = useState<boolean>(false);
  const [hasViewedWhatsNew, setHasViewedWhatsNew] = useState<boolean>(() => {
    const viewedVersion = localStorage.getItem('mango-whats-new-viewed-version');
    return viewedVersion === APP_VERSION; // Check if current version has been viewed
  });
  const [hasContentOverflow, setHasContentOverflow] = useState<boolean>(false);
  const [autoFormatState, setAutoFormatState] = useState<AutoFormatState | null>(null);
  const [shouldContinueOptimization, setShouldContinueOptimization] = useState<boolean>(false);
  const [isUpdatingPageCount, setIsUpdatingPageCount] = useState<boolean>(false);

  // Global sort criteria state - moved here to prevent initialization order issues
  const [globalSortCriteria, setGlobalSortCriteria] = useState<SortCriteria | null>(null);

  // Initialize PageManager with current shelves and settings on first load
  useEffect(() => {
    const initialShelves = menuMode === MenuMode.BULK ? bulkShelves : prePackagedShelves as unknown as Shelf[];
    // Initialize page 1 with both content and default settings
    pageManager.updatePageShelves(1, initialShelves);
    pageManager.updatePageSettings(1, globalDefaultSettings);
    // Force re-render to show the initialized content
    forcePageUpdate();
  }, [menuMode, bulkShelves, prePackagedShelves, pageManager, globalDefaultSettings, forcePageUpdate]); // Re-run when data changes

  // Auto-save effect - saves project data every 30 seconds
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      try {
        const projectData = sessionManager.createProjectData(
          pageManager,
          previewSettings,
          menuMode,
          currentAppState,
          theme,
          'Auto-saved Project'
        );
        
        // Only auto-save if the project has actual content (strains/products)
        if (projectData.metadata.totalItems > 0) {
          sessionManager.autoSave(projectData);
          setLastSaveTime(new Date());
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [autoSaveEnabled, sessionManager, pageManager, previewSettings, menuMode, currentAppState, theme]);

  // Session recovery on app startup
  useEffect(() => {
    // Check for auto-saved session on startup
    if (sessionManager.hasAutoSave()) {
      const autoSaveInfo = sessionManager.getAutoSaveInfo();
      if (autoSaveInfo && autoSaveInfo.hasData) {
        // Show recovery notification
        const shouldRecover = confirm(
          `Auto-saved session found from ${new Date(autoSaveInfo.timestamp).toLocaleString()}.\n\n` +
          'Would you like to recover your previous work?'
        );
        
        if (shouldRecover) {
          const recoveredData = sessionManager.loadAutoSave();
          if (recoveredData) {
            // Restore the session
            restoreProjectData(recoveredData);
            addToast({
              message: 'Session recovered successfully',
              type: 'success'
            });
          }
        } else {
          // User declined recovery, clear auto-save
          sessionManager.clearAutoSave();
        }
      }
    }
  }, [sessionManager]); // Only run once on startup

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

  // Auto-save toggle handler
  const handleToggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('mango-auto-save-enabled', String(newValue));
      
      // Show warning toast when enabling auto-save
      if (newValue) {
        addToast({
          title: 'Auto-Save Enabled',
          message: 'ΓÜá∩╕Å Auto-Save feature is in development and may not work as intended. Use with caution, save your work often.',
          type: 'warning',
          duration: 8000 // Show for 8 seconds to ensure user sees it
        });
      }
      
      return newValue;
    });
  }, [addToast]);

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
        `ΓÜá∩╕Å WARNING: Switching to ${newMode} WILL DELETE your current ${menuMode.toLowerCase()} menu data.\n\n` +
        `Are you sure you want to continue?`;
      
      if (!confirm(confirmMessage)) {
        return; // User cancelled, don't change mode
      }
      
      // User confirmed - immediately clear the old content to free memory
      if (menuMode === MenuMode.BULK) {
        setBulkShelves(getConfiguredBulkShelves(currentAppState, fiftyPercentOffEnabled));
      } else {
        setPrePackagedShelves(getConfiguredPrepackagedShelves(currentAppState));
      }
    }
    
    // CRITICAL: Clear PageManager to prevent type mixing during mode switch
    syncMenuMode(newMode);
    
    // Force re-render to initialize with clean state for new mode
    forcePageUpdate();
  }, [menuMode, bulkShelves, prePackagedShelves, forcePageUpdate, syncMenuMode, currentAppState, fiftyPercentOffEnabled]);

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
      localStorage.setItem('mango-whats-new-viewed-version', APP_VERSION);
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
    setUpdateError(null);
    setUpdateErrorUrl(null);
    
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
    
    console.log(`Starting strain reorder in shelf ${shelfId}: ${fromIndex} ΓåÆ ${toIndex}`);
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
  const [allowPrereleaseUpdates, setAllowPrereleaseUpdates] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mango-allow-prerelease-updates') === 'true';
    }
    return false;
  });


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

  useEffect(() => {
    let isMounted = true;

    const fetchUpdateSettings = async () => {
      try {
        if (window.electronAPI?.getUpdateSettings) {
          const settings = await window.electronAPI.getUpdateSettings();
          if (isMounted && settings && typeof settings.allowPrerelease === 'boolean') {
            setAllowPrereleaseUpdates(settings.allowPrerelease);
            localStorage.setItem('mango-allow-prerelease-updates', String(settings.allowPrerelease));
          }
        }
      } catch (error) {
        console.error('Failed to load update settings:', error);
      }
    };

    fetchUpdateSettings();

    const handleSettingsChanged = (_event: any, settings: { allowPrerelease?: boolean }) => {
      if (settings && typeof settings.allowPrerelease === 'boolean') {
        setAllowPrereleaseUpdates(settings.allowPrerelease);
        localStorage.setItem('mango-allow-prerelease-updates', String(settings.allowPrerelease));
      }
    };

    window.electronAPI?.onUpdateSettingsChanged?.(handleSettingsChanged);

    return () => {
      isMounted = false;
      window.electronAPI?.removeUpdateSettingsListeners?.();
    };
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
      syncMenuMode(MenuMode.PREPACKAGED);
      forcePageUpdate();
    }
  }, [currentAppState, hasMenuContent, menuMode, syncMenuMode, forcePageUpdate]);

  // Welcome modal handlers
  const handleWelcomeStateSelect = useCallback((selectedState: SupportedStates) => {
    setCurrentAppState(selectedState);
    localStorage.setItem('mango-selected-state', selectedState);
    localStorage.setItem('mango-has-seen-welcome', 'true');
    
    // Auto-switch to Pre-Packaged mode if selecting New York (which doesn't support Bulk mode)
    if (selectedState === SupportedStates.NEW_YORK && menuMode === MenuMode.BULK) {
      syncMenuMode(MenuMode.PREPACKAGED);
      forcePageUpdate();
    }
    
    setShowWelcomeModal(false);
  }, [menuMode, syncMenuMode, forcePageUpdate]);

  const handleWelcomeModalClose = useCallback(() => {
    localStorage.setItem('mango-has-seen-welcome', 'true');
    setShowWelcomeModal(false);
  }, []);

  // 50% OFF shelf toggle handler
  const handleFiftyPercentOffToggle = useCallback((enabled: boolean) => {
    setFiftyPercentOffEnabled(enabled);
    localStorage.setItem('mango-fifty-percent-off-enabled', enabled.toString());
  }, []);

  const handleTogglePreReleaseUpdates = useCallback((enabled: boolean) => {
    setAllowPrereleaseUpdates(enabled);
    localStorage.setItem('mango-allow-prerelease-updates', String(enabled));
    if (window.electronAPI?.setUpdateSettings) {
      window.electronAPI.setUpdateSettings({ allowPrerelease: enabled }).catch(error => {
        console.error('Failed to update pre-release preference:', error);
      });
    }
  }, []);

  useEffect(() => {
    // Update shelves based on current mode when state or 50% off toggle changes
    if (menuMode === MenuMode.BULK) {
      setBulkShelves(getConfiguredBulkShelves(currentAppState, fiftyPercentOffEnabled));
    } else {
      setPrePackagedShelves(getConfiguredPrepackagedShelves(currentAppState));
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
      console.log('≡ƒÄë Update available event received:', updateInfo);
      console.log('≡ƒôä This should NOT trigger any downloads automatically');
      
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
      console.log('≡ƒôª Download progress:', progress);
      setIsDownloadingUpdate(true); // Ensure downloading state is set
      setUpdateDownloadProgress(progress.percent);
      setUpdateDownloadProgressFull(progress);
    };

    const handleUpdateDownloaded = (_event: any, info: { version: string }) => {
      console.log('Γ£à Update download completed!', info);
      setIsDownloadingUpdate(false);
      setIsUpdateDownloaded(true);
      setUpdateDownloadProgress(100);
      setUpdateDownloadProgressFull(null); // Clear progress since download is complete
      console.log('≡ƒôî States after download completion: downloading=false, downloaded=true');
    };

    const handleUpdateNotAvailable = (_event: any, info: any) => {
      console.log('No updates available:', info);
      
      // Reset update states to ensure we show current running version
      setUpdateAvailable(false);
      setIsUpdateDownloaded(false);
      setIsDownloadingUpdate(false);
      setUpdateError(null);
      setUpdateErrorUrl(null);
      
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

      // If main process provided additional context (e.g., no prerelease available), store it
      if (info && typeof info === 'object' && 'message' in info) {
        console.log('Update info message:', info.message);
      }
    };

    const handleUpdateDebug = (_event: any, debug: { type: string; message: string; [key: string]: any }) => {
      // Debug messages now handled by DebugConsole component
      console.log('Update Debug:', debug);
    };

    const handleUpdateError = (_event: any, errorInfo: { message: string; originalError: string; manualDownloadUrl: string }) => {
      console.error('Update error received:', errorInfo);
      const original = (errorInfo?.originalError || '').toLowerCase();
      const looksLikeMissingRelease = original.includes('404') || original.includes('cannot find') || original.includes('no published release') || original.includes('no assets found') || original.includes('update info not found');

      if (looksLikeMissingRelease && allowPrereleaseUpdates) {
        console.log('Update error appears to be a missing pre-release. Treating as not-available.');
        setUpdateAvailable(false);
        setIsUpdateDownloaded(false);
        setIsDownloadingUpdate(false);
        setIsCheckingForUpdates(false);
        setNoUpdatesFound(true);
        setUpdateError(null);
        setUpdateErrorUrl(null);
        return;
      }

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
      // Use setShelves (PageManager) instead of global state
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (shelf.id !== shelfId) return shelf;
          
          if (menuMode === MenuMode.BULK) {
            return {
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
            };
          } else {
            return {
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
                  price: 0,
                  isLowStock: false,
                  isSoldOut: false,
                },
              ],
              sortCriteria: null // Reset sort criteria when adding product
            };
          }
        })
      );
    });

    if (menuMode === MenuMode.BULK) {
      setNewlyAddedStrainId(newItemId);
      setPendingScrollTarget({ mode: 'bulk', shelfId, itemId: newItemId });
    } else {
      setNewlyAddedProductId(newItemId);
      setPendingScrollTarget({ mode: 'prepackaged', shelfId, itemId: newItemId });
    }
  }, [handleShelfInteraction, setShelves, menuMode, setPendingScrollTarget]);

  // Backward compatibility alias for existing code
  const handleAddStrain = handleAddItem;

  // Generic item update handler that works for both modes
  const handleUpdateItem = useCallback((shelfId: string, itemId: string, updatedItem: Partial<Strain> | Partial<PrePackagedProduct>) => {
    // Input changes should be immediate and not use recordChange to avoid disrupting input flow
    // Use setShelves (PageManager) to persist changes properly
    setShelves(prevShelves =>
      prevShelves.map(shelf => {
        if (shelf.id !== shelfId) return shelf;
        
        if (menuMode === MenuMode.BULK) {
          return {
            ...shelf,
            strains: (shelf as Shelf).strains.map(strain =>
              strain.id === itemId ? { ...strain, ...updatedItem } : strain
            ),
            sortCriteria: null // Reset sort criteria when updating strain
          };
        } else {
          return {
            ...shelf,
            products: (shelf as PrePackagedShelf).products.map(product =>
              product.id === itemId ? { ...product, ...updatedItem } : product
            ),
            sortCriteria: null // Reset sort criteria when updating product
          };
        }
      })
    );
    
    // Mark project as having unsaved changes
    sessionManager.markDirty();
    setProjectState(sessionManager.getProjectState());
  }, [menuMode, sessionManager, setShelves]);

  // Backward compatibility alias for existing code
  const handleUpdateStrain = useCallback((shelfId: string, strainId: string, updatedStrain: Partial<Strain>) => {
    handleUpdateItem(shelfId, strainId, updatedStrain);
  }, [handleUpdateItem]);

  // Generic item removal handler that works for both modes
  const handleRemoveItem = useCallback((shelfId: string, itemId: string) => {
    recordChange(() => {
      // Use setShelves (PageManager) instead of global state
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (shelf.id !== shelfId) return shelf;
          
          if (menuMode === MenuMode.BULK) {
            return { 
              ...shelf, 
              strains: shelf.strains.filter(s => s.id !== itemId),
              sortCriteria: null // Reset sort criteria when removing strain
            };
          } else {
            return { 
              ...shelf, 
              products: shelf.products.filter(p => p.id !== itemId),
              sortCriteria: null // Reset sort criteria when removing product
            };
          }
        })
      );
    });
  }, [setShelves, menuMode]);

  // Backward compatibility alias for existing code
  const handleRemoveStrain = useCallback((shelfId: string, strainId: string) => {
    handleRemoveItem(shelfId, strainId);
  }, [handleRemoveItem]);

  // Generic item copy handler that works for both modes
  const handleCopyItem = useCallback((shelfId: string, itemId: string, direction: 'above' | 'below') => {
    recordChange(() => {
      const newItemId = crypto.randomUUID();

      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (shelf.id !== shelfId) {
            return shelf;
          }

          if (menuMode === MenuMode.BULK) {
            const strainIndex = shelf.strains.findIndex(s => s.id === itemId);
            if (strainIndex === -1) {
              return shelf;
            }

            const strainToCopy = { ...shelf.strains[strainIndex], id: newItemId };
            const newStrains = [...shelf.strains];
            const insertIndex = direction === 'above' ? strainIndex : strainIndex + 1;
            newStrains.splice(insertIndex, 0, strainToCopy);

            return {
              ...shelf,
              strains: newStrains,
              sortCriteria: null // Reset sort criteria when copying strain
            };
          }

          const typedShelf = shelf as PrePackagedShelf;
          const productIndex = typedShelf.products.findIndex(p => p.id === itemId);
          if (productIndex === -1) {
            return shelf;
          }

          const productToCopy = { ...typedShelf.products[productIndex], id: newItemId };
          const newProducts = [...typedShelf.products];
          const insertIndex = direction === 'above' ? productIndex : productIndex + 1;
          newProducts.splice(insertIndex, 0, productToCopy);

          return {
            ...typedShelf,
            products: newProducts,
            sortCriteria: null // Reset sort criteria when copying product
          } as PrePackagedShelf;
        })
      );

      if (menuMode === MenuMode.BULK) {
        setNewlyAddedStrainId(newItemId);
        setPendingScrollTarget({ mode: 'bulk', shelfId, itemId: newItemId });
      } else {
        setNewlyAddedProductId(newItemId);
        setPendingScrollTarget({ mode: 'prepackaged', shelfId, itemId: newItemId });
      }
    });
  }, [menuMode, setShelves, recordChange, setPendingScrollTarget]);

  // Backward compatibility alias for existing code
  const handleCopyStrain = useCallback((shelfId: string, strainId: string, direction: 'above' | 'below') => {
    handleCopyItem(shelfId, strainId, direction);
  }, [handleCopyItem]);

  // Generic shelf clearing handler that works for both modes
  const handleClearShelfItems = useCallback((shelfId: string) => {
    recordChange(() => {
      // Use setShelves (PageManager) instead of global state
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (shelf.id !== shelfId) return shelf;
          
          if (menuMode === MenuMode.BULK) {
            return { 
              ...shelf, 
              strains: [],
              sortCriteria: null // Reset sort criteria when clearing shelf
            };
          } else {
            return { 
              ...shelf, 
              products: [],
              sortCriteria: null // Reset sort criteria when clearing shelf
            };
          }
        })
      );
    });
  }, [setShelves, menuMode]);

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
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (shelf.id !== shelfId || menuMode !== MenuMode.PREPACKAGED) {
            return shelf;
          }

          const typedShelf = shelf as PrePackagedShelf;
          const currentCriteria = typedShelf.sortCriteria;
          let newDirection: 'asc' | 'desc' = 'asc';

          if (currentCriteria && currentCriteria.key === key) {
            newDirection = currentCriteria.direction === 'asc' ? 'desc' : 'asc';
          }

          return {
            ...typedShelf,
            sortCriteria: { key, direction: newDirection }
          } as PrePackagedShelf;
        })
      );
    });
  }, [menuMode, setShelves]);

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
    
    console.log(`Starting reorder in shelf ${shelfId}: ${fromIndex} ΓåÆ ${toIndex}`);
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
      // Clear all content from current page only
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (menuMode === MenuMode.BULK) {
            return {
              ...shelf,
              strains: [],
              sortCriteria: null // Reset sort criteria when clearing all shelves
            };
          } else {
            return {
              ...shelf,
              products: [],
              sortCriteria: null // Reset sort criteria when clearing all shelves
            };
          }
        })
      );
    });
  }, [setShelves, menuMode]);

  // Generic clear all last jars handler that works for both modes
  const handleClearAllLastJars = useCallback(() => {
    recordChange(() => {
      // Clear all last jar/low stock flags from current page only
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (menuMode === MenuMode.BULK) {
            return {
              ...shelf,
              strains: shelf.strains.map(strain => ({ ...strain, isLastJar: false })),
              sortCriteria: null // Reset sort criteria when clearing last jars
            };
          } else {
            return {
              ...shelf,
              products: shelf.products.map(product => ({ ...product, isLowStock: false })),
              sortCriteria: null // Reset sort criteria when clearing low stock
            };
          }
        })
      );
    });
  }, [setShelves, menuMode]);

  // Generic clear all sold out handler that works for both modes
  const handleClearAllSoldOut = useCallback(() => {
    recordChange(() => {
      // Clear all sold out flags from current page only
      setShelves(prevShelves =>
        prevShelves.map(shelf => {
          if (menuMode === MenuMode.BULK) {
            return {
              ...shelf,
              strains: shelf.strains.map(strain => ({ ...strain, isSoldOut: false })),
              sortCriteria: null // Reset sort criteria when clearing sold out
            };
          } else {
            return {
              ...shelf,
              products: shelf.products.map(product => ({ ...product, isSoldOut: false })),
              sortCriteria: null // Reset sort criteria when clearing sold out
            };
          }
        })
      );
    });
  }, [setShelves, menuMode]);
  
  const handleUpdatePreviewSettings = useCallback((newSettings: Partial<PreviewSettings>) => {
     // For preview settings, we don't want to reset sorts, so don't use recordChange
     setPreviewSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Multi-page management helpers
  // Add fresh new page (empty content + default settings)
  const handleAddPage = useCallback(() => {
    setIsUpdatingPageCount(true);
    
    // Save current page complete state (content + settings) before switching
    const currentPageNumber = pageManager.getCurrentPageNumber();
    pageManager.updatePageShelves(currentPageNumber, shelves);
    pageManager.updatePageSettings(currentPageNumber, previewSettings);
    
    // Create new page
    const newPageNumber = pageManager.addPage();
    
    // Initialize new page with empty shelves (proper structure) and default settings
    const emptyShelvesForMode = buildEmptyShelvesForMode(currentAppState, menuMode, fiftyPercentOffEnabled);
    pageManager.updatePageShelves(newPageNumber, emptyShelvesForMode);
    // Don't set custom settings - let it use defaults
    
    // Navigate to the new empty page
    pageManager.goToPage(newPageNumber);
    
    // Force re-render to show new empty page with default settings
    forcePageUpdate();
    
    // Clear the flag after a short delay to allow UI to stabilize
    setTimeout(() => setIsUpdatingPageCount(false), 500);
  }, [pageManager, shelves, previewSettings, forcePageUpdate, menuMode]);
  
  // Duplicate current page (copy content + settings)
  const handleDuplicatePage = useCallback(() => {
    setIsUpdatingPageCount(true);
    
    // Save current page complete state
    const currentPageNumber = pageManager.getCurrentPageNumber();
    pageManager.updatePageShelves(currentPageNumber, shelves);
    pageManager.updatePageSettings(currentPageNumber, previewSettings);
    
    // Clone the current page
    const newPageNumber = pageManager.clonePage(currentPageNumber);
    if (newPageNumber) {
      // Switch to the duplicated page
      pageManager.goToPage(newPageNumber);
      forcePageUpdate();
    }
    
    // Clear the flag after a short delay to allow UI to stabilize
    setTimeout(() => setIsUpdatingPageCount(false), 500);
  }, [pageManager, shelves, previewSettings, forcePageUpdate]);

  const handleRemovePage = useCallback((pageNumber: number) => {
    setIsUpdatingPageCount(true);
    const success = pageManager.removePage(pageNumber);
    if (success) {
      setPreviewSettings(prev => ({
        ...prev,
        pageCount: pageManager.getPageCount(),
        currentPage: pageManager.getCurrentPageNumber()
      }));
      
      // Force re-render to update UI after page deletion
      forcePageUpdate();
    }
    // Clear the flag after a short delay to allow UI to stabilize
    setTimeout(() => setIsUpdatingPageCount(false), 500);
  }, [pageManager, forcePageUpdate]);

  const handleGoToPage = useCallback((pageNumber: number) => {
    // Save current page complete state (content + settings) before switching
    const currentPageNumber = pageManager.getCurrentPageNumber();
    pageManager.updatePageShelves(currentPageNumber, shelves);
    pageManager.updatePageSettings(currentPageNumber, previewSettings);
    
    // Navigate to target page
    const success = pageManager.goToPage(pageNumber);
    if (success) {
      // Force re-render to load target page's content and settings
      forcePageUpdate();
    }
  }, [pageManager, shelves, previewSettings, forcePageUpdate]);

  const handleToggleAutoPageBreaks = useCallback(() => {
    setIsUpdatingPageCount(true);
    setPreviewSettings(prev => ({
      ...prev,
      autoPageBreaks: !prev.autoPageBreaks
    }));
    // Clear the flag after a short delay to allow UI to stabilize
    setTimeout(() => setIsUpdatingPageCount(false), 500);
  }, []);

  const handleUpdateGlobalSortCriteria = useCallback((rawKey: SortCriteria['key'] | PrePackagedSortCriteria['key']) => {
    const normalizeKeyForMode = (inputKey: SortCriteria['key'] | PrePackagedSortCriteria['key']): SortCriteria['key'] | PrePackagedSortCriteria['key'] => {
      if (menuMode === MenuMode.PREPACKAGED) {
        if (inputKey === 'grower') return 'brand';
        if (inputKey === 'isLastJar') return 'isLowStock';
      } else {
        if (inputKey === 'brand') return 'grower';
        if (inputKey === 'isLowStock') return 'isLastJar';
      }
      return inputKey;
    };

    const key = normalizeKeyForMode(rawKey) as AnySortCriteria['key'];
    const currentPageNumber = pageManager.getCurrentPageNumber();
    const currentSort = pageManager.getPageGlobalSort(currentPageNumber);
    
    // Calculate new sort criteria with direction toggle
    let newCriteria: AnySortCriteria | null = null;
    if (currentSort && currentSort.key === key) {
      // Toggle direction or clear if clicking third time
      newCriteria = currentSort.direction === 'asc' 
        ? { key, direction: 'desc' }
        : null; // Third click clears sort
    } else {
      // New sort - default to desc for THC and stock indicators
      const defaultDirection = (key === 'thc' || key === 'isLastJar' || key === 'isLowStock') ? 'desc' : 'asc';
      newCriteria = { key, direction: defaultDirection };
    }
    
    // Update current page's global sort
    pageManager.updatePageGlobalSort(currentPageNumber, newCriteria);
    
    // Clear shelf-specific sorts on current page when applying global sort
    setShelves(prevShelves => prevShelves.map(shelf => ({ ...shelf, sortCriteria: null })));
    
    // Force re-render to show updated sort
    forcePageUpdate();
  }, [menuMode, pageManager, setShelves, forcePageUpdate]);

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
      syncMenuMode(MenuMode.BULK);
      setBulkShelves(getConfiguredBulkShelves(SupportedStates.OKLAHOMA, false));
      setPrePackagedShelves(getConfiguredPrepackagedShelves(SupportedStates.OKLAHOMA));
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
      forcePageUpdate();
      
      // Force app reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, [syncMenuMode, forcePageUpdate]);

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

  const handleToggleShelfPricingVisibility = useCallback((shelfId: string, showPricing: boolean) => {
    recordChange(() => {
      setShelves(prevShelves =>
        prevShelves.map(shelf =>
          shelf.id === shelfId ? { ...shelf, hidePricing: !showPricing } : shelf
        )
      );
    });
  }, [recordChange, setShelves]);


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

  // Multi-page batch export handlers (ZIP format)
  const handleExportPNGBatch = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true);
    
    try {
      const pageData = pageManager.getExportData(previewSettings);
      const getPageElement = async (pageNumber: number): Promise<HTMLElement> => {
        // Navigate to page if needed
        if (pageManager.getCurrentPageNumber() !== pageNumber) {
          pageManager.goToPage(pageNumber);
          forcePageUpdate();
          // Wait for page content to load
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Try multiple selectors to find the artboard element
        const selectors = [
          '.print-artboard-outer',
          '[data-testid*="artboard"]', 
          '[class*="artboard"]',
          '.preview-container',
          '[class*="preview"]'
        ];
        
        for (const selector of selectors) {
          const element = document.querySelector(selector) as HTMLElement;
          if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
            return element;
          }
        }
        
        // Fallback: Use the main preview area
        const mainPreview = document.querySelector('main > div') as HTMLElement;
        return mainPreview || document.body;
      };
      
      await ZipExporter.exportPagesToZip(
        pageData,
        exportFilename || 'mango-menu',
        'png',
        getPageElement
      );
    } catch (error) {
      console.error('PNG batch export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOverlay(false);
    }
  }, [isExporting, pageManager, previewSettings, exportFilename]);

  const handleExportJPEGBatch = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true);
    
    try {
      const pageData = pageManager.getExportData(previewSettings);
      const getPageElement = (pageNumber: number) => {
        // Navigate to page and return artboard element
        if (pageManager.getCurrentPageNumber() !== pageNumber) {
          pageManager.goToPage(pageNumber);
          forcePageUpdate();
          return new Promise<HTMLElement>((resolve) => {
            setTimeout(() => {
              const artboard = document.querySelector('.print-artboard-outer, [data-testid*="artboard"], [class*="artboard"], .preview-container') as HTMLElement;
              resolve(artboard || document.body);
            }, 100);
          });
        }
        const artboard = document.querySelector('[class*="artboard"], [class*="preview-artboard"], .preview-container') as HTMLElement;
        return artboard || document.body;
      };
      
      await ZipExporter.exportPagesToZip(
        pageData,
        exportFilename || 'mango-menu',
        'jpeg',
        getPageElement
      );
    } catch (error) {
      console.error('JPEG batch export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOverlay(false);
    }
  }, [isExporting, pageManager, previewSettings, exportFilename]);

  // Multi-page sequential export handlers (individual files)
  const handleExportPNGSequential = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true);
    
    try {
      const pageData = pageManager.getExportData(previewSettings);
      const getPageElement = (pageNumber: number) => {
        // Navigate to page and return artboard element
        if (pageManager.getCurrentPageNumber() !== pageNumber) {
          pageManager.goToPage(pageNumber);
          forcePageUpdate();
          return new Promise<HTMLElement>((resolve) => {
            setTimeout(() => {
              const artboard = document.querySelector('.print-artboard-outer, [data-testid*="artboard"], [class*="artboard"], .preview-container') as HTMLElement;
              resolve(artboard || document.body);
            }, 100);
          });
        }
        const artboard = document.querySelector('[class*="artboard"], [class*="preview-artboard"], .preview-container') as HTMLElement;
        return artboard || document.body;
      };
      
      await SequentialExporter.exportPagesSequentially(
        pageData,
        exportFilename || 'mango-menu',
        'png',
        getPageElement
      );
    } catch (error) {
      console.error('PNG sequential export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOverlay(false);
    }
  }, [isExporting, pageManager, previewSettings, exportFilename]);

  const handleExportJPEGSequential = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true);
    
    try {
      const pageData = pageManager.getExportData(previewSettings);
      const getPageElement = (pageNumber: number) => {
        // Navigate to page and return artboard element
        if (pageManager.getCurrentPageNumber() !== pageNumber) {
          pageManager.goToPage(pageNumber);
          forcePageUpdate();
          return new Promise<HTMLElement>((resolve) => {
            setTimeout(() => {
              const artboard = document.querySelector('.print-artboard-outer, [data-testid*="artboard"], [class*="artboard"], .preview-container') as HTMLElement;
              resolve(artboard || document.body);
            }, 100);
          });
        }
        const artboard = document.querySelector('[class*="artboard"], [class*="preview-artboard"], .preview-container') as HTMLElement;
        return artboard || document.body;
      };
      
      await SequentialExporter.exportPagesSequentially(
        pageData,
        exportFilename || 'mango-menu',
        'jpeg',
        getPageElement
      );
    } catch (error) {
      console.error('JPEG sequential export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOverlay(false);
    }
  }, [isExporting, pageManager, previewSettings, exportFilename]);

  // Helper function to generate CSV content for a specific page
  const generateCSVContentForPage = useCallback((page: any, mode: MenuMode, state: any) => {
    // Extract shelves from page data
    const pageShelves = page.shelves || [];
    
    if (mode === MenuMode.BULK) {
      // Generate bulk flower CSV
      const header = ["Category", "Strain Name", "Grower/Brand", "THC %", "Class", "Last Jar", "Sold Out", "Original Shelf"];
      const rows: string[][] = [];
      
      pageShelves.forEach((shelf: any) => {
        shelf.strains?.forEach((strain: any) => {
          rows.push([
            shelf.name,
            strain.name || "",
            strain.grower || "",
            strain.thc ? strain.thc.toString() : "",
            strain.type ? APP_STRAIN_TYPE_TO_CSV_SUFFIX[strain.type] || strain.type : "",
            strain.isLastJar ? "TRUE" : "FALSE",
            strain.isSoldOut ? "TRUE" : "FALSE",
            strain.originalShelf || ""
          ].map(field => `"${String(field).replace(/"/g, '""')}"`));
        });
      });
      
      return [header.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    } else {
      // Generate pre-packaged CSV
      const header = ["Category", "Product Name", "Brand", "Price", "THC %", "Terpenes %", "Class", "Net Weight", "Low Stock", "Sold Out", "Notes", "Original Shelf"];
      const rows: string[][] = [];
      
      pageShelves.forEach((shelf: any) => {
        shelf.products?.forEach((product: any) => {
          rows.push([
            shelf.name,
            product.name || "",
            product.brand || "",
            product.price ? product.price.toString() : "0",
            product.thc ? product.thc.toString() : "",
            product.terpenes ? product.terpenes.toString() : "",
            product.type ? APP_STRAIN_TYPE_TO_CSV_SUFFIX[product.type] || product.type : "",
            product.netWeight || "",
            product.isLowStock ? "TRUE" : "FALSE",
            product.isSoldOut ? "TRUE" : "FALSE",
            product.notes || "",
            product.originalShelf || ""
          ].map(field => `"${String(field).replace(/"/g, '""')}"`));
        });
      });
      
      return [header.join(','), ...rows.map(row => row.join(','))].join('\r\n');
    }
  }, []);

  // Multi-page CSV export handlers
  const handleExportCSVBatch = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true);
    
    try {
      const pageData = pageManager.getExportData(previewSettings);
      const generateCSVForPage = (page: any) => {
        return generateCSVContentForPage(page, menuMode, currentAppState);
      };
      
      await ZipExporter.exportPagesAsCSVZip(
        pageData,
        exportFilename || 'mango-menu',
        generateCSVForPage
      );
    } catch (error) {
      console.error('CSV batch export failed:', error);
      alert('CSV export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOverlay(false);
    }
  }, [isExporting, pageManager, previewSettings, exportFilename, menuMode, currentAppState, generateCSVContentForPage]);

  const handleExportCSVSequential = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setShowExportOverlay(true);
    
    try {
      const pageData = pageManager.getExportData(previewSettings);
      const generateCSVForPage = (page: any) => {
        return generateCSVContentForPage(page, menuMode, currentAppState);
      };
      
      await SequentialExporter.exportPagesSequentially(
        pageData,
        exportFilename || 'mango-menu',
        'csv',
        undefined, // No page element needed for CSV
        generateCSVForPage
      );
    } catch (error) {
      console.error('CSV sequential export failed:', error);
      alert('CSV export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setShowExportOverlay(false);
    }
  }, [isExporting, pageManager, previewSettings, exportFilename, menuMode, currentAppState, generateCSVContentForPage]);

  // Session management functions
  const handleQuickSave = useCallback(() => {
    try {
      const projectData = sessionManager.createProjectData(
        pageManager,
        previewSettings,
        menuMode,
        currentAppState,
        theme,
        'Quick Save'
      );
      
      sessionManager.autoSave(projectData);
      setLastSaveTime(new Date());
      
      addToast({
        message: 'Project saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Quick save failed:', error);
      addToast({
        message: 'Save failed. Please try again.',
        type: 'error'
      });
    }
  }, [sessionManager, pageManager, previewSettings, menuMode, currentAppState, theme, addToast]);

  const handleExportProject = useCallback(() => {
    try {
      const projectData = sessionManager.createProjectData(
        pageManager,
        previewSettings,
        menuMode,
        currentAppState,
        theme,
        exportFilename || 'Mango Menu Project'
      );
      
      sessionManager.exportProjectJSON(projectData, `${exportFilename || 'mango-menu-project'}.json`);
      
      addToast({
        message: 'Project exported successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Project export failed:', error);
      addToast({
        message: 'Export failed. Please try again.',
        type: 'error'
      });
    }
  }, [sessionManager, pageManager, previewSettings, menuMode, currentAppState, theme, exportFilename, addToast]);

  // Restore complete project data (defined early to avoid initialization order issues)
  const restoreProjectData = useCallback((projectData: ProjectData) => {
    try {
      // Restore menu mode and state
      if (projectData.metadata.menuMode !== menuMode) {
        syncMenuMode(projectData.metadata.menuMode);
      }
      if (projectData.metadata.currentState !== currentAppState) {
        setCurrentAppState(projectData.metadata.currentState);
      }
      
      // Restore theme
      if (projectData.userPreferences?.theme && projectData.userPreferences.theme !== theme) {
        setTheme(projectData.userPreferences.theme);
      }
      
      // Restore pages to PageManager
      pageManager.importPages(projectData.pages.map(page => ({
        shelves: page.shelves,
        settings: page.settings || undefined
      })));
      
      // Restore preview settings
      if (projectData.globalSettings) {
        setPreviewSettings(projectData.globalSettings);
      }
      
      // Force re-render to show restored content
      forcePageUpdate();
      
      // Clear auto-save since we've loaded fresh content
      sessionManager.clearAutoSave();
      
      console.log('Project data restored successfully');
    } catch (error) {
      console.error('Failed to restore project data:', error);
      addToast({
        message: 'Failed to restore session. Starting fresh.',
        type: 'error'
      });
    }
  }, [menuMode, currentAppState, theme, pageManager, syncMenuMode, setCurrentAppState, setTheme, setPreviewSettings, forcePageUpdate, addToast]);

  // Enhanced session management handlers
  const handleSaveAs = useCallback(async () => {
    try {
      // Generate default project name
      const defaultName = projectState.currentProjectName === 'Untitled Project' 
        ? `${menuMode} Menu - ${new Date().toLocaleDateString()}`
        : projectState.currentProjectName;

      const projectData = sessionManager.createProjectData(
        pageManager,
        previewSettings,
        menuMode,
        currentAppState,
        theme,
        defaultName
      );
      
      // Create JSON content
      const exportData = {
        version: APP_VERSION,
        exported: new Date().toISOString(),
        project: projectData
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Use Electron dialog if available, otherwise use browser API
      if (window.electronAPI?.showSaveDialog) {
        // Electron - use native save dialog
        try {
          const result = await window.electronAPI.showSaveDialog({
            title: 'Save Project',
            suggestedName: `${defaultName}.json`,
            filters: [
              { name: 'JSON Files', extensions: ['json'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          });
          
          if (result.canceled) return; // User cancelled
          
          await window.electronAPI.writeFile(result.filePath, jsonString);
          
          // Update project state with actual file name
          const fileName = result.filePath.split(/[\\\/]/).pop() || `${defaultName}.json`;
          sessionManager.setCurrentProject(result.filePath, defaultName);
        } catch (error) {
          throw error;
        }
      } else if ('showSaveFilePicker' in window) {
        // Modern browsers with File System Access API
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: `${defaultName}.json`,
            types: [{
              description: 'JSON files',
              accept: { 'application/json': ['.json'] }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          
          // Update project state with actual file name
          sessionManager.setCurrentProject(fileHandle.name, defaultName);
        } catch (error) {
          if (error.name !== 'AbortError') {
            throw error;
          }
          return; // User cancelled
        }
      } else {
        // Fallback for older browsers - use simple download
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${defaultName}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Update project state
        sessionManager.setCurrentProject(`${defaultName}.json`, defaultName);
      }
      
      // Update project state after successful save
      sessionManager.markClean();
      sessionManager.addToRecentProjects(projectData, `${defaultName}.json`);
      
      setProjectState(sessionManager.getProjectState());
      setLastSaveTime(new Date());
      
      addToast({
        message: `Project saved as "${defaultName}"`,
        type: 'success'
      });
    } catch (error) {
      console.error('Save As failed:', error);
      addToast({
        message: 'Save As failed. Please try again.',
        type: 'error'
      });
    }
  }, [sessionManager, pageManager, previewSettings, menuMode, currentAppState, theme, projectState, addToast]);

  const handleLoadProject = useCallback(async () => {
    // Use Electron dialog if available, otherwise use browser file input
    if (window.electronAPI?.showOpenDialog) {
      // Electron - use native open dialog
      try {
        const result = await window.electronAPI.showOpenDialog({
          title: 'Open Project',
          filters: [
            { name: 'JSON Files', extensions: ['json'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
        
        if (result.canceled || !result.filePaths || result.filePaths.length === 0) return;
        
        const filePath = result.filePaths[0];
        const jsonString = await window.electronAPI.readFileContent(filePath);
        const projectData = sessionManager.importProjectJSON(jsonString);
        
        if (projectData) {
          // Restore the loaded project
          restoreProjectData(projectData);
          
          // Update project state
          const fileName = filePath.split(/[\\\\\\/]/).pop() || 'project.json';
          sessionManager.setCurrentProject(filePath, projectData.metadata.name);
          sessionManager.markClean();
          sessionManager.addToRecentProjects(projectData, fileName);
          
          // Clear auto-save since we've loaded a new project
          sessionManager.clearAutoSave();
          
          setProjectState(sessionManager.getProjectState());
          
          addToast({
            message: `Project "${projectData.metadata.name}" loaded successfully`,
            type: 'success'
          });
        } else {
          throw new Error('Invalid project file');
        }
      } catch (error) {
        console.error('Load project failed:', error);
        addToast({
          message: 'Failed to load project file. Please check the file format.',
          type: 'error'
        });
      }
    } else {
      // Browser - use file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonString = event.target?.result as string;
            const projectData = sessionManager.importProjectJSON(jsonString);
            
            if (projectData) {
              // Restore the loaded project
              restoreProjectData(projectData);
              
              // Update project state
              sessionManager.setCurrentProject(file.name, projectData.metadata.name);
              sessionManager.markClean();
              sessionManager.addToRecentProjects(projectData, file.name);
              
              // Clear auto-save since we've loaded a new project
              sessionManager.clearAutoSave();
              
              setProjectState(sessionManager.getProjectState());
              
              addToast({
                message: `Project "${projectData.metadata.name}" loaded successfully`,
                type: 'success'
              });
            } else {
              throw new Error('Invalid project file');
            }
          } catch (error) {
            console.error('Load project failed:', error);
            addToast({
              message: 'Failed to load project file. Please check the file format.',
              type: 'error'
            });
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  }, [sessionManager, restoreProjectData, addToast]);

  const handleLoadRecentProject = useCallback((projectPath: string, projectName: string) => {
    try {
      // Load project data instantly from stored recent projects data
      const projectData = sessionManager.loadRecentProject(projectPath);
      
      if (projectData) {
        // Restore the project data
        restoreProjectData(projectData);
        
        // Update project state
        sessionManager.setCurrentProject(projectPath, projectName);
        sessionManager.markClean();
        
        // Clear auto-save since we've loaded a recent project
        sessionManager.clearAutoSave();
        
        setProjectState(sessionManager.getProjectState());
        
        addToast({
          message: `Project "${projectName}" loaded successfully`,
          type: 'success'
        });
      } else {
        throw new Error('Project data not found');
      }
    } catch (error) {
      console.error('Load recent project failed:', error);
      
      // Remove broken project from recent projects
      sessionManager.removeFromRecentProjects(projectPath);
      
      addToast({
        message: `Failed to load "${projectName}". Project removed from recent list.`,
        type: 'error'
      });
    }
  }, [sessionManager, restoreProjectData, addToast]);

  const handleQuickSaveUpdated = useCallback(async () => {
    if (projectState.isNewProject) {
      // If new project, act like Save As
      handleSaveAs();
    } else {
      // Save to current project file
      try {
        const projectData = sessionManager.createProjectData(
          pageManager,
          previewSettings,
          menuMode,
          currentAppState,
          theme,
          projectState.currentProjectName
        );
        
        // Create JSON content
        const exportData = {
          version: APP_VERSION,
          exported: new Date().toISOString(),
          project: projectData
        };
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Write to file if we have a file path (Electron) or update recent projects (browser)
        if (window.electronAPI?.writeFile && projectState.currentProjectPath) {
          // Electron - write to the actual file
          await window.electronAPI.writeFile(projectState.currentProjectPath, jsonString);
        }
        
        // Update recent projects and mark as clean
        sessionManager.addToRecentProjects(projectData, projectState.currentProjectPath);
        sessionManager.markClean();
        
        setProjectState(sessionManager.getProjectState());
        setLastSaveTime(new Date());
        
        addToast({
          message: 'Project saved',
          type: 'success'
        });
      } catch (error) {
        console.error('Quick save failed:', error);
        addToast({
          message: 'Save failed. Please try again.',
          type: 'error'
        });
      }
    }
  }, [projectState, sessionManager, pageManager, previewSettings, menuMode, currentAppState, theme, handleSaveAs, addToast]);


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

  const handleShowProjectMenu = useCallback(() => {
    setShowHeaderMenu(true);
  }, []);

  const handleOpenShelfConfigurator = useCallback(() => {
    setShowShelfConfigurator(true);
  }, []);

  const handleSaveShelfConfig = useCallback((shelvesToSave: (Shelf | PrePackagedShelf)[]) => {
    if (menuMode === MenuMode.BULK) {
      const existingMap = new Map(bulkShelves.map((shelf) => [shelf.id, shelf]));
      const mergedShelves = (shelvesToSave as Shelf[]).map((shelf) => {
        const existing = existingMap.get(shelf.id);
        return { ...shelf, strains: existing?.strains || [] };
      });
      const sanitized = mergedShelves.map((shelf) => ({ ...shelf, strains: [] }));
      shelfConfigStore.save(currentAppState, MenuMode.BULK, sanitized);
      setBulkShelves(mergedShelves);
      pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), mergedShelves);
    } else {
      const existingMap = new Map(prePackagedShelves.map((shelf) => [shelf.id, shelf]));
      const mergedShelves = (shelvesToSave as PrePackagedShelf[]).map((shelf) => {
        const existing = existingMap.get(shelf.id);
        return { ...shelf, products: existing?.products || [] };
      });
      const sanitized = mergedShelves.map((shelf) => ({ ...shelf, products: [] }));
      shelfConfigStore.save(currentAppState, MenuMode.PREPACKAGED, sanitized);
      setPrePackagedShelves(mergedShelves);
      pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), mergedShelves);
    }
    setShelfConfigVersion((v) => v + 1);
    setShowShelfConfigurator(false);
  }, [menuMode, currentAppState, pageManager, bulkShelves, prePackagedShelves]);

  const handleResetShelfConfig = useCallback(() => {
    shelfConfigStore.reset(currentAppState, menuMode);
    const defaults = menuMode === MenuMode.BULK
      ? getDefaultShelves(currentAppState, fiftyPercentOffEnabled)
      : getDefaultPrePackagedShelves(currentAppState);
    if (menuMode === MenuMode.BULK) {
      const emptyDefaults = defaults.map((shelf) => ({ ...shelf, strains: [] }));
      setBulkShelves(emptyDefaults);
      pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), emptyDefaults);
    } else {
      const emptyDefaults = defaults.map((shelf) => ({ ...shelf, products: [] }));
      setPrePackagedShelves(emptyDefaults);
      pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), emptyDefaults);
    }
    setShelfConfigVersion((v) => v + 1);
  }, [currentAppState, menuMode, fiftyPercentOffEnabled, pageManager]);

  const handleExportShelfConfig = useCallback(() => {
    return shelfConfigStore.export();
  }, []);

  const handleImportShelfConfig = useCallback((payload: string) => {
    const result = shelfConfigStore.importFromString(payload);
    if (result.success) {
      if (menuMode === MenuMode.BULK) {
        const updated = getConfiguredBulkShelves(currentAppState, fiftyPercentOffEnabled);
        setBulkShelves(updated);
        pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), updated);
      } else {
        const updated = getConfiguredPrepackagedShelves(currentAppState);
        setPrePackagedShelves(updated);
        pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), updated);
      }
      setShelfConfigVersion((v) => v + 1);
    }
    return result;
  }, [menuMode, currentAppState, fiftyPercentOffEnabled, pageManager]);

  const handleNewMenu = useCallback(() => {
    recordChange(() => {
      if (menuMode === MenuMode.BULK) {
        setBulkShelves(getConfiguredBulkShelves(currentAppState, fiftyPercentOffEnabled));
      } else {
        setPrePackagedShelves(getConfiguredPrepackagedShelves(currentAppState));
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
          syncMenuMode(detectedMode);
          forcePageUpdate();
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
  }, [menuMode, bulkShelves, prePackagedShelves, currentAppState, syncMenuMode, forcePageUpdate]);

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
  const handleCsvImport = useCallback((data: any[], mapping: any, options?: { createMissingShelves?: boolean }) => {
    // Invert the mapping to get field -> csvColumn mapping
    const fieldToColumn: Record<string, string> = {};
    Object.entries(mapping).forEach(([csvColumn, appField]) => {
      fieldToColumn[appField as string] = csvColumn;
    });
    const allowCreateShelves = options?.createMissingShelves === true;
    
    // Convert the imported data using the column mapping
    if (menuMode === MenuMode.BULK) {
      const importedStrainsByShelf: Record<string, Strain[]> = {};
      let importedCount = 0;
      const skippedRowsData: {rowIndex: number, rowData: any, reason: string}[] = [];
      let workingShelves = [...bulkShelves];
      const createdShelves: Shelf[] = [];

      // Get the shelf name map for quick lookup
      const shelfNameMap = new Map(workingShelves.map(s => [s.name.toLowerCase(), s.id]));

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

          let targetShelfId = shelfNameMap.get(shelfName.toLowerCase());
          if (!targetShelfId) {
            if (allowCreateShelves) {
              const newShelf: Shelf = {
                id: crypto.randomUUID(),
                name: shelfName,
                pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 },
                medicalPricing: undefined,
                color: 'bg-gray-500',
                textColor: 'text-white',
                strains: [],
                sortCriteria: null,
              };
              workingShelves = [...workingShelves, newShelf];
              shelfNameMap.set(shelfName.toLowerCase(), newShelf.id);
              createdShelves.push(newShelf);
              targetShelfId = newShelf.id;
            } else {
              const reason = `Unknown shelf/category "${shelfName}"`;
              skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
              console.warn(`Skipping row ${index + 2}: ${reason}`);
              return;
            }
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

      // Update shelves with imported data (including any newly created shelves)
      const mergedShelves = workingShelves.map(shelf => ({
        ...shelf,
        strains: [...shelf.strains, ...(importedStrainsByShelf[shelf.id] || [])]
      }));
      setBulkShelves(mergedShelves);
      pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), mergedShelves);

      // Set skipped rows data and messages
      setSkippedRows(skippedRowsData);
      addToast({
        type: 'success',
        title: 'Bulk Flower CSV Import Complete',
        message: `${importedCount} strains loaded.${createdShelves.length ? ` Created ${createdShelves.length} new shelf${createdShelves.length > 1 ? 's' : ''}.` : ''}`,
        duration: 5000
      });
    } else {
      // Pre-packaged import logic
      const importedProductsByShelf: Record<string, PrePackagedProduct[]> = {};
      let importedCount = 0;
      let shakeCount = 0;
      let flowerCount = 0;
      const skippedRowsData: {rowIndex: number, rowData: any, reason: string}[] = [];
      let workingShelves = [...prePackagedShelves];
      const createdShelves: PrePackagedShelf[] = [];

      const shelfNameMap = new Map(workingShelves.map(s => [s.name.toLowerCase(), s.id]));

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
            if (allowCreateShelves) {
              const newShelf: PrePackagedShelf = {
                id: crypto.randomUUID(),
                name: shelfName,
                color: 'bg-gray-500',
                textColor: 'text-white',
                products: [],
                sortCriteria: null,
              };
              workingShelves = [...workingShelves, newShelf];
              shelfNameMap.set(shelfName.toLowerCase(), newShelf.id);
              createdShelves.push(newShelf);
              targetShelfId = newShelf.id;
            } else {
              const reason = `Unknown weight category "${shelfName}" (tried "${smartShelfName}")`;
              skippedRowsData.push({rowIndex: index + 2, rowData: row, reason});
              console.warn(`Skipping row ${index + 2}: ${reason}. Available shelves: ${Array.from(shelfNameMap.keys()).join(', ')}`);
              return;
            }
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

      // Update shelves with imported data (including any newly created shelves)
      const mergedShelves = workingShelves.map(shelf => ({
        ...shelf,
        products: [...shelf.products, ...(importedProductsByShelf[shelf.id] || [])]
      }));
      setPrePackagedShelves(mergedShelves);
      pageManager.updatePageShelves(pageManager.getCurrentPageNumber(), mergedShelves);

      // Set skipped rows data and messages
      setSkippedRows(skippedRowsData);
      addToast({
        type: 'success',
        title: 'Pre-packaged CSV Import Complete',
        message: `${importedCount} products loaded.${createdShelves.length ? ` Created ${createdShelves.length} new shelf${createdShelves.length > 1 ? 's' : ''}.` : ''}`,
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
    
    // Clear auto-save since we've imported new content
    sessionManager.clearAutoSave();
    
    recordChange(() => {});
  }, [menuMode, bulkShelves, prePackagedShelves, recordChange, pageManager]);

  // Helper function to process CSV data into clean shelf structures
  const processCSVIntoShelves = useCallback((data: any[], mapping: any, baseShelves: any[]) => {
    const fieldToColumn: Record<string, string> = {};
    Object.entries(mapping).forEach(([csvColumn, appField]) => {
      fieldToColumn[appField as string] = csvColumn;
    });

    const resultShelves = baseShelves.map(shelf => ({ 
      ...shelf, 
      strains: [], 
      products: [],
      sortCriteria: null // Ensure no sorting is applied to imported shelves
    }));
    const shelfNameMap = new Map(baseShelves.map(s => [s.name.toLowerCase(), s.id]));

    data.forEach((row, index) => {
      try {
        const shelfName = fieldToColumn.shelf ? row[fieldToColumn.shelf] : '';
        const itemName = fieldToColumn.name ? row[fieldToColumn.name] : '';
        
        if (!shelfName || !itemName) return;

        const targetShelfId = shelfNameMap.get(shelfName.toLowerCase());
        const targetShelf = resultShelves.find(s => s.id === targetShelfId);
        if (!targetShelf) return;

        if (menuMode === MenuMode.BULK) {
          // Create strain
          const newStrain = {
            id: crypto.randomUUID(),
            name: itemName,
            grower: fieldToColumn.grower ? row[fieldToColumn.grower] || '' : '',
            thc: fieldToColumn.thc && row[fieldToColumn.thc] ? parseFloat(row[fieldToColumn.thc]) : null,
            type: fieldToColumn.type ? (CSV_STRAIN_TYPE_MAP[row[fieldToColumn.type]?.toUpperCase()?.replace(/[\s-./]/g, '')] || StrainType.HYBRID) : StrainType.HYBRID,
            isLastJar: fieldToColumn.lastJar ? ['true', 'yes', '1', 'lastjar', 'last jar'].includes(row[fieldToColumn.lastJar]?.toLowerCase()) : false,
            isSoldOut: fieldToColumn.soldOut ? ['true', 'yes', '1', 'soldout', 'sold out', 'unavailable'].includes(row[fieldToColumn.soldOut]?.toLowerCase()) : false,
            originalShelf: fieldToColumn.originalShelf ? row[fieldToColumn.originalShelf] || undefined : undefined
          };
          targetShelf.strains.push(newStrain);
        } else {
          // Create product
          const newProduct = {
            id: crypto.randomUUID(),
            name: itemName,
            brand: fieldToColumn.brand ? row[fieldToColumn.brand] || '' : '',
            thc: fieldToColumn.thc && row[fieldToColumn.thc] ? parseFloat(row[fieldToColumn.thc]) : null,
            terpenes: fieldToColumn.terpenes && row[fieldToColumn.terpenes] ? parseFloat(row[fieldToColumn.terpenes]) : null,
            type: fieldToColumn.type ? (CSV_STRAIN_TYPE_MAP[row[fieldToColumn.type]?.toUpperCase()?.replace(/[\s-./]/g, '')] || StrainType.HYBRID) : StrainType.HYBRID,
            price: fieldToColumn.price && row[fieldToColumn.price] ? parseFloat(row[fieldToColumn.price].replace(/[$,]/g, '')) : 0,
            isLowStock: fieldToColumn.isLowStock ? ['true', 'yes', '1', 'lowstock', 'low stock'].includes(row[fieldToColumn.isLowStock]?.toLowerCase()) : false,
            isSoldOut: fieldToColumn.soldOut ? ['true', 'yes', '1', 'soldout', 'sold out', 'unavailable'].includes(row[fieldToColumn.soldOut]?.toLowerCase()) : false,
            notes: fieldToColumn.notes ? row[fieldToColumn.notes] || undefined : undefined,
            originalShelf: fieldToColumn.originalShelf ? row[fieldToColumn.originalShelf] || undefined : undefined
          };
          targetShelf.products.push(newProduct);
        }
      } catch (error) {
        console.warn(`Error processing row ${index + 2}:`, error);
      }
    });

    return resultShelves;
  }, [menuMode, currentAppState, fiftyPercentOffEnabled]);

  // Multi-CSV import handler
  const handleMultiCsvImport = useCallback((files: any[], shouldSplitIntoPages: boolean) => {
    try {
      if (shouldSplitIntoPages) {
        // Create a separate page for each CSV file
        files.forEach((fileData, index) => {
          // Get fresh default shelves for this CSV
          const defaultShelves = menuMode === MenuMode.BULK 
            ? getConfiguredBulkShelves(currentAppState, fiftyPercentOffEnabled)
            : getConfiguredPrepackagedShelves(currentAppState);
          
          if (index === 0) {
            // Use current page for first file
            const currentPageNumber = pageManager.getCurrentPageNumber();
            // Process CSV data into fresh shelves
            const processedShelves = processCSVIntoShelves(fileData.data, fileData.mappingConfig, defaultShelves);
            pageManager.updatePageShelves(currentPageNumber, processedShelves);
            // Clear any sort criteria for this page to ensure natural order
            pageManager.updatePageGlobalSort(currentPageNumber, null);
          } else {
            // Create new page for subsequent files  
            const newPageNumber = pageManager.addPage();
            // Process CSV data into fresh shelves for this page
            const processedShelves = processCSVIntoShelves(fileData.data, fileData.mappingConfig, defaultShelves);
            pageManager.updatePageShelves(newPageNumber, processedShelves);
            // Clear any sort criteria for this page to ensure natural order
            pageManager.updatePageGlobalSort(newPageNumber, null);
            
            // Update the global preview settings to reflect new page count
            setPreviewSettings(prev => ({
              ...prev,
              pageCount: pageManager.getPageCount()
            }));
          }
        });
      } else {
        // Flatten all CSV data into current page
        // Combine all file data and import as single dataset
        let allData: any[] = [];
        files.forEach(fileData => {
          allData = [...allData, ...fileData.data];
        });
        // Clear current page first, then import combined data
        const currentPageNumber = pageManager.getCurrentPageNumber();
        pageManager.updatePageShelves(currentPageNumber, []);
        handleCsvImport(allData, files[0].mappingConfig, { createMissingShelves: files[0]?.createMissingShelves === true });
      }
      
      // Clear auto-save since we've imported new content
      sessionManager.clearAutoSave();
      
      forcePageUpdate();
      addToast({
        message: `Successfully imported ${files.length} CSV file${files.length > 1 ? 's' : ''}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Multi-CSV import failed:', error);
      addToast({
        message: 'Import failed. Please check your CSV files and try again.',
        type: 'error'
      });
    }
  }, [handleCsvImport, pageManager, setPreviewSettings, forcePageUpdate, addToast]);

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
        `ΓÜá∩╕Å WARNING: Switching to ${newMode} WILL DELETE your current ${menuMode.toLowerCase()} menu data.\n\n` +
        `Are you sure you want to continue?`;
        
      if (confirm(confirmMessage)) {
        syncMenuMode(newMode);
        forcePageUpdate();
        recordChange(() => {});
      }
    } else {
      syncMenuMode(newMode);
      forcePageUpdate();
    }
  }, [menuMode, bulkShelves, prePackagedShelves, recordChange, syncMenuMode, forcePageUpdate]);

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
    // Use page-specific shelves and sort criteria from PageManager
    const currentPageNumber = pageManager.getCurrentPageNumber();
    const currentPageShelves = shelves; // This comes from PageManager
    
    if (menuMode === MenuMode.BULK) {
      // Process current page's bulk flower shelves with page-specific sorting
      return currentPageShelves.map(shelf => {
        // Get effective sort criteria for this shelf on current page
        const activeSortCriteria = pageManager.getEffectiveShelfSort(currentPageNumber, shelf.id);
        return {
          ...shelf,
          strains: sortStrains(shelf.strains, activeSortCriteria, currentAppState) 
        };
      });
    } else {
      // Process current page's pre-packaged shelves with page-specific sorting
      return currentPageShelves.map(shelf => {
        // Get effective sort criteria for this shelf on current page
        const activeSortCriteria = pageManager.getEffectiveShelfSort(currentPageNumber, shelf.id);
        return {
          ...shelf,
          products: sortPrePackagedProducts(shelf.products, activeSortCriteria, currentAppState) 
        };
      }) as unknown as Shelf[]; // Type assertion for backward compatibility
    }
  }, [shelves, menuMode, currentAppState, pageChangeCounter, pageManager]);

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
              setBulkShelves(getConfiguredBulkShelves(currentAppState, fiftyPercentOffEnabled));
            } else {
              setPrePackagedShelves(getConfiguredPrepackagedShelves(currentAppState));
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
          const sortMap: Record<string, SortCriteria['key'] | PrePackagedSortCriteria['key']> = {
            'name': 'name',
            'grower': 'grower',
            'brand': 'brand',
            'class': 'type',
            'thc': 'thc',
            'lastjar': 'isLastJar',
            'lowstock': 'isLowStock',
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
          alert(`≡ƒÑ¡ Mango Cannabis Flower Menu Builder v${APP_VERSION}\n\nMango Cannabis Flower Menu Builder with dynamic pricing, state compliance, and beautiful export capabilities.\n\nDeveloped by Mango Cannabis\nContact: brad@mangocannabis.com`);
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
            syncMenuMode(MenuMode.BULK);
            setBulkShelves(getConfiguredBulkShelves(SupportedStates.OKLAHOMA, false));
            setPrePackagedShelves(getConfiguredPrepackagedShelves(SupportedStates.OKLAHOMA));
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
            forcePageUpdate();
            
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
            alert('Γ£à localStorage cleared! The app will reload with default settings.');
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
    syncMenuMode,
    forcePageUpdate,
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
        allowPrereleaseUpdates={allowPrereleaseUpdates}
        onTogglePreReleaseUpdates={handleTogglePreReleaseUpdates}
        onJumpToShelf={handleScrollToShelf}
        onShowProjectMenu={handleShowProjectMenu}
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
        currentPageNumber={pageManager.getCurrentPageNumber()}
        pageManager={pageManager}
        onQuickSave={handleQuickSaveUpdated}
        onLoadProject={handleLoadProject}
        onSaveAs={handleSaveAs}
        lastSaveTime={lastSaveTime}
        hasUnsavedChanges={projectState.hasUnsavedChanges}
        isNewProject={projectState.isNewProject}
        autoSaveEnabled={autoSaveEnabled}
        onToggleAutoSave={handleToggleAutoSave}
        onOpenShelfConfigurator={handleOpenShelfConfigurator}
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
              scrollTarget={pendingScrollTarget}
              onScrollTargetHandled={() => setPendingScrollTarget(null)}
              onToggleShelfPricingVisibility={handleToggleShelfPricingVisibility}
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
              scrollTarget={pendingScrollTarget}
              onScrollTargetHandled={() => setPendingScrollTarget(null)}
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
            onDuplicatePage={handleDuplicatePage}
            onRemovePage={handleRemovePage}
            onGoToPage={handleGoToPage}
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
        <ShelfConfiguratorModal
          isOpen={showShelfConfigurator}
          mode={menuMode}
          currentState={currentAppState}
          initialShelves={configuredShelvesForModal}
          defaultShelves={defaultShelvesForModal}
          onClose={() => setShowShelfConfigurator(false)}
          onSave={handleSaveShelfConfig}
          onResetToDefaults={handleResetShelfConfig}
          onExportConfig={handleExportShelfConfig}
          onImportConfig={handleImportShelfConfig}
        />
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
          currentShelves={menuMode === MenuMode.BULK ? bulkShelves : prePackagedShelves}
          onImport={handleCsvImport}
          onMultiImport={handleMultiCsvImport}
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
                  Γ£ò
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
                  Γ£ò
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
                        <div className="font-medium">≡ƒºá Automatic Detection</div>
                        <div className="mt-1">Products with "shake" in the name are automatically categorized under Shake shelves (e.g., "28g Shake")</div>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 border-green-500 ${theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'}`}>
                        <div className="font-medium">≡ƒî╕ Default to Flower</div>
                        <div className="mt-1">All other products are categorized under Flower shelves (e.g., "28g Flower", "3.5g Flower")</div>
                      </div>
                      <div className={`p-3 rounded-lg border-l-4 border-blue-500 ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                        <div className="font-medium">ΓÜÖ∩╕Å Manual Override</div>
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
          totalPages={pageManager.getPageCount()}
          onExportPNGBatch={handleExportPNGBatch}
          onExportJPEGBatch={handleExportJPEGBatch}
          onExportCSVBatch={handleExportCSVBatch}
          onExportPNGSequential={handleExportPNGSequential}
          onExportJPEGSequential={handleExportJPEGSequential}
          onExportCSVSequential={handleExportCSVSequential}
        />

        <HeaderMenuModal
          isOpen={showHeaderMenu}
          onClose={() => setShowHeaderMenu(false)}
          theme={theme}
          projectState={projectState}
          recentProjects={sessionManager.getRecentProjects()}
          autoSaveAvailable={sessionManager.hasAutoSave()}
          onQuickSave={handleQuickSaveUpdated}
          onSaveAs={handleSaveAs}
          onLoadProject={handleLoadProject}
          onLoadRecentProject={handleLoadRecentProject}
          onExportProject={handleExportProject}
          onRecoverAutoSave={() => {
            const recoveredData = sessionManager.loadAutoSave();
            if (recoveredData) {
              restoreProjectData(recoveredData);
              setShowHeaderMenu(false);
            }
          }}
          onExport={handleOpenExportModal}
          onImportCSV={handleImportCSVRequest}
          currentState={currentAppState}
          menuMode={menuMode}
          lastSaveTime={lastSaveTime}
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

