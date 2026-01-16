/**
 * IndexedDBManager - High-performance async storage for large datasets
 *
 * Replaces localStorage for project data with benefits:
 * - No 5-10MB storage limit (typically 50MB+, can request more)
 * - Async operations don't block the UI
 * - Structured data storage with indexes
 * - Transaction support for data integrity
 * - Delta/incremental saves to reduce write overhead
 *
 * Database Schema:
 * - projects: Full project metadata
 * - pages: Individual page data (for delta saves)
 * - shelves: Individual shelf data (for granular updates)
 * - autoSave: Auto-save snapshots
 * - saveSlots: Quick save slots (1-5)
 * - recentProjects: Recent project list
 * - preferences: User preferences
 */

import type { ProjectData, ProjectMetadata, SaveSlot, RecentProject, UserPreferences } from './SessionManager';
import type { PageData } from './PageManager';
import type { AnyShelf } from '../types';

// Database version - increment when schema changes
const DB_VERSION = 1;
const DB_NAME = 'MangoMenuBuilder';

// Store names
const STORES = {
  PROJECTS: 'projects',
  PAGES: 'pages',
  SHELVES: 'shelves',
  AUTO_SAVE: 'autoSave',
  SAVE_SLOTS: 'saveSlots',
  RECENT_PROJECTS: 'recentProjects',
  PREFERENCES: 'preferences',
  CHANGE_LOG: 'changeLog',
} as const;

// Types for stored data
export interface StoredProject {
  id: string;
  metadata: ProjectMetadata;
  globalSettings: any;
  userPreferences: UserPreferences;
  exportHistory: any[];
  pageIds: string[]; // References to pages store
  lastModified: Date;
}

export interface StoredPage {
  id: string;
  projectId: string;
  pageNumber: number;
  shelfIds: string[]; // References to shelves store
  settings: any;
  lastModified: Date;
}

export interface StoredShelf {
  id: string;
  projectId: string;
  pageId: string;
  data: AnyShelf;
  lastModified: Date;
  checksum: string; // For delta detection
}

export interface StoredAutoSave {
  id: string;
  timestamp: Date;
  projectData: ProjectData;
  compressed?: boolean;
}

export interface ChangeLogEntry {
  id: string;
  timestamp: Date;
  type: 'shelf' | 'page' | 'project' | 'settings';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  previousChecksum?: string;
  newChecksum?: string;
}

/**
 * Simple checksum for detecting data changes
 */
function calculateChecksum(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * IndexedDBManager - Manages all IndexedDB operations
 */
export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof indexedDB !== 'undefined';
  }

  /**
   * Check if IndexedDB is available
   */
  public get available(): boolean {
    return this.isSupported;
  }

  /**
   * Initialize and open the database
   */
  public async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      return false;
    }

    try {
      this.db = await this.openDatabase();
      return true;
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      return false;
    }
  }

  /**
   * Open/create the database with schema
   */
  private openDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });

    return this.dbPromise;
  }

  /**
   * Create object stores and indexes
   */
  private createStores(db: IDBDatabase): void {
    // Projects store
    if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
      const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      projectStore.createIndex('lastModified', 'lastModified', { unique: false });
      projectStore.createIndex('name', 'metadata.name', { unique: false });
    }

    // Pages store
    if (!db.objectStoreNames.contains(STORES.PAGES)) {
      const pageStore = db.createObjectStore(STORES.PAGES, { keyPath: 'id' });
      pageStore.createIndex('projectId', 'projectId', { unique: false });
      pageStore.createIndex('projectPage', ['projectId', 'pageNumber'], { unique: true });
    }

    // Shelves store
    if (!db.objectStoreNames.contains(STORES.SHELVES)) {
      const shelfStore = db.createObjectStore(STORES.SHELVES, { keyPath: 'id' });
      shelfStore.createIndex('projectId', 'projectId', { unique: false });
      shelfStore.createIndex('pageId', 'pageId', { unique: false });
      shelfStore.createIndex('checksum', 'checksum', { unique: false });
    }

    // Auto-save store (single entry, always key 'current')
    if (!db.objectStoreNames.contains(STORES.AUTO_SAVE)) {
      db.createObjectStore(STORES.AUTO_SAVE, { keyPath: 'id' });
    }

    // Save slots store
    if (!db.objectStoreNames.contains(STORES.SAVE_SLOTS)) {
      const slotsStore = db.createObjectStore(STORES.SAVE_SLOTS, { keyPath: 'slotNumber' });
      slotsStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Recent projects store
    if (!db.objectStoreNames.contains(STORES.RECENT_PROJECTS)) {
      const recentStore = db.createObjectStore(STORES.RECENT_PROJECTS, { keyPath: 'id' });
      recentStore.createIndex('lastModified', 'lastModified', { unique: false });
    }

    // Preferences store
    if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
      db.createObjectStore(STORES.PREFERENCES, { keyPath: 'key' });
    }

    // Change log for delta tracking
    if (!db.objectStoreNames.contains(STORES.CHANGE_LOG)) {
      const changeStore = db.createObjectStore(STORES.CHANGE_LOG, { keyPath: 'id' });
      changeStore.createIndex('timestamp', 'timestamp', { unique: false });
      changeStore.createIndex('entityId', 'entityId', { unique: false });
    }
  }

  /**
   * Get the database instance (initializes if needed)
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.openDatabase();
  }

  // ============================================
  // AUTO-SAVE OPERATIONS
  // ============================================

  /**
   * Save auto-save data
   */
  public async saveAutoSave(projectData: ProjectData): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.AUTO_SAVE], 'readwrite');
      const store = transaction.objectStore(STORES.AUTO_SAVE);

      const autoSave: StoredAutoSave = {
        id: 'current',
        timestamp: new Date(),
        projectData,
      };

      const request = store.put(autoSave);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load auto-save data
   */
  public async loadAutoSave(): Promise<ProjectData | null> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.AUTO_SAVE], 'readonly');
      const store = transaction.objectStore(STORES.AUTO_SAVE);
      const request = store.get('current');

      request.onsuccess = () => {
        const result = request.result as StoredAutoSave | undefined;
        if (result) {
          // Restore Map objects from serialized data
          this.restoreMapObjects(result.projectData);
          resolve(result.projectData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if auto-save exists
   */
  public async hasAutoSave(): Promise<boolean> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.AUTO_SAVE], 'readonly');
      const store = transaction.objectStore(STORES.AUTO_SAVE);
      const request = store.count();

      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get auto-save info without loading full data
   */
  public async getAutoSaveInfo(): Promise<{ timestamp: Date; hasData: boolean } | null> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.AUTO_SAVE], 'readonly');
      const store = transaction.objectStore(STORES.AUTO_SAVE);
      const request = store.get('current');

      request.onsuccess = () => {
        const result = request.result as StoredAutoSave | undefined;
        if (result) {
          resolve({
            timestamp: result.timestamp,
            hasData: !!result.projectData,
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear auto-save data
   */
  public async clearAutoSave(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.AUTO_SAVE], 'readwrite');
      const store = transaction.objectStore(STORES.AUTO_SAVE);
      const request = store.delete('current');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // SAVE SLOTS OPERATIONS
  // ============================================

  /**
   * Save to a numbered slot (1-5)
   */
  public async saveToSlot(slotNumber: number, projectData: ProjectData, slotName: string): Promise<boolean> {
    if (slotNumber < 1 || slotNumber > 5) {
      throw new Error('Invalid slot number. Must be between 1 and 5');
    }

    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SAVE_SLOTS], 'readwrite');
      const store = transaction.objectStore(STORES.SAVE_SLOTS);

      const saveSlot: SaveSlot & { slotNumber: number } = {
        slotNumber,
        id: crypto.randomUUID(),
        name: slotName,
        timestamp: new Date(),
        metadata: projectData.metadata,
        data: projectData,
      };

      const request = store.put(saveSlot);

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        console.error('Failed to save to slot:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Load from a numbered slot
   */
  public async loadFromSlot(slotNumber: number): Promise<ProjectData | null> {
    if (slotNumber < 1 || slotNumber > 5) {
      throw new Error('Invalid slot number. Must be between 1 and 5');
    }

    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SAVE_SLOTS], 'readonly');
      const store = transaction.objectStore(STORES.SAVE_SLOTS);
      const request = store.get(slotNumber);

      request.onsuccess = () => {
        const result = request.result as (SaveSlot & { slotNumber: number }) | undefined;
        if (result) {
          this.restoreMapObjects(result.data);
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all save slots
   */
  public async getSaveSlots(): Promise<(SaveSlot | null)[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SAVE_SLOTS], 'readonly');
      const store = transaction.objectStore(STORES.SAVE_SLOTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as (SaveSlot & { slotNumber: number })[];
        const slots: (SaveSlot | null)[] = new Array(5).fill(null);

        results.forEach((slot) => {
          if (slot.slotNumber >= 1 && slot.slotNumber <= 5) {
            slots[slot.slotNumber - 1] = slot;
          }
        });

        resolve(slots);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // RECENT PROJECTS OPERATIONS
  // ============================================

  /**
   * Add project to recent projects
   */
  public async addToRecentProjects(project: RecentProject): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.RECENT_PROJECTS], 'readwrite');
      const store = transaction.objectStore(STORES.RECENT_PROJECTS);

      // First, get all existing to check for duplicates
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const existing = getAllRequest.result as RecentProject[];

        // Remove duplicates by name, path, or id
        const toDelete = existing.filter(
          (p) => p.name === project.name || p.path === project.path || p.id === project.id
        );

        // Delete duplicates
        toDelete.forEach((p) => store.delete(p.id));

        // Add new project
        store.put(project);

        // Trim to max 10 projects (keep most recent)
        const sorted = [...existing.filter((p) => !toDelete.includes(p)), project]
          .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
          .slice(0, 10);

        // Delete any beyond limit
        existing
          .filter((p) => !sorted.find((s) => s.id === p.id))
          .forEach((p) => store.delete(p.id));
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get recent projects list
   */
  public async getRecentProjects(): Promise<RecentProject[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.RECENT_PROJECTS], 'readonly');
      const store = transaction.objectStore(STORES.RECENT_PROJECTS);
      const index = store.index('lastModified');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = request.result as RecentProject[];
        // Sort by lastModified descending
        results.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove from recent projects
   */
  public async removeFromRecentProjects(projectId: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.RECENT_PROJECTS], 'readwrite');
      const store = transaction.objectStore(STORES.RECENT_PROJECTS);
      const request = store.delete(projectId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // DELTA SAVE OPERATIONS
  // ============================================

  /**
   * Save only changed shelves (delta save)
   */
  public async saveDelta(
    projectId: string,
    changedShelves: Map<string, AnyShelf>,
    pageId: string
  ): Promise<{ saved: number; skipped: number }> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.SHELVES, STORES.CHANGE_LOG], 'readwrite');
      const shelfStore = transaction.objectStore(STORES.SHELVES);
      const changeStore = transaction.objectStore(STORES.CHANGE_LOG);

      let saved = 0;
      let skipped = 0;
      const now = new Date();

      changedShelves.forEach((shelf, shelfId) => {
        const newChecksum = calculateChecksum(shelf);

        // Get existing shelf to compare
        const getRequest = shelfStore.get(shelfId);

        getRequest.onsuccess = () => {
          const existing = getRequest.result as StoredShelf | undefined;

          if (existing && existing.checksum === newChecksum) {
            // No change, skip
            skipped++;
            return;
          }

          // Save the shelf
          const storedShelf: StoredShelf = {
            id: shelfId,
            projectId,
            pageId,
            data: shelf,
            lastModified: now,
            checksum: newChecksum,
          };

          shelfStore.put(storedShelf);

          // Log the change
          const changeEntry: ChangeLogEntry = {
            id: crypto.randomUUID(),
            timestamp: now,
            type: 'shelf',
            entityId: shelfId,
            operation: existing ? 'update' : 'create',
            previousChecksum: existing?.checksum,
            newChecksum,
          };

          changeStore.add(changeEntry);
          saved++;
        };
      });

      transaction.oncomplete = () => resolve({ saved, skipped });
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get shelves that have changed since a timestamp
   */
  public async getChangesSince(timestamp: Date): Promise<ChangeLogEntry[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CHANGE_LOG], 'readonly');
      const store = transaction.objectStore(STORES.CHANGE_LOG);
      const index = store.index('timestamp');
      const range = IDBKeyRange.lowerBound(timestamp);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result as ChangeLogEntry[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear old change log entries (keep last 7 days)
   */
  public async pruneChangeLog(daysToKeep: number = 7): Promise<number> {
    const db = await this.getDB();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.CHANGE_LOG], 'readwrite');
      const store = transaction.objectStore(STORES.CHANGE_LOG);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoff);
      let deletedCount = 0;

      const cursorRequest = index.openCursor(range);

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve(deletedCount);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // ============================================
  // PREFERENCES OPERATIONS
  // ============================================

  /**
   * Save a preference
   */
  public async setPreference(key: string, value: any): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PREFERENCES], 'readwrite');
      const store = transaction.objectStore(STORES.PREFERENCES);
      const request = store.put({ key, value, lastModified: new Date() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a preference
   */
  public async getPreference<T>(key: string, defaultValue: T): Promise<T> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PREFERENCES], 'readonly');
      const store = transaction.objectStore(STORES.PREFERENCES);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Restore Map objects from serialized arrays
   */
  private restoreMapObjects(projectData: ProjectData): void {
    if (projectData.pages) {
      projectData.pages.forEach((page: any) => {
        if (page.shelfSortOverrides && Array.isArray(page.shelfSortOverrides)) {
          page.shelfSortOverrides = new Map(page.shelfSortOverrides);
        }
      });
    }
  }

  /**
   * Get database storage usage estimate
   */
  public async getStorageEstimate(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        used,
        quota,
        percentage: quota > 0 ? Math.round((used / quota) * 100) : 0,
      };
    }
    return { used: 0, quota: 0, percentage: 0 };
  }

  /**
   * Clear all data (for testing/reset)
   */
  public async clearAllData(): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const storeNames = Object.values(STORES);
      const transaction = db.transaction(storeNames, 'readwrite');

      storeNames.forEach((storeName) => {
        transaction.objectStore(storeName).clear();
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Close the database connection
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

// Singleton instance
let dbManagerInstance: IndexedDBManager | null = null;

/**
 * Get the singleton IndexedDBManager instance
 */
export function getIndexedDBManager(): IndexedDBManager {
  if (!dbManagerInstance) {
    dbManagerInstance = new IndexedDBManager();
  }
  return dbManagerInstance;
}
