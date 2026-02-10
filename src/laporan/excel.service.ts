import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelService {
  async generate(data: {
    title: string;
    period: string;
    columns: string[];
    data: any[];
    totals?: any;
  }): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // 1. Add title
    worksheet.mergeCells(
      'A1:' + this.getColumnLetter(data.columns.length) + '1',
    );
    const titleCell = worksheet.getCell('A1');
    titleCell.value = data.title;
    titleCell.font = { size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // 2. Add period
    worksheet.mergeCells(
      'A2:' + this.getColumnLetter(data.columns.length) + '2',
    );
    const periodCell = worksheet.getCell('A2');
    periodCell.value = `Periode: ${data.period}`;
    periodCell.alignment = { horizontal: 'center' };

    // 3. Add print date
    worksheet.mergeCells(
      'A3:' + this.getColumnLetter(data.columns.length) + '3',
    );
    const dateCell = worksheet.getCell('A3');
    dateCell.value = `Dicetak: ${new Date().toLocaleDateString('id-ID')}`;
    dateCell.alignment = { horizontal: 'center' };

    // 4. Add empty row
    worksheet.addRow([]);

    // 5. Add headers
    const headerRow = worksheet.addRow(data.columns);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    headerRow.alignment = { horizontal: 'center' };

    // 6. Add data
    data.data.forEach((row) => {
      worksheet.addRow(Object.values(row));
    });

    // 7. Add totals if provided
    if (data.totals) {
      const totalRow = worksheet.addRow([
        'TOTAL',
        ...Object.values(data.totals),
      ]);
      totalRow.font = { bold: true };
    }

    // 8. Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      let maxLength = 0;
      if (data.columns[index]) {
        maxLength = data.columns[index].length;
      }

      if (column && column.eachCell) {
        column.eachCell((cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
      }
      column.width = Math.min(maxLength + 2, 50);
    });

    // 9. Add borders
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 5) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }
    });

    // 10. Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer); // Convert ArrayBuffer to Buffer
  }

  private getColumnLetter(columnNumber: number): string {
    let letter = '';
    while (columnNumber > 0) {
      const remainder = (columnNumber - 1) % 26;
      letter = String.fromCharCode(65 + remainder) + letter;
      columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return letter;
  }
}
