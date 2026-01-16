/**
 * CSV Import Web Worker
 *
 * This worker handles CPU-intensive CSV parsing and transformation operations
 * off the main thread to prevent UI blocking during large imports.
 *
 * Features:
 * - Chunked processing with progress reporting
 * - Pre-compiled regex patterns for performance
 * - UUID batch generation
 * - Cancellation support
 */

// Import types - these will be available since Vite bundles workers
import type { StrainType } from '../types';

// ============================================
// TYPES
// ============================================

export interface ImportData {
  [key: string]: string;
}

export interface ColumnMapping {
  [csvColumn: string]: string;
}

export interface ShelfInfo {
  id: string;
  name: string;
}

export interface ProcessedStrain {
  id: string;
  name: string;
  grower: string;
  thc: number | null;
  type: string; // StrainType enum value
  isLastJar: boolean;
  isSoldOut: boolean;
  originalShelf: string;
}

export interface ProcessedProduct {
  id: string;
  name: string;
  brand: string;
  thc: number | null;
  terpenes: number | null;
  type: string; // StrainType enum value
  price: number;
  netWeight: string;
  isLowStock: boolean;
  isSoldOut: boolean;
  notes: string;
}

export interface SkippedRow {
  rowIndex: number;
  rowData: ImportData;
  reason: string;
}

export interface ShelfAssignment {
  shelfId: string;
  items: (ProcessedStrain | ProcessedProduct)[];
}

// Messages TO worker
export type WorkerInMessage =
  | {
      type: 'PROCESS_CSV';
      payload: {
        data: ImportData[];
        mapping: ColumnMapping;
        menuMode: 'bulk' | 'prepackaged';
        existingShelves: ShelfInfo[];
        allowCreateShelves: boolean;
      };
    }
  | { type: 'CANCEL' };

// Messages FROM worker
export type WorkerOutMessage =
  | { type: 'PROGRESS'; payload: { processed: number; total: number; stage: string } }
  | {
      type: 'COMPLETE';
      payload: {
        shelfAssignments: Record<string, (ProcessedStrain | ProcessedProduct)[]>;
        createdShelves: ShelfInfo[];
        skippedRows: SkippedRow[];
        stats: {
          totalProcessed: number;
          totalSkipped: number;
          shakeCount?: number;
          flowerCount?: number;
        };
      };
    }
  | { type: 'ERROR'; payload: { message: string } };

// ============================================
// PRE-COMPILED PATTERNS (compiled once at worker load)
// ============================================

const NUMERIC_VALUE_PATTERN = /(\d*\.?\d+)/;
const PRICE_CLEANUP_PATTERN = /[$,]/g;
const TYPE_NORMALIZE_PATTERN = /[\s\-./]/g;

// Strain type mapping (matches constants.ts CSV_STRAIN_TYPE_MAP)
const STRAIN_TYPE_MAP: Record<string, string> = {
  'S': 'Sativa',
  'SATIVA': 'Sativa',
  'SAT': 'Sativa',
  'SH': 'Sativa-Hybrid',
  'SATIVAHYBRID': 'Sativa-Hybrid',
  'SATHYB': 'Sativa-Hybrid',
  'H': 'Hybrid',
  'HYBRID': 'Hybrid',
  'HYB': 'Hybrid',
  'IH': 'Indica-Hybrid',
  'INDICAHYBRID': 'Indica-Hybrid',
  'INDHYB': 'Indica-Hybrid',
  'I': 'Indica',
  'INDICA': 'Indica',
  'IND': 'Indica',
};

// Boolean truthy values for parsing
const SOLD_OUT_VALUES = new Set([
  'soldout', 'sold out', 'true', '1', 'yes', 'out of stock',
  'unavailable', 'empty', 'oos', 'out'
]);

const LAST_JAR_VALUES = new Set([
  'lastjar', 'last jar', 'true', '1', 'yes'
]);

const LOW_STOCK_VALUES = new Set([
  'true', '1', 'yes', 'last 5 units', 'last5units', 'last 5', 'last5',
  'final units', 'remaining units', 'low inventory', 'last few',
  'limited stock', 'low stock', 'lowstock'
]);

// ============================================
// UUID POOL (batch generation for performance)
// ============================================

let uuidPool: string[] = [];
const UUID_POOL_SIZE = 500;

function refillUuidPool(): void {
  while (uuidPool.length < UUID_POOL_SIZE) {
    uuidPool.push(crypto.randomUUID());
  }
}

function getUuid(): string {
  if (uuidPool.length === 0) {
    refillUuidPool();
  }
  return uuidPool.pop()!;
}

// Pre-fill the pool
refillUuidPool();

// ============================================
// PARSING HELPERS
// ============================================

function extractNumericValue(str: string | undefined | null): number | null {
  if (!str || str === '-') return null;
  const match = str.match(NUMERIC_VALUE_PATTERN);
  return match ? parseFloat(match[1]) : null;
}

function parsePrice(str: string | undefined | null): number {
  if (!str) return 0;
  const cleaned = str.replace(PRICE_CLEANUP_PATTERN, '');
  const match = cleaned.match(NUMERIC_VALUE_PATTERN);
  return match ? parseFloat(match[1]) : 0;
}

function normalizeStrainType(str: string | undefined | null): string {
  if (!str) return 'Hybrid';
  const normalized = str.toUpperCase().replace(TYPE_NORMALIZE_PATTERN, '');
  return STRAIN_TYPE_MAP[normalized] || 'Hybrid';
}

function parseBooleanField(value: string | undefined | null, trueValues: Set<string>): boolean {
  if (!value) return false;
  return trueValues.has(value.toLowerCase().trim());
}

// ============================================
// MAIN PROCESSING LOGIC
// ============================================

const CHUNK_SIZE = 100; // Process 100 rows at a time
let cancelled = false;

async function processCSV(
  data: ImportData[],
  mapping: ColumnMapping,
  menuMode: 'bulk' | 'prepackaged',
  existingShelves: ShelfInfo[],
  allowCreateShelves: boolean
): Promise<void> {
  cancelled = false;

  // Invert mapping: field -> csvColumn
  const fieldToColumn: Record<string, string> = {};
  Object.entries(mapping).forEach(([csvColumn, appField]) => {
    fieldToColumn[appField as string] = csvColumn;
  });

  // Build shelf lookup map
  const shelfNameMap = new Map<string, string>();
  existingShelves.forEach(shelf => {
    shelfNameMap.set(shelf.name.toLowerCase(), shelf.id);
  });

  // Results
  const shelfAssignments: Record<string, (ProcessedStrain | ProcessedProduct)[]> = {};
  const createdShelves: ShelfInfo[] = [];
  const skippedRows: SkippedRow[] = [];
  let totalProcessed = 0;
  let shakeCount = 0;
  let flowerCount = 0;

  const total = data.length;

  // Process in chunks
  for (let i = 0; i < total; i += CHUNK_SIZE) {
    if (cancelled) {
      self.postMessage({ type: 'ERROR', payload: { message: 'Import cancelled' } });
      return;
    }

    const chunk = data.slice(i, Math.min(i + CHUNK_SIZE, total));

    for (const row of chunk) {
      const rowIndex = i + chunk.indexOf(row) + 2; // +2 for header row and 1-indexing

      try {
        const shelfName = fieldToColumn.shelf ? row[fieldToColumn.shelf] : '';
        const itemName = fieldToColumn.name ? row[fieldToColumn.name] : '';

        if (!shelfName || !itemName) {
          const reason = `Missing required data: ${!shelfName ? 'shelf/category' : ''} ${!shelfName && !itemName ? 'and ' : ''}${!itemName ? 'item name' : ''}`;
          skippedRows.push({ rowIndex, rowData: row, reason });
          continue;
        }

        let targetShelfId: string | undefined;

        if (menuMode === 'prepackaged') {
          // Smart shelf matching for pre-packaged
          const isShake = itemName.toLowerCase().includes('shake');
          const smartShelfName = shelfName.includes('g')
            ? `${shelfName} ${isShake ? 'Shake' : 'Flower'}`
            : `${shelfName}g ${isShake ? 'Shake' : 'Flower'}`;

          targetShelfId =
            shelfNameMap.get(smartShelfName.toLowerCase()) ||
            shelfNameMap.get(shelfName.toLowerCase()) ||
            (!shelfName.includes('g') ? shelfNameMap.get(`${shelfName}g`.toLowerCase()) : undefined) ||
            (shelfName.includes('g') ? shelfNameMap.get(shelfName.replace('g', '').toLowerCase()) : undefined);

          if (isShake) shakeCount++;
          else flowerCount++;
        } else {
          targetShelfId = shelfNameMap.get(shelfName.toLowerCase());
        }

        if (!targetShelfId) {
          if (allowCreateShelves) {
            const newShelfId = getUuid();
            const newShelf: ShelfInfo = { id: newShelfId, name: shelfName };
            createdShelves.push(newShelf);
            shelfNameMap.set(shelfName.toLowerCase(), newShelfId);
            targetShelfId = newShelfId;
          } else {
            const reason = `Unknown shelf/category "${shelfName}"`;
            skippedRows.push({ rowIndex, rowData: row, reason });
            continue;
          }
        }

        // Create the item
        let item: ProcessedStrain | ProcessedProduct;

        if (menuMode === 'bulk') {
          item = {
            id: getUuid(),
            name: itemName,
            grower: fieldToColumn.grower ? row[fieldToColumn.grower] || '' : '',
            thc: extractNumericValue(fieldToColumn.thc ? row[fieldToColumn.thc] : ''),
            type: normalizeStrainType(fieldToColumn.type ? row[fieldToColumn.type] : ''),
            isLastJar: parseBooleanField(fieldToColumn.lastJar ? row[fieldToColumn.lastJar] : '', LAST_JAR_VALUES),
            isSoldOut: parseBooleanField(fieldToColumn.soldOut ? row[fieldToColumn.soldOut] : '', SOLD_OUT_VALUES),
            originalShelf: fieldToColumn.originalShelf ? row[fieldToColumn.originalShelf] || '' : '',
          };
        } else {
          item = {
            id: getUuid(),
            name: itemName,
            brand: fieldToColumn.brand ? row[fieldToColumn.brand] || '' : '',
            thc: extractNumericValue(fieldToColumn.thc ? row[fieldToColumn.thc] : ''),
            terpenes: extractNumericValue(fieldToColumn.terpenes ? row[fieldToColumn.terpenes] : ''),
            type: normalizeStrainType(fieldToColumn.type ? row[fieldToColumn.type] : ''),
            price: parsePrice(fieldToColumn.price ? row[fieldToColumn.price] : ''),
            netWeight: fieldToColumn.netWeight ? row[fieldToColumn.netWeight] || '' : '',
            isLowStock: parseBooleanField(fieldToColumn.isLowStock ? row[fieldToColumn.isLowStock] : '', LOW_STOCK_VALUES),
            isSoldOut: parseBooleanField(fieldToColumn.soldOut ? row[fieldToColumn.soldOut] : '', SOLD_OUT_VALUES),
            notes: fieldToColumn.notes ? row[fieldToColumn.notes] || '' : '',
          };
        }

        if (!shelfAssignments[targetShelfId]) {
          shelfAssignments[targetShelfId] = [];
        }
        shelfAssignments[targetShelfId].push(item);
        totalProcessed++;
      } catch (error) {
        const reason = `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        skippedRows.push({ rowIndex, rowData: row, reason });
      }
    }

    // Report progress
    const processed = Math.min(i + CHUNK_SIZE, total);
    self.postMessage({
      type: 'PROGRESS',
      payload: {
        processed,
        total,
        stage: `Processing rows ${i + 1}-${processed}...`,
      },
    });

    // Yield to allow cancellation checks
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Send completion message
  self.postMessage({
    type: 'COMPLETE',
    payload: {
      shelfAssignments,
      createdShelves,
      skippedRows,
      stats: {
        totalProcessed,
        totalSkipped: skippedRows.length,
        shakeCount: menuMode === 'prepackaged' ? shakeCount : undefined,
        flowerCount: menuMode === 'prepackaged' ? flowerCount : undefined,
      },
    },
  });
}

// ============================================
// MESSAGE HANDLER
// ============================================

self.onmessage = async (event: MessageEvent<WorkerInMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'PROCESS_CSV':
      try {
        await processCSV(
          message.payload.data,
          message.payload.mapping,
          message.payload.menuMode,
          message.payload.existingShelves,
          message.payload.allowCreateShelves
        );
      } catch (error) {
        self.postMessage({
          type: 'ERROR',
          payload: { message: error instanceof Error ? error.message : 'Unknown error' },
        });
      }
      break;

    case 'CANCEL':
      cancelled = true;
      break;
  }
};

// Export types for use in main thread
export type { WorkerInMessage, WorkerOutMessage };
