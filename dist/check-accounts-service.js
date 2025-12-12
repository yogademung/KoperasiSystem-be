"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function check() {
    console.log('Checking JournalAccount...');
    const accounts = await prisma.journalAccount.findMany({ take: 5 });
    console.log('Accounts found:', accounts.length);
    if (accounts.length > 0)
        console.log('Sample:', accounts[0].accountCode);
    console.log('Checking ProductCoaMapping...');
    const mappings = await prisma.productCoaMapping.findMany({ take: 5 });
    console.log('Mappings found:', mappings.length);
}
check()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-accounts-service.js.map