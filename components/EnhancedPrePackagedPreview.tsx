import React, { forwardRef, useMemo, useEffect, useRef } from 'react';
import { PrePackagedShelf, PreviewSettings, ArtboardSize, HeaderImageSize, SupportedStates, PrePackagedProduct } from '../types';
import { ARTBOARD_DIMENSIONS_MAP, HEADER_IMAGE_CONFIGS, STATE_THC_ICONS } from '../constants';
import { WeightBasedShelfRenderer } from './WeightBasedShelfRenderer';
import { WeightCategoryDivider, WeightSpacing, ResponsiveColumnBreak } from './WeightBasedSeparators';
import { 
  createWeightBasedGroups, 
  analyzeProductDistribution, 
  WeightOrganizationSettings,
  ProductDistributionAnalysis 
} from '../utils/weightBasedOrganization';

interface EnhancedPrePackagedPreviewProps {
  shelves: PrePackagedShelf[];
  settings: PreviewSettings;
  currentState: SupportedStates;
  onOverflowDetected?: (hasOverflow: boolean) => void;
  organizationSettings?: WeightOrganizationSettings;
  enableIntelligentLayout?: boolean;
  showWeightHeaders?: boolean;
  showDistributionAnalysis?: boolean;
}

const DEFAULT_ORGANIZATION_SETTINGS: WeightOrganizationSettings = {
  primarySort: 'weight',
  secondarySort: 'price',
  groupBy: 'weight',
  sortDirection: 'asc',
  prioritizeInventoryStatus: true,
  separateShakeProducts: true,
  emphasizeBrands: true,
};

const getScaledValue = (base: number, multiplier: number, min: number = 0) => Math.max(min, base * multiplier); 

const getHeaderImageDetails = (artboardSize: ArtboardSize, headerSize: HeaderImageSize): { src?: string; height: number; } => {
  if (headerSize === HeaderImageSize.NONE) {
    return { height: 0 };
  }
  const configSet = HEADER_IMAGE_CONFIGS[artboardSize];
  if (!configSet) return { height: 0 };

  const config = configSet[headerSize as Exclude<HeaderImageSize, HeaderImageSize.NONE>];
  if (config) {
    return { src: config.src, height: config.naturalHeight };
  }
  return { height: 0 };
};

export const EnhancedPrePackagedPreview = forwardRef<HTMLDivElement, EnhancedPrePackagedPreviewProps>((
  { 
    shelves, 
    settings, 
    currentState, 
    onOverflowDetected,
    organizationSettings = DEFAULT_ORGANIZATION_SETTINGS,
    enableIntelligentLayout = true,
    showWeightHeaders = true,
    showDistributionAnalysis = false
  }, ref
) => {
  const { 
    artboardSize, 
    baseFontSizePx, 
    columns, 
    forceShelfFit, 
    headerImageSize, 
    linePaddingMultiplier, 
    showThcIcon,
    showTerpenes = true,
    showInventoryStatus = true,
    showNetWeight = false
  } = settings;
  
  const artboardSpecs = ARTBOARD_DIMENSIONS_MAP[artboardSize];

  const headerImageDetails = useMemo(() => 
    getHeaderImageDetails(artboardSize, headerImageSize), 
    [artboardSize, headerImageSize]
  );

  const artboardStyle: React.CSSProperties = {
    position: 'relative',
    width: `${artboardSpecs.naturalWidth}px`,
    height: `${artboardSpecs.naturalHeight}px`,
    backgroundColor: 'white',
    boxShadow: '0 0 15px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const contentPadding = useMemo(() => getScaledValue(baseFontSizePx, 2, 10), [baseFontSizePx]);
  const columnGap = useMemo(() => getScaledValue(baseFontSizePx, 1.5, 8), [baseFontSizePx]);
  const rowGap = useMemo(() => getScaledValue(baseFontSizePx, 1.5, 8), [baseFontSizePx]);
  const rowGapPx = `${rowGap}px`;

  const contentAreaStyle: React.CSSProperties = {
    padding: `${contentPadding}px`,
    width: '100%',
    height: `calc(100% - ${headerImageDetails.height}px)`,
    boxSizing: 'border-box',
    columnCount: columns,
    columnGap: `${columnGap}px`,
    columnFill: 'auto',
    overflow: 'hidden',
  };

  // Aggregate all products from all shelves
  const allProducts = useMemo(() => {
    return shelves.flatMap(shelf => shelf.products);
  }, [shelves]);

  // Analyze product distribution for intelligent layout
  const distributionAnalysis: ProductDistributionAnalysis = useMemo(() => {
    return analyzeProductDistribution(allProducts);
  }, [allProducts]);

  // Determine optimal organization mode based on analysis
  const effectiveOrganizationSettings = useMemo((): WeightOrganizationSettings => {
    if (!enableIntelligentLayout) {
      return organizationSettings;
    }

    const analysis = distributionAnalysis;
    const recommended = analysis.recommendedLayout;

    // Override organization settings based on analysis
    const intelligentSettings: WeightOrganizationSettings = {
      ...organizationSettings,
      primarySort: recommended.organizationMode === 'weight-first' ? 'weight' : 
                   recommended.organizationMode === 'brand-first' ? 'brand' : 'price',
      groupBy: recommended.organizationMode === 'weight-first' ? 'weight' : 
               recommended.organizationMode === 'brand-first' ? 'brand' : 'price-tier',
    };

    return intelligentSettings;
  }, [organizationSettings, enableIntelligentLayout, distributionAnalysis]);

  // Create weight-based groups using the intelligent organization
  const organizedGroups = useMemo(() => {
    if (allProducts.length === 0) return [];
    return createWeightBasedGroups(allProducts, effectiveOrganizationSettings);
  }, [allProducts, effectiveOrganizationSettings]);

  // Determine organization mode for rendering
  const organizationMode = useMemo(() => {
    switch (effectiveOrganizationSettings.groupBy) {
      case 'weight':
        return 'weight-first' as const;
      case 'brand':
        return 'brand-first' as const;
      case 'price-tier':
        return 'price-first' as const;
      default:
        return 'weight-first' as const;
    }
  }, [effectiveOrganizationSettings.groupBy]);

  // Render organized content
  const renderOrganizedContent = useMemo(() => {
    if (organizedGroups.length === 0) return null;

    let previousWeight = null;
    
    return organizedGroups.map((group, index) => {
      const shouldShowWeightDivider = showWeightHeaders && 
        group.weight && 
        group.weight !== previousWeight && 
        index > 0;

      // Update previous weight for next iteration
      if (group.weight) {
        previousWeight = group.weight;
      }

      const applyAvoidBreak = forceShelfFit;
      
      // Calculate overflow warning
      let showOverflowWarning = false;
      if (applyAvoidBreak && group.products.length > 0) {
        const estimatedRowHeight = baseFontSizePx * 2.2 * (1 + linePaddingMultiplier * 0.8);
        const estimatedHeaderHeight = baseFontSizePx * 2.5;
        const estimatedTableHeaderHeight = baseFontSizePx * 1.6;
        const estimatedGroupHeight = estimatedHeaderHeight + estimatedTableHeaderHeight + (group.products.length * estimatedRowHeight);
        
        const totalContentHeight = artboardSpecs.naturalHeight - headerImageDetails.height - (contentPadding * 2);
        const availableColumnHeight = totalContentHeight;
        
        const isSignificantlyTooTall = estimatedGroupHeight > availableColumnHeight * 0.9;
        const hasEnoughProducts = group.products.length >= 8;
        
        showOverflowWarning = isSignificantlyTooTall && hasEnoughProducts;
      }

      return (
        <React.Fragment key={group.id}>
          {shouldShowWeightDivider && (
            <WeightCategoryDivider
              toWeight={group.weight}
              baseFontSizePx={baseFontSizePx}
              showWeightLabels={true}
            />
          )}
          
          <WeightBasedShelfRenderer
            products={group.products}
            baseFontSizePx={baseFontSizePx}
            linePaddingMultiplier={linePaddingMultiplier}
            marginBottomStyle={rowGapPx}
            applyAvoidBreakStyle={applyAvoidBreak}
            showOverflowWarning={showOverflowWarning}
            currentState={currentState}
            showTerpenes={showTerpenes}
            showInventoryStatus={showInventoryStatus}
            showNetWeight={showNetWeight}
            showPricing={!shelves.some(shelf => shelf.hidePricing)}
            organizationMode={organizationMode}
            groupByBrand={effectiveOrganizationSettings.emphasizeBrands}
            sortByPrice={effectiveOrganizationSettings.primarySort === 'price' || effectiveOrganizationSettings.secondarySort === 'price'}
          />
          
          {/* Add responsive column breaks for better layout */}
          {index < organizedGroups.length - 1 && columns > 1 && (
            <ResponsiveColumnBreak
              baseFontSizePx={baseFontSizePx}
              columns={columns}
              avoidBreak={forceShelfFit}
            />
          )}
          
          <WeightSpacing baseFontSizePx={baseFontSizePx} size="sm" />
        </React.Fragment>
      );
    });
  }, [organizedGroups, baseFontSizePx, linePaddingMultiplier, rowGapPx, forceShelfFit, artboardSpecs.naturalHeight, headerImageDetails.height, contentPadding, currentState, showTerpenes, showInventoryStatus, showNetWeight, shelves, organizationMode, effectiveOrganizationSettings, showWeightHeaders, columns]);

  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const overflowElement = overflowRef.current;
      if (overflowElement && onOverflowDetected) {
        const hasVerticalOverflow = overflowElement.scrollHeight > overflowElement.clientHeight;
        const hasHorizontalOverflow = overflowElement.scrollWidth > overflowElement.clientWidth;
        const hasOverflow = hasVerticalOverflow || hasHorizontalOverflow;
        
        onOverflowDetected(hasOverflow);
      }
    };

    checkOverflow();

    const overflowElement = overflowRef.current;
    if (overflowElement) {
      const resizeObserver = new ResizeObserver(() => {
        checkOverflow();
      });
      
      resizeObserver.observe(overflowElement);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [onOverflowDetected, renderOrganizedContent, settings]);

  // Render distribution analysis if enabled (for debugging/development)
  const distributionAnalysisDisplay = useMemo(() => {
    if (!showDistributionAnalysis || !distributionAnalysis) return null;

    const analysisStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${headerImageDetails.height + 10}px`,
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px',
      borderRadius: '4px',
      fontSize: `${baseFontSizePx * 0.6}px`,
      maxWidth: '200px',
      zIndex: 1000,
    };

    return (
      <div style={analysisStyle}>
        <div>Total Products: {distributionAnalysis.totalProducts}</div>
        <div>Organization: {distributionAnalysis.recommendedLayout.organizationMode}</div>
        <div>Columns: {distributionAnalysis.recommendedLayout.columnsRecommended}</div>
        <div>Strategy: {distributionAnalysis.recommendedLayout.groupingStrategy}</div>
      </div>
    );
  }, [showDistributionAnalysis, distributionAnalysis, baseFontSizePx, headerImageDetails.height]);

  return (
    <div
      ref={ref}
      style={artboardStyle}
      className="print-artboard-outer"
      data-testid="enhanced-prepackaged-preview-artboard"
    >
      {headerImageDetails.src && headerImageDetails.height > 0 && (
        <img 
          src={headerImageDetails.src} 
          alt="Menu Header" 
          draggable={false}
          style={{ 
            width: '100%', 
            height: `${headerImageDetails.height}px`, 
            objectFit: 'cover',
            display: 'block',
            userSelect: 'none',
            pointerEvents: 'none',
          }} 
        />
      )}
      
      {allProducts.length > 0 ? (
        <div style={contentAreaStyle} className="menu-content-area" ref={overflowRef}>
          {renderOrganizedContent}
        </div>
      ) : (
        <div style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: `calc(100% - ${headerImageDetails.height}px)`,
            color: '#aaa', 
            fontSize: getScaledValue(baseFontSizePx, 2.5)
        }}>
          Add products to shelves to see your menu.
        </div>
      )}
      
      {showThcIcon && (
        <img 
          src={STATE_THC_ICONS[currentState]}
          alt={`${currentState} THC Regulatory Icon`}
          draggable={false}
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            width: '80px',
            height: 'auto',
            opacity: 1,
            zIndex: 10,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      )}
      
      {distributionAnalysisDisplay}
    </div>
  );
});

EnhancedPrePackagedPreview.displayName = 'EnhancedPrePackagedPreview';