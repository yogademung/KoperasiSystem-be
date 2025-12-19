
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAccounts() {
    const assets = await prisma.journalAccount.findMany({
        where: { accountType: 'AST', isActive: true },
        select: { accountCode: true, accountName: true }
    });
    console.log('ASSETS:', assets);
}

listAccounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
