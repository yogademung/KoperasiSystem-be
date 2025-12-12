
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('Checking JournalAccount...');
    const accounts = await prisma.journalAccount.findMany({ take: 5 });
    console.log('Accounts found:', accounts.length);
    if (accounts.length > 0) console.log('Sample:', accounts[0].accountCode);

    console.log('Checking ProductCoaMapping...');
    const mappings = await prisma.productCoaMapping.findMany({ take: 5 });
    console.log('Mappings found:', mappings.length);
}

check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
