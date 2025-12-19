"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedMapping() {
    console.log('Seeding KREDIT_REALISASI mapping...');
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
                debitAccount: '1.20.01',
                creditAccount: '1.01.01'
            }
        });
        console.log('Mapping created:', mapping);
    }
    catch (e) {
        console.error('Error creating mapping:', e);
    }
}
seedMapping()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-mapping.js.map