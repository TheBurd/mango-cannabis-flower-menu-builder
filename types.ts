export enum StrainType {
  SATIVA = "Sativa",
  SATIVA_HYBRID = "Sativa-Hybrid",
  HYBRID = "Hybrid",
  INDICA_HYBRID = "Indica-Hybrid",
  INDICA = "Indica",
}

export enum MenuMode {
  BULK = "Bulk",
  PREPACKAGED = "Pre-Packaged",
}

export enum PrePackagedWeight {
  EIGHTH = "3.5g",
  QUARTER = "7g", 
  HALF = "14g",
  OUNCE = "28g",
}

export interface Strain {
  id: string;
  name: string;
  grower: string;
  thc: number | null;
  type: StrainType;
  isLastJar: boolean;
  isSoldOut: boolean;
  originalShelf?: string; // For 50% OFF shelf - tracks which shelf this strain originally came from
}

export interface PrePackagedProduct {
  id: string;
  name: string;
  brand: string; // Emphasized brand/grower for pre-packaged products
  thc: number | null;
  terpenes?: number | null; // Terpene percentage (e.g., 2.5 for 2.5%)
  type: StrainType;
  // weight: removed - now handled at shelf level
  price: number; // Fixed price per package
  netWeight?: string; // Net weight field (e.g., "3.52g")
  isLowStock: boolean; // Low stock flag - replaces inventoryStatus
  isSoldOut: boolean; // Sold out flag
  notes?: string; // Additional notes (e.g., "Has Display", batch info)
  originalShelf?: string; // For tracking shelf moves
}

export interface PriceTiers {
  g: number;
  eighth: number;
  quarter: number;
  half: number;
  oz: number;
  fiveG?: number; // Optional 5g pricing for infused flower shelves
}

export interface SortCriteria {
  key: 'name' | 'grower' | 'type' | 'thc' | 'isLastJar' | 'isSoldOut' | 'originalShelf';
  direction: 'asc' | 'desc';
}

export interface PrePackagedSortCriteria {
  key: 'name' | 'brand' | 'type' | 'thc' | 'terpenes' | 'price' | 'isLowStock' | 'isSoldOut' | 'originalShelf';
  direction: 'asc' | 'desc';
}

export interface Shelf {
  id: string;
  name: string;
  pricing: PriceTiers;
  color: string; // Tailwind background color class e.g., 'bg-purple-600'
  textColor: string; // Tailwind text color class e.g., 'text-white'
  strains: Strain[];
  sortCriteria: SortCriteria | null; // Added for individual shelf sorting
  hidePricing?: boolean; // Optional flag to hide pricing display for special shelves like 50% OFF
  isInfused?: boolean; // Optional flag to identify infused flower shelves with different pricing display
}

export interface PrePackagedShelf {
  id: string;
  name: string;
  color: string; // Tailwind background color class e.g., 'bg-purple-600'
  textColor: string; // Tailwind text color class e.g., 'text-white'
  products: PrePackagedProduct[];
  sortCriteria: PrePackagedSortCriteria | null;
  hidePricing?: boolean; // Optional flag to hide pricing display for special shelves
  weightFilter?: PrePackagedWeight[]; // Optional filter for specific weights (e.g., only 3.5g products)
  brandEmphasis?: boolean; // Optional flag to emphasize brand over strain name
}

export enum ArtboardSize {
  LETTER_PORTRAIT = "8.5x11\" Portrait",
  LETTER_LANDSCAPE = "11x8.5\" Landscape", 
  SCREEN_16_9_LANDSCAPE = "16:9 Landscape Screen", 
  SCREEN_16_9_PORTRAIT = "9:16 Portrait Screen",
}

export enum HeaderImageSize {
  LARGE = "Large",
  SMALL = "Small",
  NONE = "None",
}

export interface ArtboardDimensions {
  aspectRatio: string; 
  naturalWidth: number; // Natural width of the artboard at 100% scale (e.g., pixels for 300 DPI or screen)
  naturalHeight: number; // Natural height of the artboard at 100% scale
  maxWidthClass?: string; // Tailwind max-width utility, mostly for visual consistency if artboard is scaled down
}

export interface PreviewSettings {
  artboardSize: ArtboardSize;
  baseFontSizePx: number; // Base font size in pixels
  columns: 1 | 2 | 3 | 4 | 5 | 6;
  zoomLevel: number; // e.g., 1 = 100%
  forceShelfFit: boolean; // New setting for allowing shelves to split across columns
  headerImageSize: HeaderImageSize; // Added for selectable header images
  linePaddingMultiplier: number; // Multiplier for line item top/bottom padding (e.g., 0.3 = smaller padding, 0.5 = larger padding)
  showThcIcon: boolean; // Show THC regulatory icon on menu preview/export
  showSoldOutProducts: boolean; // Show sold out products in menu preview/export
  fitToWindowTrigger?: number; // Timestamp trigger for fit-to-window action
  menuMode: MenuMode; // Support for bulk vs pre-packaged mode
  showTerpenes?: boolean; // Show terpene percentages in pre-packaged mode
  terpeneHighlightThreshold?: number; // Highlight terpenes above this percentage (default: 2.0)
  terpeneDisplayFormat?: 'percentage' | 'decimal' | 'both'; // How to display terpene values
  showLowStock?: boolean; // Show low stock indicators in pre-packaged mode
  inventoryHighlightLowStock?: boolean; // Highlight low stock items in distinct color
  showNetWeight?: boolean; // Show net weight in pre-packaged mode
  netWeightPrecision?: 1 | 2 | 3; // Decimal places for net weight display
  // Multi-page support
  pageCount: number; // Total number of pages (default: 1)
  currentPage: number; // Currently viewed page (1-based, default: 1)
  autoPageBreaks: boolean; // Automatically create pages when content overflows (default: true)
  // Footer settings
  showMenuDate: boolean; // Show menu date in footer
  menuDateText: string; // The date text to display
  menuDatePosition?: 'left' | 'center'; // Position of date text in footer
}

// Multi-page content distribution types
export interface PagedContent {
  pageNumber: number; // 1-based page number
  shelves: AnyShelf[]; // Shelves assigned to this page
  estimatedHeight: number; // Estimated content height in pixels
  actualHeight?: number; // Measured height after rendering
}

export interface ContentDistribution {
  pages: PagedContent[];
  totalPages: number;
  hasOverflow: boolean; // Whether content would overflow without pages
}

export enum SupportedStates {
  OKLAHOMA = "Oklahoma",
  MICHIGAN = "Michigan",
  NEW_MEXICO = "New Mexico",
}

export type Theme = 'light' | 'dark';

// Utility types for menu mode compatibility
export type AnyShelf = Shelf | PrePackagedShelf;
export type AnyProduct = Strain | PrePackagedProduct;
export type AnySortCriteria = SortCriteria | PrePackagedSortCriteria;

// Type guards for runtime type checking
export interface MenuModeData {
  mode: MenuMode;
  shelves: MenuMode extends MenuMode.BULK ? Shelf[] : PrePackagedShelf[];
}

// CSV Import/Export types for pre-packaged products
export interface PrePackagedCSVRow {
  Category: string;
  'Strain Name': string;
  'Brand/Grower': string;
  'THC %': string;
  'Terpenes %'?: string;
  // Weight: removed - now handled at category/shelf level
  Price: string;
  'Net Weight'?: string;
  'Low Stock': string; // Changed from 'Inventory Status'
  'Sold Out': string; // Sold out status
  Notes?: string;
  'Original Shelf'?: string;
}

// Type guard functions for runtime type checking
export const isPrePackagedProduct = (product: AnyProduct): product is PrePackagedProduct => {
  return 'brand' in product && 'weight' in product && 'price' in product;
};

export const isStrain = (product: AnyProduct): product is Strain => {
  return 'grower' in product && 'isLastJar' in product;
};

export const isPrePackagedShelf = (shelf: AnyShelf): shelf is PrePackagedShelf => {
  return 'products' in shelf && !('pricing' in shelf);
};

export const isBulkShelf = (shelf: AnyShelf): shelf is Shelf => {
  return 'strains' in shelf && 'pricing' in shelf;
};

export const isPrePackagedSortCriteria = (criteria: AnySortCriteria): criteria is PrePackagedSortCriteria => {
  const prePackagedKeys: Array<PrePackagedSortCriteria['key']> = [
    'name', 'brand', 'type', 'thc', 'terpenes', 'price', 'isLowStock', 'isSoldOut', 'originalShelf'
  ];
  return prePackagedKeys.includes(criteria.key as PrePackagedSortCriteria['key']);
};

