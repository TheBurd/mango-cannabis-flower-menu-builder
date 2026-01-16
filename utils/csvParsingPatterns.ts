/**
 * Pre-compiled regex patterns for CSV parsing operations.
 *
 * These patterns are compiled once at module load time rather than
 * being created on every function call, improving performance when
 * processing large CSV files with thousands of rows.
 *
 * Performance Impact:
 * - Regex compilation is expensive (~100-1000 microseconds per pattern)
 * - For 10,000 rows, recompiling patterns would add 1-10 seconds overhead
 * - Pre-compiled patterns reduce this to negligible microseconds
 */

// ============================================
// LINE AND CELL PARSING PATTERNS
// ============================================

/** Split content on newlines (handles both \r\n and \n) */
export const NEWLINE_PATTERN = /\r\n|\n/;

/** Match leading/trailing double quotes from CSV cells */
export const QUOTED_FIELD_PATTERN = /^"|"$/g;

/** Match escaped double quotes in CSV cells (replace "" with ") */
export const ESCAPED_QUOTES_PATTERN = /""/g;

// ============================================
// NUMERIC VALUE EXTRACTION PATTERNS
// ============================================

/** Extract numeric value from string (e.g., "24.5%" -> "24.5") */
export const NUMERIC_VALUE_PATTERN = /(\d*\.?\d+)/;

/** Match currency symbols and thousands separators for price parsing */
export const PRICE_CLEANUP_PATTERN = /[$,]/g;

/** Match percentage symbol */
export const PERCENT_CLEANUP_PATTERN = /%/g;

// ============================================
// STRAIN TYPE NORMALIZATION PATTERNS
// ============================================

/** Remove spaces, hyphens, dots, slashes for strain type normalization */
export const TYPE_NORMALIZE_PATTERN = /[\s\-./]/g;

// ============================================
// CSV ESCAPE PATTERNS
// ============================================

/** Match double quotes for CSV field escaping (used in export) */
export const CSV_QUOTE_ESCAPE_PATTERN = /"/g;

// ============================================
// HEADER/FIELD NAME NORMALIZATION
// ============================================

/** Remove spaces, underscores, hyphens for header matching */
export const HEADER_NORMALIZE_PATTERN = /[\s_-]/g;

// ============================================
// WEIGHT DETECTION PATTERNS
// ============================================

/** Common weight values for pre-packaged detection */
export const WEIGHT_VALUES = ['1g', '3.5g', '7g', '14g', '28g'] as const;

/** Pattern to detect weight strings */
export const WEIGHT_DETECT_PATTERN = /\b(\d+(?:\.\d+)?)\s*(?:g|oz)\b/i;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse a CSV line into cells, handling quoted fields.
 * This is a faster alternative to regex splitting for simple CSV.
 */
export function parseCsvLine(line: string, delimiter: string = ','): string[] {
  const cells: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(currentCell.trim());
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Add last cell
  cells.push(currentCell.trim());

  return cells;
}

/**
 * Extract numeric value from a string.
 * Uses pre-compiled pattern for better performance.
 */
export function extractNumericValue(str: string | undefined | null): number | null {
  if (!str) return null;
  const match = str.match(NUMERIC_VALUE_PATTERN);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Parse a price string, removing currency symbols and formatting.
 */
export function parsePrice(str: string | undefined | null): number {
  if (!str) return 0;
  const cleaned = str.replace(PRICE_CLEANUP_PATTERN, '');
  const match = cleaned.match(NUMERIC_VALUE_PATTERN);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Normalize a strain type string for lookup in CSV_STRAIN_TYPE_MAP.
 */
export function normalizeStrainType(str: string | undefined | null): string {
  if (!str) return '';
  return str.toUpperCase().replace(TYPE_NORMALIZE_PATTERN, '');
}

/**
 * Normalize a header name for matching against field aliases.
 */
export function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(HEADER_NORMALIZE_PATTERN, '');
}

/**
 * Escape a field value for CSV export.
 */
export function escapeCsvField(value: string | number | boolean | null | undefined): string {
  const str = String(value ?? '');
  return `"${str.replace(CSV_QUOTE_ESCAPE_PATTERN, '""')}"`;
}

/**
 * Check if a string value represents a truthy boolean.
 * Used for parsing "sold out", "last jar", "low stock" columns.
 */
const TRUTHY_VALUES = new Set([
  'true', 'yes', '1', 'soldout', 'sold out', 'out of stock',
  'unavailable', 'empty', 'oos', 'out', 'lastjar', 'last jar',
  'lowstock', 'low stock', 'limited'
]);

export function parseBooleanField(value: string | undefined | null): boolean {
  if (!value) return false;
  return TRUTHY_VALUES.has(value.toLowerCase().trim());
}

/**
 * Parse CSV content into lines, filtering empty lines.
 */
export function splitCsvLines(content: string): string[] {
  return content.split(NEWLINE_PATTERN).filter(line => line.trim() !== '');
}

/**
 * Clean a CSV cell value by removing outer quotes and unescaping inner quotes.
 */
export function cleanCsvCell(cell: string): string {
  return cell.trim().replace(QUOTED_FIELD_PATTERN, '').replace(ESCAPED_QUOTES_PATTERN, '"');
}
