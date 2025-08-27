import React from 'react';
import { PrePackagedProduct } from '../types';
import { StrainTypeIndicator } from './common/StrainTypeIndicator';
import { THC_DECIMAL_PLACES, MANGO_MAIN_ORANGE } from '../constants';

interface PrePackagedProductDisplayProps {
  product: PrePackagedProduct;
  baseFontSizePx: number;
  linePaddingMultiplier: number;
  gridColumns: string;
  shelfBorderColor: string;
  shelfColor: string; // Added for low stock highlighting
  isLastRow: boolean;
  applyAvoidBreakStyle?: boolean;
  showTerpenes?: boolean;
  showLowStock?: boolean; // Renamed from showInventoryStatus
  showNetWeight?: boolean;
}

const getScaledFontSize = (base: number, multiplier: number, min: number = 7): string =>
  `${Math.max(min, base * multiplier)}px`;

const getScaledValue = (base: number, multiplier: number, min: number = 0): number =>
  Math.max(min, base * multiplier);

export const PrePackagedProductDisplay: React.FC<PrePackagedProductDisplayProps> = ({
  product,
  baseFontSizePx,
  linePaddingMultiplier,
  gridColumns,
  shelfBorderColor,
  shelfColor,
  isLastRow,
  applyAvoidBreakStyle,
  showTerpenes = true,
  showLowStock = true, // Renamed from showInventoryStatus
  showNetWeight = false,
}) => {
  const formatPrice = (price: number) => `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
  const formatTerpenes = (terpenes: number | null | undefined) => 
    terpenes ? `${terpenes.toFixed(1)}%` : '-';
  const formatTHC = (thc: number | null) => 
    thc !== null ? `${thc.toFixed(THC_DECIMAL_PLACES)}%` : '-';

  const rowHeight = getScaledValue(baseFontSizePx, 2.2, 22);
  
  // Extract hex color from shelf color for low stock highlighting
  const getShelfColorHex = (colorClass: string): string => {
    if (colorClass.includes('bg-[') && colorClass.includes(']')) {
      const match = colorClass.match(/bg-\[(.+)\]/);
      return match ? match[1] : '#6B7280';
    }
    return '#6B7280'; // Default gray if can't parse
  };

  const shelfColorHex = getShelfColorHex(shelfColor);
  const isLowStock = product.isLowStock;

  return (
    <div
      className={`bg-white ${isLowStock ? 'last-jar-row' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        alignItems: 'center',
        minHeight: `${rowHeight}px`,
        padding: `${getScaledValue(baseFontSizePx, linePaddingMultiplier * 0.8, 2)}px ${getScaledValue(baseFontSizePx, 0.6, 6)}px`,
        borderLeft: isLowStock ? `4px solid ${shelfColorHex}` : `2px solid ${shelfBorderColor}`,
        borderRight: `2px solid ${shelfBorderColor}`,
        borderBottom: isLastRow ? `2px solid ${shelfBorderColor}` : '1px solid #e5e7eb',
        backgroundColor: isLowStock ? `${shelfColorHex}20` : '#ffffff', // Use shelf color at 20% opacity
        position: 'relative',
        marginBottom: '0',
        fontSize: getScaledFontSize(baseFontSizePx, 0.85, 9),
        breakInside: applyAvoidBreakStyle ? 'avoid-column' : 'auto',
        boxSizing: 'border-box',
        color: '#374151',
        fontFamily: "'Inter', sans-serif",
        borderRadius: isLastRow ? '0 0 4px 4px' : '0',
        lineHeight: '1.3',
      }}
    >
      {/* Strain Name - emphasized for retail */}
      <div style={{
        lineHeight: '1.3',
        display: 'flex',
        alignItems: 'center',
        gap: `${baseFontSizePx * 0.5}px`,
        color: '#374151',
        fontWeight: 600, // Slightly bolder for strain names
      }}>
        {/* Low Stock Icon */}
        {isLowStock && (
          <svg 
            width={`${baseFontSizePx * 0.9}px`} 
            height={`${baseFontSizePx * 0.9}px`} 
            viewBox="0 0 100 90" 
            fill="none" 
            style={{ flexShrink: 0 }}
          >
            <path 
              fill="#dc2626" 
              d="M44.104 4.04c2.757-4.423 9.285-4.352 11.92.214l43.034 74.535c2.677 4.638-.67 10.435-6.025 10.435H6.967c-5.355 0-8.702-5.797-6.025-10.435L43.975 4.254l.129-.214Zm8.478 2.201c-1.148-1.987-4.017-1.987-5.164 0L4.385 80.777c-1.112 1.925.2 4.317 2.37 4.465l.212.007h86.066l.213-.007c2.1-.143 3.395-2.388 2.47-4.277l-.1-.188L52.581 6.24Z" 
            />
            <path 
              fill="#dc2626" 
              d="M40.85 27.152h17.756l-1.51 34H42.361l-1.511-34Zm-.377 44.805c0-5.289 3.778-8.235 9.293-8.235 5.44 0 9.218 2.946 9.218 8.235 0 5.29-3.778 8.16-9.218 8.16-5.515 0-9.293-2.87-9.293-8.16Z" 
            />
          </svg>
        )}
        {product.name || "Unnamed Product"}
      </div>
      
      {/* Brand - highly emphasized for pre-packaged products */}
      <div style={{
        lineHeight: '1.3',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 700, // Bold for brand emphasis
        color: '#1f2937', // Darker color for brand prominence
      }}>
        {product.brand || '-'}
      </div>
      
      {/* Terpenes % */}
      {showTerpenes && (
        <div style={{
          lineHeight: '1.3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          color: '#059669', // Green color for terpenes
          fontWeight: 500,
        }}>
          {formatTerpenes(product.terpenes)}
        </div>
      )}
      
      {/* Net Weight */}
      {showNetWeight && (
        <div style={{
          lineHeight: '1.3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          color: '#6b7280',
          fontSize: getScaledFontSize(baseFontSizePx, 0.8, 8),
        }}>
          {product.netWeight || '-'}
        </div>
      )}
      
      
      {/* Type Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <StrainTypeIndicator type={product.type} baseFontSizePx={baseFontSizePx} />
      </div>
      
      {/* Price and THC */}
      <div style={{
        lineHeight: '1.3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'column',
        gap: '2px',
        color: '#374151',
      }}>
        <div style={{
          fontWeight: 700, // Bold price for retail emphasis
          fontSize: getScaledFontSize(baseFontSizePx, 0.9, 9),
          color: '#1f2937', // Darker for price prominence
        }}>
          {formatPrice(product.price)}
        </div>
        <div style={{
          fontSize: getScaledFontSize(baseFontSizePx, 0.75, 7),
          fontWeight: 500,
          color: '#6b7280',
        }}>
          {formatTHC(product.thc)}
        </div>
      </div>
      
      {/* Notes overlay for special products */}
      {product.notes && (
        <div style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          fontSize: getScaledFontSize(baseFontSizePx, 0.65, 6),
          color: '#6b7280',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '1px 3px',
          borderRadius: '2px',
          maxWidth: '60px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {product.notes}
      </div>
    )}
    </div>
  );
};