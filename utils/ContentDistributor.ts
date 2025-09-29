import { AnyShelf, PreviewSettings, ContentDistribution, PagedContent, ArtboardSize, isPrePackagedShelf } from '../types';
import { ARTBOARD_DIMENSIONS_MAP } from '../constants';

/**
 * ContentDistributor - Enhanced multi-page content distribution
 * 
 * This class handles CSS column-based pagination where content flows naturally
 * through columns and pages represent different "viewports" of the same continuous layout.
 * Now supports true multi-page functionality with intelligent content distribution.
 */
export class ContentDistributor {
  private settings: PreviewSettings;
  private artboardDimensions: { naturalWidth: number; naturalHeight: number };

  constructor(settings: PreviewSettings) {
    this.settings = settings;
    this.artboardDimensions = ARTBOARD_DIMENSIONS_MAP[settings.artboardSize];
  }

  /**
   * Calculates column-based pagination info with multi-page support
   */
  public calculateColumnPagination(): {
    columnsPerPage: number;
    totalPages: number;
    hasOverflow: boolean;
    columnWidth: number;
    columnGap: number;
  } {
    const { columns, pageCount } = this.settings;
    
    // Calculate column dimensions
    const contentWidth = this.calculateAvailableContentWidth();
    const columnGap = Math.max(8, this.settings.baseFontSizePx * 1.5);
    const totalGapWidth = (columns - 1) * columnGap;
    const availableColumnSpace = contentWidth - totalGapWidth;
    const columnWidth = availableColumnSpace / columns;

    // Multi-page support enabled
    return {
      columnsPerPage: columns,
      totalPages: pageCount || 1,
      hasOverflow: pageCount > 1,
      columnWidth,
      columnGap
    };
  }

  /**
   * Gets the CSS transform for a specific page with multi-page support
   */
  public getColumnTransformForPage(pageNumber: number): {
    transform: string;
    clipPath?: string;
  } {
    if (pageNumber <= 1 || !this.settings.pageCount || this.settings.pageCount <= 1) {
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
   * Estimates content height for a set of shelves
   */
  private estimateContentHeight(shelves: AnyShelf[]): number {
    if (shelves.length === 0) return 0;

    // Rough estimation: shelf header + products/strains
    const estimatedShelfHeaderHeight = 60; // Title and spacing
    const estimatedItemHeight = 40; // Average height per strain/product

    let totalHeight = 0;
    shelves.forEach(shelf => {
      totalHeight += estimatedShelfHeaderHeight;
      if (isPrePackagedShelf(shelf)) {
        totalHeight += shelf.products.length * estimatedItemHeight;
      } else {
        totalHeight += shelf.strains.length * estimatedItemHeight;
      }
    });

    return totalHeight;
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
   * Distributes content across multiple pages intelligently
   */
  public distributeContent(shelves: AnyShelf[]): ContentDistribution {
    const filteredShelves = this.getAllShelvesForPage(shelves);
    const { pageCount = 1 } = this.settings;

    if (pageCount <= 1) {
      // Single page mode
      return {
        pages: [{
          pageNumber: 1,
          shelves: filteredShelves,
          estimatedHeight: this.estimateContentHeight(filteredShelves)
        }],
        totalPages: 1,
        hasOverflow: false
      };
    }

    // Multi-page distribution
    const pages: PagedContent[] = [];
    const shelvesPerPage = Math.ceil(filteredShelves.length / pageCount);

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const startIndex = (pageNum - 1) * shelvesPerPage;
      const endIndex = Math.min(startIndex + shelvesPerPage, filteredShelves.length);
      const pageShelves = filteredShelves.slice(startIndex, endIndex);

      pages.push({
        pageNumber: pageNum,
        shelves: pageShelves,
        estimatedHeight: this.estimateContentHeight(pageShelves)
      });
    }

    return {
      pages,
      totalPages: pageCount,
      hasOverflow: pageCount > 1
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