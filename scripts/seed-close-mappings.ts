
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log('Seeding Anggota Closure Mappings...');

    const mappings = [
        // Tutup -> Debit Simpanan Sukarela (Generalizing for now) / Credit Kas
        {
            module: 'SIMPANAN',
            transType: 'ANGGOTA_TUTUP',
            description: 'Penutupan Keanggotaan',
            debit: '2.10.01', // Ideally should split Principal/Mandatory, but using general savings for flow test
            credit: '1.01.01'
        },
        // Denda -> Debit Simpanan Sukarela / Credit Pendapatan Denda
        {
            module: 'SIMPANAN',
            transType: 'ANGGOTA_DENDA',
            description: 'Denda Penutupan',
            debit: '2.10.01',
            credit: '4.20.03'
        },
        // Admin -> Debit Simpanan Sukarela / Credit Pendapatan Admin
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
