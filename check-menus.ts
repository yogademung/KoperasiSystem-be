
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking menus...');
    const count = await prisma.menu.count();
    console.log(`Total menus: ${count}`);

    const menus = await prisma.menu.findMany({
        select: { id: true, menuName: true, parentId: true, isActive: true }
    });
    console.log('Menus:', menus);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
