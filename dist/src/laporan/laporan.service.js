"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaporanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const pdf_service_1 = require("./pdf.service");
const excel_service_1 = require("./excel.service");
let LaporanService = class LaporanService {
    prisma;
    pdfService;
    excelService;
    constructor(prisma, pdfService, excelService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.excelService = excelService;
    }
    async generateSimpananRekap(params) {
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
        const formattedData = data.map(item => ({
            'Kode Wilayah': item.regionCode || 'PUSAT',
            'Jumlah Rekening': item._count.accountNumber,
            'Total Pokok': this.formatCurrency(Number(item._sum.principal)),
            'Total Wajib': this.formatCurrency(Number(item._sum.mandatoryInit)),
            'Total Saldo': this.formatCurrency(Number(item._sum.balance))
        }));
        const totals = {
            'Total Rekening': data.reduce((sum, item) => sum + item._count.accountNumber, 0),
            'Sum Pokok': data.reduce((sum, item) => sum + Number(item._sum.principal), 0),
            'Sum Wajib': data.reduce((sum, item) => sum + Number(item._sum.mandatoryInit), 0),
            'Sum Saldo': data.reduce((sum, item) => sum + Number(item._sum.balance), 0)
        };
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title: 'REKAP SIMPANAN ANGGOTA',
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                totals
            });
        }
        else {
            return this.excelService.generate({
                title: 'REKAP SIMPANAN ANGGOTA',
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Kode Wilayah', 'Jumlah Rekening', 'Total Pokok', 'Total Wajib', 'Total Saldo'],
                data: formattedData,
                totals
            });
        }
    }
    async generateNeraca(params) {
        return this.generateSimpananRekap({ ...params, startDate: params.date, endDate: params.date });
    }
    async generateTabrelaRekap(params) {
        return this.generateGenericProductRekap('NasabahTab', 'REKAP TABUNGAN SUKARELA (TABRELA)', params);
    }
    async generateBrahmacariRekap(params) {
        return this.generateGenericProductRekap('NasabahBrahmacari', 'REKAP BRAHMACARI', params);
    }
    async generateBalimesariRekap(params) {
        return this.generateGenericProductRekap('NasabahBalimesari', 'REKAP BALIMESARI', params);
    }
    async generateWanaprastaRekap(params) {
        return this.generateGenericProductRekap('NasabahWanaprasta', 'REKAP WANAPRASTA', params);
    }
    async generateDepositoRekap(params) {
        return this.generateGenericProductRekap('NasabahJangka', 'REKAP DEPOSITO', params, 'nominal');
    }
    async generateGenericProductRekap(modelName, title, params, balanceField = 'saldo') {
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
        const formattedData = data.map((item) => ({
            'Status': item.status === 'A' ? 'AKTIF' : 'TUTUP',
            'Jumlah Rekening': Object.values(item._count)[0],
            'Total Saldo': this.formatCurrency(Number(item._sum[balanceField] || 0))
        }));
        const totals = {
            'Total Rekening': data.reduce((sum, item) => sum + Number(Object.values(item._count)[0]), 0),
            'Sum Saldo': data.reduce((sum, item) => sum + Number(item._sum[balanceField] || 0), 0)
        };
        if (params.format === 'PDF') {
            return this.pdfService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                data: formattedData,
                totals
            });
        }
        else {
            return this.excelService.generate({
                title,
                period: `${this.formatDate(params.startDate)} s/d ${this.formatDate(params.endDate)}`,
                columns: ['Status', 'Jumlah Rekening', 'Total Saldo'],
                data: formattedData,
                totals
            });
        }
    }
    formatCurrency(value) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(value);
    }
    formatDate(date) {
        return new Intl.DateTimeFormat('id-ID').format(date);
    }
};
exports.LaporanService = LaporanService;
exports.LaporanService = LaporanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        excel_service_1.ExcelService])
], LaporanService);
//# sourceMappingURL=laporan.service.js.map