import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';

interface JournalEntryRow {
    accountCode: string;
    debit: number;
    credit: number;
    description: string;
}

interface NasabahRow {
    nama: string;
    noKtp: string;
    alamat: string;
    email: string;
    telepon: string;
    tempatLahir: string;
    tanggalLahir: Date | null;
    jenisKelamin: string;
    pekerjaan: string;
}

interface AnggotaTransactionRow {
    nasabahId: number;
    noAnggota: string;
    tglDaftar: Date;
    pokok: number;
    wajibAwal: number;
    saldo: number;
}

@Injectable()
export class MigrationService {
    constructor(private prisma: PrismaService) { }

    async generateJournalTemplate(): Promise<Buffer> {
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

        return Buffer.from(await workbook.xlsx.writeBuffer()) as Buffer;
    }

    async uploadJournal(fileBuffer: Buffer, journalDate: string, userId: number) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer as any);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            throw new BadRequestException('Invalid Excel file');
        }

        const journalEntries: JournalEntryRow[] = [];
        let totalDebit = 0;
        let totalCredit = 0;

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;

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
            throw new BadRequestException(`Journal is not balanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`);
        }

        if (journalEntries.length === 0) {
            throw new BadRequestException('No valid journal entries found');
        }

        // Validate accounts
        for (const entry of journalEntries) {
            const account = await this.prisma.journalAccount.findUnique({
                where: { accountCode: entry.accountCode }
            });
            if (!account) {
                throw new BadRequestException(`Account code ${entry.accountCode} not found`);
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
                    userId: userId, // Required by schema
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

    async generateNasabahTemplate(): Promise<Buffer> {
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

        return Buffer.from(await workbook.xlsx.writeBuffer()) as Buffer;
    }

    async uploadNasabah(fileBuffer: Buffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer as any);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) throw new BadRequestException('Invalid Excel file');

        const nasabahList: NasabahRow[] = [];
        const errors: { row: number; message: string }[] = [];
        let rowCount = 0;

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const ktp = row.getCell(2).text;
            // if (ktp === '1234567890123456') return; // skip example if needed

            rowCount++;
            try {
                const nama = row.getCell(1).text;
                const noKtp = row.getCell(2).text;
                let tanggalLahirVal: any = row.getCell(7).value; // type can be string, date, object

                if (!nama || !noKtp) throw new Error('Nama dan No KTP wajib diisi');

                let tanggalLahir: Date | null = null;
                if (tanggalLahirVal instanceof Date) {
                    tanggalLahir = tanggalLahirVal;
                } else if (typeof tanggalLahirVal === 'string') {
                    const parsed = new Date(tanggalLahirVal);
                    if (!isNaN(parsed.getTime())) tanggalLahir = parsed;
                } else if (typeof tanggalLahirVal === 'object' && tanggalLahirVal && 'result' in tanggalLahirVal) {
                    // ExcelJS formula result?
                    const parsed = new Date(tanggalLahirVal.result);
                    if (!isNaN(parsed.getTime())) tanggalLahir = parsed;
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
            } catch (e) {
                errors.push({ row: rowNumber, message: e.message });
            }
        });

        if (nasabahList.length === 0) throw new BadRequestException('No valid nasabah data found');

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

    async generateAnggotaTransactionTemplate(): Promise<Buffer> {
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

        return Buffer.from(await workbook.xlsx.writeBuffer()) as Buffer;
    }

    async uploadAnggotaTransaction(fileBuffer: Buffer) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer as any);
        const worksheet = workbook.getWorksheet('Transaksi Anggota') || workbook.getWorksheet(2);

        if (!worksheet) throw new BadRequestException('Sheet "Transaksi Anggota" not found');

        const txns: AnggotaTransactionRow[] = [];
        const errors: { row: number; message: string }[] = [];
        let rowCount = 0;

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            rowCount++;

            try {
                const nasabahId = parseInt(row.getCell(1).text);
                const noAnggota = row.getCell(2).text;
                let tglDaftarVal: any = row.getCell(3).value;
                const pokok = parseFloat(row.getCell(4).text) || 0;
                const wajib = parseFloat(row.getCell(5).text) || 0;
                const saldo = parseFloat(row.getCell(6).text) || 0;

                if (!nasabahId || isNaN(nasabahId)) throw new Error('Nasabah ID invalid');
                if (!noAnggota) throw new Error('No Anggota required');

                let tglDaftar = new Date();
                if (tglDaftarVal instanceof Date) {
                    tglDaftar = tglDaftarVal;
                } else if (typeof tglDaftarVal === 'string') {
                    const parsed = new Date(tglDaftarVal);
                    if (!isNaN(parsed.getTime())) tglDaftar = parsed;
                }

                txns.push({ nasabahId, noAnggota, tglDaftar, pokok, wajibAwal: wajib, saldo });
            } catch (e) {
                errors.push({ row: rowNumber, message: e.message });
            }
        });

        let successCount = 0;

        // Ensure Nasabah exists
        const nasabahIds = [...new Set(txns.map(t => t.nasabahId))];
        const validCustomers = await this.prisma.nasabah.findMany({
            where: { id: { in: nasabahIds } },
            select: { id: true }
        });
        const validCustSet = new Set(validCustomers.map(c => c.id));

        for (const txn of txns) {
            if (!validCustSet.has(txn.nasabahId)) continue;

            const existing = await this.prisma.anggotaAccount.findUnique({
                where: { accountNumber: txn.noAnggota }
            });
            if (existing) continue;

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
            } catch (e) {
                // Log failed creation
            }
        }

        return {
            success: true,
            totalRows: rowCount,
            successCount,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}
