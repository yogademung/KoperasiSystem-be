"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const accounts = await prisma.journalAccount.findMany({
            where: {
                accountCode: {
                    startsWith: '2.20'
                }
            }
        });
        console.log('Accounts starting with 2.20:', JSON.stringify(accounts, null, 2));
        const gain = await prisma.journalAccount.findMany({ where: { accountCode: { startsWith: '4.20' } } });
        console.log('Accounts starting with 4.20:', JSON.stringify(gain, null, 2));
        const loss = await prisma.journalAccount.findMany({ where: { accountCode: { startsWith: '5.40' } } });
        console.log('Accounts starting with 5.40:', JSON.stringify(loss, null, 2));
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=check-accounts.js.map