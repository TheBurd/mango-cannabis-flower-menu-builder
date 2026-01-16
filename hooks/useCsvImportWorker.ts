/**
 * Hook for managing CSV import Web Worker
 *
 * Provides a clean interface for processing CSV imports in a background worker,
 * with progress reporting and cancellation support.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  WorkerOutMessage,
  ImportData,
  ColumnMapping,
  ShelfInfo,
  ProcessedStrain,
  ProcessedProduct,
  SkippedRow,
} from '../workers/csvImportWorker';

export interface CsvImportProgress {
  stage: string;
  processed: number;
  total: number;
  percentage: number;
}

export interface CsvImportResult {
  shelfAssignments: Record<string, (ProcessedStrain | ProcessedProduct)[]>;
  createdShelves: ShelfInfo[];
  skippedRows: SkippedRow[];
  stats: {
    totalProcessed: number;
    totalSkipped: number;
    shakeCount?: number;
    flowerCount?: number;
  };
}

export interface UseCsvImportWorkerReturn {
  /** Start processing CSV data in the worker */
  processCSV: (
    data: ImportData[],
    mapping: ColumnMapping,
    menuMode: 'bulk' | 'prepackaged',
    existingShelves: ShelfInfo[],
    allowCreateShelves: boolean
  ) => Promise<CsvImportResult>;
  /** Cancel the current import operation */
  cancel: () => void;
  /** Whether an import is currently in progress */
  isProcessing: boolean;
  /** Current progress information */
  progress: CsvImportProgress | null;
  /** Last error message, if any */
  error: string | null;
}

/**
 * Hook for managing CSV import processing in a Web Worker.
 *
 * @example
 * ```tsx
 * const { processCSV, cancel, isProcessing, progress, error } = useCsvImportWorker();
 *
 * const handleImport = async () => {
 *   try {
 *     const result = await processCSV(data, mapping, 'bulk', shelves, true);
 *     console.log('Imported', result.stats.totalProcessed, 'items');
 *   } catch (err) {
 *     console.error('Import failed:', err);
 *   }
 * };
 * ```
 */
export function useCsvImportWorker(): UseCsvImportWorkerReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<CsvImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((result: CsvImportResult) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const processCSV = useCallback(
    (
      data: ImportData[],
      mapping: ColumnMapping,
      menuMode: 'bulk' | 'prepackaged',
      existingShelves: ShelfInfo[],
      allowCreateShelves: boolean
    ): Promise<CsvImportResult> => {
      return new Promise((resolve, reject) => {
        // Store resolve/reject for message handler
        resolveRef.current = resolve;
        rejectRef.current = reject;

        // Reset state
        setIsProcessing(true);
        setProgress({ stage: 'Initializing...', processed: 0, total: data.length, percentage: 0 });
        setError(null);

        // Terminate any existing worker
        if (workerRef.current) {
          workerRef.current.terminate();
        }

        // Create new worker
        // Note: Vite handles the worker URL transformation
        workerRef.current = new Worker(
          new URL('../workers/csvImportWorker.ts', import.meta.url),
          { type: 'module' }
        );

        // Set up message handler
        workerRef.current.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
          const message = event.data;

          switch (message.type) {
            case 'PROGRESS':
              setProgress({
                stage: message.payload.stage,
                processed: message.payload.processed,
                total: message.payload.total,
                percentage: Math.round((message.payload.processed / message.payload.total) * 100),
              });
              break;

            case 'COMPLETE':
              setIsProcessing(false);
              setProgress(null);
              workerRef.current?.terminate();
              workerRef.current = null;
              if (resolveRef.current) {
                resolveRef.current(message.payload);
              }
              break;

            case 'ERROR':
              setIsProcessing(false);
              setProgress(null);
              setError(message.payload.message);
              workerRef.current?.terminate();
              workerRef.current = null;
              if (rejectRef.current) {
                rejectRef.current(new Error(message.payload.message));
              }
              break;
          }
        };

        // Handle worker errors
        workerRef.current.onerror = (event) => {
          setIsProcessing(false);
          setProgress(null);
          setError(event.message || 'Worker error');
          workerRef.current?.terminate();
          workerRef.current = null;
          if (rejectRef.current) {
            rejectRef.current(new Error(event.message || 'Worker error'));
          }
        };

        // Send data to worker
        workerRef.current.postMessage({
          type: 'PROCESS_CSV',
          payload: {
            data,
            mapping,
            menuMode,
            existingShelves,
            allowCreateShelves,
          },
        });
      });
    },
    []
  );

  const cancel = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'CANCEL' });
      // Give it a moment to cancel gracefully, then terminate
      setTimeout(() => {
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
        setIsProcessing(false);
        setProgress(null);
        if (rejectRef.current) {
          rejectRef.current(new Error('Import cancelled'));
        }
      }, 100);
    }
  }, []);

  return {
    processCSV,
    cancel,
    isProcessing,
    progress,
    error,
  };
}
