export declare class ExcelService {
    generate(data: {
        title: string;
        period: string;
        columns: string[];
        data: any[];
        totals?: any;
    }): Promise<Buffer>;
    private getColumnLetter;
}
