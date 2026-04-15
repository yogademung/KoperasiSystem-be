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
exports.KreditReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
let KreditReportService = class KreditReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getKolektibilitas(period) {
        const [year, month] = period.split('-');
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        const credits = await this.prisma.debiturKredit.findMany({
            where: {
                status: { not: 'CLOSED' },
            },
            include: {
                jadwal: {
                    where: {
                        status: 'UNPAID',
                        tglJatuhTempo: { lte: endDate },
                    },
                    orderBy: { angsuranKe: 'asc' },
                },
                nasabah: true,
                realisasi: true,
            },
        });
        const result = {
            totalKredit: credits.length,
            totalOutstanding: 0,
            lancar: { count: 0, outstanding: 0 },
            kurangLancar: { count: 0, outstanding: 0 },
            diragukan: { count: 0, outstanding: 0 },
            macet: { count: 0, outstanding: 0 },
        };
        for (const credit of credits) {
            const sisaPokok = credit.jadwal.reduce((sum, j) => sum + parseFloat(j.sisaPokok.toString()), 0);
            result.totalOutstanding += sisaPokok;
            const overdueInstallment = credit.jadwal[0];
            if (!overdueInstallment) {
                result.lancar.count++;
                result.lancar.outstanding += sisaPokok;
                continue;
            }
            const daysOverdue = Math.floor((endDate.getTime() -
                new Date(overdueInstallment.tglJatuhTempo).getTime()) /
                (1000 * 60 * 60 * 24));
            if (daysOverdue <= 0) {
                result.lancar.count++;
                result.lancar.outstanding += sisaPokok;
            }
            else if (daysOverdue <= 90) {
                result.kurangLancar.count++;
                result.kurangLancar.outstanding += sisaPokok;
            }
            else if (daysOverdue <= 180) {
                result.diragukan.count++;
                result.diragukan.outstanding += sisaPokok;
            }
            else {
                result.macet.count++;
                result.macet.outstanding += sisaPokok;
            }
        }
        return result;
    }
    async generateKolektibilitasPDF(period) {
        const data = await this.getKolektibilitas(period);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc
                .fontSize(16)
                .text('LAPORAN KOLEKTIBILITAS KREDIT', { align: 'center' });
            doc.fontSize(12).text(`Periode: ${period}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(12).text(`Total Kredit: ${data.totalKredit}`);
            doc.text(`Total Outstanding: Rp ${data.totalOutstanding.toLocaleString('id-ID')}`);
            doc.moveDown();
            doc.fontSize(14).text('Detail Kolektibilitas:', { underline: true });
            doc.moveDown();
            doc.fontSize(11);
            doc.text(`Lancar (Kol 1): ${data.lancar.count} kredit - Rp ${data.lancar.outstanding.toLocaleString('id-ID')}`);
            doc.text(`Kurang Lancar (Kol 2): ${data.kurangLancar.count} kredit - Rp ${data.kurangLancar.outstanding.toLocaleString('id-ID')}`);
            doc.text(`Diragukan (Kol 3): ${data.diragukan.count} kredit - Rp ${data.diragukan.outstanding.toLocaleString('id-ID')}`);
            doc.text(`Macet (Kol 4-5): ${data.macet.count} kredit - Rp ${data.macet.outstanding.toLocaleString('id-ID')}`);
            doc.end();
        });
    }
    async getDaftarKredit(status) {
        const where = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }
        const credits = await this.prisma.debiturKredit.findMany({
            where,
            include: {
                nasabah: true,
                realisasi: {
                    orderBy: { tglRealisasi: 'desc' },
                    take: 1,
                },
                jadwal: {
                    where: { status: 'UNPAID' },
                },
            },
            orderBy: { nomorKredit: 'asc' },
        });
        return credits.map((credit) => {
            const sisaPokok = credit.jadwal.reduce((sum, j) => sum + parseFloat(j.sisaPokok.toString()), 0);
            const sisaBunga = credit.jadwal.reduce((sum, j) => sum + parseFloat(j.sisaBunga?.toString() || '0'), 0);
            return {
                nomorKredit: credit.nomorKredit,
                namaDebitur: credit.nasabah.nama,
                jenisKredit: credit.jenisKredit,
                tglRealisasi: credit.realisasi[0]?.tglRealisasi || null,
                nominal: parseFloat(credit.nominalPengajuan.toString()),
                sisaPokok,
                sisaBunga,
                status: credit.status,
            };
        });
    }
    async generateDaftarKreditExcel(status) {
        const data = await this.getDaftarKredit(status);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Daftar Kredit');
        worksheet.columns = [
            { header: 'No. Kredit', key: 'nomorKredit', width: 15 },
            { header: 'Nama Debitur', key: 'namaDebitur', width: 30 },
            { header: 'Jenis Kredit', key: 'jenisKredit', width: 20 },
            { header: 'Tgl. Realisasi', key: 'tglRealisasi', width: 15 },
            { header: 'Plafon', key: 'nominal', width: 15 },
            { header: 'Sisa Pokok', key: 'sisaPokok', width: 15 },
            { header: 'Sisa Bunga', key: 'sisaBunga', width: 15 },
            { header: 'Status', key: 'status', width: 12 },
        ];
        data.forEach((row) => {
            worksheet.addRow({
                ...row,
                tglRealisasi: row.tglRealisasi
                    ? new Date(row.tglRealisasi).toLocaleDateString('id-ID')
                    : '-',
            });
        });
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        return await workbook.xlsx.writeBuffer();
    }
    async getTunggakan(asOf) {
        const asOfDate = new Date(asOf);
        const overdueInstallments = await this.prisma.debiturJadwal.findMany({
            where: {
                status: 'UNPAID',
                tglJatuhTempo: { lt: asOfDate },
            },
            include: {
                debiturKredit: {
                    include: {
                        nasabah: true,
                    },
                },
            },
            orderBy: [{ tglJatuhTempo: 'asc' }],
        });
        return overdueInstallments.map((jadwal) => {
            const daysOverdue = Math.floor((asOfDate.getTime() - new Date(jadwal.tglJatuhTempo).getTime()) /
                (1000 * 60 * 60 * 24));
            const penaltyRate = Math.min(daysOverdue * 0.005, 0.1);
            const pokokTunggakan = parseFloat(jadwal.pokok.toString());
            const bungaTunggakan = parseFloat(jadwal.bunga.toString());
            const denda = (pokokTunggakan + bungaTunggakan) * penaltyRate;
            return {
                nomorKredit: jadwal.debiturKredit.nomorKredit,
                namaDebitur: jadwal.debiturKredit.nasabah.nama,
                angsuranKe: jadwal.angsuranKe,
                tglJatuhTempo: jadwal.tglJatuhTempo,
                hariTerlambat: daysOverdue,
                pokokTunggakan,
                bungaTunggakan,
                denda,
                totalTunggakan: pokokTunggakan + bungaTunggakan + denda,
            };
        });
    }
    async generateTunggakanPDF(asOf) {
        const data = await this.getTunggakan(asOf);
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(16).text('LAPORAN TUNGGAKAN & DENDA', { align: 'center' });
            doc.fontSize(12).text(`Per Tanggal: ${asOf}`, { align: 'center' });
            doc.moveDown(2);
            const totalPokok = data.reduce((sum, item) => sum + item.pokokTunggakan, 0);
            const totalBunga = data.reduce((sum, item) => sum + item.bungaTunggakan, 0);
            const totalDenda = data.reduce((sum, item) => sum + item.denda, 0);
            const grandTotal = data.reduce((sum, item) => sum + item.totalTunggakan, 0);
            doc.fontSize(11);
            doc.text(`Total Kredit Menunggak: ${data.length}`);
            doc.text(`Total Pokok: Rp ${totalPokok.toLocaleString('id-ID')}`);
            doc.text(`Total Bunga: Rp ${totalBunga.toLocaleString('id-ID')}`);
            doc.text(`Total Denda: Rp ${totalDenda.toLocaleString('id-ID')}`);
            doc.text(`Grand Total: Rp ${grandTotal.toLocaleString('id-ID')}`);
            doc.moveDown(2);
            doc.fontSize(10);
            data.forEach((item, index) => {
                doc.text(`${index + 1}. ${item.nomorKredit} - ${item.namaDebitur}`);
                doc.text(`   Angsuran ke-${item.angsuranKe}, Jatuh Tempo: ${new Date(item.tglJatuhTempo).toLocaleDateString('id-ID')}`);
                doc.text(`   Terlambat: ${item.hariTerlambat} hari, Total: Rp ${item.totalTunggakan.toLocaleString('id-ID')}`);
                doc.moveDown(0.5);
            });
            doc.end();
        });
    }
};
exports.KreditReportService = KreditReportService;
exports.KreditReportService = KreditReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KreditReportService);
//# sourceMappingURL=kredit-report.service.js.map