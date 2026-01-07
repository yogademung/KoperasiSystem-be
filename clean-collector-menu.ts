
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Cleaning Collector Menu...');

        const deleted = await prisma.menu.deleteMany({
            where: { path: '/collector' }
        });

        console.log(`Deleted ${deleted.count} menu(s) with path '/collector'.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
