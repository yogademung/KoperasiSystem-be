import { PrismaService } from '../database/prisma.service';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
export declare class LaporanService {
    private prisma;
    private pdfService;
    private excelService;
    constructor(prisma: PrismaService, pdfService: PdfService, excelService: ExcelService);
    generateSimpananRekap(params: {
        startDate: Date;
        endDate: Date;
        regionCode?: string;
        format: 'PDF' | 'EXCEL';
    }): Promise<Buffer<ArrayBufferLike>>;
    generateTabrelaRekap(params: any): Promise<Buffer<ArrayBufferLike>>;
    generateBrahmacariRekap(params: any): Promise<Buffer<ArrayBufferLike>>;
    generateBalimesariRekap(params: any): Promise<Buffer<ArrayBufferLike>>;
    generateWanaprastaRekap(params: any): Promise<Buffer<ArrayBufferLike>>;
    generateDepositoRekap(params: any): Promise<Buffer<ArrayBufferLike>>;
    private generateGenericProductRekap;
    generateMutasiSimpanan(params: {
        startDate: Date;
        endDate: Date;
        productType: string;
        format: 'PDF' | 'EXCEL';
    }): Promise<Buffer<ArrayBufferLike>>;
    generateDaftarRekening(params: {
        productType: string;
        format: 'PDF' | 'EXCEL';
    }): Promise<Buffer<ArrayBufferLike>>;
    generateNeraca(params: {
        date: Date;
        format: 'PDF' | 'EXCEL';
    }): Promise<Buffer<ArrayBufferLike>>;
    generateLabaRugi(params: {
        startDate: Date;
        endDate: Date;
        format: 'PDF' | 'EXCEL';
    }): Promise<Buffer<ArrayBufferLike>>;
    private formatCurrency;
    private formatDate;
}
