
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';

@Injectable()
export class LaporanService {
    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService,
        private excelService: ExcelService
    ) { }

    async generateSimpananRekap(params: {
        startDate: Date;
        endDate: Date;
        regionCode?: string;
        format: 'PDF' | 'EXCEL';
    }) {
        // 1. Query data with grouping (Aggregated by System/Region in real app, here simple list or global sum)
        // To make it meaningful, let's group by product type (Tabrela, Deposito, etc) or just list accounts
        // The prompt suggested grouping by regionCode.

        // Note: Prisma groupBy has limitations. Let's use aggregate or raw query if needed. 
        // Here we stick to the prompt's idea: group by regionCode.
        const data = await this.prisma.anggotaAccount.groupBy({
            by: ['regionCode'],
            where: {
                openDate: {
                    gte: params.startDate,
                    lte: params.endDate
                },
                ...(params.regionCode && { regionCode: params.regionCode })
            },
            _sum: {
                balance: true,
                principal: true,
                mandatoryInit: true
            },
            _count: {
                accountNumber: true
            }
        });

        // 2. Format data for report
        const formattedData = data.map(item => ({
            'Kode Wilayah': item.regionCode || 'PUSAT',
            'Jumlah Rekening': item._count.accountNumber,
            'Total Pokok': this.formatCurrency(Number(item._sum.principal)),
            'Total Wajib': this.formatCurrency(Number(item._sum.mandatoryInit)),
            'Total Saldo': this.formatCurrency(Number(item._sum.balance))
        }));

        // 3. Calculate totals
        const totals = {
            'Total Rekening': data.reduce((sum, item) => sum + item._count.accountNumber, 0),
            'Sum Pokok': data.reduce((sum, item) => sum + Number(item._sum.principal), 0),
            'Sum Wajib': data.reduce((sum, item) => sum + Number(item._sum.mandatoryInit), 0),
            'Sum Saldo': data.reduce((sum, item) => sum + Number(item._sum.balance), 0)
        };

        // 4. Generate report
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title: 'REKAP SIMPANAN ANGGOTA',
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                totals
            });
        } else {
            return this.excelService.generate({
                title: 'REKAP SIMPANAN ANGGOTA',
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Kode Wilayah', 'Jumlah Rekening', 'Total Pokok', 'Total Wajib', 'Total Saldo'],
                data: formattedData,
                totals
            });
        }
    }

    // Placeholder for Kredit Report
    // Placeholder for Akuntansi Report (Balance Sheet)
    async generateNeraca(params: {
        date: Date;
        format: 'PDF' | 'EXCEL';
    }) {
        // Logic for Balance Sheet would go here
        return this.generateSimpananRekap({ ...params, startDate: params.date, endDate: params.date }); // Dummy return
    }

    async generateTabrelaRekap(params: any) {
        return this.generateGenericProductRekap('NasabahTab', 'REKAP TABUNGAN SUKARELA (TABRELA)', params);
    }

    async generateBrahmacariRekap(params: any) {
        return this.generateGenericProductRekap('NasabahBrahmacari', 'REKAP BRAHMACARI', params);
    }

    async generateBalimesariRekap(params: any) {
        return this.generateGenericProductRekap('NasabahBalimesari', 'REKAP BALIMESARI', params);
    }

    async generateWanaprastaRekap(params: any) {
        return this.generateGenericProductRekap('NasabahWanaprasta', 'REKAP WANAPRASTA', params);
    }

    async generateDepositoRekap(params: any) {
        return this.generateGenericProductRekap('NasabahJangka', 'REKAP DEPOSITO', params, 'nominal');
    }

    private async generateGenericProductRekap(
        modelName: 'NasabahTab' | 'NasabahBrahmacari' | 'NasabahBalimesari' | 'NasabahWanaprasta' | 'NasabahJangka',
        title: string,
        params: { startDate: Date; endDate: Date; format: 'PDF' | 'EXCEL' },
        balanceField: string = 'saldo'
    ) {
        // @ts-ignore
        const delegate = this.prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)];

        const data = await delegate.groupBy({
            by: ['status'],
            where: {
                tglBuka: {
                    lte: params.endDate
                }
            },
            _sum: {
                [balanceField]: true
            },
            _count: {
                [modelName === 'NasabahTab' ? 'noTab' : (modelName === 'NasabahJangka' ? 'noJangka' : `no${modelName.replace('Nasabah', '')}`)]: true
            }
        });

        const formattedData = data.map((item: any) => ({
            'Status': item.status === 'A' ? 'AKTIF' : 'TUTUP',
            'Jumlah Rekening': Object.values(item._count)[0],
            'Total Saldo': this.formatCurrency(Number(item._sum[balanceField] || 0))
        }));

        const totals = {
            'Total Rekening': data.reduce((sum: number, item: any) => sum + Number(Object.values(item._count)[0]), 0),
            'Sum Saldo': data.reduce((sum: number, item: any) => sum + Number(item._sum[balanceField] || 0), 0)
        };

        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                totals
            });
        } else {
            return this.excelService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Status', 'Jumlah Rekening', 'Total Saldo'],
                data: formattedData,
                totals
            });
        }
    }

    private formatCurrency(value: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value);
    }

    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('id-ID').format(date);
    }
}
