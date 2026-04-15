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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfRendererService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PdfRendererService = class PdfRendererService {
    UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'reports');
    constructor() {
        if (!fs.existsSync(this.UPLOADS_DIR)) {
            fs.mkdirSync(this.UPLOADS_DIR, { recursive: true });
        }
    }
    async renderToPdf(template, data, filename) {
        return new Promise((resolve, reject) => {
            try {
                const filePath = path.join(this.UPLOADS_DIR, filename);
                const doc = new pdfkit_1.default({
                    size: this.getPaperSize(template.paperSize),
                    layout: template.orientation === 'landscape' ? 'landscape' : 'portrait',
                    margins: {
                        top: this.mmToPoints(template.margins.top),
                        bottom: this.mmToPoints(template.margins.bottom),
                        left: this.mmToPoints(template.margins.left),
                        right: this.mmToPoints(template.margins.right),
                    },
                });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);
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
            }
            catch (error) {
                reject(error);
            }
        });
    }
    renderElement(doc, element, data) {
        const x = this.mmToPoints(element.x);
        const y = this.mmToPoints(element.y);
        if (element.style) {
            if (element.style.fontSize) {
                doc.fontSize(element.style.fontSize);
            }
            if (element.style.fontWeight === 'bold') {
                doc.font('Helvetica-Bold');
            }
            else {
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
        doc.fillColor('black');
        doc.font('Helvetica');
    }
    renderText(doc, element, x, y) {
        if (!element.content)
            return;
        const options = {};
        if (element.width) {
            options.width = this.mmToPoints(element.width);
        }
        if (element.style?.textAlign) {
            options.align = element.style.textAlign;
        }
        doc.text(element.content, x, y, options);
    }
    renderVariable(doc, element, data, x, y) {
        if (!element.variableKey)
            return;
        const value = this.getNestedValue(data, element.variableKey);
        const formattedValue = this.formatValue(value, element);
        const options = {};
        if (element.width) {
            options.width = this.mmToPoints(element.width);
        }
        if (element.style?.textAlign) {
            options.align = element.style.textAlign;
        }
        doc.text(formattedValue, x, y, options);
    }
    renderTable(doc, element, data, x, y) {
        if (!element.tableConfig)
            return;
        const { columns, dataSource, headerStyle, rowStyle } = element.tableConfig;
        const tableData = this.getNestedValue(data, dataSource);
        if (!Array.isArray(tableData))
            return;
        let currentY = y;
        const rowHeight = 15;
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
            if (currentY > doc.page.height - this.mmToPoints(20)) {
                doc.addPage();
                currentY = this.mmToPoints(20);
            }
        }
    }
    renderPassbookGrid(doc, element, data, x, y) {
        if (!element.passbookConfig)
            return;
        const { startLine, columns } = element.passbookConfig;
        const transactions = data.transactions || [];
        if (!Array.isArray(transactions))
            return;
        const lineHeight = this.mmToPoints(5.5);
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
    renderImage(doc, element, x, y) {
        if (!element.imageSrc)
            return;
        try {
            const options = {};
            if (element.width) {
                options.width = this.mmToPoints(element.width);
            }
            if (element.height) {
                options.height = this.mmToPoints(element.height);
            }
            doc.image(element.imageSrc, x, y, options);
        }
        catch (error) {
            console.error('Failed to load image:', error);
        }
    }
    renderShape(doc, element, x, y) {
        if (element.width && element.height) {
            doc.rect(x, y, this.mmToPoints(element.width), this.mmToPoints(element.height));
            if (element.style?.border) {
                doc.stroke();
            }
        }
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    formatValue(value, element) {
        if (value === null || value === undefined)
            return '';
        return value.toString();
    }
    mmToPoints(mm) {
        return mm * 2.83465;
    }
    getPaperSize(size) {
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
exports.PdfRendererService = PdfRendererService;
exports.PdfRendererService = PdfRendererService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PdfRendererService);
//# sourceMappingURL=pdf-renderer.service.js.map