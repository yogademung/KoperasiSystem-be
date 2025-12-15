export declare class PdfService {
    private templateCache;
    constructor();
    private registerHelpers;
    generate(data: {
        title: string;
        period: string;
        data: any[];
        totals?: any;
        orientation?: 'portrait' | 'landscape';
    }): Promise<Buffer>;
    private getTemplate;
}
