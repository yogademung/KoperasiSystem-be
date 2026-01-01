
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const j = await prisma.postedJournal.findUnique({ where: { journalNumber: 'MIG/2025/12/4579' } });
    if (j) console.log(`POSTING_TYPE: ${j.postingType}`);
    else console.log('NOT_FOUND');
}
main().finally(() => prisma.$disconnect());
