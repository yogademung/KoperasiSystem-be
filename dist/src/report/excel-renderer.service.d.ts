import { TemplateSchema } from './interfaces/report.interfaces';
export declare class ExcelRendererService {
    private readonly UPLOADS_DIR;
    constructor();
    renderToExcel(template: TemplateSchema, data: Record<string, any>, filename: string): Promise<string>;
    private renderElement;
    private renderText;
    private renderVariable;
    private renderTable;
    private renderPassbookGrid;
    private applyStyle;
    private getNestedValue;
    private colorToArgb;
    private getPaperSize;
    getFileSize(filePath: string): Promise<number>;
}
