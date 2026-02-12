"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAccounting = seedAccounting;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const accountData = [
    { accountCode: "1.01.00", accountName: "KAS", accountType: "AST", debetPoleFlag: true },
    { accountCode: "1.01.01", accountName: "KAS KANTOR (USP)", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.01.02", accountName: "KAS KANTOR (TOKO)", accountType: "AST", debetPoleFlag: true, businessUnitId: 2 },
    { accountCode: "1.01.03", accountName: "KAS TELLER 1", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.01.04", accountName: "KAS TELLER 2", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.01.05", accountName: "KAS TRANSIT KOLEKTOR", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.02.00", accountName: "BANK", accountType: "AST", debetPoleFlag: true },
    { accountCode: "1.02.01", accountName: "BANK BPD BALI (USP)", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.02.02", accountName: "BANK BRI (USP)", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.02.11", accountName: "BANK BPD BALI (TOKO)", accountType: "AST", debetPoleFlag: true, businessUnitId: 2 },
    { accountCode: "1.20.00", accountName: "PIUTANG PINJAMAN", accountType: "AST", debetPoleFlag: true },
    { accountCode: "1.20.01", accountName: "PINJAMAN ANGGOTA (KREDIT)", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.20.02", accountName: "PINJAMAN PEGAWAI", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.20.99", accountName: "PENYISIHAN PENGHAPUSAN PINJAMAN", accountType: "AST", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "1.40.00", accountName: "REKENING ANTAR UNIT", accountType: "AST", debetPoleFlag: true },
    { accountCode: "1.40.01", accountName: "RAK - UNIT USP", accountType: "RAK", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.40.02", accountName: "RAK - UNIT TOKO", accountType: "RAK", debetPoleFlag: true, businessUnitId: 2 },
    { accountCode: "1.30.00", accountName: "ASET TETAP", accountType: "AST", debetPoleFlag: true },
    { accountCode: "1.30.01", accountName: "TANAH DAN BANGUNAN", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.30.02", accountName: "PERALATAN KANTOR", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.30.03", accountName: "KENDARAAN", accountType: "AST", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "1.30.99", accountName: "AKUMULASI PENYUSUTAN", accountType: "AST", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.10.00", accountName: "SIMPANAN DANA PIHAK KETIGA", accountType: "LIA", debetPoleFlag: false },
    { accountCode: "2.10.01", accountName: "SIMPANAN SUKARELA (TABUNGAN)", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.10.02", accountName: "SIMPANAN BERJANGKA (DEPOSITO)", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.10.03", accountName: "SIMPANAN HARI RAYA", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.10.04", accountName: "SIMPANAN PENDIDIKAN", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.10.05", accountName: "SIMPANAN BRAHMACARI", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.10.06", accountName: "SIMPANAN BALI MESARI", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.10.07", accountName: "SIMPANAN WANAPRASTA", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.20.00", accountName: "HUTANG LANCAR LAINNYA", accountType: "LIA", debetPoleFlag: false },
    { accountCode: "2.20.01", accountName: "TITIPAN DANA SOSIAL", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.20.02", accountName: "HUTANG SHU ANGGOTA", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.20.03", accountName: "HUTANG PAJAK", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "2.30.00", accountName: "HUTANG PINJAMAN", accountType: "LIA", debetPoleFlag: false },
    { accountCode: "2.30.01", accountName: "HUTANG PINJAMAN EXTERNAL", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "3.10.00", accountName: "MODAL SENDIRI", accountType: "EQT", debetPoleFlag: false },
    { accountCode: "3.10.01", accountName: "SIMPANAN POKOK", accountType: "EQT", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "3.10.02", accountName: "SIMPANAN WAJIB", accountType: "EQT", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "3.10.03", accountName: "MODAL PENYERTAAN", accountType: "EQT", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "3.10.04", accountName: "MODAL DONASI/HIBAH", accountType: "EQT", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "3.20.00", accountName: "CADANGAN", accountType: "EQT", debetPoleFlag: false },
    { accountCode: "3.20.01", accountName: "CADANGAN UMUM", accountType: "EQT", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "3.20.02", accountName: "CADANGAN RESIKO", accountType: "EQT", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "3.99.99", accountName: "SHU TAHUN BERJALAN", accountType: "EQT", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "4.10.00", accountName: "PENDAPATAN BUNGA", accountType: "REV", debetPoleFlag: false },
    { accountCode: "4.10.01", accountName: "BUNGA PINJAMAN ANGGOTA", accountType: "REV", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "4.10.02", accountName: "BUNGA PINJAMAN PEGAWAI", accountType: "REV", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "4.20.00", accountName: "PENDAPATAN NON BUNGA", accountType: "REV", debetPoleFlag: false },
    { accountCode: "4.20.01", accountName: "ADMINISTRASI KREDIT", accountType: "REV", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "4.20.02", accountName: "PROVISI KREDIT", accountType: "REV", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "4.20.03", accountName: "DENDAS KETERLAMBATAN", accountType: "REV", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "5.10.00", accountName: "BIAYA OPERASIONAL", accountType: "EXP", debetPoleFlag: true },
    { accountCode: "5.10.01", accountName: "GAJI PEGAWAI", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.10.02", accountName: "TUNJANGAN HARI RAYA", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.10.03", accountName: "BIAYA LISTRIK, AIR, TELEPON", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.10.04", accountName: "BIAYA ALAT TULIS KANTOR", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.10.05", accountName: "BIAYA RAPAT", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.20.00", accountName: "BIAYA BUNGA", accountType: "EXP", debetPoleFlag: true },
    { accountCode: "5.20.01", accountName: "BUNGA SIMPANAN SUKARELA", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.20.02", accountName: "BUNGA DEPOSITO BERJANGKA", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.20.04", accountName: "BUNGA BRAHMACARI", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.20.05", accountName: "BUNGA BALI MESARI", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.20.06", accountName: "BUNGA WANAPRASTA", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.20.10", accountName: "BIAYA BUNGA PINJAMAN EXTERNAL", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.30.00", accountName: "BIAYA PENYUSUTAN", accountType: "EXP", debetPoleFlag: true },
    { accountCode: "5.30.01", accountName: "PENYUSUTAN GEDUNG", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.30.01", accountName: "PENYUSUTAN GEDUNG", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "5.30.02", accountName: "PENYUSUTAN PERALATAN", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 },
    { accountCode: "2.20.04", accountName: "HUTANG PEMBELIAN ASET", accountType: "LIA", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "4.20.04", accountName: "KEUNTUNGAN PENJUALAN ASET", accountType: "REV", debetPoleFlag: false, businessUnitId: 1 },
    { accountCode: "5.40.01", accountName: "KERUGIAN PENJUALAN ASET", accountType: "EXP", debetPoleFlag: true, businessUnitId: 1 }
];
const mappingData = [
    { module: 'SIMPANAN', transType: 'ANGGOTA_SETOR_POKOK', description: 'Setoran Pokok Anggota', debit: '1.01.01', credit: '3.10.01' },
    { module: 'SIMPANAN', transType: 'ANGGOTA_SETOR_WAJIB', description: 'Setoran Wajib Anggota', debit: '1.01.01', credit: '3.10.02' },
    { module: 'SIMPANAN', transType: 'ANGGOTA_SETOR_SUKARELA', description: 'Setoran Sukarela Anggota', debit: '1.01.01', credit: '2.10.01' },
    { module: 'SIMPANAN', transType: 'ANGGOTA_TARIK', description: 'Penarikan Anggota', debit: '2.10.01', credit: '1.01.01' },
    { module: 'SIMPANAN', transType: 'TABRELA_SETOR', description: 'Setoran Tabrela', debit: '1.01.01', credit: '2.10.01' },
    { module: 'SIMPANAN', transType: 'TABRELA_TARIK', description: 'Penarikan Tabrela', debit: '2.10.01', credit: '1.01.01' },
    { module: 'SIMPANAN', transType: 'DEPOSITO_SETOR', description: 'Penempatan Deposito', debit: '1.01.01', credit: '2.10.02' },
    { module: 'SIMPANAN', transType: 'DEPOSITO_CAIR', description: 'Pencairan Deposito', debit: '2.10.02', credit: '1.01.01' },
    { module: 'SIMPANAN', transType: 'BRAHMACARI_SETOR', description: 'Setoran Brahmacari', debit: '1.01.01', credit: '2.10.05' },
    { module: 'SIMPANAN', transType: 'BRAHMACARI_TARIK', description: 'Penarikan Brahmacari', debit: '2.10.05', credit: '1.01.01' },
    { module: 'SIMPANAN', transType: 'BALIMESARI_SETOR', description: 'Setoran Bali Mesari', debit: '1.01.01', credit: '2.10.06' },
    { module: 'SIMPANAN', transType: 'BALIMESARI_TARIK', description: 'Penarikan Bali Mesari', debit: '2.10.06', credit: '1.01.01' },
    { module: 'SIMPANAN', transType: 'WANAPRASTA_SETOR', description: 'Setoran Wanaprasta', debit: '1.01.01', credit: '2.10.07' },
    { module: 'SIMPANAN', transType: 'WANAPRASTA_TARIK', description: 'Penarikan Wanaprasta', debit: '2.10.07', credit: '1.01.01' },
    { module: 'KREDIT', transType: 'KREDIT_REALISASI', description: 'Realisasi Kredit', debit: '1.20.01', credit: '1.01.01' },
    { module: 'KREDIT', transType: 'KREDIT_ANGSURAN', description: 'Mapping Angsuran Pokok', debit: '1.01.01', credit: '1.20.01' },
    { module: 'KREDIT', transType: 'KREDIT_BUNGA', description: 'Mapping Angsuran Bunga', debit: '1.01.01', credit: '4.10.01' },
    { module: 'ASSET', transType: 'ASSET_ACQUISITION', description: 'Perolehan Aset Tetap', debit: '1.30.00', credit: '1.01.01' },
    { module: 'ASSET', transType: 'ASSET_DEPRECIATION', description: 'Penyusutan Aset Tetap', debit: '5.30.00', credit: '1.30.99' },
    { module: 'ASSET', transType: 'ASSET_DISPOSAL_GAIN', description: 'Keuntungan Penjualan Aset', debit: '1.01.01', credit: '4.20.04' },
    { module: 'ASSET', transType: 'ASSET_DISPOSAL_LOSS', description: 'Kerugian Penjualan Aset', debit: '5.40.01', credit: '1.01.01' },
    { module: 'CAPITAL', transType: 'MODAL_SETOR', description: 'Setoran Modal Penyertaan', debit: '1.01.01', credit: '3.10.03' },
    { module: 'CAPITAL', transType: 'MODAL_TARIK', description: 'Penarikan Modal Penyertaan', debit: '3.10.03', credit: '1.01.01' },
    { module: 'CAPITAL', transType: 'MODAL_SHU', description: 'Distribusi SHU ke Modal Penyertaan', debit: '3.99.99', credit: '3.10.03' },
    { module: 'CAPITAL', transType: 'LOAN_DISBURSE', description: 'Pencairan Pinjaman External', debit: '1.02.01', credit: '2.30.01' },
];
async function seedAccounting() {
    console.log('🌱 Seeding Business Units...');
    const units = [
        { id: 1, code: 'USP', name: 'Unit Simpan Pinjam', description: 'Unit Usaha Simpan Pinjam' },
        { id: 2, code: 'TOKO', name: 'Unit Toko / Waserda', description: 'Unit Usaha Toko dan Warung Serba Ada' }
    ];
    for (const unit of units) {
        await prisma.businessUnit.upsert({
            where: { id: unit.id },
            update: unit,
            create: unit
        });
    }
    console.log('🌱 Seeding Journal Accounts...');
    for (const acc of accountData) {
        let parentCode = null;
        if (!acc.accountCode.endsWith('.00')) {
            const parts = acc.accountCode.split('.');
            if (parts.length === 3) {
                parentCode = `${parts[0]}.${parts[1]}.00`;
            }
        }
        await prisma.journalAccount.upsert({
            where: { accountCode: acc.accountCode },
            update: {
                accountName: acc.accountName,
                accountType: acc.accountType,
                debetPoleFlag: acc.debetPoleFlag,
                parentCode: parentCode,
                businessUnitId: acc.businessUnitId
            },
            create: {
                accountCode: acc.accountCode,
                accountName: acc.accountName,
                accountType: acc.accountType,
                debetPoleFlag: acc.debetPoleFlag,
                parentCode: parentCode,
                businessUnitId: acc.businessUnitId,
                isActive: true,
                createdBy: 'SYSTEM'
            }
        });
    }
    console.log('🌱 Seeding Product COA Mappings...');
    for (const map of mappingData) {
        await prisma.productCoaMapping.upsert({
            where: { transType: map.transType },
            update: {
                description: map.description,
                debitAccount: map.debit,
                creditAccount: map.credit
            },
            create: {
                module: map.module,
                transType: map.transType,
                description: map.description,
                debitAccount: map.debit,
                creditAccount: map.credit
            }
        });
    }
    console.log('✅ Accounting Seeding Completed!');
}
if (require.main === module) {
    seedAccounting()
        .then(async () => {
        await prisma.$disconnect();
    })
        .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
}
//# sourceMappingURL=accounting-seeder.js.map