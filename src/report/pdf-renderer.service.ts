import { Injectable } from '@nestjs/common';
import {
  TemplateSchema,
  TemplateElement,
} from './interfaces/report.interfaces';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF Renderer Service
 * Renders template schema to PDF using PDFKit
 */
@Injectable()
export class PdfRendererService {
  private readonly UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'reports');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.UPLOADS_DIR)) {
      fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
    }
  }

  /**
   * Render template to PDF
   */
  async renderToPdf(
    template: TemplateSchema,
    data: Record<string, any>,
    filename: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const filePath = path.join(this.UPLOADS_DIR, filename);
        const doc = new PDFDocument({
          size: this.getPaperSize(template.paperSize),
          layout:
            template.orientation === 'landscape' ? 'landscape' : 'portrait',
          margins: {
            top: this.mmToPoints(template.margins.top),
            bottom: this.mmToPoints(template.margins.bottom),
            left: this.mmToPoints(template.margins.left),
            right: this.mmToPoints(template.margins.right),
          },
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Render all elements
        for (const element of template.elements) {
          this.renderElement(doc, element, data);
        }

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Render a single element
   */
  private renderElement(
    doc: PDFKit.PDFDocument,
    element: TemplateElement,
    data: Record<string, any>,
  ) {
    const x = this.mmToPoints(element.x);
    const y = this.mmToPoints(element.y);

    // Apply styling
    if (element.style) {
      if (element.style.fontSize) {
        doc.fontSize(element.style.fontSize);
      }
      if (element.style.fontWeight === 'bold') {
        doc.font('Helvetica-Bold');
      } else {
        doc.font('Helvetica');
      }
      if (element.style.color) {
        doc.fillColor(element.style.color);
      }
    }

    switch (element.type) {
      case 'text':
        this.renderText(doc, element, x, y);
        break;
      case 'variable':
        this.renderVariable(doc, element, data, x, y);
        break;
      case 'table':
        this.renderTable(doc, element, data, x, y);
        break;
      case 'passbook-grid':
        this.renderPassbookGrid(doc, element, data, x, y);
        break;
      case 'image':
        this.renderImage(doc, element, x, y);
        break;
      case 'shape':
        this.renderShape(doc, element, x, y);
        break;
    }

    // Reset styling
    doc.fillColor('black');
    doc.font('Helvetica');
  }

  /**
   * Render text element
   */
  private renderText(
    doc: PDFKit.PDFDocument,
    element: TemplateElement,
    x: number,
    y: number,
  ) {
    if (!element.content) return;

    const options: any = {};
    if (element.width) {
      options.width = this.mmToPoints(element.width);
    }
    if (element.style?.textAlign) {
      options.align = element.style.textAlign;
    }

    doc.text(element.content, x, y, options);
  }

  /**
   * Render variable element
   */
  private renderVariable(
    doc: PDFKit.PDFDocument,
    element: TemplateElement,
    data: Record<string, any>,
    x: number,
    y: number,
  ) {
    if (!element.variableKey) return;

    const value = this.getNestedValue(data, element.variableKey);
    const formattedValue = this.formatValue(value, element);

    const options: any = {};
    if (element.width) {
      options.width = this.mmToPoints(element.width);
    }
    if (element.style?.textAlign) {
      options.align = element.style.textAlign;
    }

    doc.text(formattedValue, x, y, options);
  }

  /**
   * Render table element
   */
  private renderTable(
    doc: PDFKit.PDFDocument,
    element: TemplateElement,
    data: Record<string, any>,
    x: number,
    y: number,
  ) {
    if (!element.tableConfig) return;

    const { columns, dataSource, headerStyle, rowStyle } = element.tableConfig;
    const tableData = this.getNestedValue(data, dataSource);

    if (!Array.isArray(tableData)) return;

    let currentY = y;
    const rowHeight = 15; // Default row height in points

    // Render header
    if (headerStyle?.fontSize) {
      doc.fontSize(headerStyle.fontSize);
    }
    if (headerStyle?.fontWeight === 'bold') {
      doc.font('Helvetica-Bold');
    }

    let currentX = x;
    for (const column of columns) {
      const colWidth = this.mmToPoints(column.width);
      doc.text(column.header, currentX, currentY, {
        width: colWidth,
        align: column.align,
      });
      currentX += colWidth;
    }

    currentY += rowHeight;

    // Render rows
    if (rowStyle?.fontSize) {
      doc.fontSize(rowStyle.fontSize);
    }
    doc.font('Helvetica');

    for (const row of tableData) {
      currentX = x;
      for (const column of columns) {
        const colWidth = this.mmToPoints(column.width);
        const value = row[column.key] || '';
        doc.text(value.toString(), currentX, currentY, {
          width: colWidth,
          align: column.align,
        });
        currentX += colWidth;
      }
      currentY += rowHeight;

      // Check if we need a new page
      if (currentY > doc.page.height - this.mmToPoints(20)) {
        doc.addPage();
        currentY = this.mmToPoints(20);
      }
    }
  }

  /**
   * Render passbook grid element
   */
  private renderPassbookGrid(
    doc: PDFKit.PDFDocument,
    element: TemplateElement,
    data: Record<string, any>,
    x: number,
    y: number,
  ) {
    if (!element.passbookConfig) return;

    const { startLine, columns } = element.passbookConfig;
    const transactions = data.transactions || [];

    if (!Array.isArray(transactions)) return;

    const lineHeight = this.mmToPoints(5.5); // Standard passbook line height
    let currentY = y + (startLine - 1) * lineHeight;

    doc.fontSize(11);

    for (const transaction of transactions) {
      for (const column of columns) {
        const value = transaction[column.key] || '';
        const colX = this.mmToPoints(column.xPosition);
        const colWidth = this.mmToPoints(column.width);

        doc.text(value.toString(), colX, currentY, {
          width: colWidth,
          align: column.align,
        });
      }
      currentY += lineHeight;
    }
  }

  /**
   * Render image element
   */
  private renderImage(
    doc: PDFKit.PDFDocument,
    element: TemplateElement,
    x: number,
    y: number,
  ) {
    if (!element.imageSrc) return;

    try {
      const options: any = {};
      if (element.width) {
        options.width = this.mmToPoints(element.width);
      }
      if (element.height) {
        options.height = this.mmToPoints(element.height);
      }

      doc.image(element.imageSrc, x, y, options);
    } catch (error) {
      // If image fails to load, just skip it
      console.error('Failed to load image:', error);
    }
  }

  /**
   * Render shape element
   */
  private renderShape(
    doc: PDFKit.PDFDocument,
    element: TemplateElement,
    x: number,
    y: number,
  ) {
    // Simple line/rectangle rendering
    if (element.width && element.height) {
      doc.rect(
        x,
        y,
        this.mmToPoints(element.width),
        this.mmToPoints(element.height),
      );
      if (element.style?.border) {
        doc.stroke();
      }
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Format value based on element configuration
   */
  private formatValue(value: any, element: TemplateElement): string {
    if (value === null || value === undefined) return '';
    return value.toString();
  }

  /**
   * Convert millimeters to points (PDF unit)
   */
  private mmToPoints(mm: number): number {
    return mm * 2.83465; // 1mm = 2.83465 points
  }

  /**
   * Get paper size for PDFKit
   */
  private getPaperSize(size: string): [number, number] | string {
    switch (size.toUpperCase()) {
      case 'A4':
        return 'A4';
      case 'LETTER':
        return 'LETTER';
      case 'LEGAL':
        return 'LEGAL';
      default:
        return 'A4';
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
