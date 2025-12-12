"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkAccounts() {
    const codes = ['1.01.01', '3.10.01'];
    const accounts = await prisma.journalAccount.findMany({
        where: { accountCode: { in: codes } }
    });
    console.log('Found Accounts:', accounts.map(a => a.accountCode));
    if (accounts.length !== codes.length) {
        console.error('MISSING ACCOUNTS!');
    }
    else {
        console.log('All required accounts exist.');
    }
}
checkAccounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-specific-accounts.js.map