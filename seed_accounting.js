
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    console.log("Seeding Accounting Data...");

    // 1. Ensure Defaults Accounts Exist
    const accounts = [
        { code: '10100', name: 'Kas', type: 'ASSET', debetPoleFlag: true },
        { code: '10300', name: 'Piutang Kredit', type: 'ASSET', debetPoleFlag: true },
        { code: '40100', name: 'Pendapatan Bunga Kredit', type: 'INCOME', debetPoleFlag: false },
    ];

    for (const acc of accounts) {
        await prisma.journalAccount.upsert({
            where: { accountCode: acc.code },
            update: {},
            create: {
                accountCode: acc.code,
                accountName: acc.name,
                accountType: acc.type,
                debetPoleFlag: acc.debetPoleFlag,
                isActive: true,
                createdBy: 'SEED'
            }
        });
        console.log(`Upserted Account: ${acc.code}`);
    }

    // 2. Ensure Mappings Exist
    const mappings = [
        { type: 'KREDIT_ANGSURAN', debit: '10100', credit: '10300' }, // Debit Cash, Credit Piutang
        { type: 'KREDIT_BUNGA', debit: '10100', credit: '40100' },    // Debit Cash (implicitly handled by logic split), Credit Pendapatan
    ];

    for (const map of mappings) {
        await prisma.productCoaMapping.upsert({
            where: { transType: map.type },
            update: {
                debitAccount: map.debit,
                creditAccount: map.credit
            },
            create: {
                transType: map.type,
                debitAccount: map.debit,
                creditAccount: map.credit,
                module: 'KREDIT',
                description: map.type === 'KREDIT_ANGSURAN' ? 'Mapping Angsuran Pokok' : 'Mapping Angsuran Bunga'
            }
        });
        console.log(`Upserted Mapping: ${map.type}`);
    }

    console.log("Seeding Complete.");
}

seed()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
