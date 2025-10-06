import { AnyShelf, PreviewSettings, PagedContent, ContentDistribution, MenuMode, isPrePackagedShelf, SortCriteria, PrePackagedSortCriteria, AnySortCriteria } from '../types';
import { ContentDistributor } from './ContentDistributor';

/**
 * PageManager - Manages multi-page menu functionality
 * 
 * This class handles the creation, navigation, and management of multiple menu pages.
 * Each page can have independent settings and content, allowing for complex menu layouts.
 */
export class PageManager {
  private pages: Map<number, PageData> = new Map();
  private currentPageNumber: number = 1;
  private maxPages: number = 10; // Safety limit
  private currentMode: MenuMode = MenuMode.PREPACKAGED; // Track current mode

  constructor() {
    // Initialize with first page
    this.pages.set(1, this.createEmptyPage(1));
  }

  /**
   * Set the current mode and clear pages to prevent type mixing
   */
  public setMode(mode: MenuMode): void {
    if (this.currentMode !== mode) {
      // Clear all pages when mode changes to prevent type mixing
      this.pages.clear();
      this.pages.set(1, this.createEmptyPage(1));
      this.currentPageNumber = 1;
      this.currentMode = mode;
    }
  }

  /**
   * Get the current mode
   */
  public getCurrentMode(): MenuMode {
    return this.currentMode;
  }

  /**
   * Create a new empty page with default settings
   */
  private createEmptyPage(pageNumber: number): PageData {
    return {
      pageNumber,
      shelves: [],
      settings: null, // Will inherit from global settings if null
      hasCustomSettings: false,
      lastModified: Date.now(),
      globalSortCriteria: null,
      shelfSortOverrides: new Map()
    };
  }

  /**
   * Add a new page with proper sequential numbering
   */
  public addPage(): number {
    if (this.pages.size >= this.maxPages) {
      throw new Error(`Maximum of ${this.maxPages} pages allowed`);
    }

    // Use sequential numbering: find the next available number
    const newPageNumber = this.pages.size + 1;
    const newPage = this.createEmptyPage(newPageNumber);
    
    // Copy settings from current page if it has custom settings
    const currentPage = this.getCurrentPage();
    if (currentPage?.hasCustomSettings && currentPage.settings) {
      newPage.settings = { ...currentPage.settings };
      newPage.hasCustomSettings = true;
    }

    this.pages.set(newPageNumber, newPage);
    
    // Ensure proper sequential numbering
    this.renumberPages();
    
    return newPageNumber;
  }

  /**
   * Remove a page (cannot remove page 1)
   */
  public removePage(pageNumber: number): boolean {
    if (pageNumber === 1) {
      throw new Error('Cannot remove page 1');
    }

    if (!this.pages.has(pageNumber)) {
      return false;
    }

    this.pages.delete(pageNumber);

    // If we're on the deleted page, move to page 1
    if (this.currentPageNumber === pageNumber) {
      this.currentPageNumber = 1;
    }

    // Renumber pages to maintain sequence
    this.renumberPages();
    
    return true;
  }

  /**
   * Renumber pages to maintain sequential numbering after deletion
   */
  private renumberPages(): void {
    const sortedPages = Array.from(this.pages.entries()).sort((a, b) => a[0] - b[0]);
    const newPages = new Map<number, PageData>();

    sortedPages.forEach(([oldNumber, page], index) => {
      const newNumber = index + 1;
      page.pageNumber = newNumber;
      newPages.set(newNumber, page);
      
      // Update current page number if it changed
      if (oldNumber === this.currentPageNumber) {
        this.currentPageNumber = newNumber;
      }
    });

    this.pages = newPages;
  }

  /**
   * Navigate to a specific page
   */
  public goToPage(pageNumber: number): boolean {
    if (!this.pages.has(pageNumber)) {
      return false;
    }

    this.currentPageNumber = pageNumber;
    return true;
  }

  /**
   * Get current page data
   */
  public getCurrentPage(): PageData | null {
    return this.pages.get(this.currentPageNumber) || null;
  }

  /**
   * Get page data by number
   */
  public getPage(pageNumber: number): PageData | null {
    return this.pages.get(pageNumber) || null;
  }

  /**
   * Get all pages
   */
  public getAllPages(): PageData[] {
    return Array.from(this.pages.values()).sort((a, b) => a.pageNumber - b.pageNumber);
  }

  /**
   * Get current page number
   */
  public getCurrentPageNumber(): number {
    return this.currentPageNumber;
  }

  /**
   * Get total page count
   */
  public getPageCount(): number {
    return this.pages.size;
  }

  /**
   * Update shelves for a specific page
   */
  public updatePageShelves(pageNumber: number, shelves: AnyShelf[]): void {
    const page = this.pages.get(pageNumber);
    if (!page) return;

    page.shelves = [...shelves];
    page.lastModified = Date.now();
  }

  /**
   * Update settings for a specific page
   */
  public updatePageSettings(pageNumber: number, settings: Partial<PreviewSettings>): void {
    const page = this.pages.get(pageNumber);
    if (!page) return;

    if (page.settings) {
      page.settings = { ...page.settings, ...settings };
    } else {
      page.settings = { ...settings } as PreviewSettings;
    }
    page.hasCustomSettings = true;
    page.lastModified = Date.now();
  }

  /**
   * Get effective settings for a page (custom settings or fallback to global)
   */
  public getPageSettings(pageNumber: number, globalSettings: PreviewSettings): PreviewSettings {
    const page = this.pages.get(pageNumber);
    if (!page) return globalSettings;

    if (page.hasCustomSettings && page.settings) {
      return { 
        ...globalSettings, 
        ...page.settings,
        currentPage: pageNumber,
        pageCount: this.getPageCount()
      };
    }

    return {
      ...globalSettings,
      currentPage: pageNumber,
      pageCount: this.getPageCount()
    };
  }

  /**
   * Clear all custom settings for a page (will use global settings)
   */
  public clearPageSettings(pageNumber: number): void {
    const page = this.pages.get(pageNumber);
    if (!page) return;

    page.settings = null;
    page.hasCustomSettings = false;
    page.lastModified = Date.now();
  }

  /**
   * Update global sort criteria for a specific page
   */
  public updatePageGlobalSort(pageNumber: number, criteria: AnySortCriteria | null): void {
    const page = this.pages.get(pageNumber);
    if (!page) return;

    page.globalSortCriteria = criteria;
    page.lastModified = Date.now();
  }

  /**
   * Update shelf-specific sort criteria for a page
   */
  public updatePageShelfSort(pageNumber: number, shelfId: string, criteria: AnySortCriteria | null): void {
    const page = this.pages.get(pageNumber);
    if (!page) return;

    if (criteria === null || criteria === undefined) {
      page.shelfSortOverrides.delete(shelfId);
    } else {
      page.shelfSortOverrides.set(shelfId, criteria);
    }
    page.lastModified = Date.now();
  }

  /**
   * Get global sort criteria for a page
   */
  public getPageGlobalSort(pageNumber: number): AnySortCriteria | null {
    const page = this.pages.get(pageNumber);
    return page?.globalSortCriteria || null;
  }

  /**
   * Get shelf-specific sort criteria for a page
   */
  public getPageShelfSort(pageNumber: number, shelfId: string): AnySortCriteria | null {
    const page = this.pages.get(pageNumber);
    return page?.shelfSortOverrides.get(shelfId) || null;
  }

  /**
   * Get effective sort criteria for a shelf (shelf-specific overrides global)
   */
  public getEffectiveShelfSort(pageNumber: number, shelfId: string): AnySortCriteria | null {
    const page = this.pages.get(pageNumber);
    if (!page) return null;

    // Shelf-specific sort overrides global sort
    const shelfSort = page.shelfSortOverrides.get(shelfId);
    if (shelfSort !== undefined) {
      return shelfSort; // Can be null (manual reorder) or actual criteria
    }

    // Fall back to page's global sort
    return page.globalSortCriteria;
  }

  /**
   * Clone a page
   */
  public clonePage(sourcePageNumber: number): number | null {
    const sourcePage = this.pages.get(sourcePageNumber);
    if (!sourcePage) return null;

    const newPageNumber = this.addPage();
    const newPage = this.pages.get(newPageNumber)!;

    // Deep copy shelves with new unique IDs for all items
    newPage.shelves = JSON.parse(JSON.stringify(sourcePage.shelves)).map((shelf: any) => {
      const newShelf = {
        ...shelf,
        id: `${shelf.id}-clone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Generate new IDs for strains (bulk mode)
      if (newShelf.strains) {
        newShelf.strains = newShelf.strains.map((strain: any) => ({
          ...strain,
          id: `strain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }
      
      // Generate new IDs for products (pre-packaged mode)
      if (newShelf.products) {
        newShelf.products = newShelf.products.map((product: any) => ({
          ...product,
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
      }
      
      return newShelf;
    });
    if (sourcePage.settings) {
      newPage.settings = JSON.parse(JSON.stringify(sourcePage.settings));
      newPage.hasCustomSettings = sourcePage.hasCustomSettings;
    }
    
    // Copy sort state
    newPage.globalSortCriteria = sourcePage.globalSortCriteria;
    newPage.shelfSortOverrides = new Map(sourcePage.shelfSortOverrides);

    return newPageNumber;
  }

  /**
   * Move shelves from one page to another
   */
  public moveShelvesToPage(
    fromPageNumber: number, 
    toPageNumber: number, 
    shelfIds: string[]
  ): boolean {
    const fromPage = this.pages.get(fromPageNumber);
    const toPage = this.pages.get(toPageNumber);
    
    if (!fromPage || !toPage) return false;

    // Find and remove shelves from source page
    const shelvesToMove = fromPage.shelves.filter(shelf => shelfIds.includes(shelf.id));
    fromPage.shelves = fromPage.shelves.filter(shelf => !shelfIds.includes(shelf.id));

    // Add shelves to destination page
    toPage.shelves.push(...shelvesToMove);

    // Update timestamps
    fromPage.lastModified = Date.now();
    toPage.lastModified = Date.now();

    return true;
  }

  /**
   * Get export data for all pages
   */
  public getExportData(globalSettings: PreviewSettings): PageExportData[] {
    return this.getAllPages().map(page => ({
      pageNumber: page.pageNumber,
      shelves: page.shelves,
      settings: this.getPageSettings(page.pageNumber, globalSettings),
      isEmpty: page.shelves.length === 0
    }));
  }

  /**
   * Import data to create new pages
   */
  public importPages(importData: PageImportData[]): void {
    // Clear existing pages except page 1
    const pagesToDelete = Array.from(this.pages.keys()).filter(num => num > 1);
    pagesToDelete.forEach(pageNum => this.pages.delete(pageNum));

    // Import new pages
    importData.forEach((pageData, index) => {
      const pageNumber = index + 1;
      
      if (pageNumber === 1) {
        // Update existing page 1
        const page1 = this.pages.get(1)!;
        page1.shelves = pageData.shelves;
        if (pageData.settings) {
          page1.settings = pageData.settings;
          page1.hasCustomSettings = true;
        }
      } else {
        // Create new page
        const newPage = this.createEmptyPage(pageNumber);
        newPage.shelves = pageData.shelves;
        if (pageData.settings) {
          newPage.settings = pageData.settings;
          newPage.hasCustomSettings = true;
        }
        this.pages.set(pageNumber, newPage);
      }
    });

    // Reset to page 1
    this.currentPageNumber = 1;
  }

  /**
   * Reset to single page with all content
   */
  public resetToSinglePage(): void {
    // Collect all shelves from all pages
    const allShelves: AnyShelf[] = [];
    this.pages.forEach(page => {
      allShelves.push(...page.shelves);
    });

    // Clear all pages
    this.pages.clear();

    // Create new page 1 with all content
    const page1 = this.createEmptyPage(1);
    page1.shelves = allShelves;
    this.pages.set(1, page1);
    this.currentPageNumber = 1;
  }
}

/**
 * Interface for individual page data
 */
export interface PageData {
  pageNumber: number;
  shelves: AnyShelf[];
  settings: PreviewSettings | null; // null means use global settings
  hasCustomSettings: boolean;
  lastModified: number;
  // Page-specific sort state
  globalSortCriteria: AnySortCriteria | null; // Global sort for this page
  shelfSortOverrides: Map<string, AnySortCriteria | null>; // Per-shelf overrides
}

/**
 * Interface for page export data
 */
export interface PageExportData {
  pageNumber: number;
  shelves: AnyShelf[];
  settings: PreviewSettings;
  isEmpty: boolean;
}

/**
 * Interface for page import data
 */
export interface PageImportData {
  shelves: AnyShelf[];
  settings?: Partial<PreviewSettings>;
}
