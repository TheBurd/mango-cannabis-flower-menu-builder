import { PrePackagedProduct, PrePackagedWeight, StrainType } from '../types';
import { STRAIN_TYPES_ORDERED } from '../constants';

export interface WeightOrganizationSettings {
  primarySort: 'weight' | 'price' | 'brand' | 'thc' | 'name' | 'inventory';
  secondarySort?: 'weight' | 'price' | 'brand' | 'thc' | 'name' | 'inventory';
  groupBy: 'weight' | 'brand' | 'price-tier' | 'none';
  sortDirection: 'asc' | 'desc';
  prioritizeInventoryStatus: boolean;
  separateShakeProducts: boolean;
  emphasizeBrands: boolean;
}

export interface WeightBasedGroup {
  id: string;
  title: string;
  subtitle?: string;
  weight?: PrePackagedWeight;
  products: PrePackagedProduct[];
  priority: number;
  metadata: {
    totalValue: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    brandCount: number;
    hasInventoryAlerts: boolean;
  };
}

// Weight ordering constants
export const WEIGHT_PRIORITY: Record<PrePackagedWeight, number> = {
  [PrePackagedWeight.EIGHTH]: 1,    // 3.5g - highest priority
  [PrePackagedWeight.QUARTER]: 2,   // 7g
  [PrePackagedWeight.HALF]: 3,      // 14g  
  [PrePackagedWeight.OUNCE]: 4      // 28g - lowest priority
};

// Price tier definitions for intelligent grouping
export const PRICE_TIER_DEFINITIONS = {
  [PrePackagedWeight.EIGHTH]: [
    { name: 'Ultra Premium', min: 40, max: Infinity, priority: 1 },
    { name: 'Premium', min: 25, max: 39.99, priority: 2 },
    { name: 'Mid-Shelf', min: 15, max: 24.99, priority: 3 },
    { name: 'Value', min: 0, max: 14.99, priority: 4 }
  ],
  [PrePackagedWeight.QUARTER]: [
    { name: 'Premium', min: 35, max: Infinity, priority: 1 },
    { name: 'Standard', min: 20, max: 34.99, priority: 2 },
    { name: 'Value', min: 0, max: 19.99, priority: 3 }
  ],
  [PrePackagedWeight.HALF]: [
    { name: 'Premium', min: 60, max: Infinity, priority: 1 },
    { name: 'Standard', min: 35, max: 59.99, priority: 2 },
    { name: 'Value', min: 0, max: 34.99, priority: 3 }
  ],
  [PrePackagedWeight.OUNCE]: [
    { name: 'Premium Flower', min: 100, max: Infinity, priority: 1 },
    { name: 'Mid Flower', min: 60, max: 99.99, priority: 2 },
    { name: 'Value Flower', min: 40, max: 59.99, priority: 3 },
    { name: 'Premium Shake', min: 25, max: 39.99, priority: 4 },
    { name: 'Value Shake', min: 0, max: 24.99, priority: 5 }
  ]
};

// Detect if product is likely shake/trim based on price and name
export const isLikelyShakeProduct = (product: PrePackagedProduct): boolean => {
  const nameLower = product.name.toLowerCase();
  const shakeKeywords = ['shake', 'trim', 'smalls', 'popcorn', 'mini', 'nugget'];
  
  const hasShakeKeyword = shakeKeywords.some(keyword => nameLower.includes(keyword));
  
  // Price-based detection for ounces
  if (product.weight === PrePackagedWeight.OUNCE && product.price < 50) {
    return true;
  }
  
  return hasShakeKeyword;
};

// Get price tier for a product
export const getProductPriceTier = (product: PrePackagedProduct) => {
  const tiers = PRICE_TIER_DEFINITIONS[product.weight] || [];
  const tier = tiers.find(t => product.price >= t.min && product.price <= t.max);
  return tier || { name: 'Other', priority: 999, min: 0, max: Infinity };
};

// Check if product has inventory alerts
export const hasInventoryAlert = (product: PrePackagedProduct): boolean => {
  if (!product.inventoryStatus) return false;
  
  const status = product.inventoryStatus.toLowerCase();
  return status.includes('last') || status.includes('low') || status.includes('final') || 
         status.includes('limited') || /\d+\s*(left|remaining|units?)/.test(status);
};

// Sort products by multiple criteria
export const sortProducts = (
  products: PrePackagedProduct[], 
  settings: WeightOrganizationSettings
): PrePackagedProduct[] => {
  return [...products].sort((a, b) => {
    // Always prioritize inventory alerts if enabled
    if (settings.prioritizeInventoryStatus) {
      const aHasAlert = hasInventoryAlert(a);
      const bHasAlert = hasInventoryAlert(b);
      
      if (aHasAlert && !bHasAlert) return -1;
      if (!aHasAlert && bHasAlert) return 1;
    }
    
    // Primary sort
    let primaryComparison = 0;
    
    switch (settings.primarySort) {
      case 'weight':
        primaryComparison = WEIGHT_PRIORITY[a.weight] - WEIGHT_PRIORITY[b.weight];
        break;
      case 'price':
        primaryComparison = settings.sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
        break;
      case 'brand':
        primaryComparison = a.brand.localeCompare(b.brand);
        break;
      case 'thc':
        const aThc = a.thc || 0;
        const bThc = b.thc || 0;
        primaryComparison = settings.sortDirection === 'asc' ? aThc - bThc : bThc - aThc;
        break;
      case 'name':
        primaryComparison = a.name.localeCompare(b.name);
        break;
      case 'inventory':
        const aAlert = hasInventoryAlert(a);
        const bAlert = hasInventoryAlert(b);
        if (aAlert && !bAlert) return -1;
        if (!aAlert && bAlert) return 1;
        primaryComparison = 0;
        break;
    }
    
    if (primaryComparison !== 0) {
      return settings.sortDirection === 'desc' ? -primaryComparison : primaryComparison;
    }
    
    // Secondary sort
    if (settings.secondarySort && settings.secondarySort !== settings.primarySort) {
      let secondaryComparison = 0;
      
      switch (settings.secondarySort) {
        case 'weight':
          secondaryComparison = WEIGHT_PRIORITY[a.weight] - WEIGHT_PRIORITY[b.weight];
          break;
        case 'price':
          secondaryComparison = a.price - b.price;
          break;
        case 'brand':
          secondaryComparison = a.brand.localeCompare(b.brand);
          break;
        case 'thc':
          const aThc = a.thc || 0;
          const bThc = b.thc || 0;
          secondaryComparison = bThc - aThc; // Default to high to low for secondary
          break;
        case 'name':
          secondaryComparison = a.name.localeCompare(b.name);
          break;
      }
      
      return secondaryComparison;
    }
    
    // Tertiary sort by name as fallback
    return a.name.localeCompare(b.name);
  });
};

// Create weight-based groups
export const createWeightBasedGroups = (
  products: PrePackagedProduct[],
  settings: WeightOrganizationSettings
): WeightBasedGroup[] => {
  const groups: WeightBasedGroup[] = [];
  
  switch (settings.groupBy) {
    case 'weight':
      // Group by weight category
      const weightGroups = new Map<PrePackagedWeight, PrePackagedProduct[]>();
      
      products.forEach(product => {
        if (!weightGroups.has(product.weight)) {
          weightGroups.set(product.weight, []);
        }
        weightGroups.get(product.weight)!.push(product);
      });
      
      // Create groups for each weight
      WEIGHT_PRIORITY && Object.keys(WEIGHT_PRIORITY).forEach(weight => {
        const w = weight as PrePackagedWeight;
        const weightProducts = weightGroups.get(w) || [];
        
        if (weightProducts.length > 0) {
          const sortedProducts = sortProducts(weightProducts, settings);
          
          // Separate shake products if enabled
          let regularProducts = sortedProducts;
          let shakeProducts: PrePackagedProduct[] = [];
          
          if (settings.separateShakeProducts) {
            regularProducts = sortedProducts.filter(p => !isLikelyShakeProduct(p));
            shakeProducts = sortedProducts.filter(p => isLikelyShakeProduct(p));
          }
          
          // Add regular products group
          if (regularProducts.length > 0) {
            groups.push(createGroupFromProducts(regularProducts, `${w}-regular`, `${w} Products`, w));
          }
          
          // Add shake products group if any
          if (shakeProducts.length > 0) {
            groups.push(createGroupFromProducts(shakeProducts, `${w}-shake`, `${w} Shake/Trim`, w));
          }
        }
      });
      break;
      
    case 'brand':
      // Group by brand
      const brandGroups = new Map<string, PrePackagedProduct[]>();
      
      products.forEach(product => {
        const brand = product.brand || 'Unknown Brand';
        if (!brandGroups.has(brand)) {
          brandGroups.set(brand, []);
        }
        brandGroups.get(brand)!.push(product);
      });
      
      // Sort brands by total products and create groups
      const sortedBrands = Array.from(brandGroups.entries())
        .sort(([, a], [, b]) => b.length - a.length);
      
      sortedBrands.forEach(([brand, brandProducts]) => {
        const sortedProducts = sortProducts(brandProducts, settings);
        groups.push(createGroupFromProducts(sortedProducts, `brand-${brand}`, brand));
      });
      break;
      
    case 'price-tier':
      // Group by price tiers across all weights
      const allProducts = sortProducts(products, settings);
      const priceGroups = new Map<string, PrePackagedProduct[]>();
      
      allProducts.forEach(product => {
        const tier = getProductPriceTier(product);
        const tierKey = `${product.weight}-${tier.name}`;
        
        if (!priceGroups.has(tierKey)) {
          priceGroups.set(tierKey, []);
        }
        priceGroups.get(tierKey)!.push(product);
      });
      
      // Create groups sorted by priority
      const sortedPriceGroups = Array.from(priceGroups.entries())
        .map(([key, products]) => {
          const product = products[0];
          const tier = getProductPriceTier(product);
          return {
            key,
            products,
            weight: product.weight,
            tier,
            priority: WEIGHT_PRIORITY[product.weight] * 100 + tier.priority
          };
        })
        .sort((a, b) => a.priority - b.priority);
      
      sortedPriceGroups.forEach(({ key, products, tier, weight }) => {
        groups.push(createGroupFromProducts(
          products, 
          key, 
          `${weight} ${tier.name}`,
          weight
        ));
      });
      break;
      
    case 'none':
    default:
      // Single group with all products
      const sortedProducts = sortProducts(products, settings);
      if (sortedProducts.length > 0) {
        groups.push(createGroupFromProducts(sortedProducts, 'all', 'All Products'));
      }
      break;
  }
  
  return groups;
};

// Helper function to create group metadata
function createGroupFromProducts(
  products: PrePackagedProduct[], 
  id: string, 
  title: string,
  weight?: PrePackagedWeight
): WeightBasedGroup {
  const prices = products.map(p => p.price);
  const brands = new Set(products.map(p => p.brand));
  
  return {
    id,
    title,
    weight,
    products,
    priority: weight ? WEIGHT_PRIORITY[weight] : 0,
    metadata: {
      totalValue: prices.reduce((sum, price) => sum + price, 0),
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      brandCount: brands.size,
      hasInventoryAlerts: products.some(hasInventoryAlert)
    }
  };
}

// Filter products based on various criteria
export const filterProducts = (
  products: PrePackagedProduct[],
  filters: {
    weights?: PrePackagedWeight[];
    brands?: string[];
    priceRange?: { min: number; max: number };
    thcRange?: { min: number; max: number };
    strainTypes?: StrainType[];
    inventoryStatusOnly?: boolean;
    excludeShake?: boolean;
  }
): PrePackagedProduct[] => {
  return products.filter(product => {
    // Weight filter
    if (filters.weights && filters.weights.length > 0) {
      if (!filters.weights.includes(product.weight)) return false;
    }
    
    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand)) return false;
    }
    
    // Price range filter
    if (filters.priceRange) {
      if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
        return false;
      }
    }
    
    // THC range filter
    if (filters.thcRange && product.thc !== null) {
      if (product.thc < filters.thcRange.min || product.thc > filters.thcRange.max) {
        return false;
      }
    }
    
    // Strain type filter
    if (filters.strainTypes && filters.strainTypes.length > 0) {
      if (!filters.strainTypes.includes(product.type)) return false;
    }
    
    // Inventory status filter
    if (filters.inventoryStatusOnly) {
      if (!hasInventoryAlert(product)) return false;
    }
    
    // Exclude shake filter
    if (filters.excludeShake) {
      if (isLikelyShakeProduct(product)) return false;
    }
    
    return true;
  });
};

// Analyze product distribution for layout optimization
export interface ProductDistributionAnalysis {
  totalProducts: number;
  weightDistribution: Record<PrePackagedWeight, number>;
  brandDistribution: Record<string, number>;
  priceDistribution: {
    ranges: Array<{ min: number; max: number; count: number; }>;
    average: number;
    median: number;
  };
  recommendedLayout: {
    organizationMode: 'weight-first' | 'brand-first' | 'price-first';
    columnsRecommended: number;
    groupingStrategy: string;
  };
}

export const analyzeProductDistribution = (products: PrePackagedProduct[]): ProductDistributionAnalysis => {
  if (products.length === 0) {
    return {
      totalProducts: 0,
      weightDistribution: {} as Record<PrePackagedWeight, number>,
      brandDistribution: {},
      priceDistribution: {
        ranges: [],
        average: 0,
        median: 0
      },
      recommendedLayout: {
        organizationMode: 'weight-first',
        columnsRecommended: 1,
        groupingStrategy: 'single-column'
      }
    };
  }
  
  // Weight distribution
  const weightDistribution: Record<PrePackagedWeight, number> = {} as Record<PrePackagedWeight, number>;
  products.forEach(product => {
    weightDistribution[product.weight] = (weightDistribution[product.weight] || 0) + 1;
  });
  
  // Brand distribution
  const brandDistribution: Record<string, number> = {};
  products.forEach(product => {
    const brand = product.brand || 'Unknown';
    brandDistribution[brand] = (brandDistribution[brand] || 0) + 1;
  });
  
  // Price distribution
  const prices = products.map(p => p.price).sort((a, b) => a - b);
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const median = prices[Math.floor(prices.length / 2)];
  
  // Create price ranges
  const priceRanges = [
    { min: 0, max: 15, count: 0 },
    { min: 15, max: 30, count: 0 },
    { min: 30, max: 50, count: 0 },
    { min: 50, max: 100, count: 0 },
    { min: 100, max: Infinity, count: 0 }
  ];
  
  prices.forEach(price => {
    const range = priceRanges.find(r => price >= r.min && price < r.max);
    if (range) range.count++;
  });
  
  // Determine recommended layout
  const weightCount = Object.keys(weightDistribution).length;
  const brandCount = Object.keys(brandDistribution).length;
  const hasBalancedWeights = weightCount >= 3 && Math.max(...Object.values(weightDistribution)) / products.length < 0.7;
  const hasDominantBrands = brandCount <= 5 && Math.max(...Object.values(brandDistribution)) / products.length > 0.3;
  
  let organizationMode: 'weight-first' | 'brand-first' | 'price-first';
  let groupingStrategy: string;
  
  if (hasBalancedWeights) {
    organizationMode = 'weight-first';
    groupingStrategy = 'weight-categories-with-price-tiers';
  } else if (hasDominantBrands) {
    organizationMode = 'brand-first';
    groupingStrategy = 'brand-sections-with-weight-sorting';
  } else {
    organizationMode = 'price-first';
    groupingStrategy = 'price-tiers-across-weights';
  }
  
  // Column recommendations
  let columnsRecommended = 1;
  if (products.length > 50) columnsRecommended = 3;
  else if (products.length > 20) columnsRecommended = 2;
  
  return {
    totalProducts: products.length,
    weightDistribution,
    brandDistribution,
    priceDistribution: {
      ranges: priceRanges,
      average,
      median
    },
    recommendedLayout: {
      organizationMode,
      columnsRecommended,
      groupingStrategy
    }
  };
};