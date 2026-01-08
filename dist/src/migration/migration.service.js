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
        worksheet.addRow({
            accountCode: '1-100',
            accountName: 'Contoh: Kas',
            debit: 1000000,
            credit: 0,
            description: 'Contoh deskripsi jurnal',
        });
        worksheet.getRow(2).font = { italic: true, color: { argb: 'FF666666' } };
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
            if (rowNumber <= 2)
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
                message: 'Journal imported successfully',
                journalId: journal.id
            };
        });
    }
    async previewJournal(fileBuffer, journalDate, redenominate = false) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new common_1.BadRequestException('Invalid Excel file');
        }
        const previewData = [];
        let totalDebit = 0;
        let totalCredit = 0;
        const allAccounts = await this.prisma.journalAccount.findMany({ select: { accountCode: true } });
        const validAccountCodes = new Set(allAccounts.map(a => a.accountCode));
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2)
                return;
            const accountCode = row.getCell(1).text;
            const description = row.getCell(5).text;
            let debit = parseFloat(row.getCell(3).text) || 0;
            let credit = parseFloat(row.getCell(4).text) || 0;
            if (redenominate) {
                debit = debit / 1000;
                credit = credit / 1000;
            }
            if (!accountCode && !debit && !credit)
                return;
            const rowData = {
                rowNumber,
                accountCode,
                description,
                debit,
                credit,
                status: 'valid',
                errors: []
            };
            if (!accountCode) {
                rowData.errors.push('Account Code required');
            }
            else if (!validAccountCodes.has(accountCode)) {
                rowData.errors.push('Account Code not found');
            }
            if (rowData.errors.length > 0) {
                rowData.status = 'error';
            }
            else {
                totalDebit += debit;
                totalCredit += credit;
            }
            previewData.push(rowData);
        });
        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
        return {
            data: previewData,
            summary: {
                totalRows: previewData.length,
                totalDebit,
                totalCredit,
                isBalanced,
                balanceDiff: totalDebit - totalCredit,
                valid: previewData.filter(d => d.status === 'valid').length,
                errors: previewData.filter(d => d.status === 'error').length
            }
        };
    }
    async confirmJournal(validatedData, journalDate, userId) {
        const entries = validatedData.map(d => ({
            accountCode: d.accountCode,
            debit: d.debit,
            credit: d.credit,
            description: d.description
        }));
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new common_1.BadRequestException(`Journal is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`);
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
                        create: entries.map(entry => ({
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
                message: 'Journal imported successfully',
                journalId: journal.id
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
        worksheet.addRow({
            nama: 'I Made Contoh',
            noKtp: '1234567890123456',
            alamat: 'Jl. Contoh No. 123',
            email: 'contoh@email.com',
            telepon: '081234567890',
            tempatLahir: 'Denpasar',
            tanggalLahir: new Date('1990-01-15'),
            jenisKelamin: 'L',
            pekerjaan: 'Wiraswasta',
        });
        worksheet.getRow(2).font = { italic: true, color: { argb: 'FF666666' } };
        worksheet.getColumn('H').eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.dataValidation = { type: 'list', allowBlank: true, formulae: ['"L,P"'] };
            }
        });
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
    async previewNasabah(fileBuffer) {
        try {
            console.log('📋 Starting nasabah preview...');
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(fileBuffer);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                throw new common_1.BadRequestException('Invalid Excel file');
            }
            const previewData = [];
            const errors = [];
            let rowNumber = 0;
            worksheet.eachRow((row, idx) => {
                if (idx === 1)
                    return;
                if (idx === 2)
                    return;
                const nama = row.getCell(1).text;
                const noKtp = row.getCell(2).text;
                if (!nama && !noKtp)
                    return;
                rowNumber++;
                try {
                    let tanggalLahirVal = row.getCell(7).value;
                    let tanggalLahir = null;
                    if (tanggalLahirVal instanceof Date) {
                        tanggalLahir = tanggalLahirVal;
                    }
                    else if (typeof tanggalLahirVal === 'string') {
                        const parsed = new Date(tanggalLahirVal);
                        if (!isNaN(parsed.getTime()))
                            tanggalLahir = parsed;
                    }
                    const nasabahData = {
                        rowNumber,
                        excelRow: idx,
                        nama,
                        noKtp,
                        alamat: row.getCell(3).text,
                        email: row.getCell(4).text,
                        telepon: row.getCell(5).text,
                        tempatLahir: row.getCell(6).text,
                        tanggalLahir,
                        jenisKelamin: row.getCell(8).text,
                        pekerjaan: row.getCell(9).text,
                        status: 'valid',
                        errors: []
                    };
                    if (!nama)
                        nasabahData.errors.push('Nama wajib diisi');
                    if (!noKtp)
                        nasabahData.errors.push('No KTP wajib diisi');
                    if (noKtp && noKtp.length !== 16)
                        nasabahData.errors.push('No KTP harus 16 digit');
                    if (nasabahData.errors.length > 0) {
                        nasabahData.status = 'error';
                    }
                    previewData.push(nasabahData);
                }
                catch (e) {
                    errors.push({ row: idx, message: e.message });
                }
            });
            const ktpList = previewData.map(n => n.noKtp).filter(Boolean);
            const existingNasabah = await this.prisma.nasabah.findMany({
                where: { noKtp: { in: ktpList } },
                select: { noKtp: true, nama: true }
            });
            const existingKtpSet = new Set(existingNasabah.map(n => n.noKtp));
            previewData.forEach(item => {
                if (existingKtpSet.has(item.noKtp)) {
                    item.status = 'duplicate';
                    item.errors.push(`KTP sudah terdaftar`);
                }
            });
            const ktpCount = new Map();
            previewData.forEach(item => {
                if (item.noKtp) {
                    ktpCount.set(item.noKtp, (ktpCount.get(item.noKtp) || 0) + 1);
                }
            });
            previewData.forEach(item => {
                if (item.noKtp && ktpCount.get(item.noKtp) > 1) {
                    if (item.status !== 'duplicate') {
                        item.status = 'duplicate';
                    }
                    if (!item.errors.includes('Duplicate dalam file')) {
                        item.errors.push('Duplicate dalam file');
                    }
                }
            });
            const summary = {
                total: previewData.length,
                valid: previewData.filter(d => d.status === 'valid').length,
                duplicates: previewData.filter(d => d.status === 'duplicate').length,
                errors: previewData.filter(d => d.status === 'error').length,
            };
            console.log(`✅ Preview complete: ${summary.total} rows, ${summary.valid} valid, ${summary.duplicates} duplicates, ${summary.errors} errors`);
            return {
                success: true,
                data: previewData,
                summary,
                existingInDb: existingNasabah
            };
        }
        catch (error) {
            console.error('❌ FATAL ERROR in previewNasabah:', error);
            throw error;
        }
    }
    async confirmNasabah(validatedData) {
        try {
            console.log(`💾 Confirming upload of ${validatedData.length} nasabah records...`);
            const nasabahToCreate = validatedData.map(n => ({
                nama: n.nama,
                noKtp: n.noKtp,
                alamat: n.alamat,
                email: n.email,
                telepon: n.telepon,
                tempatLahir: n.tempatLahir,
                tanggalLahir: n.tanggalLahir ? new Date(n.tanggalLahir) : null,
                jenisKelamin: n.jenisKelamin === 'L' || n.jenisKelamin === 'P' ? n.jenisKelamin : null,
                pekerjaan: n.pekerjaan
            }));
            await this.prisma.nasabah.createMany({
                data: nasabahToCreate
            });
            console.log(`✅ Successfully created ${nasabahToCreate.length} nasabah records`);
            return {
                success: true,
                created: nasabahToCreate.length,
                message: `${nasabahToCreate.length} nasabah berhasil diimpor`
            };
        }
        catch (error) {
            console.error('❌ FATAL ERROR in confirmNasabah:', error);
            throw error;
        }
    }
    async uploadNasabah(fileBuffer) {
        try {
            console.log('📤 Starting nasabah upload...');
            console.log('File buffer type:', typeof fileBuffer);
            console.log('File buffer length:', fileBuffer?.length);
            console.log('File buffer constructor:', fileBuffer?.constructor?.name);
            if (!fileBuffer) {
                throw new common_1.BadRequestException('File buffer is null or undefined');
            }
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(fileBuffer);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) {
                console.error('❌ Invalid Excel file: No worksheet found');
                throw new common_1.BadRequestException('Invalid Excel file');
            }
            const nasabahList = [];
            const errors = [];
            let rowCount = 0;
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber <= 2)
                    return;
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
                    console.error(`❌ Error parsing row ${rowNumber}:`, e.message);
                    errors.push({ row: rowNumber, message: e.message });
                }
            });
            console.log(`📊 Parsed ${nasabahList.length} nasabah from ${rowCount} rows`);
            if (nasabahList.length === 0) {
                console.error('❌ No valid nasabah data found');
                throw new common_1.BadRequestException('No valid nasabah data found');
            }
            const ktpList = nasabahList.map(n => n.noKtp);
            console.log('🔍 Checking for existing KTP numbers...');
            const existing = await this.prisma.nasabah.findMany({
                where: { noKtp: { in: ktpList } },
                select: { noKtp: true }
            });
            const existingKtps = new Set(existing.map(e => e.noKtp));
            const validNasabah = nasabahList.filter(n => !existingKtps.has(n.noKtp));
            console.log(`✅ Found ${existing.length} existing, ${validNasabah.length} new nasabah`);
            if (validNasabah.length > 0) {
                console.log('💾 Creating new nasabah records...');
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
                console.log(`✅ Successfully created ${validNasabah.length} nasabah records`);
            }
            const result = {
                success: true,
                totalProcessed: rowCount,
                created: validNasabah.length,
                skipped: existing.length,
                errors: errors.length > 0 ? errors : undefined
            };
            console.log('✅ Upload nasabah completed:', result);
            return result;
        }
        catch (error) {
            console.error('❌ FATAL ERROR in uploadNasabah:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
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
        sheet2.addRow({
            nasabahId: 1,
            noAnggota: 'A001',
            tglDaftar: new Date('2024-01-15'),
            pokok: 500000,
            wajib: 100000,
            saldo: 600000,
        });
        sheet2.getRow(2).font = { italic: true, color: { argb: 'FF666666' } };
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
            if (rowNumber <= 2)
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
                        balance: txn.saldo,
                        status: 'ACTIVE',
                        regionCode: 'PUSAT',
                        groupCode: 'UMUM',
                        createdBy: 'MIGRATION',
                    }
                });
                successCount++;
            }
            catch (e) {
                console.error(`Error creating anggota account for ${txn.noAnggota}:`, e);
            }
        }
        return {
            success: true,
            total: txns.length,
            imported: successCount,
            errors
        };
    }
    async previewAnggota(fileBuffer, redenominate = false) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet('Transaksi Anggota') || workbook.getWorksheet(2);
        if (!worksheet) {
            throw new common_1.BadRequestException('Sheet "Transaksi Anggota" not found');
        }
        const previewData = [];
        const nasabahIds = new Set();
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2)
                return;
            const nasabahId = parseInt(row.getCell(1).text);
            const noAnggota = row.getCell(2).text;
            let tglDaftarVal = row.getCell(3).value;
            let pokok = parseFloat(row.getCell(4).text) || 0;
            let wajib = parseFloat(row.getCell(5).text) || 0;
            let saldo = parseFloat(row.getCell(6).text) || 0;
            if (redenominate) {
                pokok = pokok / 1000;
                wajib = wajib / 1000;
                saldo = saldo / 1000;
            }
            if (!nasabahId && !noAnggota)
                return;
            if (nasabahId)
                nasabahIds.add(nasabahId);
            let tglDaftar = new Date();
            if (tglDaftarVal instanceof Date) {
                tglDaftar = tglDaftarVal;
            }
            else if (typeof tglDaftarVal === 'string') {
                const parsed = new Date(tglDaftarVal);
                if (!isNaN(parsed.getTime()))
                    tglDaftar = parsed;
            }
            previewData.push({
                rowNumber,
                nasabahId,
                noAnggota,
                tglDaftar,
                pokok,
                wajib,
                saldo,
                status: 'valid',
                errors: []
            });
        });
        const existingNasabah = await this.prisma.nasabah.findMany({
            where: { id: { in: Array.from(nasabahIds) } },
            select: { id: true, nama: true, noKtp: true }
        });
        const nasabahMap = new Map(existingNasabah.map(n => [n.id, n]));
        const existingAnggota = await this.prisma.anggotaAccount.findMany({
            where: { accountNumber: { in: previewData.map(d => d.noAnggota).filter(Boolean) } },
            select: { accountNumber: true }
        });
        const existingAnggotaSet = new Set(existingAnggota.map(a => a.accountNumber));
        const nasabahAggregates = new Map();
        previewData.forEach(row => {
            if (!row.nasabahId) {
                row.status = 'error';
                row.errors.push('Nasabah ID required');
            }
            else if (!nasabahMap.has(row.nasabahId)) {
                row.status = 'error';
                row.errors.push('Nasabah ID not found');
            }
            else {
                row.namaNasabah = nasabahMap.get(row.nasabahId)?.nama;
                row.noKtp = nasabahMap.get(row.nasabahId)?.noKtp;
                const current = nasabahAggregates.get(row.nasabahId) || {
                    nama: row.namaNasabah,
                    noKtp: row.noKtp,
                    totalPokok: 0,
                    totalWajib: 0,
                    totalSaldo: 0,
                    count: 0
                };
                current.totalPokok += row.pokok;
                current.totalWajib += row.wajib;
                current.totalSaldo += row.saldo;
                current.count++;
                nasabahAggregates.set(row.nasabahId, current);
            }
            if (!row.noAnggota) {
                row.status = 'error';
                row.errors.push('No Anggota required');
            }
            else if (existingAnggotaSet.has(row.noAnggota)) {
                row.status = 'duplicate';
                row.errors.push('No Anggota already exists');
            }
        });
        const aggregates = Array.from(nasabahAggregates.entries()).map(([id, stats]) => ({
            nasabahId: id,
            ...stats
        }));
        return {
            data: previewData,
            aggregates,
            summary: {
                totalRows: previewData.length,
                valid: previewData.filter(d => d.status === 'valid').length,
                errors: previewData.filter(d => d.status === 'error').length,
                totalSaldoAll: previewData.reduce((sum, d) => sum + d.saldo, 0)
            }
        };
    }
    async confirmAnggota(validatedData) {
        let successCount = 0;
        const errors = [];
        for (const txn of validatedData) {
            try {
                const existing = await this.prisma.anggotaAccount.findUnique({
                    where: { accountNumber: txn.noAnggota }
                });
                if (existing)
                    continue;
                await this.prisma.anggotaAccount.create({
                    data: {
                        customerId: txn.nasabahId,
                        accountNumber: txn.noAnggota,
                        openDate: new Date(txn.tglDaftar),
                        principal: txn.pokok,
                        mandatoryInit: txn.wajib,
                        balance: txn.saldo,
                        status: 'ACTIVE',
                        regionCode: 'PUSAT',
                        groupCode: 'UMUM',
                        createdBy: 'MIGRATION',
                    }
                });
                successCount++;
            }
            catch (e) {
                errors.push({ noAnggota: txn.noAnggota, message: e.message });
            }
        }
        return {
            success: true,
            imported: successCount,
            errors
        };
    }
    async generateCoaTemplate() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template COA');
        worksheet.columns = [
            { header: 'Account Code', key: 'accountCode', width: 15 },
            { header: 'Account Name', key: 'accountName', width: 30 },
            { header: 'Account Type', key: 'accountType', width: 20 },
            { header: 'Parent Code', key: 'parentCode', width: 15 },
            { header: 'D/C (Debet/Credit)', key: 'dbOrCr', width: 8 },
            { header: 'Remark', key: 'remark', width: 30 },
        ];
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        worksheet.addRow({
            accountCode: '1-000',
            accountName: 'AKTIVA',
            accountType: 'ASSET',
            parentCode: '',
            dbOrCr: 'D',
            remark: 'Header Aktiva',
        });
        worksheet.getRow(2).font = { italic: true, color: { argb: 'FF666666' } };
        return Buffer.from(await workbook.xlsx.writeBuffer());
    }
    async previewCoa(fileBuffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new common_1.BadRequestException('Invalid Excel file');
        }
        const previewData = [];
        const accountCodes = new Set();
        const existingAccounts = await this.prisma.journalAccount.findMany({ select: { accountCode: true } });
        const existingAccountSet = new Set(existingAccounts.map(a => a.accountCode));
        const coaFormatSetting = await this.prisma.lovValue.findFirst({
            where: { code: 'COMPANY_PROFILE', codeValue: 'COA_FORMAT' }
        });
        const coaFormat = coaFormatSetting?.description || 'xxx-xxx-xxx';
        let regexPattern = '';
        if (coaFormat) {
            regexPattern = '^' + coaFormat.replace(/[.-]/g, '\\$&').replace(/x/gi, '\\d') + '$';
        }
        const coaRegex = new RegExp(regexPattern);
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber <= 2)
                return;
            const accountCode = row.getCell(1).text?.toString().trim();
            const accountName = row.getCell(2).text?.toString().trim();
            const accountType = row.getCell(3).text?.toString().trim();
            const parentCode = row.getCell(4).text?.toString().trim();
            const dbOrCr = row.getCell(5).text?.toString().trim().toUpperCase();
            const remark = row.getCell(6).text?.toString().trim();
            if (!accountCode && !accountName)
                return;
            const rowData = {
                rowNumber,
                accountCode,
                accountName,
                accountType,
                parentCode,
                dbOrCr,
                remark,
                status: 'valid',
                errors: []
            };
            if (!accountCode) {
                rowData.errors.push('Account Code required');
            }
            else {
                if (accountCode.length !== coaFormat.length) {
                    rowData.status = 'error';
                    rowData.errors.push(`Panjang kode keliru (Exp: ${coaFormat.length} char, Act: ${accountCode.length})`);
                }
                else if (!coaRegex.test(accountCode)) {
                    rowData.status = 'error';
                    rowData.errors.push(`Format must match ${coaFormat}`);
                }
            }
            if (!accountName)
                rowData.errors.push('Account Name required');
            if (existingAccountSet.has(accountCode)) {
                rowData.status = 'duplicate';
                rowData.errors.push('Account Code already exists in DB');
            }
            if (accountCodes.has(accountCode)) {
                rowData.status = 'duplicate';
                rowData.errors.push('Duplicate in file');
            }
            if (dbOrCr && !['D', 'C'].includes(dbOrCr)) {
                rowData.errors.push('D/C must be D or C');
            }
            accountCodes.add(accountCode);
            if (rowData.errors.length > 0 && rowData.status !== 'duplicate') {
                rowData.status = 'error';
            }
            previewData.push(rowData);
        });
        return {
            data: previewData,
            summary: {
                totalRows: previewData.length,
                valid: previewData.filter(d => d.status === 'valid').length,
                duplicates: previewData.filter(d => d.status === 'duplicate').length,
                errors: previewData.filter(d => d.status === 'error').length
            }
        };
    }
    async confirmCoa(validatedData) {
        let successCount = 0;
        const errors = [];
        for (const row of validatedData) {
            try {
                const existing = await this.prisma.journalAccount.findUnique({
                    where: { accountCode: row.accountCode }
                });
                if (existing)
                    continue;
                await this.prisma.journalAccount.create({
                    data: {
                        accountCode: row.accountCode,
                        accountName: row.accountName,
                        accountType: row.accountType || 'OTHER',
                        parentCode: row.parentCode || null,
                        debetPoleFlag: row.dbOrCr === 'D',
                        remark: row.remark,
                        isActive: true,
                        createdBy: 'MIGRATION'
                    }
                });
                successCount++;
            }
            catch (e) {
                errors.push({ accountCode: row.accountCode, message: e.message });
            }
        }
        return {
            success: true,
            imported: successCount,
            errors
        };
    }
};
exports.MigrationService = MigrationService;
exports.MigrationService = MigrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MigrationService);
//# sourceMappingURL=migration.service.js.map