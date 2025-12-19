
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMappings() {
    console.log('Checking KREDIT_REALISASI mapping...');
    try {
        const mapping = await prisma.productCoaMapping.findUnique({
            where: { transType: 'KREDIT_REALISASI' }
        });

        if (mapping) {
            console.log('Mapping FOUND:', mapping);
        } else {
            console.error('Mapping NOT FOUND for KREDIT_REALISASI');
            process.exit(1);
        }
    } catch (e) {
        console.error('Error checking mapping:', e);
        process.exit(1);
    }
}

checkMappings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
