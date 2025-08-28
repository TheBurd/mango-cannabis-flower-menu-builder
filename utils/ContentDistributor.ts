import { AnyShelf, PreviewSettings, ContentDistribution, PagedContent, ArtboardSize, isPrePackagedShelf } from '../types';
import { ARTBOARD_DIMENSIONS_MAP } from '../constants';

/**
 * ContentDistributor - DEPRECATED: Multi-page functionality temporarily disabled
 * 
 * This class was designed for CSS column-based pagination, where content flows naturally
 * through columns and pages represent different "viewports" of the same continuous layout.
 * Currently returns no-op values to support single-page layout.
 */
export class ContentDistributor {
  private settings: PreviewSettings;
  private artboardDimensions: { naturalWidth: number; naturalHeight: number };

  constructor(settings: PreviewSettings) {
    this.settings = settings;
    this.artboardDimensions = ARTBOARD_DIMENSIONS_MAP[settings.artboardSize];
  }

  /**
   * DEPRECATED: Calculates column-based pagination info
   * Multi-page functionality disabled - returns single-page values
   */
  public calculateColumnPagination(): {
    columnsPerPage: number;
    totalPages: number;
    hasOverflow: boolean;
    columnWidth: number;
    columnGap: number;
  } {
    const { columns } = this.settings;
    
    // Calculate column dimensions for single-page layout
    const contentWidth = this.calculateAvailableContentWidth();
    const columnGap = Math.max(8, this.settings.baseFontSizePx * 1.5);
    const totalGapWidth = (columns - 1) * columnGap;
    const availableColumnSpace = contentWidth - totalGapWidth;
    const columnWidth = availableColumnSpace / columns;

    // DISABLED: Always return single-page values
    return {
      columnsPerPage: columns,
      totalPages: 1, // Always single page
      hasOverflow: false, // No multi-page overflow
      columnWidth,
      columnGap
    };
  }

  /**
   * DEPRECATED: Gets the CSS transform for a specific page
   * Multi-page functionality disabled - returns no-op transform for single-page layout
   */
  public getColumnTransformForPage(pageNumber: number): {
    transform: string;
    clipPath?: string;
  } {
    // DISABLED: Always return no transform for single-page layout
    return { transform: 'none' };
    
    // PRESERVED FOR FUTURE: Multi-page transform logic
    /*
    if (pageNumber <= 1) {
      return { transform: 'none' };
    }

    const pageIndex = pageNumber - 1;
    const artboardWidth = this.artboardDimensions.naturalWidth;
    const contentPadding = Math.max(10, this.settings.baseFontSizePx * 2) * 2;
    const availableContentWidth = artboardWidth - contentPadding;
    const horizontalOffset = pageIndex * availableContentWidth;

    return {
      transform: `translateX(-${horizontalOffset}px)`,
    };
    */
  }

  /**
   * Calculate the width of a single column
   */
  private calculateColumnWidth(): number {
    const availableWidth = this.calculateAvailableContentWidth();
    const columnGap = this.calculateColumnGap();
    const totalGapWidth = (this.settings.columns - 1) * columnGap;
    return (availableWidth - totalGapWidth) / this.settings.columns;
  }

  /**
   * Calculate the gap between columns
   */
  private calculateColumnGap(): number {
    return Math.max(8, this.settings.baseFontSizePx * 1.5);
  }

  /**
   * Detects if content would overflow and calculates needed pages
   * This is called after content is rendered to measure actual heights
   */
  public detectContentOverflow(contentElement: HTMLElement | null): number {
    if (!contentElement) return 1;

    const availableHeight = this.calculateAvailableContentHeight();
    const contentHeight = contentElement.scrollHeight;

    if (contentHeight <= availableHeight) {
      return 1;
    }

    // Calculate how many pages we need based on content height
    const pagesNeeded = Math.ceil(contentHeight / availableHeight);
    return Math.max(1, pagesNeeded);
  }

  /**
   * Calculates available content width considering artboard and padding
   */
  private calculateAvailableContentWidth(): number {
    const artboardWidth = this.artboardDimensions.naturalWidth;
    const contentPadding = Math.max(10, this.settings.baseFontSizePx * 2) * 2; // left + right
    return artboardWidth - contentPadding;
  }

  /**
   * Calculates available content height considering header images and padding
   */
  private calculateAvailableContentHeight(): number {
    const { headerImageSize } = this.settings;
    const artboardHeight = this.artboardDimensions.naturalHeight;
    
    // Get header image height
    let headerHeight = 0;
    if (headerImageSize !== 'None') {
      headerHeight = headerImageSize === 'Large' ? 450 : 200;
    }

    // Calculate content padding
    const contentPadding = Math.max(10, this.settings.baseFontSizePx * 2) * 2; // top + bottom

    return artboardHeight - headerHeight - contentPadding;
  }

  /**
   * Updates settings and recalculates dimensions
   */
  public updateSettings(newSettings: PreviewSettings): void {
    this.settings = newSettings;
    this.artboardDimensions = ARTBOARD_DIMENSIONS_MAP[newSettings.artboardSize];
  }

  /**
   * For the new approach, all shelves are rendered on every page
   * CSS columns and clipping handle the visual pagination
   */
  public getAllShelvesForPage(shelves: AnyShelf[]): AnyShelf[] {
    // Return all shelves - CSS column pagination will handle the visual splitting
    return shelves.filter(shelf => 
      isPrePackagedShelf(shelf) 
        ? shelf.products.length > 0 
        : shelf.strains.length > 0
    );
  }

  /**
   * DEPRECATED: Legacy method for backward compatibility
   * Multi-page functionality disabled - always returns single page
   */
  public distributeContent(shelves: AnyShelf[]): ContentDistribution {
    const allShelves = this.getAllShelvesForPage(shelves);
    
    return {
      pages: [{
        pageNumber: 1,
        shelves: allShelves,
        estimatedHeight: 0
      }],
      totalPages: 1, // Always single page
      hasOverflow: false // No multi-page overflow
    };
  }

  /**
   * Calculates optimal page count based on content overflow detection
   */
  public calculateOptimalPageCount(shelves: AnyShelf[]): number {
    // For auto page breaks, estimate based on shelf count and content
    // This is a rough estimation - actual overflow detection happens in the artboard
    if (shelves.length === 0) return 1;
    
    // Simple heuristic: assume each shelf takes about 200px height on average
    const estimatedShelfHeight = 200;
    const totalEstimatedHeight = shelves.length * estimatedShelfHeight;
    const availableHeight = this.calculateAvailableContentHeight();
    
    const estimatedPages = Math.ceil(totalEstimatedHeight / availableHeight);
    return Math.max(1, Math.min(estimatedPages, 10)); // Cap at 10 pages
  }

  /**
   * Calculate optimal page count based on actual rendered content
   * This is called from the artboard components with the actual content element
   */
  public calculateOptimalPageCountFromElement(contentElement: HTMLElement | null): number {
    if (!contentElement) return 1;
    
    // For horizontal column overflow, check scrollWidth instead of scrollHeight
    const totalContentWidth = contentElement.scrollWidth;
    const availableWidth = this.calculateAvailableContentWidth();
    
    if (totalContentWidth <= availableWidth) {
      return 1;
    }
    
    // Calculate pages needed based on horizontal overflow
    const pagesNeeded = Math.ceil(totalContentWidth / availableWidth);
    return Math.max(1, Math.min(pagesNeeded, 10)); // Cap at 10 pages
  }
}