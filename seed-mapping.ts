
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMapping() {
    console.log('Seeding KREDIT_REALISASI mapping...');

    // Check if exists
    const existing = await prisma.productCoaMapping.findUnique({
        where: { transType: 'KREDIT_REALISASI' }
    });

    if (existing) {
        console.log('Mapping already exists.');
        return;
    }

    try {
        const mapping = await prisma.productCoaMapping.create({
            data: {
                transType: 'KREDIT_REALISASI',
                description: 'Realisasi Pencairan Kredit',
                module: 'KREDIT',
                debitAccount: '1.20.01',  // PINJAMAN ANGGOTA (KREDIT)
                creditAccount: '1.01.01'  // KAS KANTOR
            }
        });
        console.log('Mapping created:', mapping);
    } catch (e) {
        console.error('Error creating mapping:', e);
    }
}

seedMapping()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
