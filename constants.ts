import { Shelf, ArtboardSize, ArtboardDimensions, PreviewSettings, SupportedStates, StrainType, HeaderImageSize, PriceTiers, PrePackagedShelf, PrePackagedWeight, MenuMode } from './types';
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

export const NEW_YORK_PRICING_HIERARCHY: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [
  // New York supports Pre-Packaged mode only - no bulk flower pricing tiers
];

// OKLAHOMA PRE-PACKAGED PRICING HIERARCHIES
// Organized by weight categories with separate Flower (orange gradient) and Shake (green gradient)
// Team can assign their own specific prices within each weight category
export const OKLAHOMA_PREPACKAGED_PRICING_HIERARCHY: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [
  // FLOWER CATEGORIES - Orange Gradient (#FFA447 to #F46A4E)
  // 28g Flower - Darkest Orange
  { name: "28g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#F46A4E]", textColor: "text-white" },
  
  // 14g Flower - Mid-Dark Orange  
  { name: "14g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#F7824A]", textColor: "text-white" },
  
  // 7g Flower - Mid-Light Orange
  { name: "7g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#FA9B48]", textColor: "text-white" },
  
  // 3.5g Flower - Lightest Orange
  { name: "3.5g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#FFA447]", textColor: "text-white" },
  
  // SHAKE CATEGORIES - Green Gradient (#79BC3F to #2A9016)
  // 28g Shake - Darkest Green
  { name: "28g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#2A9016]", textColor: "text-white" },
  
  // 14g Shake - Mid-Dark Green
  { name: "14g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#3FA525]", textColor: "text-white" },
  
  // 7g Shake - Mid-Light Green  
  { name: "7g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#55BA35]", textColor: "text-white" },
  
  // 3.5g Shake - Lightest Green
  { name: "3.5g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#79BC3F]", textColor: "text-white" },
];

// NEW YORK PRE-PACKAGED PRICING HIERARCHIES
// Organized by weight categories with separate Flower (orange gradient) and Shake (green gradient)
// New York follows weight-based organization similar to Oklahoma but only supports Pre-Packaged mode
export const NEW_YORK_PREPACKAGED_PRICING_HIERARCHY: Omit<Shelf, 'strains' | 'id' | 'sortCriteria'>[] = [
  // FLOWER CATEGORIES - Orange Gradient (same as other states)
  // 28g Flower - Darkest Orange
  { name: "28g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#F46A4E]", textColor: "text-white" },
  
  // 14g Flower - Mid-Dark Orange  
  { name: "14g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#F7824A]", textColor: "text-white" },
  
  // 7g Flower - Mid-Light Orange
  { name: "7g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#FA9B48]", textColor: "text-white" },
  
  // 3.5g Flower - Lightest Orange
  { name: "3.5g Flower", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#FFA447]", textColor: "text-white" },
  
  // SHAKE CATEGORIES - Green Gradient (#79BC3F to #2A9016)
  // 28g Shake - Darkest Green
  { name: "28g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#2A9016]", textColor: "text-white" },
  
  // 14g Shake - Mid-Dark Green
  { name: "14g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#3FA525]", textColor: "text-white" },
  
  // 7g Shake - Mid-Light Green  
  { name: "7g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#55BA35]", textColor: "text-white" },
  
  // 3.5g Shake - Lightest Green
  { name: "3.5g Shake", pricing: { g: 0, eighth: 0, quarter: 0, half: 0, oz: 0 }, color: "bg-[#79BC3F]", textColor: "text-white" },
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

export const NEW_YORK_SHELF_HIERARCHY: Record<string, number> = {
  // New York supports Pre-Packaged mode only - no bulk flower shelf hierarchy
};

// Shelf hierarchy for pre-packaged products (organized by weight categories)
// Simple weight-based organization - team assigns specific prices within each category
export const OKLAHOMA_PREPACKAGED_SHELF_HIERARCHY: Record<string, number> = {
  // Organized by weight categories only
  "28g Flower": 0,
  "28g Shake": 1,
  "14g Flower": 2,
  "7g Flower": 3,
  "3.5g Flower": 4,
};

export const NEW_YORK_PREPACKAGED_SHELF_HIERARCHY: Record<string, number> = {
  // Organized by weight categories only - same structure as Oklahoma
  "28g Flower": 0,
  "28g Shake": 1,
  "14g Flower": 2,
  "7g Flower": 3,
  "3.5g Flower": 4,
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
    case SupportedStates.NEW_YORK:
      // New York only supports Pre-Packaged mode, no bulk shelves
      return {};
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
    case SupportedStates.NEW_YORK:
      hierarchy = NEW_YORK_PRICING_HIERARCHY;
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

// Helper functions for pre-packaged mode
export const getShelfHierarchyPrepackaged = (state: SupportedStates): Record<string, number> => {
  switch (state) {
    case SupportedStates.OKLAHOMA:
      return OKLAHOMA_PREPACKAGED_SHELF_HIERARCHY;
    case SupportedStates.MICHIGAN:
      // TODO: Add Michigan pre-packaged hierarchy when needed
      return OKLAHOMA_PREPACKAGED_SHELF_HIERARCHY;
    case SupportedStates.NEW_MEXICO:
      // TODO: Add New Mexico pre-packaged hierarchy when needed
      return OKLAHOMA_PREPACKAGED_SHELF_HIERARCHY;
    case SupportedStates.NEW_YORK:
      return NEW_YORK_PREPACKAGED_SHELF_HIERARCHY;
    default:
      return OKLAHOMA_PREPACKAGED_SHELF_HIERARCHY;
  }
};

export const getDefaultShelvesPrepackaged = (state: SupportedStates, includeFiftyPercentOff: boolean = false): PrePackagedShelf[] => {
  let hierarchy: Omit<PrePackagedShelf, 'products' | 'id' | 'sortCriteria'>[] = [];
  
  switch (state) {
    case SupportedStates.OKLAHOMA:
      // Use the pricing hierarchy for Oklahoma pre-packaged products (price-point based organization)
      hierarchy = OKLAHOMA_PREPACKAGED_PRICING_HIERARCHY.map(shelf => ({
        name: shelf.name,
        color: shelf.color,
        textColor: shelf.textColor,
        hidePricing: shelf.hidePricing,
        brandEmphasis: true, // Enable brand emphasis for pre-packaged products
        weightFilter: getWeightFilterFromShelfName(shelf.name),
      }));
      break;
    case SupportedStates.MICHIGAN:
      // TODO: Add Michigan pre-packaged hierarchy when needed
      hierarchy = OKLAHOMA_PREPACKAGED_PRICING_HIERARCHY.map(shelf => ({
        name: shelf.name,
        color: shelf.color,
        textColor: shelf.textColor,
        hidePricing: shelf.hidePricing,
        brandEmphasis: true,
        weightFilter: getWeightFilterFromShelfName(shelf.name),
      }));
      break;
    case SupportedStates.NEW_MEXICO:
      // TODO: Add New Mexico pre-packaged hierarchy when needed
      hierarchy = OKLAHOMA_PREPACKAGED_PRICING_HIERARCHY.map(shelf => ({
        name: shelf.name,
        color: shelf.color,
        textColor: shelf.textColor,
        hidePricing: shelf.hidePricing,
        brandEmphasis: true,
        weightFilter: getWeightFilterFromShelfName(shelf.name),
      }));
      break;
    case SupportedStates.NEW_YORK:
      // Use New York specific pre-packaged hierarchy (blue gradient)
      hierarchy = NEW_YORK_PREPACKAGED_PRICING_HIERARCHY.map(shelf => ({
        name: shelf.name,
        color: shelf.color,
        textColor: shelf.textColor,
        hidePricing: shelf.hidePricing,
        brandEmphasis: true,
        weightFilter: getWeightFilterFromShelfName(shelf.name),
      }));
      break;
    default:
      hierarchy = OKLAHOMA_PREPACKAGED_PRICING_HIERARCHY.map(shelf => ({
        name: shelf.name,
        color: shelf.color,
        textColor: shelf.textColor,
        hidePricing: shelf.hidePricing,
        brandEmphasis: true,
        weightFilter: getWeightFilterFromShelfName(shelf.name),
      }));
  }

  // Add 50% OFF shelf at the beginning if enabled (converted to PrePackagedShelf format)
  if (includeFiftyPercentOff) {
    const fiftyPercentOffPrepackaged = {
      name: FIFTY_PERCENT_OFF_SHELF.name,
      color: FIFTY_PERCENT_OFF_SHELF.color,
      textColor: FIFTY_PERCENT_OFF_SHELF.textColor,
      hidePricing: FIFTY_PERCENT_OFF_SHELF.hidePricing,
      brandEmphasis: true,
    };
    hierarchy = [fiftyPercentOffPrepackaged, ...hierarchy];
  }

  return hierarchy.map(shelf => ({
    ...shelf,
    id: crypto.randomUUID(),
    products: [],
    sortCriteria: null, // Initialize sortCriteria
  }));
};

// Helper function to get shelf pricing by name for pre-packaged mode
export const getShelfPricingByNamePrepackaged = (shelfName: string, state: SupportedStates): PriceTiers | null => {
  // Pre-packaged products use fixed pricing per item, not per-gram pricing
  // Return the pricing structure from the original hierarchy for reference only
  const originalShelves = getDefaultShelves(state, false);
  const shelf = originalShelves.find(s => s.name === shelfName);
  return shelf ? shelf.pricing : null;
};

// Helper function to detect weight category from shelf name
export const getWeightCategoryFromShelfName = (shelfName: string): string => {
  if (shelfName.includes('3.5g')) return '3.5g';
  if (shelfName.includes('7g')) return '7g';
  if (shelfName.includes('14g')) return '14g';
  if (shelfName.includes('28g')) return '28g';
  return 'unknown';
};

// Helper function to check if shelf is shake/trim category
export const isShakeCategory = (shelfName: string): boolean => {
  return shelfName.toLowerCase().includes('shake') || shelfName.toLowerCase().includes('trim');
};

// Helper function to get weight filter from shelf name
export const getWeightFilterFromShelfName = (shelfName: string): PrePackagedWeight[] | undefined => {
  if (shelfName.includes('3.5g')) return [PrePackagedWeight.EIGHTH];
  if (shelfName.includes('7g')) return [PrePackagedWeight.QUARTER];
  if (shelfName.includes('14g')) return [PrePackagedWeight.HALF];
  if (shelfName.includes('28g')) return [PrePackagedWeight.OUNCE];
  return undefined; // No filter for mixed weight shelves
};

// Weight-specific display configurations for pre-packaged products
export const PREPACKAGED_WEIGHT_CONFIGS = {
  '3.5g': {
    displayName: '3.5g Eighths',
    pricingField: 'eighth' as keyof PriceTiers,
    sortPriority: 1,
  },
  '7g': {
    displayName: '7g Quarters',
    pricingField: 'quarter' as keyof PriceTiers,
    sortPriority: 2,
  },
  '14g': {
    displayName: '14g Halfs',
    pricingField: 'half' as keyof PriceTiers,
    sortPriority: 3,
  },
  '28g': {
    displayName: '28g Ounces',
    pricingField: 'oz' as keyof PriceTiers,
    sortPriority: 4,
  },
};

export const ARTBOARD_DIMENSIONS_MAP: Record<ArtboardSize, ArtboardDimensions> = {
  [ArtboardSize.LETTER_PORTRAIT]: { aspectRatio: 'aspect-[8.5/11]', naturalWidth: 2550, naturalHeight: 3300, maxWidthClass: 'max-w-[2550px]' },
  [ArtboardSize.LETTER_LANDSCAPE]: { aspectRatio: 'aspect-[11/8.5]', naturalWidth: 3300, naturalHeight: 2550, maxWidthClass: 'max-w-[3300px]' },
  [ArtboardSize.SCREEN_16_9_LANDSCAPE]: { aspectRatio: 'aspect-[16/9]', naturalWidth: 3300, naturalHeight: 1856, maxWidthClass: 'max-w-[3300px]' }, // Updated to match header image width
  [ArtboardSize.SCREEN_16_9_PORTRAIT]: { aspectRatio: 'aspect-[9/16]', naturalWidth: 1872, naturalHeight: 3328, maxWidthClass: 'max-w-[1872px]' }, // Updated to match header image width
};

export const INITIAL_PREVIEW_SETTINGS: PreviewSettings = {
  artboardSize: ArtboardSize.LETTER_PORTRAIT,
  baseFontSizePx: 16,
  columns: 2,
  zoomLevel: 0.25, 
  forceShelfFit: false, // Allow Shelf Splitting is ON by default (false = splitting enabled, shelves can split across columns)
  headerImageSize: HeaderImageSize.SMALL, // Default header image size
  linePaddingMultiplier: 0.5, // Default padding multiplier (corresponds to current tightened padding)
  showThcIcon: true, // Default to showing THC icon
  showSoldOutProducts: false, // Default to hiding sold out products
  menuMode: MenuMode.BULK, // Default to bulk flower mode
  showTerpenes: true, // Default to showing terpenes in pre-packaged mode
  terpeneHighlightThreshold: 2.0, // Highlight terpenes above 2.0%
  terpeneDisplayFormat: 'percentage', // Display as percentage by default
  showLowStock: true, // Default to showing low stock indicators in pre-packaged mode
  inventoryHighlightLowStock: true, // Highlight low stock items by default
  showNetWeight: false, // Default to hiding net weight in pre-packaged mode
  netWeightPrecision: 2, // Default to 2 decimal places for net weight
  // Multi-page defaults - DEPRECATED but preserved for future development
  pageCount: 1, // Always single page for now
  currentPage: 1, // Always first page
  autoPageBreaks: false, // Multi-page disabled
  // Footer defaults
  showMenuDate: false, // Default to hiding menu date
  menuDateText: (() => {
    const today = new Date();
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const day = today.getDate();
    const year = today.getFullYear();
    return `Updated: ${month} ${day}, ${year}`;
  })(), // Default date text with full date
  menuDatePosition: 'left', // Default position for date text
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
  [StrainType.SATIVA]: { acronym: 'S', primaryColor: 'var(--strain-sativa, #fe9426)', textColorClass: 'text-white' }, // Mango Orange
  [StrainType.SATIVA_HYBRID]: { acronym: 'SH', primaryColor: '', gradient: 'var(--strain-sativa-hybrid, linear-gradient(to right, #fe9426, #73ad3b))', textColorClass: 'text-white' }, // Orange to Green
  [StrainType.HYBRID]: { acronym: 'H', primaryColor: 'var(--strain-hybrid, #73ad3b)', textColorClass: 'text-white' }, // Mango Green
  [StrainType.INDICA_HYBRID]: { acronym: 'IH', primaryColor: '', gradient: 'var(--strain-indica-hybrid, linear-gradient(to right, #73ad3b, #a855f7))', textColorClass: 'text-white' }, // Green to Purple
  [StrainType.INDICA]: { acronym: 'I', primaryColor: 'var(--strain-indica, #a855f7)', textColorClass: 'text-white' }, // Purple
};


// CSS Custom Properties for theme-aware colors
// These map to variables defined in styles/theme-variables.css
export const MANGO_MAIN_ORANGE = 'var(--mango-main-orange, #fe9426)';
export const MANGO_SUPPORT_ORANGE = 'var(--mango-support-orange, #f9541a)';
export const MANGO_MAIN_GREEN = 'var(--mango-main-green, #73ad3b)';
export const MANGO_SUPPORT_GREEN = 'var(--mango-support-green, #A9ED65)';

// Legacy color values for backward compatibility
export const MANGO_MAIN_ORANGE_VALUE = '#fe9426';
export const MANGO_SUPPORT_ORANGE_VALUE = '#f9541a';
export const MANGO_MAIN_GREEN_VALUE = '#73ad3b';
export const MANGO_SUPPORT_GREEN_VALUE = '#A9ED65';

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

// CSV shelf name mappings for pre-packaged products
// Updated to map to weight-based categories (team sets specific prices within)
export const CSV_PREPACKAGED_SHELF_MAP: Record<string, string> = {
  // All 3.5g variations map to 3.5g Flower category
  '3.5G': '3.5g Flower',
  '35': '3.5g Flower', 
  'EIGHTH': '3.5g Flower',
  
  // All 7g variations map to 7g Flower category  
  '7G': '7g Flower',
  '7': '7g Flower',
  'QUARTER': '7g Flower',
  
  // All 14g variations map to 14g Flower category
  '14G': '14g Flower',
  '14': '14g Flower',
  'HALF': '14g Flower', 
  
  // All 28g flower variations map to 28g Flower category
  '28G': '28g Flower',
  '28': '28g Flower',
  'OUNCE': '28g Flower',
  'OZ': '28g Flower',
  
  // All shake variations map to 28g Shake category
  'SHAKE': '28g Shake',
  'SHAKE 28G': '28g Shake',
  'TRIM': '28g Shake',
  'SHAKE 28': '28g Shake',
};

// THC Icons for each state
export const STATE_THC_ICONS: Record<SupportedStates, string> = {
  [SupportedStates.OKLAHOMA]: getIconPath('thcSymbol_OK.svg'),
  [SupportedStates.MICHIGAN]: getIconPath('thcSymbol_MI.svg'),
  [SupportedStates.NEW_MEXICO]: getIconPath('thcSymbol_NM.svg'),
  [SupportedStates.NEW_YORK]: getIconPath('thcSymbol_NY.svg'),
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

// Pre-packaged product shelves for Oklahoma
export const OKLAHOMA_PREPACKAGED_SHELVES: Omit<PrePackagedShelf, 'products' | 'id' | 'sortCriteria'>[] = [
  { name: "Premium Pre-Rolls", color: "bg-emerald-500", textColor: "text-emerald-50" },
  { name: "Edibles", color: "bg-purple-500", textColor: "text-purple-50" },
  { name: "Concentrates", color: "bg-amber-500", textColor: "text-amber-50" },
  { name: "Cartridges", color: "bg-blue-500", textColor: "text-blue-50" },
  { name: "Disposables", color: "bg-pink-500", textColor: "text-pink-50" },
  { name: "Topicals", color: "bg-teal-500", textColor: "text-teal-50" },
  { name: "Accessories", color: "bg-gray-500", textColor: "text-gray-50" },
];

export const MICHIGAN_PREPACKAGED_SHELVES: Omit<PrePackagedShelf, 'products' | 'id' | 'sortCriteria'>[] = [
  { name: "Premium Pre-Rolls", color: "bg-emerald-500", textColor: "text-emerald-50" },
  { name: "Edibles", color: "bg-purple-500", textColor: "text-purple-50" },
  { name: "Concentrates", color: "bg-amber-500", textColor: "text-amber-50" },
  { name: "Cartridges", color: "bg-blue-500", textColor: "text-blue-50" },
  { name: "Disposables", color: "bg-pink-500", textColor: "text-pink-50" },
  { name: "Topicals", color: "bg-teal-500", textColor: "text-teal-50" },
  { name: "Accessories", color: "bg-gray-500", textColor: "text-gray-50" },
];

export const NEW_MEXICO_PREPACKAGED_SHELVES: Omit<PrePackagedShelf, 'products' | 'id' | 'sortCriteria'>[] = [
  { name: "Premium Pre-Rolls", color: "bg-emerald-500", textColor: "text-emerald-50" },
  { name: "Edibles", color: "bg-purple-500", textColor: "text-purple-50" },
  { name: "Concentrates", color: "bg-amber-500", textColor: "text-amber-50" },
  { name: "Cartridges", color: "bg-blue-500", textColor: "text-blue-50" },
  { name: "Disposables", color: "bg-pink-500", textColor: "text-pink-50" },
  { name: "Topicals", color: "bg-teal-500", textColor: "text-teal-50" },
  { name: "Accessories", color: "bg-gray-500", textColor: "text-gray-50" },
];

// Helper function to get default pre-packaged shelves
export const getDefaultPrePackagedShelves = (state: SupportedStates): PrePackagedShelf[] => {
  // All states now support Pre-Packaged mode with weight-based pricing hierarchy
  let hierarchy: Omit<PrePackagedShelf, 'products' | 'id' | 'sortCriteria'>[] = [];
  
  // Use state-specific pricing hierarchies for optimal organization
  switch (state) {
    case SupportedStates.NEW_YORK:
      // New York uses blue gradient for flower categories
      hierarchy = NEW_YORK_PREPACKAGED_PRICING_HIERARCHY.map(shelf => ({
        name: shelf.name,
        color: shelf.color,
        textColor: shelf.textColor,
        hidePricing: shelf.hidePricing,
        brandEmphasis: true,
        weightFilter: getWeightFilterFromShelfName(shelf.name),
      }));
      break;
    default:
      // Use the Oklahoma pricing hierarchy for all other states (weight-based organization)
      hierarchy = OKLAHOMA_PREPACKAGED_PRICING_HIERARCHY.map(shelf => ({
        name: shelf.name,
        color: shelf.color,
        textColor: shelf.textColor,
        hidePricing: shelf.hidePricing,
        brandEmphasis: true, // Enable brand emphasis for pre-packaged products
        weightFilter: getWeightFilterFromShelfName(shelf.name),
      }));
  }

  return hierarchy.map(shelf => ({
    ...shelf,
    id: crypto.randomUUID(),
    products: [],
    sortCriteria: null,
  }));
};