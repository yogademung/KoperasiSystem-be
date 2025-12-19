
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function listAccounts() {
    const assets = await prisma.journalAccount.findMany({
        where: { accountType: 'AST', isActive: true },
        select: { accountCode: true, accountName: true },
        orderBy: { accountCode: 'asc' }
    });

    const output = assets.map(a => `${a.accountCode} - ${a.accountName}`).join('\n');
    fs.writeFileSync('accounts.txt', output);
    console.log('Done writing accounts.txt');
}

listAccounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
