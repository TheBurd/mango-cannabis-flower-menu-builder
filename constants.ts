import { Shelf, ArtboardSize, ArtboardDimensions, PreviewSettings, SupportedStates, StrainType, HeaderImageSize, PriceTiers } from './types';
import { getImagePath } from './utils/assets';
import { getIconPath } from './utils/assets';

export const OKLAHOMA_PRICING_HIERARCHY: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [
  { name: "Superior Flower", pricing: { g: 15, eighth: 45, quarter: 85, half: 160, oz: 300 }, color: "bg-mango-gradient", textColor: "text-white" },
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

export const MICHIGAN_PRICING_HIERARCHY: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [
  { name: "Exclusive Flower", pricing: { g: 15, eighth: 40, quarter: 75, half: 145, oz: 240 }, color: "bg-mango-gradient", textColor: "text-white" },
  { name: "Legendary Flower", pricing: { g: 10, eighth: 30, quarter: 55, half: 105, oz: 200 }, color: "bg-amber-500", textColor: "text-amber-50" },
  { name: "Diamond Flower", pricing: { g: 9, eighth: 25, quarter: 47, half: 90, oz: 175 }, color: "bg-sky-500", textColor: "text-sky-50" },
  { name: "Platinum Flower", pricing: { g: 8, eighth: 22, quarter: 40, half: 75, oz: 140 }, color: "bg-slate-700", textColor: "text-slate-50" },
  { name: "Exotic Flower", pricing: { g: 7, eighth: 18, quarter: 35, half: 65, oz: 125 }, color: "bg-rose-500", textColor: "text-rose-50" },
  { name: "Superior Flower", pricing: { g: 6, eighth: 17, quarter: 30, half: 55, oz: 100 }, color: "bg-violet-500", textColor: "text-violet-50" },
  { name: "Premium Flower", pricing: { g: 5, eighth: 15, quarter: 25, half: 45, oz: 80 }, color: "bg-emerald-500", textColor: "text-emerald-50" },
  { name: "Deluxe Flower", pricing: { g: 4, eighth: 12, quarter: 20, half: 35, oz: 60 }, color: "bg-indigo-500", textColor: "text-indigo-50" },
  { name: "Value Flower", pricing: { g: 3, eighth: 7, quarter: 13, half: 20, oz: 30 }, color: "bg-gray-500", textColor: "text-gray-50" },
  // Infused Flower Shelves (Michigan only)
  { name: "Exotic Live Resin Infused Flower", pricing: { g: 8, eighth: 0, quarter: 0, half: 0, oz: 0, fiveG: 35 }, color: "bg-gradient-to-r from-rose-600 to-pink-600", textColor: "text-white", isInfused: true },
  { name: "Premium Distillate Infused Flower", pricing: { g: 7, eighth: 0, quarter: 0, half: 0, oz: 0, fiveG: 30 }, color: "bg-gradient-to-r from-emerald-600 to-teal-600", textColor: "text-white", isInfused: true },
  { name: "Value Distillate Infused Flower", pricing: { g: 6, eighth: 0, quarter: 0, half: 0, oz: 0, fiveG: 25 }, color: "bg-gradient-to-r from-gray-600 to-slate-600", textColor: "text-white", isInfused: true },
  { name: "Legendary Shake", pricing: { g: 2, eighth: 5, quarter: 8, half: 14, oz: 20 }, color: "bg-lime-600", textColor: "text-lime-50" },
];

export const NEW_MEXICO_PRICING_HIERARCHY: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [
  { name: "Exclusive Flower", pricing: { g: 20, eighth: 40, quarter: 75, half: 140, oz: 250 }, color: "bg-mango-gradient", textColor: "text-white" },
  { name: "Legendary Flower", pricing: { g: 15, eighth: 35, quarter: 65, half: 110, oz: 200 }, color: "bg-amber-500", textColor: "text-amber-50" },
  { name: "Diamond Flower", pricing: { g: 12, eighth: 30, quarter: 55, half: 100, oz: 170 }, color: "bg-sky-500", textColor: "text-sky-50" },
  { name: "Platinum Flower", pricing: { g: 10, eighth: 25, quarter: 45, half: 85, oz: 140 }, color: "bg-slate-700", textColor: "text-slate-50" },
  { name: "Exotic Flower", pricing: { g: 8, eighth: 20, quarter: 35, half: 60, oz: 100 }, color: "bg-rose-500", textColor: "text-rose-50" },
  { name: "Premium Flower", pricing: { g: 6, eighth: 10, quarter: 20, half: 35, oz: 60 }, color: "bg-emerald-500", textColor: "text-emerald-50" },
  { name: "Value Flower", pricing: { g: 5, eighth: 9, quarter: 18, half: 30, oz: 45 }, color: "bg-gray-500", textColor: "text-gray-50" },
  { name: "Shake", pricing: { g: 3, eighth: 5, quarter: 10, half: 20, oz: 30 }, color: "bg-lime-600", textColor: "text-lime-50" },
];

// 50% OFF shelf configuration - appears at the top when enabled
export const FIFTY_PERCENT_OFF_SHELF: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'> = {
  name: "50% OFF STRAINS",
  pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, // Placeholder pricing, won't be displayed
  color: "bg-gradient-to-r from-red-500 to-orange-500",
  textColor: "text-white",
  hidePricing: true, // Don't show pricing for this shelf
};

// Shelf hierarchy for sorting (0 = highest tier, higher numbers = lower tier)
export const OKLAHOMA_SHELF_HIERARCHY: Record<string, number> = {
  "Superior Flower": 0,
  "Legendary Flower": 1,
  "Diamond Flower": 2,
  "Platinum Flower": 3,
  "Exotic Flower": 4,
  "Premium Flower": 5,
  "Deluxe Flower": 6,
  "Value Flower": 7,
  "Legendary Shake": 8,
  "Exotic Shake": 9,
};

export const MICHIGAN_SHELF_HIERARCHY: Record<string, number> = {
  "Exclusive Flower": 0,
  "Legendary Flower": 1,
  "Diamond Flower": 2,
  "Platinum Flower": 3,
  "Exotic Flower": 4,
  "Superior Flower": 5,
  "Premium Flower": 6,
  "Deluxe Flower": 7,
  "Value Flower": 8,
  "Exotic Live Resin Infused Flower": 9,
  "Premium Distillate Infused Flower": 10,
  "Value Distillate Infused Flower": 11,
  "Legendary Shake": 12,
};

export const NEW_MEXICO_SHELF_HIERARCHY: Record<string, number> = {
  "Exclusive Flower": 0,
  "Legendary Flower": 1,
  "Diamond Flower": 2,
  "Platinum Flower": 3,
  "Exotic Flower": 4,
  "Premium Flower": 5,
  "Value Flower": 6,
  "Shake": 7,
};

// Helper function to get shelf hierarchy for current state
export const getShelfHierarchy = (state: SupportedStates): Record<string, number> => {
  switch (state) {
    case SupportedStates.OKLAHOMA:
      return OKLAHOMA_SHELF_HIERARCHY;
    case SupportedStates.MICHIGAN:
      return MICHIGAN_SHELF_HIERARCHY;
    case SupportedStates.NEW_MEXICO:
      return NEW_MEXICO_SHELF_HIERARCHY;
    default:
      return OKLAHOMA_SHELF_HIERARCHY;
  }
};

// Helper function to get shelf pricing by name for a state
export const getShelfPricingByName = (shelfName: string, state: SupportedStates): PriceTiers | null => {
  const shelves = getDefaultShelves(state, false);
  const shelf = shelves.find(s => s.name === shelfName);
  return shelf ? shelf.pricing : null;
};

export const getDefaultShelves = (state: SupportedStates, includeFiftyPercentOff: boolean = false): Shelf[] => {
  let hierarchy: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [];
  
  switch (state) {
    case SupportedStates.OKLAHOMA:
      hierarchy = OKLAHOMA_PRICING_HIERARCHY;
      break;
    case SupportedStates.MICHIGAN:
      hierarchy = MICHIGAN_PRICING_HIERARCHY;
      break;
    case SupportedStates.NEW_MEXICO:
      hierarchy = NEW_MEXICO_PRICING_HIERARCHY;
      break;
    default:
      hierarchy = OKLAHOMA_PRICING_HIERARCHY;
  }

  // Add 50% OFF shelf at the beginning if enabled
  if (includeFiftyPercentOff) {
    hierarchy = [FIFTY_PERCENT_OFF_SHELF, ...hierarchy];
  }

  return hierarchy.map(shelf => ({
    ...shelf,
    id: crypto.randomUUID(),
    strains: [],
    sortCriteria: null, // Initialize sortCriteria
  }));
};

export const ARTBOARD_DIMENSIONS_MAP: Record<ArtboardSize, ArtboardDimensions> = {
  [ArtboardSize.LETTER_PORTRAIT]: { aspectRatio: 'aspect-[8.5/11]', naturalWidth: 2550, naturalHeight: 3300, maxWidthClass: 'max-w-[2550px]' },
  [ArtboardSize.LETTER_LANDSCAPE]: { aspectRatio: 'aspect-[11/8.5]', naturalWidth: 3300, naturalHeight: 2550, maxWidthClass: 'max-w-[3300px]' },
  [ArtboardSize.SCREEN_16_9_LANDSCAPE]: { aspectRatio: 'aspect-[16/9]', naturalWidth: 3300, naturalHeight: 1856, maxWidthClass: 'max-w-[3300px]' }, // Updated to match header image width
  [ArtboardSize.SCREEN_16_9_PORTRAIT]: { aspectRatio: 'aspect-[9/16]', naturalWidth: 1872, naturalHeight: 3328, maxWidthClass: 'max-w-[1872px]' }, // Updated to match header image width
};

export const INITIAL_PREVIEW_SETTINGS: PreviewSettings = {
  artboardSize: ArtboardSize.LETTER_PORTRAIT,
  baseFontSizePx: 10,
  columns: 1,
  zoomLevel: 0.25, 
  forceShelfFit: true, // Allow Shelf Splitting is OFF by default (true = no splitting, shelves stay together)
  headerImageSize: HeaderImageSize.NONE, // Default header image size
  linePaddingMultiplier: 0.3, // Default padding multiplier (corresponds to current tightened padding)
  showThcIcon: true, // Default to showing THC icon
};

export const HEADER_IMAGE_CONFIGS: Record<ArtboardSize, Partial<Record<Exclude<HeaderImageSize, HeaderImageSize.NONE>, { src: string; naturalHeight: number; naturalWidth: number }>>> = {
  [ArtboardSize.LETTER_PORTRAIT]: {
    [HeaderImageSize.LARGE]: { src: getImagePath("Flower Menu Page Header - 2550x450.jpg"), naturalHeight: 450, naturalWidth: 2550 },
    [HeaderImageSize.SMALL]: { src: getImagePath("Flower Menu Page Header - 2550x200.jpg"), naturalHeight: 200, naturalWidth: 2550 },
  },
  [ArtboardSize.LETTER_LANDSCAPE]: {
    [HeaderImageSize.LARGE]: { src: getImagePath("Flower Menu Page Header - 3300x500.jpg"), naturalHeight: 500, naturalWidth: 3300 },
    [HeaderImageSize.SMALL]: { src: getImagePath("Flower Menu Page Header - 3300x300.jpg"), naturalHeight: 300, naturalWidth: 3300 },
  },
  [ArtboardSize.SCREEN_16_9_LANDSCAPE]: { // Corresponds to user's "widescreenLandscape"
    [HeaderImageSize.LARGE]: { src: getImagePath("Flower Menu Page Header - 3300x300.jpg"), naturalHeight: 300, naturalWidth: 3300 },
    [HeaderImageSize.SMALL]: { src: getImagePath("Flower Menu Page Header - 3300x150.jpg"), naturalHeight: 150, naturalWidth: 3300 },
  },
  [ArtboardSize.SCREEN_16_9_PORTRAIT]: { // Corresponds to user's "widescreenPortrait"
    [HeaderImageSize.LARGE]: { src: getImagePath("Flower Menu Page Header - 1872x600.jpg"), naturalHeight: 600, naturalWidth: 1872 },
    [HeaderImageSize.SMALL]: { src: getImagePath("Flower Menu Page Header - 1872x300.jpg"), naturalHeight: 300, naturalWidth: 1872 },
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

// THC Icons for each state
export const STATE_THC_ICONS: Record<SupportedStates, string> = {
  [SupportedStates.OKLAHOMA]: getIconPath('thcSymbol_OK.svg'),
  [SupportedStates.MICHIGAN]: getIconPath('thcSymbol_MI.svg'),
  [SupportedStates.NEW_MEXICO]: getIconPath('thcSymbol_NM.svg'),
};

// Helper function to detect cross-state shelf conflicts
export const getCrossStateShelfConflicts = (fromState: SupportedStates, toState: SupportedStates): string[] => {
  if (fromState === toState) return [];
  
  const fromShelves = getDefaultShelves(fromState);
  const toShelves = getDefaultShelves(toState);
  
  const fromShelfNames = new Set(fromShelves.map(s => s.name.toLowerCase()));
  const toShelfNames = new Set(toShelves.map(s => s.name.toLowerCase()));
  
  const conflicts: string[] = [];
  
  // Find shelf names that exist in both states
  fromShelfNames.forEach(shelfName => {
    if (toShelfNames.has(shelfName)) {
      // Check if pricing is different
      const fromShelf = fromShelves.find(s => s.name.toLowerCase() === shelfName);
      const toShelf = toShelves.find(s => s.name.toLowerCase() === shelfName);
      
      if (fromShelf && toShelf) {
        const pricingDifferent = 
          fromShelf.pricing.g !== toShelf.pricing.g ||
          fromShelf.pricing.eighth !== toShelf.pricing.eighth ||
          fromShelf.pricing.quarter !== toShelf.pricing.quarter ||
          fromShelf.pricing.half !== toShelf.pricing.half ||
          fromShelf.pricing.oz !== toShelf.pricing.oz;
          
        if (pricingDifferent) {
          conflicts.push(fromShelf.name);
        }
      }
    }
  });
  
  return conflicts;
};

// EmailJS Configuration for Feedback Form
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create a new service (Gmail, Outlook, or any email provider)
// 3. Create an email template with the following variables:
//    - {{from_name}}, {{from_email}}, {{feedback_type}}, {{subject}}, {{message}}, {{app_name}}, {{app_version}}, {{timestamp}}
// 4. Replace the values below with your actual EmailJS credentials
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_of3tntm', // Replace with your EmailJS service ID
  TEMPLATE_ID: 'template_1hbgmlf', // Replace with your EmailJS template ID  
  PUBLIC_KEY: 'ZgKeb7PLVvudKcZMJ', // Replace with your EmailJS public key
  TO_EMAIL: 'brad@mangocannabis.com' // This is where feedback will be sent
};
    