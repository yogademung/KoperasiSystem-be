"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const lock = await prisma.periodLock.findUnique({ where: { period: '2025-12' } });
    console.log(`LOCK_STATUS: ${lock?.status}`);
    console.log(`FULL_LOCK: ${JSON.stringify(lock)}`);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=debug-lock.js.map