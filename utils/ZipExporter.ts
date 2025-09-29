import JSZip from 'jszip';
import domtoimage from 'dom-to-image';
import { PageExportData } from './PageManager';

/**
 * ZipExporter - Handles batch export of multiple pages to ZIP format
 */
export class ZipExporter {
  /**
   * Export multiple pages as individual images in a ZIP file
   */
  public static async exportPagesToZip(
    pages: PageExportData[],
    baseFilename: string,
    format: 'png' | 'jpeg' = 'png',
    getPageElement: (pageNumber: number) => Promise<HTMLElement> | HTMLElement | null
  ): Promise<void> {
    const zip = new JSZip();
    const exportPromises: Promise<void>[] = [];

    // Filter out empty pages unless user wants them
    const pagesToExport = pages.filter(page => !page.isEmpty || pages.length === 1);

    for (const page of pagesToExport) {
      const exportPromise = this.addPageToZip(
        zip, 
        page, 
        baseFilename, 
        format, 
        getPageElement,
        pagesToExport.length > 1
      );
      exportPromises.push(exportPromise);
    }

    // Wait for all pages to be processed
    await Promise.all(exportPromises);

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}-pages.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Add a single page to the ZIP archive
   */
  private static async addPageToZip(
    zip: JSZip,
    page: PageExportData,
    baseFilename: string,
    format: 'png' | 'jpeg',
    getPageElement: (pageNumber: number) => Promise<HTMLElement> | HTMLElement | null,
    includePageNumber: boolean
  ): Promise<void> {
    const pageElementResult = getPageElement(page.pageNumber);
    const pageElement = await Promise.resolve(pageElementResult);
    if (!pageElement) {
      console.warn(`Could not find element for page ${page.pageNumber}`);
      return;
    }

    try {
      // Generate filename for this page
      const filename = includePageNumber 
        ? `${baseFilename}-page-${page.pageNumber}.${format}`
        : `${baseFilename}.${format}`;

      // Export the page as image
      const dataUrl = format === 'png' 
        ? await domtoimage.toPng(pageElement, {
            quality: 1.0,
            bgcolor: '#ffffff',
            width: pageElement.offsetWidth,
            height: pageElement.offsetHeight
          })
        : await domtoimage.toJpeg(pageElement, {
            quality: 0.95,
            bgcolor: '#ffffff',
            width: pageElement.offsetWidth,
            height: pageElement.offsetHeight
          });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Add to ZIP
      zip.file(filename, blob);
      
    } catch (error) {
      console.error(`Failed to export page ${page.pageNumber}:`, error);
      
      // Add error file to ZIP for debugging
      const errorMessage = `Failed to export page ${page.pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      zip.file(`error-page-${page.pageNumber}.txt`, errorMessage);
    }
  }

  /**
   * Export pages as CSV data in a ZIP file
   */
  public static async exportPagesAsCSVZip(
    pages: PageExportData[],
    baseFilename: string,
    generateCSVForPage: (page: PageExportData) => string
  ): Promise<void> {
    const zip = new JSZip();

    // Filter out empty pages
    const pagesToExport = pages.filter(page => !page.isEmpty);

    if (pagesToExport.length === 0) {
      throw new Error('No pages with content to export');
    }

    for (const page of pagesToExport) {
      try {
        const csvContent = generateCSVForPage(page);
        const filename = pagesToExport.length > 1 
          ? `${baseFilename}-page-${page.pageNumber}.csv`
          : `${baseFilename}.csv`;
        
        zip.file(filename, csvContent);
      } catch (error) {
        console.error(`Failed to generate CSV for page ${page.pageNumber}:`, error);
        
        // Add error file
        const errorMessage = `Failed to generate CSV for page ${page.pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        zip.file(`error-page-${page.pageNumber}.txt`, errorMessage);
      }
    }

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}-csv.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Create custom naming pattern for exports
   */
  public static generateCustomFilename(
    basePattern: string,
    pageNumber: number,
    totalPages: number,
    timestamp?: Date
  ): string {
    const date = timestamp || new Date();
    const formatters = {
      '{base}': basePattern,
      '{page}': pageNumber.toString(),
      '{total}': totalPages.toString(),
      '{page-padded}': pageNumber.toString().padStart(2, '0'),
      '{date}': date.toISOString().split('T')[0], // YYYY-MM-DD
      '{datetime}': date.toISOString().replace(/[:.]/g, '-').split('.')[0], // YYYY-MM-DDTHH-MM-SS
      '{timestamp}': Date.now().toString()
    };

    let filename = basePattern;
    Object.entries(formatters).forEach(([pattern, replacement]) => {
      filename = filename.replace(new RegExp(pattern.replace(/[{}]/g, '\\$&'), 'g'), replacement);
    });

    return filename;
  }

  /**
   * Get available naming patterns for user selection
   */
  public static getAvailablePatterns(): Array<{ pattern: string; description: string; example: string }> {
    const sampleDate = new Date('2024-01-15T14:30:00');
    const examples = [
      {
        pattern: '{base}-page-{page}',
        description: 'Base name with page number',
        example: 'menu-page-1'
      },
      {
        pattern: '{base}-{page}-of-{total}',
        description: 'Page count format',
        example: 'menu-1-of-3'
      },
      {
        pattern: '{base}-{date}-page-{page-padded}',
        description: 'Date and padded page number',
        example: 'menu-2024-01-15-page-01'
      },
      {
        pattern: '{base}-{datetime}',
        description: 'Base name with full timestamp',
        example: 'menu-2024-01-15T14-30-00'
      }
    ];

    return examples;
  }
}

/**
 * Sequential file exporter for individual downloads
 */
export class SequentialExporter {
  /**
   * Export pages one by one with file dialogs
   */
  public static async exportPagesSequentially(
    pages: PageExportData[],
    baseFilename: string,
    format: 'png' | 'jpeg' | 'csv',
    getPageElement?: (pageNumber: number) => Promise<HTMLElement> | HTMLElement | null,
    generateCSVForPage?: (page: PageExportData) => string
  ): Promise<void> {
    // Filter out empty pages
    const pagesToExport = pages.filter(page => !page.isEmpty);

    if (pagesToExport.length === 0) {
      throw new Error('No pages with content to export');
    }

    for (const page of pagesToExport) {
      await this.exportSinglePage(
        page, 
        baseFilename, 
        format, 
        pagesToExport.length > 1,
        getPageElement,
        generateCSVForPage
      );
      
      // Small delay between exports to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Export a single page with file dialog
   */
  private static async exportSinglePage(
    page: PageExportData,
    baseFilename: string,
    format: 'png' | 'jpeg' | 'csv',
    includePageNumber: boolean,
    getPageElement?: (pageNumber: number) => Promise<HTMLElement> | HTMLElement | null,
    generateCSVForPage?: (page: PageExportData) => string
  ): Promise<void> {
    try {
      const filename = includePageNumber 
        ? `${baseFilename}-page-${page.pageNumber}.${format}`
        : `${baseFilename}.${format}`;

      let blob: Blob;

      if (format === 'csv') {
        if (!generateCSVForPage) {
          throw new Error('CSV generator function not provided');
        }
        const csvContent = generateCSVForPage(page);
        blob = new Blob([csvContent], { type: 'text/csv' });
      } else {
        if (!getPageElement) {
          throw new Error('Page element getter function not provided');
        }
        
        const pageElementResult = getPageElement(page.pageNumber);
        const pageElement = await Promise.resolve(pageElementResult);
        if (!pageElement) {
          throw new Error(`Could not find element for page ${page.pageNumber}`);
        }

        const dataUrl = format === 'png'
          ? await domtoimage.toPng(pageElement, {
              quality: 1.0,
              bgcolor: '#ffffff',
              width: pageElement.offsetWidth,
              height: pageElement.offsetHeight
            })
          : await domtoimage.toJpeg(pageElement, {
              quality: 0.95,
              bgcolor: '#ffffff',
              width: pageElement.offsetWidth,
              height: pageElement.offsetHeight
            });

        const response = await fetch(dataUrl);
        blob = await response.blob();
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(`Failed to export page ${page.pageNumber}:`, error);
      // Could show user notification here
    }
  }
}