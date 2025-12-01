import { MenuMode, PrePackagedShelf, PriceTiers, Shelf, SupportedStates } from '../types';

const STORAGE_KEY = 'mango-shelf-configs-v1';
const CONFIG_VERSION = 1;

type ShelfConfigMode = 'bulk' | 'prepackaged';

interface ShelfConfigRecord {
  state: SupportedStates;
  mode: ShelfConfigMode;
  shelves: Shelf[] | PrePackagedShelf[];
  version: number;
  updatedAt: number;
}

const sanitizePriceTiers = (pricing?: PriceTiers): PriceTiers | undefined => {
  if (!pricing) return undefined;
  const { g, eighth, quarter, half, oz, fiveG } = pricing;
  return { g, eighth, quarter, half, oz, fiveG };
};

const sanitizeBulkShelves = (shelves: Shelf[]): Shelf[] =>
  shelves.map((shelf) => ({
    ...shelf,
    strains: [], // never persist strains with config
    pricing: sanitizePriceTiers(shelf.pricing) || {
      g: 0,
      eighth: 0,
      quarter: 0,
      half: 0,
      oz: 0,
    },
    medicalPricing: sanitizePriceTiers(shelf.medicalPricing),
  }));

const sanitizePrePackagedShelves = (shelves: PrePackagedShelf[]): PrePackagedShelf[] =>
  shelves.map((shelf) => ({
    ...shelf,
    products: [], // never persist products with config
  }));

const readAll = (): ShelfConfigRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === 'object');
  } catch (err) {
    console.warn('Failed to read shelf configs, resetting.', err);
    return [];
  }
};

const writeAll = (records: ShelfConfigRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to persist shelf configs.', err);
  }
};

export const shelfConfigStore = {
  get(state: SupportedStates, mode: MenuMode): Shelf[] | PrePackagedShelf[] | null {
    const keyMode: ShelfConfigMode = mode === MenuMode.BULK ? 'bulk' : 'prepackaged';
    const match = readAll().find((entry) => entry.state === state && entry.mode === keyMode);
    if (!match) return null;

    if (keyMode === 'bulk') {
      return sanitizeBulkShelves(match.shelves as Shelf[]);
    }
    return sanitizePrePackagedShelves(match.shelves as PrePackagedShelf[]);
  },

  save(state: SupportedStates, mode: MenuMode, shelves: Shelf[] | PrePackagedShelf[]): void {
    const keyMode: ShelfConfigMode = mode === MenuMode.BULK ? 'bulk' : 'prepackaged';
    const sanitized =
      keyMode === 'bulk'
        ? sanitizeBulkShelves(shelves as Shelf[])
        : sanitizePrePackagedShelves(shelves as PrePackagedShelf[]);

    const all = readAll().filter((entry) => !(entry.state === state && entry.mode === keyMode));
    all.push({
      state,
      mode: keyMode,
      shelves: sanitized,
      version: CONFIG_VERSION,
      updatedAt: Date.now(),
    });
    writeAll(all);
  },

  reset(state: SupportedStates, mode: MenuMode): void {
    const keyMode: ShelfConfigMode = mode === MenuMode.BULK ? 'bulk' : 'prepackaged';
    const filtered = readAll().filter((entry) => !(entry.state === state && entry.mode === keyMode));
    writeAll(filtered);
  },

  export(): string {
    return JSON.stringify(readAll(), null, 2);
  },

  importFromString(payload: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(payload);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'Invalid format: expected an array' };
      }
      const validated: ShelfConfigRecord[] = parsed
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null;
          if (!entry.state || !entry.mode || !entry.shelves) return null;
          return {
            state: entry.state as SupportedStates,
            mode: entry.mode as ShelfConfigMode,
            shelves: entry.shelves,
            version: entry.version || CONFIG_VERSION,
            updatedAt: entry.updatedAt || Date.now(),
          };
        })
        .filter(Boolean) as ShelfConfigRecord[];

      writeAll(validated);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unknown error' };
    }
  },
};
