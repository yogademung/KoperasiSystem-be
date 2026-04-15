import { TemplateSchema } from './interfaces/report.interfaces';
export declare class PdfRendererService {
    private readonly UPLOADS_DIR;
    constructor();
    renderToPdf(template: TemplateSchema, data: Record<string, any>, filename: string): Promise<string>;
    private renderElement;
    private renderText;
    private renderVariable;
    private renderTable;
    private renderPassbookGrid;
    private renderImage;
    private renderShape;
    private getNestedValue;
    private formatValue;
    private mmToPoints;
    private getPaperSize;
    getFileSize(filePath: string): Promise<number>;
}
