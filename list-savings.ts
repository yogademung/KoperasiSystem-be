
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tabs = await prisma.nasabahTab.findMany({ take: 5 });
    console.log('Tabrela Accounts:', tabs.map(t => t.noTab));

    const balimesari = await prisma.nasabahBalimesari.findMany({ take: 5 });
    console.log('Balimesari Accounts:', balimesari.map(b => b.noBalimesari));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
