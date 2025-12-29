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
exports.MigrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ExcelJS = __importStar(require("exceljs"));
let MigrationService = class MigrationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateJournalTemplate() {
        const accounts = await this.prisma.journalAccount.findMany({
            where: { isActive: true },
            orderBy: { accountCode: 'asc' },
        });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template Jurnal');
        worksheet.columns = [
            { header: 'Account Code', key: 'accountCode', width: 15 },
            { header: 'Account Name', key: 'accountName', width: 30 },
            { header: 'Debit', key: 'debit', width: 15 },
            { header: 'Credit', key: 'credit', width: 15 },
            { header: 'Description', key: 'description', width: 40 },
        ];
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        accounts.forEach((account) => {
            worksheet.addRow({
                accountCode: account.accountCode,
                accountName: account.accountName,
                debit: 0,
                credit: 0,
                description: 'Saldo Awal - Migrasi',
            });
        });
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
    async uploadJournal(fileBuffer, journalDate, userId) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new common_1.BadRequestException('Invalid Excel file');
        }
        const journalEntries = [];
        let totalDebit = 0;
        let totalCredit = 0;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            const accountCode = row.getCell(1).text;
            const debit = parseFloat(row.getCell(3).text) || 0;
            const credit = parseFloat(row.getCell(4).text) || 0;
            const description = row.getCell(5).text;
            if ((debit > 0 || credit > 0) && accountCode) {
                journalEntries.push({
                    accountCode,
                    debit,
                    credit,
                    description
                });
                totalDebit += debit;
                totalCredit += credit;
            }
        });
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Journal is not balanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`);
        }
        if (journalEntries.length === 0) {
            throw new common_1.BadRequestException('No valid journal entries found');
        }
        for (const entry of journalEntries) {
            const account = await this.prisma.journalAccount.findUnique({
                where: { accountCode: entry.accountCode }
            });
            if (!account) {
                throw new common_1.BadRequestException(`Account code ${entry.accountCode} not found`);
            }
        }
        const date = new Date(journalDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const journalNumber = `MIG/${year}/${month}/${Date.now().toString().slice(-4)}`;
        return await this.prisma.$transaction(async (tx) => {
            const journal = await tx.postedJournal.create({
                data: {
                    journalNumber,
                    journalDate: date,
                    description: 'Initial Balance - Migration',
                    postingType: 'MANUAL',
                    status: 'POSTED',
                    userId: userId,
                    details: {
                        create: journalEntries.map(entry => ({
                            accountCode: entry.accountCode,
                            debit: entry.debit,
                            credit: entry.credit,
                            description: entry.description
                        }))
                    }
                }
            });
            return {
                success: true,
                journalId: journal.id,
                journalNumber: journal.journalNumber,
                totalDebit,
                totalCredit,
                itemsCount: journalEntries.length
            };
        });
    }
    async generateNasabahTemplate() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template Nasabah');
        worksheet.columns = [
            { header: 'Nama', key: 'nama', width: 30 },
            { header: 'No KTP', key: 'noKtp', width: 20 },
            { header: 'Alamat', key: 'alamat', width: 40 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Telepon', key: 'telepon', width: 15 },
            { header: 'Tempat Lahir', key: 'tempatLahir', width: 20 },
            { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 15 },
            { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
            { header: 'Pekerjaan', key: 'pekerjaan', width: 20 },
        ];
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        worksheet.getColumn('H').eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.dataValidation = { type: 'list', allowBlank: true, formulae: ['"L,P"'] };
            }
        });
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
    async uploadNasabah(fileBuffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet)
            throw new common_1.BadRequestException('Invalid Excel file');
        const nasabahList = [];
        const errors = [];
        let rowCount = 0;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            const ktp = row.getCell(2).text;
            rowCount++;
            try {
                const nama = row.getCell(1).text;
                const noKtp = row.getCell(2).text;
                let tanggalLahirVal = row.getCell(7).value;
                if (!nama || !noKtp)
                    throw new Error('Nama dan No KTP wajib diisi');
                let tanggalLahir = null;
                if (tanggalLahirVal instanceof Date) {
                    tanggalLahir = tanggalLahirVal;
                }
                else if (typeof tanggalLahirVal === 'string') {
                    const parsed = new Date(tanggalLahirVal);
                    if (!isNaN(parsed.getTime()))
                        tanggalLahir = parsed;
                }
                else if (typeof tanggalLahirVal === 'object' && tanggalLahirVal && 'result' in tanggalLahirVal) {
                    const parsed = new Date(tanggalLahirVal.result);
                    if (!isNaN(parsed.getTime()))
                        tanggalLahir = parsed;
                }
                nasabahList.push({
                    nama,
                    noKtp,
                    alamat: row.getCell(3).text,
                    email: row.getCell(4).text,
                    telepon: row.getCell(5).text,
                    tempatLahir: row.getCell(6).text,
                    tanggalLahir,
                    jenisKelamin: row.getCell(8).text,
                    pekerjaan: row.getCell(9).text,
                });
            }
            catch (e) {
                errors.push({ row: rowNumber, message: e.message });
            }
        });
        if (nasabahList.length === 0)
            throw new common_1.BadRequestException('No valid nasabah data found');
        const ktpList = nasabahList.map(n => n.noKtp);
        const existing = await this.prisma.nasabah.findMany({
            where: { noKtp: { in: ktpList } },
            select: { noKtp: true }
        });
        const existingKtps = new Set(existing.map(e => e.noKtp));
        const validNasabah = nasabahList.filter(n => !existingKtps.has(n.noKtp));
        if (validNasabah.length > 0) {
            await this.prisma.nasabah.createMany({
                data: validNasabah.map(n => ({
                    nama: n.nama,
                    noKtp: n.noKtp,
                    alamat: n.alamat,
                    email: n.email,
                    telepon: n.telepon,
                    tempatLahir: n.tempatLahir,
                    tanggalLahir: n.tanggalLahir,
                    jenisKelamin: n.jenisKelamin === 'L' || n.jenisKelamin === 'P' ? n.jenisKelamin : null,
                    pekerjaan: n.pekerjaan
                }))
            });
        }
        return {
            success: true,
            totalProcessed: rowCount,
            created: validNasabah.length,
            skipped: existing.length,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    async generateAnggotaTransactionTemplate() {
        const workbook = new ExcelJS.Workbook();
        const sheet1 = workbook.addWorksheet('Referensi Nasabah');
        sheet1.columns = [
            { header: 'Nasabah ID', key: 'id', width: 10 },
            { header: 'Nama', key: 'nama', width: 30 },
            { header: 'No KTP', key: 'ktp', width: 20 },
        ];
        const customers = await this.prisma.nasabah.findMany({
            select: { id: true, nama: true, noKtp: true },
            orderBy: { nama: 'asc' }
        });
        customers.forEach(c => {
            sheet1.addRow({ id: c.id, nama: c.nama, ktp: c.noKtp });
        });
        const sheet2 = workbook.addWorksheet('Transaksi Anggota');
        sheet2.columns = [
            { header: 'Nasabah ID', key: 'nasabahId', width: 10 },
            { header: 'No Anggota', key: 'noAnggota', width: 15 },
            { header: 'Tgl Daftar', key: 'tglDaftar', width: 15 },
            { header: 'Pokok', key: 'pokok', width: 15 },
            { header: 'Wajib Awal', key: 'wajib', width: 15 },
            { header: 'Saldo Simpanan', key: 'saldo', width: 15 },
        ];
        sheet2.getRow(1).font = { bold: true };
        sheet2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
    async uploadAnggotaTransaction(fileBuffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet('Transaksi Anggota') || workbook.getWorksheet(2);
        if (!worksheet)
            throw new common_1.BadRequestException('Sheet "Transaksi Anggota" not found');
        const txns = [];
        const errors = [];
        let rowCount = 0;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return;
            rowCount++;
            try {
                const nasabahId = parseInt(row.getCell(1).text);
                const noAnggota = row.getCell(2).text;
                let tglDaftarVal = row.getCell(3).value;
                const pokok = parseFloat(row.getCell(4).text) || 0;
                const wajib = parseFloat(row.getCell(5).text) || 0;
                const saldo = parseFloat(row.getCell(6).text) || 0;
                if (!nasabahId || isNaN(nasabahId))
                    throw new Error('Nasabah ID invalid');
                if (!noAnggota)
                    throw new Error('No Anggota required');
                let tglDaftar = new Date();
                if (tglDaftarVal instanceof Date) {
                    tglDaftar = tglDaftarVal;
                }
                else if (typeof tglDaftarVal === 'string') {
                    const parsed = new Date(tglDaftarVal);
                    if (!isNaN(parsed.getTime()))
                        tglDaftar = parsed;
                }
                txns.push({ nasabahId, noAnggota, tglDaftar, pokok, wajibAwal: wajib, saldo });
            }
            catch (e) {
                errors.push({ row: rowNumber, message: e.message });
            }
        });
        let successCount = 0;
        const nasabahIds = [...new Set(txns.map(t => t.nasabahId))];
        const validCustomers = await this.prisma.nasabah.findMany({
            where: { id: { in: nasabahIds } },
            select: { id: true }
        });
        const validCustSet = new Set(validCustomers.map(c => c.id));
        for (const txn of txns) {
            if (!validCustSet.has(txn.nasabahId))
                continue;
            const existing = await this.prisma.anggotaAccount.findUnique({
                where: { accountNumber: txn.noAnggota }
            });
            if (existing)
                continue;
            try {
                await this.prisma.anggotaAccount.create({
                    data: {
                        customerId: txn.nasabahId,
                        accountNumber: txn.noAnggota,
                        openDate: txn.tglDaftar,
                        principal: txn.pokok,
                        mandatoryInit: txn.wajibAwal,
                        status: 'A',
                        regionCode: 'PUSAT',
                        groupCode: 'UMUM',
                        createdBy: 'MIGRATION',
                    }
                });
                successCount++;
            }
            catch (e) {
            }
        }
        return {
            success: true,
            totalRows: rowCount,
            successCount,
            errors: errors.length > 0 ? errors : undefined
        };
    }
};
exports.MigrationService = MigrationService;
exports.MigrationService = MigrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MigrationService);
//# sourceMappingURL=migration.service.js.map