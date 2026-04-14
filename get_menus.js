const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: [{ parentId: 'asc' }, { orderNum: 'asc' }],
    select: { id: true, menuName: true, path: true, parentId: true, module: true, orderNum: true, icon: true }
  });
  console.log(JSON.stringify(menus, null, 2));
}

main().finally(() => prisma.$disconnect());
