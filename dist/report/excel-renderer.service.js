"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelRendererService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let ExcelRendererService = class ExcelRendererService {
    UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'reports');
    constructor() {
        if (!fs.existsSync(this.UPLOADS_DIR)) {
            fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
        }
    }
    async renderToExcel(template, data, filename) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');
        worksheet.pageSetup = {
            paperSize: this.getPaperSize(template.paperSize),
            orientation: template.orientation === 'landscape' ? 'landscape' : 'portrait',
            margins: {
                top: template.margins.top / 25.4,
                bottom: template.margins.bottom / 25.4,
                left: template.margins.left / 25.4,
                right: template.margins.right / 25.4,
            },
        };
        for (const element of template.elements) {
            this.renderElement(worksheet, element, data);
        }
        worksheet.columns.forEach((column) => {
            if (column) {
                column.width = 15;
            }
        });
        const filePath = path.join(this.UPLOADS_DIR, filename);
        await workbook.xlsx.writeFile(filePath);
        return filePath;
    }
    renderElement(worksheet, element, data) {
        const row = Math.floor(element.y / 5) + 1;
        const col = Math.floor(element.x / 20) + 1;
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
    renderText(worksheet, element, row, col) {
        if (!element.content)
            return;
        const cell = worksheet.getCell(row, col);
        cell.value = element.content;
        this.applyStyle(cell, element);
    }
    renderVariable(worksheet, element, data, row, col) {
        if (!element.variableKey)
            return;
        const value = this.getNestedValue(data, element.variableKey);
        const cell = worksheet.getCell(row, col);
        cell.value = value;
        this.applyStyle(cell, element);
    }
    renderTable(worksheet, element, data, row, col) {
        if (!element.tableConfig)
            return;
        const { columns, dataSource, headerStyle, rowStyle } = element.tableConfig;
        const tableData = this.getNestedValue(data, dataSource);
        if (!Array.isArray(tableData))
            return;
        let currentRow = row;
        let currentCol = col;
        for (const column of columns) {
            const cell = worksheet.getCell(currentRow, currentCol);
            cell.value = column.header;
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
        for (const rowData of tableData) {
            currentCol = col;
            for (const column of columns) {
                const cell = worksheet.getCell(currentRow, currentCol);
                cell.value = rowData[column.key] || '';
                if (rowStyle?.fontSize) {
                    cell.font = { size: rowStyle.fontSize };
                }
                cell.alignment = { horizontal: column.align };
                currentCol++;
            }
            currentRow++;
        }
        const tableRange = worksheet.getCell(row, col).address +
            ':' +
            worksheet.getCell(currentRow - 1, col + columns.length - 1).address;
        const range = worksheet.getCell(tableRange);
    }
    renderPassbookGrid(worksheet, element, data, row, col) {
        if (!element.passbookConfig)
            return;
        const { startLine, columns } = element.passbookConfig;
        const transactions = data.transactions || [];
        if (!Array.isArray(transactions))
            return;
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
    applyStyle(cell, element) {
        if (!element.style)
            return;
        const font = {};
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
        if (element.style.textAlign) {
            cell.alignment = { horizontal: element.style.textAlign };
        }
        if (element.style.backgroundColor) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: this.colorToArgb(element.style.backgroundColor) },
            };
        }
        if (element.style.border) {
            const borderStyle = {
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
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    colorToArgb(color) {
        if (color.startsWith('#')) {
            return 'FF' + color.substring(1).toUpperCase();
        }
        return 'FF000000';
    }
    getPaperSize(size) {
        switch (size.toUpperCase()) {
            case 'A4':
                return 9;
            case 'LETTER':
                return 1;
            case 'LEGAL':
                return 5;
            default:
                return 9;
        }
    }
    async getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        }
        catch {
            return 0;
        }
    }
};
exports.ExcelRendererService = ExcelRendererService;
exports.ExcelRendererService = ExcelRendererService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ExcelRendererService);
//# sourceMappingURL=excel-renderer.service.js.map