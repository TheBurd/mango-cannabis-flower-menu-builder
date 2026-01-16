/**
 * React hook for IndexedDB integration
 *
 * Provides a clean React interface for the IndexedDBManager,
 * with automatic initialization, error handling, and fallback to localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IndexedDBManager,
  getIndexedDBManager,
  type StoredAutoSave,
  type ChangeLogEntry,
} from '../utils/IndexedDBManager';
import type { ProjectData, SaveSlot, RecentProject } from '../utils/SessionManager';
import type { AnyShelf } from '../types';

export interface UseIndexedDBReturn {
  // Status
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;

  // Auto-save operations
  saveAutoSave: (projectData: ProjectData) => Promise<boolean>;
  loadAutoSave: () => Promise<ProjectData | null>;
  hasAutoSave: () => Promise<boolean>;
  getAutoSaveInfo: () => Promise<{ timestamp: Date; hasData: boolean } | null>;
  clearAutoSave: () => Promise<boolean>;

  // Save slots
  saveToSlot: (slotNumber: number, projectData: ProjectData, slotName: string) => Promise<boolean>;
  loadFromSlot: (slotNumber: number) => Promise<ProjectData | null>;
  getSaveSlots: () => Promise<(SaveSlot | null)[]>;

  // Recent projects
  addToRecentProjects: (project: RecentProject) => Promise<boolean>;
  getRecentProjects: () => Promise<RecentProject[]>;
  removeFromRecentProjects: (projectId: string) => Promise<boolean>;

  // Delta save
  saveDelta: (
    projectId: string,
    changedShelves: Map<string, AnyShelf>,
    pageId: string
  ) => Promise<{ saved: number; skipped: number }>;
  getChangesSince: (timestamp: Date) => Promise<ChangeLogEntry[]>;

  // Preferences
  setPreference: <T>(key: string, value: T) => Promise<boolean>;
  getPreference: <T>(key: string, defaultValue: T) => Promise<T>;

  // Storage info
  getStorageInfo: () => Promise<{ used: number; quota: number; percentage: number }>;

  // Manager instance (for advanced use)
  manager: IndexedDBManager | null;
}

/**
 * Hook for managing IndexedDB operations in React components
 *
 * @example
 * ```tsx
 * const { isReady, saveAutoSave, loadAutoSave, isSupported } = useIndexedDB();
 *
 * useEffect(() => {
 *   if (isReady) {
 *     loadAutoSave().then(data => {
 *       if (data) restoreSession(data);
 *     });
 *   }
 * }, [isReady]);
 *
 * const handleAutoSave = async () => {
 *   const success = await saveAutoSave(projectData);
 *   if (success) console.log('Auto-saved to IndexedDB');
 * };
 * ```
 */
export function useIndexedDB(): UseIndexedDBReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef<IndexedDBManager | null>(null);

  // Initialize on mount
  useEffect(() => {
    const initDB = async () => {
      try {
        const manager = getIndexedDBManager();
        managerRef.current = manager;

        if (!manager.available) {
          setError('IndexedDB not supported in this browser');
          setIsLoading(false);
          return;
        }

        const success = await manager.initialize();
        if (success) {
          setIsReady(true);
        } else {
          setError('Failed to initialize IndexedDB');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error initializing IndexedDB');
      } finally {
        setIsLoading(false);
      }
    };

    initDB();

    // Cleanup on unmount
    return () => {
      // Don't close the manager here as it's a singleton
      // that may be used by other components
    };
  }, []);

  // Wrap all operations with error handling
  const wrapAsync = useCallback(
    async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
      if (!managerRef.current || !isReady) {
        console.warn('IndexedDB not ready, operation skipped');
        return fallback;
      }

      try {
        return await operation();
      } catch (err) {
        console.error('IndexedDB operation failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return fallback;
      }
    },
    [isReady]
  );

  // Auto-save operations
  const saveAutoSave = useCallback(
    async (projectData: ProjectData): Promise<boolean> => {
      return wrapAsync(async () => {
        await managerRef.current!.saveAutoSave(projectData);
        return true;
      }, false);
    },
    [wrapAsync]
  );

  const loadAutoSave = useCallback(async (): Promise<ProjectData | null> => {
    return wrapAsync(async () => {
      return managerRef.current!.loadAutoSave();
    }, null);
  }, [wrapAsync]);

  const hasAutoSave = useCallback(async (): Promise<boolean> => {
    return wrapAsync(async () => {
      return managerRef.current!.hasAutoSave();
    }, false);
  }, [wrapAsync]);

  const getAutoSaveInfo = useCallback(async (): Promise<{ timestamp: Date; hasData: boolean } | null> => {
    return wrapAsync(async () => {
      return managerRef.current!.getAutoSaveInfo();
    }, null);
  }, [wrapAsync]);

  const clearAutoSave = useCallback(async (): Promise<boolean> => {
    return wrapAsync(async () => {
      await managerRef.current!.clearAutoSave();
      return true;
    }, false);
  }, [wrapAsync]);

  // Save slots
  const saveToSlot = useCallback(
    async (slotNumber: number, projectData: ProjectData, slotName: string): Promise<boolean> => {
      return wrapAsync(async () => {
        return managerRef.current!.saveToSlot(slotNumber, projectData, slotName);
      }, false);
    },
    [wrapAsync]
  );

  const loadFromSlot = useCallback(
    async (slotNumber: number): Promise<ProjectData | null> => {
      return wrapAsync(async () => {
        return managerRef.current!.loadFromSlot(slotNumber);
      }, null);
    },
    [wrapAsync]
  );

  const getSaveSlots = useCallback(async (): Promise<(SaveSlot | null)[]> => {
    return wrapAsync(async () => {
      return managerRef.current!.getSaveSlots();
    }, new Array(5).fill(null));
  }, [wrapAsync]);

  // Recent projects
  const addToRecentProjects = useCallback(
    async (project: RecentProject): Promise<boolean> => {
      return wrapAsync(async () => {
        await managerRef.current!.addToRecentProjects(project);
        return true;
      }, false);
    },
    [wrapAsync]
  );

  const getRecentProjects = useCallback(async (): Promise<RecentProject[]> => {
    return wrapAsync(async () => {
      return managerRef.current!.getRecentProjects();
    }, []);
  }, [wrapAsync]);

  const removeFromRecentProjects = useCallback(
    async (projectId: string): Promise<boolean> => {
      return wrapAsync(async () => {
        await managerRef.current!.removeFromRecentProjects(projectId);
        return true;
      }, false);
    },
    [wrapAsync]
  );

  // Delta save
  const saveDelta = useCallback(
    async (
      projectId: string,
      changedShelves: Map<string, AnyShelf>,
      pageId: string
    ): Promise<{ saved: number; skipped: number }> => {
      return wrapAsync(async () => {
        return managerRef.current!.saveDelta(projectId, changedShelves, pageId);
      }, { saved: 0, skipped: 0 });
    },
    [wrapAsync]
  );

  const getChangesSince = useCallback(
    async (timestamp: Date): Promise<ChangeLogEntry[]> => {
      return wrapAsync(async () => {
        return managerRef.current!.getChangesSince(timestamp);
      }, []);
    },
    [wrapAsync]
  );

  // Preferences
  const setPreference = useCallback(
    async <T>(key: string, value: T): Promise<boolean> => {
      return wrapAsync(async () => {
        await managerRef.current!.setPreference(key, value);
        return true;
      }, false);
    },
    [wrapAsync]
  );

  const getPreference = useCallback(
    async <T>(key: string, defaultValue: T): Promise<T> => {
      return wrapAsync(async () => {
        return managerRef.current!.getPreference(key, defaultValue);
      }, defaultValue);
    },
    [wrapAsync]
  );

  // Storage info
  const getStorageInfo = useCallback(async (): Promise<{ used: number; quota: number; percentage: number }> => {
    return wrapAsync(async () => {
      return managerRef.current!.getStorageEstimate();
    }, { used: 0, quota: 0, percentage: 0 });
  }, [wrapAsync]);

  return {
    // Status
    isReady,
    isLoading,
    error,
    isSupported: managerRef.current?.available ?? false,

    // Auto-save
    saveAutoSave,
    loadAutoSave,
    hasAutoSave,
    getAutoSaveInfo,
    clearAutoSave,

    // Save slots
    saveToSlot,
    loadFromSlot,
    getSaveSlots,

    // Recent projects
    addToRecentProjects,
    getRecentProjects,
    removeFromRecentProjects,

    // Delta save
    saveDelta,
    getChangesSince,

    // Preferences
    setPreference,
    getPreference,

    // Storage info
    getStorageInfo,

    // Manager instance
    manager: managerRef.current,
  };
}

/**
 * Hook for tracking changes and enabling delta saves
 *
 * @example
 * ```tsx
 * const { trackChange, getChangedShelves, clearChanges } = useDeltaTracker();
 *
 * // When a shelf is modified
 * const handleShelfUpdate = (shelfId: string, newData: AnyShelf) => {
 *   trackChange(shelfId, newData);
 * };
 *
 * // When saving
 * const handleSave = async () => {
 *   const changes = getChangedShelves();
 *   await idb.saveDelta(projectId, changes, pageId);
 *   clearChanges();
 * };
 * ```
 */
export function useDeltaTracker() {
  const changesRef = useRef<Map<string, AnyShelf>>(new Map());
  const [changeCount, setChangeCount] = useState(0);

  const trackChange = useCallback((shelfId: string, shelfData: AnyShelf) => {
    changesRef.current.set(shelfId, shelfData);
    setChangeCount(changesRef.current.size);
  }, []);

  const getChangedShelves = useCallback((): Map<string, AnyShelf> => {
    return new Map(changesRef.current);
  }, []);

  const clearChanges = useCallback(() => {
    changesRef.current.clear();
    setChangeCount(0);
  }, []);

  const hasChanges = changeCount > 0;

  return {
    trackChange,
    getChangedShelves,
    clearChanges,
    hasChanges,
    changeCount,
  };
}
