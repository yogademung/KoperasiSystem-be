
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    const count = await prisma.journalAccount.count();
    console.log(`Total Journal Accounts: ${count}`);

    if (count > 0) {
        const sample = await prisma.journalAccount.findFirst();
        console.log('Sample Account:', sample);
    }
}

checkData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
