"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seed() {
    console.log('Seeding Anggota Closure Mappings...');
    const mappings = [
        {
            module: 'SIMPANAN',
            transType: 'ANGGOTA_TUTUP',
            description: 'Penutupan Keanggotaan',
            debit: '2.10.01',
            credit: '1.01.01'
        },
        {
            module: 'SIMPANAN',
            transType: 'ANGGOTA_DENDA',
            description: 'Denda Penutupan',
            debit: '2.10.01',
            credit: '4.20.03'
        },
        {
            module: 'SIMPANAN',
            transType: 'ANGGOTA_ADMIN',
            description: 'Biaya Admin Penutupan',
            debit: '2.10.01',
            credit: '4.20.01'
        }
    ];
    for (const m of mappings) {
        await prisma.productCoaMapping.upsert({
            where: { transType: m.transType },
            update: {
                description: m.description,
                debitAccount: m.debit,
                creditAccount: m.credit
            },
            create: {
                module: m.module,
                transType: m.transType,
                description: m.description,
                debitAccount: m.debit,
                creditAccount: m.credit
            }
        });
        console.log(`Upserted ${m.transType}`);
    }
}
seed()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-close-mappings.js.map