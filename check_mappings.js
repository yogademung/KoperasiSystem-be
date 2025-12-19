
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMappings() {
    console.log("Checking COA Mappings...");
    const mappingAngsuran = await prisma.productCoaMapping.findUnique({ where: { transType: 'KREDIT_ANGSURAN' } });
    const mappingBunga = await prisma.productCoaMapping.findUnique({ where: { transType: 'KREDIT_BUNGA' } });

    console.log("Mapping KREDIT_ANGSURAN:", mappingAngsuran);
    console.log("Mapping KREDIT_BUNGA:", mappingBunga);

    const accountsToCheck = ['10100', '10300', '40100'];
    if (mappingAngsuran) {
        accountsToCheck.push(mappingAngsuran.debitAccount);
        accountsToCheck.push(mappingAngsuran.creditAccount);
    }
    if (mappingBunga) {
        accountsToCheck.push(mappingBunga.creditAccount);
    }

    const uniqueAccounts = [...new Set(accountsToCheck)];
    console.log("Checking Accounts:", uniqueAccounts);

    const accounts = await prisma.journalAccount.findMany({
        where: { accountCode: { in: uniqueAccounts } }
    });

    console.log("Found Accounts:", accounts.map(a => `${a.accountCode} - ${a.accountName}`));

    const missing = uniqueAccounts.filter(code => !accounts.find(a => a.code === code));
    console.log("Missing Accounts:", missing);
}

checkMappings()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
