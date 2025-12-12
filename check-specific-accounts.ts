
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAccounts() {
    const codes = ['1.01.01', '3.10.01'];
    const accounts = await prisma.journalAccount.findMany({
        where: { accountCode: { in: codes } }
    });

    console.log('Found Accounts:', accounts.map(a => a.accountCode));
    if (accounts.length !== codes.length) {
        console.error('MISSING ACCOUNTS!');
    } else {
        console.log('All required accounts exist.');
    }
}

checkAccounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
