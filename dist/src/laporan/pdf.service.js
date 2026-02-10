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
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = __importStar(require("puppeteer"));
const Handlebars = __importStar(require("handlebars"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PdfService = class PdfService {
    templateCache = new Map();
    constructor() {
        this.registerHelpers();
    }
    registerHelpers() {
        Handlebars.registerHelper('formatCurrency', (value) => {
            if (value === undefined || value === null)
                return '';
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
            }).format(value);
        });
        Handlebars.registerHelper('formatDate', (value) => {
            if (!value)
                return '';
            return new Date(value).toLocaleDateString('id-ID');
        });
        Handlebars.registerHelper('eq', function (a, b) {
            return a === b;
        });
    }
    async generate(data) {
        const template = this.getTemplate('report-table');
        const html = template({
            title: data.title,
            period: data.period,
            printDate: new Date().toLocaleDateString('id-ID'),
            columns: data.data.length > 0 ? Object.keys(data.data[0]) : [],
            rows: data.data,
            totals: data.totals,
            location: 'Denpasar',
        });
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            landscape: data.orientation === 'landscape',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm',
            },
        });
        await browser.close();
        return Buffer.from(pdf);
    }
    getTemplate(name) {
        if (this.templateCache.has(name)) {
            return this.templateCache.get(name);
        }
        const templatePath = path.join(process.cwd(), 'templates', `${name}.hbs`);
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found at ${templatePath}`);
        }
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const compiled = Handlebars.compile(templateContent);
        this.templateCache.set(name, compiled);
        return compiled;
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PdfService);
//# sourceMappingURL=pdf.service.js.map