import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const config = await prisma.s_lov_value.findFirst({
            where: { lov_name: 'last_closing_month' }
        });
        console.log('Last Closing Month Config:', JSON.stringify(config, null, 2));

        const locks = await prisma.periodLock.findMany({
            where: { status: 'LOCKED' }
        });
        console.log('Active Period Locks:', JSON.stringify(locks, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
