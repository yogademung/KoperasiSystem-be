
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const lock = await prisma.periodLock.findUnique({ where: { period: '2025-12' } });
    console.log(`LOCK_STATUS: ${lock?.status}`);
    console.log(`FULL_LOCK: ${JSON.stringify(lock)}`);
}
main().finally(() => prisma.$disconnect());
