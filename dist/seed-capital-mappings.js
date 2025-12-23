"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedCapitalMappings() {
    console.log('Seeding CAPITAL (Modal & Loan) mappings...');
    const mappings = [
        {
            transType: 'MODAL_SETOR',
            description: 'Setoran Modal Penyertaan',
            module: 'MODAL',
            debitAccount: '1.01.01',
            creditAccount: '3.01.01'
        },
        {
            transType: 'MODAL_TARIK',
            description: 'Penarikan Modal Penyertaan',
            module: 'MODAL',
            debitAccount: '3.01.01',
            creditAccount: '1.01.01'
        },
        {
            transType: 'MODAL_SHU',
            description: 'Pembagian SHU ke Modal',
            module: 'MODAL',
            debitAccount: '5.01.01',
            creditAccount: '3.01.01'
        },
        {
            transType: 'LOAN_DISBURSE',
            description: 'Pencairan Pinjaman Bank (Terima Dana)',
            module: 'PINJAMAN_LUAR',
            debitAccount: '1.01.01',
            creditAccount: '2.01.01'
        },
        {
            transType: 'LOAN_PAYMENT',
            description: 'Angsuran Pinjaman Bank',
            module: 'PINJAMAN_LUAR',
            debitAccount: '2.01.01',
            creditAccount: '1.01.01'
        }
    ];
    const accounts = [
        { accountCode: '3.01.01', accountName: 'MODAL PENYERTAAN', accountType: 'EQT' },
        { accountCode: '2.01.01', accountName: 'HUTANG BANK', accountType: 'LIA' },
        { accountCode: '5.01.01', accountName: 'BEBAN SHU', accountType: 'EXP' },
        { accountCode: '1.01.01', accountName: 'KAS KANTOR', accountType: 'AST' }
    ];
    for (const acc of accounts) {
        const existing = await prisma.journalAccount.findUnique({ where: { accountCode: acc.accountCode } });
        if (!existing) {
            console.log(`Creating Account: ${acc.accountName} (${acc.accountCode})`);
            await prisma.journalAccount.create({ data: acc });
        }
    }
    for (const m of mappings) {
        const existing = await prisma.productCoaMapping.findUnique({ where: { transType: m.transType } });
        if (existing) {
            console.log(`Mapping ${m.transType} exists. Updating...`);
            await prisma.productCoaMapping.update({
                where: { transType: m.transType },
                data: m
            });
        }
        else {
            console.log(`Creating Mapping ${m.transType}...`);
            await prisma.productCoaMapping.create({ data: m });
        }
    }
}
seedCapitalMappings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-capital-mappings.js.map