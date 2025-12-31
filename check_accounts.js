
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const accounts = await prisma.journalAccount.findMany({
        where: { accountType: 'EQT' },
        select: { accountCode: true, accountName: true }
    });
    console.log(JSON.stringify(accounts, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
