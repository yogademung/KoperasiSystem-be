"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=list-accounts.js.map