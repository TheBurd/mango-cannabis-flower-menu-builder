export enum StrainType {
  SATIVA = "Sativa",
  SATIVA_HYBRID = "Sativa-Hybrid",
  HYBRID = "Hybrid",
  INDICA_HYBRID = "Indica-Hybrid",
  INDICA = "Indica",
}

export interface Strain {
  id: string;
  name: string;
  grower: string;
  thc: number | null;
  type: StrainType;
  isLastJar: boolean;
}

export interface PriceTiers {
  g: number;
  eighth: number;
  quarter: number;
  half: number;
  oz: number;
}

export interface SortCriteria {
  key: 'name' | 'grower' | 'type' | 'thc' | 'isLastJar';
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
  columns: 1 | 2 | 3 | 4;
  zoomLevel: number; // e.g., 1 = 100%
  forceShelfFit: boolean; // New setting for allowing shelves to split across columns
  headerImageSize: HeaderImageSize; // Added for selectable header images
  linePaddingMultiplier: number; // Multiplier for line item top/bottom padding (e.g., 0.3 = smaller padding, 0.5 = larger padding)
}

export enum SupportedStates {
  OKLAHOMA = "Oklahoma",
  // MICHIGAN = "Michigan", // Future
  // NEW_MEXICO = "New Mexico", // Future
  // NEW_YORK = "New York", // Future
}