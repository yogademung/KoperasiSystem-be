import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const regions = await prisma.user.findMany({
        select: { regionCode: true },
        distinct: ['regionCode'],
        where: { regionCode: { not: null } }
    });
    console.log(JSON.stringify(regions, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
