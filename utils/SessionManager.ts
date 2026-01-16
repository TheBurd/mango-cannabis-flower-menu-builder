import { PageManager, PageData } from './PageManager';
import { PreviewSettings, MenuMode, SupportedStates, Theme } from '../types';
import { getIndexedDBManager, IndexedDBManager } from './IndexedDBManager';

/**
 * SessionManager - Handles JSON-based session persistence and project management
 *
 * This class provides enterprise-grade session management including auto-save,
 * quick save/load slots, project export/import, and team collaboration features.
 *
 * Storage Strategy:
 * - Primary: IndexedDB (async, no size limit, better for large projects)
 * - Fallback: localStorage (sync, 5-10MB limit, for older browsers)
 *
 * The manager automatically uses IndexedDB when available and falls back
 * to localStorage for browsers that don't support it.
 */
export class SessionManager {
  private static readonly AUTO_SAVE_KEY = 'mango-auto-save';
  private static readonly SAVE_SLOTS_KEY = 'mango-save-slots';
  private static readonly USER_PREFERENCES_KEY = 'mango-user-preferences';
  private static readonly RECENT_PROJECTS_KEY = 'mango-recent-projects';
  private static readonly PROJECT_STATE_KEY = 'mango-project-state';
  private static readonly MAX_SAVE_SLOTS = 5;
  private static readonly MAX_RECENT_PROJECTS = 10;
  public static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds

  private autoSaveTimer: NodeJS.Timeout | null = null;
  private lastSaveTime: number = 0;
  private currentProjectState: ProjectState = {
    currentProjectPath: null,
    currentProjectName: 'Untitled Project',
    hasUnsavedChanges: false,
    lastSaveTime: null,
    lastAutoSaveTime: null,
    isNewProject: true
  };

  // IndexedDB manager for async storage
  private idbManager: IndexedDBManager | null = null;
  private idbInitialized: boolean = false;
  private idbInitPromise: Promise<boolean> | null = null;

  constructor() {
    this.setupAutoSave();
    this.initIndexedDB();
  }

  /**
   * Initialize IndexedDB asynchronously
   */
  private async initIndexedDB(): Promise<boolean> {
    if (this.idbInitPromise) {
      return this.idbInitPromise;
    }

    this.idbInitPromise = (async () => {
      try {
        this.idbManager = getIndexedDBManager();
        if (this.idbManager.available) {
          this.idbInitialized = await this.idbManager.initialize();
          if (this.idbInitialized) {
            console.log('IndexedDB initialized successfully');
          }
        }
      } catch (error) {
        console.warn('IndexedDB initialization failed, using localStorage fallback:', error);
        this.idbInitialized = false;
      }
      return this.idbInitialized;
    })();

    return this.idbInitPromise;
  }

  /**
   * Check if IndexedDB is available and initialized
   */
  public get useIndexedDB(): boolean {
    return this.idbInitialized && this.idbManager !== null;
  }

  /**
   * Wait for IndexedDB to be ready (for async operations)
   */
  public async waitForIndexedDB(): Promise<boolean> {
    if (this.idbInitPromise) {
      return this.idbInitPromise;
    }
    return false;
  }

  /**
   * Create complete project data from current app state
   */
  public createProjectData(
    pageManager: PageManager,
    previewSettings: PreviewSettings,
    menuMode: MenuMode,
    currentState: SupportedStates,
    theme: Theme,
    projectName: string = 'Untitled Menu'
  ): ProjectData {
    const pages = pageManager.getAllPages();
    const totalItems = pages.reduce((total, page) => {
      return total + page.shelves.reduce((pageTotal, shelf) => {
        const itemCount = 'strains' in shelf ? shelf.strains.length : shelf.products?.length || 0;
        return pageTotal + itemCount;
      }, 0);
    }, 0);

    const metadata: ProjectMetadata = {
      id: crypto.randomUUID(),
      name: projectName,
      description: `${menuMode} menu for ${currentState}`,
      version: '1.1.2',
      created: new Date(),
      lastModified: new Date(),
      owner: 'User', // Will be replaced with actual user system
      tags: [menuMode.toLowerCase(), currentState.toLowerCase().replace(' ', '-')],
      totalPages: pages.length,
      totalItems,
      menuMode,
      currentState
    };

    const userPreferences: UserPreferences = {
      theme,
      autoSaveEnabled: true,
      autoSaveInterval: this.constructor.AUTO_SAVE_INTERVAL,
      defaultExportFormat: 'png',
      defaultNamingPattern: '{base}-page-{page}',
      recentProjects: [],
      favoriteTemplates: []
    };

    return {
      metadata,
      pages: pages.map(page => ({
        ...page,
        // Ensure serializable data
        shelfSortOverrides: Array.from(page.shelfSortOverrides.entries())
      })),
      globalSettings: previewSettings,
      userPreferences,
      exportHistory: []
    };
  }

  /**
   * Save current session to auto-save slot
   * Uses IndexedDB when available for better performance with large projects
   */
  public autoSave(projectData: ProjectData): void {
    // Try IndexedDB first (async, non-blocking)
    if (this.useIndexedDB && this.idbManager) {
      this.idbManager.saveAutoSave(projectData)
        .then(() => {
          this.lastSaveTime = Date.now();
          console.log('Auto-save completed (IndexedDB):', new Date().toLocaleTimeString());
        })
        .catch((error) => {
          console.warn('IndexedDB auto-save failed, falling back to localStorage:', error);
          this.autoSaveToLocalStorage(projectData);
        });
    } else {
      // Fallback to localStorage
      this.autoSaveToLocalStorage(projectData);
    }
  }

  /**
   * Save to localStorage (fallback method)
   */
  private autoSaveToLocalStorage(projectData: ProjectData): void {
    try {
      const autoSaveData = {
        timestamp: new Date().toISOString(),
        data: projectData
      };

      localStorage.setItem(SessionManager.AUTO_SAVE_KEY, JSON.stringify(autoSaveData));
      this.lastSaveTime = Date.now();

      console.log('Auto-save completed (localStorage):', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  /**
   * Load auto-saved session (async version that tries IndexedDB first)
   */
  public async loadAutoSaveAsync(): Promise<ProjectData | null> {
    // Try IndexedDB first
    if (this.useIndexedDB && this.idbManager) {
      try {
        const data = await this.idbManager.loadAutoSave();
        if (data) {
          console.log('Loaded auto-save from IndexedDB');
          return data;
        }
      } catch (error) {
        console.warn('IndexedDB load failed, trying localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.loadAutoSave();
  }

  /**
   * Load auto-saved session (sync version, localStorage only)
   */
  public loadAutoSave(): ProjectData | null {
    try {
      const savedData = localStorage.getItem(SessionManager.AUTO_SAVE_KEY);
      if (!savedData) return null;

      const autoSaveData = JSON.parse(savedData);

      // Restore Map objects from serialized arrays
      if (autoSaveData.data.pages) {
        autoSaveData.data.pages.forEach((page: any) => {
          if (page.shelfSortOverrides && Array.isArray(page.shelfSortOverrides)) {
            page.shelfSortOverrides = new Map(page.shelfSortOverrides);
          }
        });
      }

      return autoSaveData.data;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  /**
   * Save to numbered slot (1-5)
   * Async version that uses IndexedDB when available
   */
  public async saveToSlotAsync(slotNumber: number, projectData: ProjectData, slotName: string): Promise<boolean> {
    if (slotNumber < 1 || slotNumber > SessionManager.MAX_SAVE_SLOTS) {
      throw new Error(`Invalid slot number. Must be between 1 and ${SessionManager.MAX_SAVE_SLOTS}`);
    }

    // Try IndexedDB first
    if (this.useIndexedDB && this.idbManager) {
      try {
        return await this.idbManager.saveToSlot(slotNumber, projectData, slotName);
      } catch (error) {
        console.warn('IndexedDB save failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.saveToSlot(slotNumber, projectData, slotName);
  }

  /**
   * Save to numbered slot (1-5) - sync version (localStorage only)
   */
  public saveToSlot(slotNumber: number, projectData: ProjectData, slotName: string): boolean {
    if (slotNumber < 1 || slotNumber > SessionManager.MAX_SAVE_SLOTS) {
      throw new Error(`Invalid slot number. Must be between 1 and ${SessionManager.MAX_SAVE_SLOTS}`);
    }

    try {
      const saveSlots = this.getSaveSlots();

      const saveSlot: SaveSlot = {
        id: crypto.randomUUID(),
        name: slotName,
        timestamp: new Date(),
        metadata: projectData.metadata,
        data: projectData
      };

      saveSlots[slotNumber - 1] = saveSlot;
      localStorage.setItem(SessionManager.SAVE_SLOTS_KEY, JSON.stringify(saveSlots));

      return true;
    } catch (error) {
      console.error('Failed to save to slot:', error);
      return false;
    }
  }

  /**
   * Load from numbered slot - async version
   */
  public async loadFromSlotAsync(slotNumber: number): Promise<ProjectData | null> {
    if (slotNumber < 1 || slotNumber > SessionManager.MAX_SAVE_SLOTS) {
      throw new Error(`Invalid slot number. Must be between 1 and ${SessionManager.MAX_SAVE_SLOTS}`);
    }

    // Try IndexedDB first
    if (this.useIndexedDB && this.idbManager) {
      try {
        const data = await this.idbManager.loadFromSlot(slotNumber);
        if (data) {
          console.log('Loaded from slot (IndexedDB)');
          return data;
        }
      } catch (error) {
        console.warn('IndexedDB load failed, trying localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.loadFromSlot(slotNumber);
  }

  /**
   * Load from numbered slot - sync version (localStorage only)
   */
  public loadFromSlot(slotNumber: number): ProjectData | null {
    if (slotNumber < 1 || slotNumber > SessionManager.MAX_SAVE_SLOTS) {
      throw new Error(`Invalid slot number. Must be between 1 and ${SessionManager.MAX_SAVE_SLOTS}`);
    }

    try {
      const saveSlots = this.getSaveSlots();
      const saveSlot = saveSlots[slotNumber - 1];

      if (!saveSlot) return null;

      // Restore Map objects from serialized data
      if (saveSlot.data.pages) {
        saveSlot.data.pages.forEach((page: any) => {
          if (page.shelfSortOverrides && Array.isArray(page.shelfSortOverrides)) {
            page.shelfSortOverrides = new Map(page.shelfSortOverrides);
          }
        });
      }

      return saveSlot.data;
    } catch (error) {
      console.error('Failed to load from slot:', error);
      return null;
    }
  }

  /**
   * Get all save slots - async version
   */
  public async getSaveSlotsAsync(): Promise<(SaveSlot | null)[]> {
    // Try IndexedDB first
    if (this.useIndexedDB && this.idbManager) {
      try {
        return await this.idbManager.getSaveSlots();
      } catch (error) {
        console.warn('IndexedDB getSaveSlots failed, trying localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.getSaveSlots();
  }

  /**
   * Get all save slots - sync version (localStorage only)
   */
  public getSaveSlots(): (SaveSlot | null)[] {
    try {
      const savedSlots = localStorage.getItem(SessionManager.SAVE_SLOTS_KEY);
      if (!savedSlots) {
        return new Array(SessionManager.MAX_SAVE_SLOTS).fill(null);
      }

      return JSON.parse(savedSlots);
    } catch (error) {
      console.error('Failed to get save slots:', error);
      return new Array(SessionManager.MAX_SAVE_SLOTS).fill(null);
    }
  }

  /**
   * Export project as JSON file
   */
  public exportProjectJSON(projectData: ProjectData, filename?: string): void {
    try {
      const exportData = {
        version: '1.1.2',
        exported: new Date().toISOString(),
        project: projectData
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${projectData.metadata.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project JSON:', error);
    }
  }

  /**
   * Import project from JSON file
   */
  public importProjectJSON(jsonString: string): ProjectData | null {
    try {
      const importData = JSON.parse(jsonString);
      
      // Validate import data structure
      if (!importData.project || !importData.project.metadata) {
        throw new Error('Invalid project file format');
      }

      const projectData = importData.project;

      // Restore Map objects from serialized data
      if (projectData.pages) {
        projectData.pages.forEach((page: any) => {
          if (page.shelfSortOverrides && Array.isArray(page.shelfSortOverrides)) {
            page.shelfSortOverrides = new Map(page.shelfSortOverrides);
          }
        });
      }

      return projectData;
    } catch (error) {
      console.error('Failed to import project JSON:', error);
      return null;
    }
  }

  /**
   * Setup auto-save system
   */
  public setupAutoSave(): void {
    // Clear any existing timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    // Auto-save will be triggered by the app when data changes
    // The timer is just a fallback for safety
    this.autoSaveTimer = setInterval(() => {
      // This will be called by the app with current data
      const lastSave = Date.now() - this.lastSaveTime;
      if (lastSave > SessionManager.AUTO_SAVE_INTERVAL) {
        console.log('Auto-save timer triggered (fallback)');
      }
    }, SessionManager.AUTO_SAVE_INTERVAL);
  }

  /**
   * Clear auto-save data from both storage backends
   */
  public clearAutoSave(): void {
    // Clear from localStorage
    localStorage.removeItem(SessionManager.AUTO_SAVE_KEY);

    // Also clear from IndexedDB if available
    if (this.useIndexedDB && this.idbManager) {
      this.idbManager.clearAutoSave().catch((error) => {
        console.warn('Failed to clear IndexedDB auto-save:', error);
      });
    }
  }

  /**
   * Check if auto-save data exists - async version
   */
  public async hasAutoSaveAsync(): Promise<boolean> {
    // Check IndexedDB first
    if (this.useIndexedDB && this.idbManager) {
      try {
        const hasIDB = await this.idbManager.hasAutoSave();
        if (hasIDB) return true;
      } catch (error) {
        console.warn('IndexedDB hasAutoSave check failed:', error);
      }
    }

    // Fallback to localStorage
    return this.hasAutoSave();
  }

  /**
   * Check if auto-save data exists - sync version (localStorage only)
   */
  public hasAutoSave(): boolean {
    return localStorage.getItem(SessionManager.AUTO_SAVE_KEY) !== null;
  }

  /**
   * Get auto-save info without loading full data - async version
   */
  public async getAutoSaveInfoAsync(): Promise<{ timestamp: string; hasData: boolean } | null> {
    // Check IndexedDB first
    if (this.useIndexedDB && this.idbManager) {
      try {
        const info = await this.idbManager.getAutoSaveInfo();
        if (info) {
          return {
            timestamp: info.timestamp.toISOString(),
            hasData: info.hasData
          };
        }
      } catch (error) {
        console.warn('IndexedDB getAutoSaveInfo failed:', error);
      }
    }

    // Fallback to localStorage
    return this.getAutoSaveInfo();
  }

  /**
   * Get auto-save info without loading full data - sync version (localStorage only)
   */
  public getAutoSaveInfo(): { timestamp: string; hasData: boolean } | null {
    try {
      const savedData = localStorage.getItem(SessionManager.AUTO_SAVE_KEY);
      if (!savedData) return null;

      const autoSaveData = JSON.parse(savedData);
      return {
        timestamp: autoSaveData.timestamp,
        hasData: !!autoSaveData.data
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get storage usage information
   */
  public async getStorageInfo(): Promise<{ used: number; quota: number; percentage: number; backend: 'indexeddb' | 'localstorage' }> {
    if (this.useIndexedDB && this.idbManager) {
      try {
        const estimate = await this.idbManager.getStorageEstimate();
        return { ...estimate, backend: 'indexeddb' };
      } catch (error) {
        console.warn('Failed to get IndexedDB storage estimate:', error);
      }
    }

    // Estimate localStorage usage (rough estimate)
    let used = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
      used *= 2; // UTF-16 characters are 2 bytes each
    } catch (error) {
      console.warn('Failed to estimate localStorage usage:', error);
    }

    return {
      used,
      quota: 5 * 1024 * 1024, // Approximate localStorage limit (5MB)
      percentage: Math.round((used / (5 * 1024 * 1024)) * 100),
      backend: 'localstorage'
    };
  }

  /**
   * Set current project information
   */
  public setCurrentProject(path: string | null, name: string): void {
    this.currentProjectState.currentProjectPath = path;
    this.currentProjectState.currentProjectName = name;
    this.currentProjectState.isNewProject = path === null;
    this.currentProjectState.lastSaveTime = path ? new Date() : null;
    this.saveProjectState();
  }

  /**
   * Mark project as having unsaved changes
   */
  public markDirty(): void {
    this.currentProjectState.hasUnsavedChanges = true;
    this.saveProjectState();
  }

  /**
   * Mark project as clean (saved)
   */
  public markClean(): void {
    this.currentProjectState.hasUnsavedChanges = false;
    this.currentProjectState.lastSaveTime = new Date();
    this.saveProjectState();
  }

  /**
   * Get current project state
   */
  public getProjectState(): ProjectState {
    return { ...this.currentProjectState };
  }

  /**
   * Add project to recent projects list with full project data
   */
  public addToRecentProjects(projectData: ProjectData, filePath?: string): void {
    try {
      const recentProjects = this.getRecentProjects();
      
      const recentProject: RecentProject = {
        id: projectData.metadata.id,
        name: projectData.metadata.name,
        path: filePath || '',
        lastModified: new Date(),
        metadata: projectData.metadata,
        thumbnail: '', // Will be generated separately
        pages: projectData.pages.length,
        items: projectData.metadata.totalItems,
        projectData: projectData // Store full project data for instant loading
      };

      // Remove existing entries with same name OR path to prevent duplicates
      const filtered = recentProjects.filter(p => 
        p.name !== recentProject.name && 
        p.path !== recentProject.path &&
        p.id !== recentProject.id
      );
      const updated = [recentProject, ...filtered].slice(0, SessionManager.MAX_RECENT_PROJECTS);
      
      localStorage.setItem(SessionManager.RECENT_PROJECTS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to add to recent projects:', error);
    }
  }

  /**
   * Load project data from recent projects instantly
   */
  public loadRecentProject(projectPath: string): ProjectData | null {
    try {
      const recentProjects = this.getRecentProjects();
      const project = recentProjects.find(p => p.path === projectPath);
      
      if (!project || !project.projectData) {
        throw new Error('Project not found in recent projects list');
      }

      // Return the stored project data instantly
      return project.projectData;
    } catch (error) {
      console.error('Failed to load recent project:', error);
      return null;
    }
  }

  /**
   * Remove project from recent projects (for broken/missing files)
   */
  public removeFromRecentProjects(projectPath: string): void {
    try {
      const recentProjects = this.getRecentProjects();
      const filtered = recentProjects.filter(p => p.path !== projectPath);
      localStorage.setItem(SessionManager.RECENT_PROJECTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from recent projects:', error);
    }
  }

  /**
   * Get recent projects list
   */
  public getRecentProjects(): RecentProject[] {
    try {
      const saved = localStorage.getItem(SessionManager.RECENT_PROJECTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to get recent projects:', error);
      return [];
    }
  }

  /**
   * Save project state to localStorage
   */
  private saveProjectState(): void {
    try {
      localStorage.setItem(SessionManager.PROJECT_STATE_KEY, JSON.stringify(this.currentProjectState));
    } catch (error) {
      console.error('Failed to save project state:', error);
    }
  }

  /**
   * Load project state from localStorage
   */
  private loadProjectState(): void {
    try {
      const saved = localStorage.getItem(SessionManager.PROJECT_STATE_KEY);
      if (saved) {
        this.currentProjectState = { ...this.currentProjectState, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load project state:', error);
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}

// Type definitions for use in components
export interface ProjectData {
  metadata: ProjectMetadata;
  pages: PageData[];
  globalSettings: PreviewSettings;
  userPreferences: UserPreferences;
  exportHistory: ExportRecord[];
}

export interface ProjectMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  created: Date;
  lastModified: Date;
  owner: string;
  tags: string[];
  totalPages: number;
  totalItems: number;
  menuMode: MenuMode;
  currentState: SupportedStates;
}

export interface UserPreferences {
  theme: Theme;
  autoSaveEnabled: boolean;
  autoSaveInterval: number;
  defaultExportFormat: string;
  defaultNamingPattern: string;
  recentProjects: string[];
  favoriteTemplates: string[];
}

export interface ExportRecord {
  timestamp: Date;
  format: string;
  filename: string;
  pageCount: number;
  exportMode: string;
}

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: Date;
  thumbnail?: string;
  metadata: ProjectMetadata;
  data: ProjectData;
}

export interface ProjectState {
  currentProjectPath: string | null;
  currentProjectName: string;
  hasUnsavedChanges: boolean;
  lastSaveTime: Date | null;
  lastAutoSaveTime: Date | null;
  isNewProject: boolean;
}

export interface RecentProject {
  id: string;
  name: string;
  path: string;
  lastModified: Date;
  metadata: ProjectMetadata;
  thumbnail: string;
  pages: number;
  items: number;
  projectData?: ProjectData; // Store full project data for instant loading
}
