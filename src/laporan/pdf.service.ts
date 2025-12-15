
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
    private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

    constructor() {
        this.registerHelpers();
    }

    private registerHelpers() {
        Handlebars.registerHelper('formatCurrency', (value) => {
            if (value === undefined || value === null) return '';
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
        });
        Handlebars.registerHelper('formatDate', (value) => {
            if (!value) return '';
            return new Date(value).toLocaleDateString('id-ID');
        });
        Handlebars.registerHelper('eq', function (a, b) {
            return a === b;
        });
    }

    async generate(data: {
        title: string;
        period: string;
        data: any[];
        totals?: any;
        orientation?: 'portrait' | 'landscape';
    }): Promise<Buffer> {
        // 1. Load template
        const template = this.getTemplate('report-table');

        // 2. Compile with data
        const html = template({
            title: data.title,
            period: data.period,
            printDate: new Date().toLocaleDateString('id-ID'),
            columns: data.data.length > 0 ? Object.keys(data.data[0]) : [],
            rows: data.data,
            totals: data.totals,
            location: 'Denpasar'
        });

        // 3. Generate PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
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
                left: '15mm'
            }
        });

        await browser.close();

        return Buffer.from(pdf);
    }

    private getTemplate(name: string): HandlebarsTemplateDelegate {
        if (this.templateCache.has(name)) {
            return this.templateCache.get(name)!;
        }

        // Adjust path based on your project structure. 
        // Assuming templates are in 'koperasi-backend/templates'
        const templatePath = path.join(
            process.cwd(),
            'templates',
            `${name}.hbs`
        );

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template not found at ${templatePath}`);
        }

        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const compiled = Handlebars.compile(templateContent);

        this.templateCache.set(name, compiled);
        return compiled;
    }
}
