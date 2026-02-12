"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const config = await prisma.lovValue.findFirst({
            where: {
                code: 'COMPANY_PROFILE',
                codeValue: 'LAST_CLOSING_MONTH'
            }
        });
        console.log('Last Closing Month Config:', JSON.stringify(config, null, 2));
        const locks = await prisma.periodLock.findMany({
            where: { status: 'LOCKED' }
        });
        console.log('Active Period Locks:', JSON.stringify(locks, null, 2));
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=check-config.js.map