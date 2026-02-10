import { Injectable } from '@nestjs/common';
import {
  TemplateSchema,
  TemplateElement,
} from './interfaces/report.interfaces';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Excel Renderer Service
 * Renders template schema to Excel using ExcelJS
 */
@Injectable()
export class ExcelRendererService {
  private readonly UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'reports');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.UPLOADS_DIR)) {
      fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
    }
  }

  /**
   * Render template to Excel
   */
  async renderToExcel(
    template: TemplateSchema,
    data: Record<string, any>,
    filename: string,
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Set page setup
    worksheet.pageSetup = {
      paperSize: this.getPaperSize(template.paperSize),
      orientation:
        template.orientation === 'landscape' ? 'landscape' : 'portrait',
      margins: {
        top: template.margins.top / 25.4, // Convert mm to inches
        bottom: template.margins.bottom / 25.4,
        left: template.margins.left / 25.4,
        right: template.margins.right / 25.4,
      },
    } as any;

    // Render all elements
    for (const element of template.elements) {
      this.renderElement(worksheet, element, data);
    }

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column) {
        column.width = 15; // Default width
      }
    });

    const filePath = path.join(this.UPLOADS_DIR, filename);
    await workbook.xlsx.writeFile(filePath);

    return filePath;
  }

  /**
   * Render a single element
   */
  private renderElement(
    worksheet: ExcelJS.Worksheet,
    element: TemplateElement,
    data: Record<string, any>,
  ) {
    // Convert mm position to Excel row/column
    const row = Math.floor(element.y / 5) + 1; // Approximate: 5mm per row
    const col = Math.floor(element.x / 20) + 1; // Approximate: 20mm per column

    switch (element.type) {
      case 'text':
        this.renderText(worksheet, element, row, col);
        break;
      case 'variable':
        this.renderVariable(worksheet, element, data, row, col);
        break;
      case 'table':
        this.renderTable(worksheet, element, data, row, col);
        break;
      case 'passbook-grid':
        this.renderPassbookGrid(worksheet, element, data, row, col);
        break;
    }
  }

  /**
   * Render text element
   */
  private renderText(
    worksheet: ExcelJS.Worksheet,
    element: TemplateElement,
    row: number,
    col: number,
  ) {
    if (!element.content) return;

    const cell = worksheet.getCell(row, col);
    cell.value = element.content;
    this.applyStyle(cell, element);
  }

  /**
   * Render variable element
   */
  private renderVariable(
    worksheet: ExcelJS.Worksheet,
    element: TemplateElement,
    data: Record<string, any>,
    row: number,
    col: number,
  ) {
    if (!element.variableKey) return;

    const value = this.getNestedValue(data, element.variableKey);
    const cell = worksheet.getCell(row, col);
    cell.value = value;
    this.applyStyle(cell, element);
  }

  /**
   * Render table element
   */
  private renderTable(
    worksheet: ExcelJS.Worksheet,
    element: TemplateElement,
    data: Record<string, any>,
    row: number,
    col: number,
  ) {
    if (!element.tableConfig) return;

    const { columns, dataSource, headerStyle, rowStyle } = element.tableConfig;
    const tableData = this.getNestedValue(data, dataSource);

    if (!Array.isArray(tableData)) return;

    let currentRow = row;

    // Render header
    let currentCol = col;
    for (const column of columns) {
      const cell = worksheet.getCell(currentRow, currentCol);
      cell.value = column.header;

      // Apply header style
      if (headerStyle) {
        cell.font = {
          bold: headerStyle.fontWeight === 'bold',
          size: headerStyle.fontSize || 11,
        };
        if (headerStyle.backgroundColor) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: this.colorToArgb(headerStyle.backgroundColor) },
          };
        }
      }

      cell.alignment = { horizontal: column.align };
      currentCol++;
    }

    currentRow++;

    // Render data rows
    for (const rowData of tableData) {
      currentCol = col;
      for (const column of columns) {
        const cell = worksheet.getCell(currentRow, currentCol);
        cell.value = rowData[column.key] || '';

        // Apply row style
        if (rowStyle?.fontSize) {
          cell.font = { size: rowStyle.fontSize };
        }

        cell.alignment = { horizontal: column.align };
        currentCol++;
      }
      currentRow++;
    }

    // Add borders to table
    const tableRange =
      worksheet.getCell(row, col).address +
      ':' +
      worksheet.getCell(currentRow - 1, col + columns.length - 1).address;

    const range = worksheet.getCell(tableRange);
    // Note: ExcelJS doesn't support range borders directly, would need to iterate cells
  }

  /**
   * Render passbook grid element
   */
  private renderPassbookGrid(
    worksheet: ExcelJS.Worksheet,
    element: TemplateElement,
    data: Record<string, any>,
    row: number,
    col: number,
  ) {
    if (!element.passbookConfig) return;

    const { startLine, columns } = element.passbookConfig;
    const transactions = data.transactions || [];

    if (!Array.isArray(transactions)) return;

    let currentRow = row + (startLine - 1);

    for (const transaction of transactions) {
      let currentCol = col;
      for (const column of columns) {
        const cell = worksheet.getCell(currentRow, currentCol);
        cell.value = transaction[column.key] || '';
        cell.alignment = { horizontal: column.align };
        cell.font = { size: 11 };
        currentCol++;
      }
      currentRow++;
    }
  }

  /**
   * Apply styling to cell
   */
  private applyStyle(cell: ExcelJS.Cell, element: TemplateElement) {
    if (!element.style) return;

    // Font styling
    const font: Partial<ExcelJS.Font> = {};
    if (element.style.fontSize) {
      font.size = element.style.fontSize;
    }
    if (element.style.fontWeight === 'bold') {
      font.bold = true;
    }
    if (element.style.fontStyle === 'italic') {
      font.italic = true;
    }
    if (element.style.color) {
      font.color = { argb: this.colorToArgb(element.style.color) };
    }
    cell.font = font;

    // Alignment
    if (element.style.textAlign) {
      cell.alignment = { horizontal: element.style.textAlign };
    }

    // Background color
    if (element.style.backgroundColor) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: this.colorToArgb(element.style.backgroundColor) },
      };
    }

    // Border
    if (element.style.border) {
      const borderStyle: ExcelJS.Border = {
        style: element.style.border.style === 'dashed' ? 'dashDot' : 'thin',
        color: { argb: this.colorToArgb(element.style.border.color) },
      };
      cell.border = {
        top: borderStyle,
        left: borderStyle,
        bottom: borderStyle,
        right: borderStyle,
      };
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Convert color string to ARGB format
   */
  private colorToArgb(color: string): string {
    // Simple conversion - assumes hex color
    if (color.startsWith('#')) {
      return 'FF' + color.substring(1).toUpperCase();
    }
    return 'FF000000'; // Default black
  }

  /**
   * Get paper size for Excel
   */
  private getPaperSize(size: string): number {
    switch (size.toUpperCase()) {
      case 'A4':
        return 9; // A4
      case 'LETTER':
        return 1; // Letter
      case 'LEGAL':
        return 5; // Legal
      default:
        return 9; // Default A4
    }
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }
}
