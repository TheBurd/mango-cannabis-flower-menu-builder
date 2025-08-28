import React, { useMemo } from 'react';
import { PrePackagedProduct, PrePackagedWeight, SupportedStates } from '../types';
import { WeightCategoryHeader } from './WeightCategoryHeader';
import { ProductGroupRenderer, ProductGroup } from './ProductGroupRenderer';

interface WeightBasedShelfRendererProps {
  products: PrePackagedProduct[];
  baseFontSizePx: number;
  linePaddingMultiplier: number;
  marginBottomStyle: string;
  applyAvoidBreakStyle: boolean;
  showOverflowWarning: boolean;
  currentState: SupportedStates;
  showTerpenes: boolean;
  showInventoryStatus: boolean;
  showNetWeight: boolean;
  showPricing: boolean;
  organizationMode: 'weight-first' | 'price-first' | 'brand-first';
  groupByBrand?: boolean;
  sortByPrice?: boolean;
}

// Weight ordering for consistent display
const WEIGHT_ORDER: PrePackagedWeight[] = [
  PrePackagedWeight.EIGHTH,    // 3.5g
  PrePackagedWeight.QUARTER,   // 7g
  PrePackagedWeight.HALF,      // 14g
  PrePackagedWeight.OUNCE      // 28g
];

// Price tier definitions for grouping
const PRICE_TIERS = {
  [PrePackagedWeight.EIGHTH]: [
    { name: 'Premium', min: 30, max: 50, color: 'bg-gradient-to-r from-amber-400 to-orange-400', textColor: 'text-white' },
    { name: 'Mid-Tier', min: 20, max: 29.99, color: 'bg-gradient-to-r from-emerald-400 to-teal-400', textColor: 'text-white' },
    { name: 'Value', min: 0, max: 19.99, color: 'bg-gradient-to-r from-blue-400 to-indigo-400', textColor: 'text-white' }
  ],
  [PrePackagedWeight.QUARTER]: [
    { name: 'Premium', min: 35, max: 100, color: 'bg-gradient-to-r from-purple-400 to-pink-400', textColor: 'text-white' },
    { name: 'Value', min: 0, max: 34.99, color: 'bg-gradient-to-r from-cyan-400 to-blue-400', textColor: 'text-white' }
  ],
  [PrePackagedWeight.HALF]: [
    { name: 'Premium', min: 50, max: 200, color: 'bg-gradient-to-r from-rose-400 to-red-400', textColor: 'text-white' },
    { name: 'Value', min: 0, max: 49.99, color: 'bg-gradient-to-r from-violet-400 to-purple-400', textColor: 'text-white' }
  ],
  [PrePackagedWeight.OUNCE]: [
    { name: 'Premium Flower', min: 80, max: 300, color: 'bg-gradient-to-r from-orange-500 to-red-500', textColor: 'text-white' },
    { name: 'Premium Shake', min: 30, max: 79.99, color: 'bg-gradient-to-r from-lime-500 to-green-500', textColor: 'text-white' },
    { name: 'Value Shake', min: 0, max: 29.99, color: 'bg-gradient-to-r from-yellow-500 to-orange-500', textColor: 'text-white' }
  ]
};

// Group products by weight
const groupProductsByWeight = (products: PrePackagedProduct[]): Map<PrePackagedWeight, PrePackagedProduct[]> => {
  const weightGroups = new Map<PrePackagedWeight, PrePackagedProduct[]>();
  
  products.forEach(product => {
    if (!weightGroups.has(product.weight)) {
      weightGroups.set(product.weight, []);
    }
    weightGroups.get(product.weight)!.push(product);
  });
  
  return weightGroups;
};

// Create price-based product groups within a weight category
const createPriceGroups = (products: PrePackagedProduct[], weight: PrePackagedWeight): ProductGroup[] => {
  const tiers = PRICE_TIERS[weight] || [];
  const groups: ProductGroup[] = [];
  
  tiers.forEach((tier, index) => {
    const tierProducts = products.filter(p => p.price >= tier.min && p.price <= tier.max);
    
    if (tierProducts.length > 0) {
      groups.push({
        id: `${weight}-${tier.name.toLowerCase()}`,
        title: `${tier.name} (${tier.min === 0 ? 'Up to' : tier.max === Infinity ? 'From' : ''} $${tier.max === Infinity ? tier.min : tier.max})`,
        products: tierProducts,
        priority: index,
        color: tier.color,
        textColor: tier.textColor
      });
    }
  });
  
  // Handle products that don't fit into any tier
  const uncategorizedProducts = products.filter(p => 
    !tiers.some(tier => p.price >= tier.min && p.price <= tier.max)
  );
  
  if (uncategorizedProducts.length > 0) {
    groups.push({
      id: `${weight}-other`,
      title: 'Other',
      products: uncategorizedProducts,
      priority: 999,
      color: 'bg-gray-400',
      textColor: 'text-white'
    });
  }
  
  return groups.sort((a, b) => a.priority - b.priority);
};

// Create brand-based product groups
const createBrandGroups = (products: PrePackagedProduct[]): ProductGroup[] => {
  const brandMap = new Map<string, PrePackagedProduct[]>();
  
  products.forEach(product => {
    const brand = product.brand || 'Unknown Brand';
    if (!brandMap.has(brand)) {
      brandMap.set(brand, []);
    }
    brandMap.get(brand)!.push(product);
  });
  
  const groups: ProductGroup[] = [];
  let priority = 0;
  
  // Sort brands by total product count (most products first)
  const sortedBrands = Array.from(brandMap.entries())
    .sort(([, a], [, b]) => b.length - a.length);
  
  sortedBrands.forEach(([brand, brandProducts]) => {
    groups.push({
      id: `brand-${brand.toLowerCase().replace(/\s+/g, '-')}`,
      title: brand,
      products: brandProducts,
      priority: priority++,
      color: 'bg-gradient-to-r from-slate-400 to-gray-400',
      textColor: 'text-white'
    });
  });
  
  return groups;
};

export const WeightBasedShelfRenderer: React.FC<WeightBasedShelfRendererProps> = ({
  products,
  baseFontSizePx,
  linePaddingMultiplier,
  marginBottomStyle,
  applyAvoidBreakStyle,
  showOverflowWarning,
  currentState,
  showTerpenes,
  showInventoryStatus,
  showNetWeight,
  showPricing = true,
  organizationMode,
  groupByBrand = false,
  sortByPrice = true
}) => {
  const containerStyle: React.CSSProperties = useMemo(() => ({
    marginBottom: marginBottomStyle,
    ...(applyAvoidBreakStyle && {
      breakInside: 'avoid-column' as const,
    }),
  }), [marginBottomStyle, applyAvoidBreakStyle]);

  const overflowWarningStyle: React.CSSProperties = useMemo(() => ({
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    color: '#856404',
    padding: `${baseFontSizePx * 0.3}px ${baseFontSizePx * 0.5}px`,
    fontSize: `${baseFontSizePx * 0.7}px`,
    borderRadius: '3px',
    marginBottom: `${baseFontSizePx * 0.4}px`,
    textAlign: 'center' as const,
  }), [baseFontSizePx]);

  // Organize products based on the selected mode
  const organizedContent = useMemo(() => {
    if (products.length === 0) return null;

    switch (organizationMode) {
      case 'weight-first':
        const weightGroups = groupProductsByWeight(products);
        return WEIGHT_ORDER.map(weight => {
          const weightProducts = weightGroups.get(weight);
          if (!weightProducts || weightProducts.length === 0) return null;

          const priceGroups = createPriceGroups(weightProducts, weight);
          
          return (
            <div key={weight}>
              <WeightCategoryHeader
                weight={weight}
                productCount={weightProducts.length}
                baseFontSizePx={baseFontSizePx}
                marginBottomStyle={`${baseFontSizePx * 0.8}px`}
              />
              
              {priceGroups.map(group => (
                <ProductGroupRenderer
                  key={group.id}
                  group={group}
                  baseFontSizePx={baseFontSizePx}
                  linePaddingMultiplier={linePaddingMultiplier}
                  currentState={currentState}
                  showTerpenes={showTerpenes}
                  showInventoryStatus={showInventoryStatus}
                  showNetWeight={showNetWeight}
                  showPricing={showPricing}
                  brandEmphasis={true}
                  groupByBrand={groupByBrand}
                  sortByPrice={sortByPrice}
                />
              ))}
            </div>
          );
        }).filter(Boolean);

      case 'brand-first':
        const brandGroups = createBrandGroups(products);
        return brandGroups.map(group => (
          <ProductGroupRenderer
            key={group.id}
            group={group}
            baseFontSizePx={baseFontSizePx}
            linePaddingMultiplier={linePaddingMultiplier}
            currentState={currentState}
            showTerpenes={showTerpenes}
            showInventoryStatus={showInventoryStatus}
            showNetWeight={showNetWeight}
            showPricing={showPricing}
            brandEmphasis={true}
            groupByBrand={false}
            sortByPrice={sortByPrice}
          />
        ));

      case 'price-first':
        // Create overall price groups across all weights
        const allPriceGroups: ProductGroup[] = [];
        let groupIndex = 0;
        
        // Group by price ranges across all weights
        const priceRanges = [
          { name: 'Premium ($50+)', min: 50, max: Infinity, color: 'bg-gradient-to-r from-yellow-400 to-orange-400' },
          { name: 'High ($30-$49.99)', min: 30, max: 49.99, color: 'bg-gradient-to-r from-purple-400 to-pink-400' },
          { name: 'Mid ($15-$29.99)', min: 15, max: 29.99, color: 'bg-gradient-to-r from-emerald-400 to-teal-400' },
          { name: 'Value (Under $15)', min: 0, max: 14.99, color: 'bg-gradient-to-r from-blue-400 to-indigo-400' }
        ];
        
        priceRanges.forEach(range => {
          const rangeProducts = products.filter(p => p.price >= range.min && p.price <= range.max);
          if (rangeProducts.length > 0) {
            allPriceGroups.push({
              id: `price-${range.name.toLowerCase().replace(/\s+/g, '-')}`,
              title: range.name,
              products: rangeProducts,
              priority: groupIndex++,
              color: range.color,
              textColor: 'text-white'
            });
          }
        });
        
        return allPriceGroups.map(group => (
          <ProductGroupRenderer
            key={group.id}
            group={group}
            baseFontSizePx={baseFontSizePx}
            linePaddingMultiplier={linePaddingMultiplier}
            currentState={currentState}
            showTerpenes={showTerpenes}
            showInventoryStatus={showInventoryStatus}
            showNetWeight={showNetWeight}
            showPricing={showPricing}
            brandEmphasis={true}
            groupByBrand={groupByBrand}
            sortByPrice={sortByPrice}
          />
        ));

      default:
        return null;
    }
  }, [products, organizationMode, baseFontSizePx, linePaddingMultiplier, currentState, showTerpenes, showInventoryStatus, showNetWeight, showPricing, groupByBrand, sortByPrice]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div style={containerStyle}>
      {showOverflowWarning && (
        <div style={overflowWarningStyle}>
          ⚠ This content may be too large for the current layout
        </div>
      )}
      
      {organizedContent}
    </div>
  );
};