import { Shelf, PriceTiers, ArtboardSize, ArtboardDimensions, PreviewSettings, SupportedStates, StrainType, HeaderImageSize } from './types';

export const OKLAHOMA_PRICING_HIERARCHY: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [
  { name: "Superior Flower", pricing: { g: 15, eighth: 45, quarter: 85, half: 160, oz: 300 }, color: "bg-purple-600", textColor: "text-purple-50" },
  { name: "Legendary Flower", pricing: { g: 10, eighth: 30, quarter: 55, half: 105, oz: 200 }, color: "bg-amber-500", textColor: "text-amber-50" },
  { name: "Diamond Flower", pricing: { g: 9, eighth: 25, quarter: 47, half: 90, oz: 175 }, color: "bg-sky-500", textColor: "text-sky-50" },
  { name: "Platinum Flower", pricing: { g: 8, eighth: 22, quarter: 40, half: 75, oz: 140 }, color: "bg-slate-700", textColor: "text-slate-50" },
  { name: "Exotic Flower", pricing: { g: 6, eighth: 18, quarter: 35, half: 65, oz: 125 }, color: "bg-rose-500", textColor: "text-rose-50" },
  { name: "Premium Flower", pricing: { g: 5, eighth: 15, quarter: 25, half: 45, oz: 80 }, color: "bg-emerald-500", textColor: "text-emerald-50" },
  { name: "Deluxe Flower", pricing: { g: 4, eighth: 12, quarter: 20, half: 35, oz: 60 }, color: "bg-indigo-500", textColor: "text-indigo-50" },
  { name: "Value Flower", pricing: { g: 2, eighth: 6, quarter: 10, half: 16, oz: 30 }, color: "bg-gray-500", textColor: "text-gray-50" },
  { name: "Legendary Shake", pricing: { g: 1, eighth: 3.50, quarter: 6, half: 8, oz: 10 }, color: "bg-lime-600", textColor: "text-lime-50" },
  { name: "Exotic Shake", pricing: { g: 1, eighth: 2.50, quarter: 3.50, half: 4, oz: 5 }, color: "bg-teal-600", textColor: "text-teal-50" },
];

export const getDefaultShelves = (state: SupportedStates): Shelf[] => {
  if (state === SupportedStates.OKLAHOMA) {
    return OKLAHOMA_PRICING_HIERARCHY.map(shelf => ({
      ...shelf,
      id: crypto.randomUUID(),
      strains: [],
      sortCriteria: null, // Initialize sortCriteria
    }));
  }
  return [];
};

export const ARTBOARD_DIMENSIONS_MAP: Record<ArtboardSize, ArtboardDimensions> = {
  [ArtboardSize.LETTER_PORTRAIT]: { aspectRatio: 'aspect-[8.5/11]', naturalWidth: 2550, naturalHeight: 3300, maxWidthClass: 'max-w-[2550px]' },
  [ArtboardSize.LETTER_LANDSCAPE]: { aspectRatio: 'aspect-[11/8.5]', naturalWidth: 3300, naturalHeight: 2550, maxWidthClass: 'max-w-[3300px]' },
  [ArtboardSize.SCREEN_16_9_LANDSCAPE]: { aspectRatio: 'aspect-[16/9]', naturalWidth: 1920, naturalHeight: 1080, maxWidthClass: 'max-w-[1920px]' },
  [ArtboardSize.SCREEN_16_9_PORTRAIT]: { aspectRatio: 'aspect-[9/16]', naturalWidth: 1080, naturalHeight: 1920, maxWidthClass: 'max-w-[1080px]' },
};

export const INITIAL_PREVIEW_SETTINGS: PreviewSettings = {
  artboardSize: ArtboardSize.LETTER_PORTRAIT,
  baseFontSizePx: 10,
  columns: 1,
  zoomLevel: 0.25, 
  forceShelfFit: false,
  headerImageSize: HeaderImageSize.NONE, // Default header image size
  linePaddingMultiplier: 0.3, // Default padding multiplier (corresponds to current tightened padding)
};

export const HEADER_IMAGE_CONFIGS: Record<ArtboardSize, Partial<Record<Exclude<HeaderImageSize, HeaderImageSize.NONE>, { src: string; naturalHeight: number; naturalWidth: number }>>> = {
  [ArtboardSize.LETTER_PORTRAIT]: {
    [HeaderImageSize.LARGE]: { src: "/assets/images/Flower Menu Page Header - 2550x450.jpg", naturalHeight: 450, naturalWidth: 2550 },
    [HeaderImageSize.SMALL]: { src: "/assets/images/Flower Menu Page Header - 2550x200.jpg", naturalHeight: 200, naturalWidth: 2550 },
  },
  [ArtboardSize.LETTER_LANDSCAPE]: {
    [HeaderImageSize.LARGE]: { src: "/assets/images/Flower Menu Page Header - 3300x500.jpg", naturalHeight: 500, naturalWidth: 3300 },
    [HeaderImageSize.SMALL]: { src: "/assets/images/Flower Menu Page Header - 3300x300.jpg", naturalHeight: 300, naturalWidth: 3300 },
  },
  [ArtboardSize.SCREEN_16_9_LANDSCAPE]: { // Corresponds to user's "widescreenLandscape"
    [HeaderImageSize.LARGE]: { src: "/assets/images/Flower Menu Page Header - 3300x300.jpg", naturalHeight: 300, naturalWidth: 3300 },
    [HeaderImageSize.SMALL]: { src: "/assets/images/Flower Menu Page Header - 3300x150.jpg", naturalHeight: 150, naturalWidth: 3300 },
  },
  [ArtboardSize.SCREEN_16_9_PORTRAIT]: { // Corresponds to user's "widescreenPortrait"
    [HeaderImageSize.LARGE]: { src: "/assets/images/Flower Menu Page Header - 1872x600.jpg", naturalHeight: 600, naturalWidth: 1872 },
    [HeaderImageSize.SMALL]: { src: "/assets/images/Flower Menu Page Header - 1872x300.jpg", naturalHeight: 300, naturalWidth: 1872 },
  },
};


export const STRAIN_TYPES_ORDERED: StrainType[] = [
  StrainType.SATIVA,
  StrainType.SATIVA_HYBRID,
  StrainType.HYBRID,
  StrainType.INDICA_HYBRID,
  StrainType.INDICA,
];

export const STRAIN_TYPE_VISUALS: Record<StrainType, { acronym: string; primaryColor: string; gradient?: string; textColorClass: string }> = {
  [StrainType.SATIVA]: { acronym: 'S', primaryColor: '#fe9426', textColorClass: 'text-white' }, // Mango Orange
  [StrainType.SATIVA_HYBRID]: { acronym: 'SH', primaryColor: '', gradient: 'linear-gradient(to right, #fe9426, #73ad3b)', textColorClass: 'text-white' }, // Orange to Green
  [StrainType.HYBRID]: { acronym: 'H', primaryColor: '#73ad3b', textColorClass: 'text-white' }, // Mango Green
  [StrainType.INDICA_HYBRID]: { acronym: 'IH', primaryColor: '', gradient: 'linear-gradient(to right, #73ad3b, #a855f7)', textColorClass: 'text-white' }, // Green to Purple (Tailwind purple-500: #a855f7)
  [StrainType.INDICA]: { acronym: 'I', primaryColor: '#a855f7', textColorClass: 'text-white' }, // Tailwind purple-500: #a855f7
};


export const MANGO_MAIN_ORANGE = '#fe9426';
export const MANGO_SUPPORT_ORANGE = '#f9541a';
export const MANGO_MAIN_GREEN = '#73ad3b';
export const MANGO_SUPPORT_GREEN = '#A9ED65';

export const THC_DECIMAL_PLACES = 1;

export const MIN_SHELVES_PANEL_WIDTH = 250;
export const MIN_PREVIEW_PANEL_WIDTH = 350;
export const DEFAULT_SHELVES_PANEL_WIDTH = 550;
export const DIVIDER_WIDTH = 8; // px

// CSV Type Mapping
export const CSV_STRAIN_TYPE_MAP: Record<string, StrainType> = {
  'S': StrainType.SATIVA,
  'SATIVA': StrainType.SATIVA,
  'SATIVAHYBRID': StrainType.SATIVA_HYBRID,
  'S/H': StrainType.SATIVA_HYBRID,
  'SH': StrainType.SATIVA_HYBRID,
  'H/S': StrainType.SATIVA_HYBRID,
  'HS': StrainType.SATIVA_HYBRID,
  'HYBRID': StrainType.HYBRID,
  'H': StrainType.HYBRID,
  'INDICAHYBRID': StrainType.INDICA_HYBRID,
  'I/H': StrainType.INDICA_HYBRID,
  'IH': StrainType.INDICA_HYBRID,
  'H/I': StrainType.INDICA_HYBRID,
  'HI': StrainType.INDICA_HYBRID,
  'INDICA': StrainType.INDICA,
  'I': StrainType.INDICA,
};

export const APP_STRAIN_TYPE_TO_CSV_SUFFIX: Record<StrainType, string> = {
  [StrainType.SATIVA]: 'S',
  [StrainType.SATIVA_HYBRID]: 'H/S',
  [StrainType.HYBRID]: 'H',
  [StrainType.INDICA_HYBRID]: 'H/I',
  [StrainType.INDICA]: 'I',
};
    