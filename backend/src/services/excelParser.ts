import * as XLSX from 'xlsx';
import { parse, isValid, startOfWeek, format } from 'date-fns';

export interface ParsedHoursRecord {
  project: string;
  employeeId: string;
  resourceName: string;
  rate: number;
  activityId: string;
  weekStartDate: string;
  actualOrProposed: 'A' | 'P';
  hours: number;
  demandType: 'Hard Demand' | 'Soft Demand';
  projectId: string;
  phase: string;
  milestone: string;
}

export interface ParseResult {
  records: ParsedHoursRecord[];
  errors: string[];
  warnings: string[];
}

/**
 * Parses budget tracker Excel files following the exact VBA extraction rules
 */
export class BudgetTrackerParser {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Parse an Excel file buffer
   */
  parse(fileBuffer: Buffer, demandType: 'Hard Demand' | 'Soft Demand'): ParseResult {
    this.errors = [];
    this.warnings = [];
    const records: ParsedHoursRecord[] = [];

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });

      // Look for "Detail" sheet
      const detailSheet = workbook.Sheets['Detail'];
      if (!detailSheet) {
        this.errors.push('No "Detail" sheet found in workbook');
        return { records, errors: this.errors, warnings: this.warnings };
      }

      // Convert sheet to array of arrays for easier processing
      const data = XLSX.utils.sheet_to_json(detailSheet, { header: 1, raw: false, defval: '' }) as any[][];

      if (data.length < 6) {
        this.errors.push('Sheet has insufficient rows (minimum 6 required)');
        return { records, errors: this.errors, warnings: this.warnings };
      }

      // Extract metadata from header rows
      const projectName = this.getCellValue(data, 0, 0); // Row 1, Col A
      const projectId = this.getCellValue(data, 0, 1); // Row 1, Col B

      // Process each data row (starting from Row 6, index 5)
      for (let rowIdx = 5; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx];

        // Extract employee info
        const activity = this.getCellValue(data, rowIdx, 0); // Col A
        const employeeId = this.getCellValue(data, rowIdx, 1); // Col B
        const resourceName = this.getCellValue(data, rowIdx, 2); // Col C
        const rate = this.parseNumber(this.getCellValue(data, rowIdx, 3)); // Col D
        const activityId = this.getCellValue(data, rowIdx, 4); // Col E

        // Skip if Employee ID is empty
        if (!employeeId || employeeId.trim() === '') {
          continue;
        }

        // Process each week column (starting from column H, index 7)
        for (let colIdx = 7; colIdx < row.length; colIdx++) {
          // Get date from Row 3 (index 2)
          const dateValue = this.getCellValue(data, 2, colIdx);
          const weekDate = this.parseDate(dateValue);

          // Skip if not a valid date
          if (!weekDate) {
            continue;
          }

          // Validate date range (2020-2035)
          const year = weekDate.getFullYear();
          if (year < 2020 || year > 2035) {
            continue;
          }

          // Get hours value
          const hoursValue = this.getCellValue(data, rowIdx, colIdx);
          const hours = this.parseNumber(hoursValue);

          // Skip if hours are invalid (<=0 or >500)
          if (hours <= 0 || hours > 500) {
            continue;
          }

          // Get A/P indicator from Row 1 at this column
          const apIndicator = this.getCellValue(data, 0, colIdx);
          const actualOrProposed = this.parseAPIndicator(apIndicator);

          // Get Phase from Row 4 (index 3)
          const phase = this.getCellValue(data, 3, colIdx);

          // Get Milestone from Row 5 (index 4)
          const milestone = this.getCellValue(data, 4, colIdx);

          // Adjust date to start of week (Sunday)
          const weekStartDate = startOfWeek(weekDate, { weekStartsOn: 0 });

          // Create record
          records.push({
            project: projectName,
            employeeId: employeeId.toString(),
            resourceName: resourceName,
            rate: rate,
            activityId: activityId,
            weekStartDate: format(weekStartDate, 'yyyy-MM-dd'),
            actualOrProposed: actualOrProposed,
            hours: hours,
            demandType: demandType,
            projectId: projectId,
            phase: phase,
            milestone: milestone,
          });
        }
      }

      if (records.length === 0) {
        this.warnings.push('No valid hours records found in file');
      } else {
        this.warnings.push(`Successfully extracted ${records.length} hours records`);
      }

    } catch (error) {
      this.errors.push(`Error parsing Excel file: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { records, errors: this.errors, warnings: this.warnings };
  }

  /**
   * Get cell value safely
   */
  private getCellValue(data: any[][], row: number, col: number): string {
    if (row >= data.length || !data[row]) return '';
    if (col >= data[row].length) return '';
    const value = data[row][col];
    return value !== null && value !== undefined ? String(value).trim() : '';
  }

  /**
   * Parse number from string
   */
  private parseNumber(value: string): number {
    if (!value || value.trim() === '') return 0;
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(value: string): Date | null {
    if (!value || value.trim() === '') return null;

    // Try parsing as ISO date first
    let date = parse(value, 'yyyy-MM-dd', new Date());
    if (isValid(date)) return date;

    // Try common date formats
    const formats = [
      'M/d/yyyy',
      'MM/dd/yyyy',
      'd/M/yyyy',
      'dd/MM/yyyy',
      'yyyy-MM-dd',
      'M/d/yy',
      'MM/dd/yy',
    ];

    for (const fmt of formats) {
      try {
        date = parse(value, fmt, new Date());
        if (isValid(date)) return date;
      } catch {
        continue;
      }
    }

    // Try Excel serial date number
    const excelDate = parseFloat(value);
    if (!isNaN(excelDate) && excelDate > 0) {
      // Excel serial date starts from 1900-01-01
      const baseDate = new Date(1899, 11, 30);
      date = new Date(baseDate.getTime() + excelDate * 24 * 60 * 60 * 1000);
      if (isValid(date)) return date;
    }

    return null;
  }

  /**
   * Parse A/P indicator from cell value
   */
  private parseAPIndicator(value: string): 'A' | 'P' {
    const upper = value.toUpperCase().trim();
    if (upper.includes('A') || upper === 'ACTUAL') return 'A';
    if (upper.includes('P') || upper === 'PROPOSED' || upper === 'PLAN') return 'P';
    return 'P'; // Default to Proposed
  }
}
