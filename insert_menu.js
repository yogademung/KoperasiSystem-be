const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Find Inventory Parent Menu
  const invParent = await prisma.menu.findFirst({
    where: { menuName: 'Inventory', parentId: null }
  });

  if (!invParent) {
    console.log('Parent menu Inventory not found!');
    return;
  }

  // 2. Check if Stock Transfer already exists
  const existing = await prisma.menu.findFirst({
    where: { parentId: invParent.id, path: '/inventory/transfer' }
  });

  if (existing) {
    console.log('Stock Transfer menu already exists:', existing);
    return;
  }

  // 3. Get max order number under Inventory
  const maxOrder = await prisma.menu.findFirst({
    where: { parentId: invParent.id },
    orderBy: { orderNum: 'desc' }
  });
  const nextOrder = (maxOrder?.orderNum || 0) + 1;

  // 4. Create Stock Transfer Menu
  const newMenu = await prisma.menu.create({
    data: {
      menuName: 'Stock Transfer',
      path: '/inventory/transfer',
      parentId: invParent.id,
      module: 'ACCOUNTING', // Or standard module for Inventory
      orderNum: nextOrder,
      isActive: true,
      createdBy: 'SYSTEM'
    }
  });

  console.log('Created new menu:', newMenu);

  // 5. Assign to ADMIN role
  const adminRole = await prisma.role.findFirst({ where: { roleName: 'ADMIN' } });
  if (adminRole) {
    await prisma.menuRole.create({
      data: {
        roleId: adminRole.id,
        menuId: newMenu.id,
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true
      }
    });
    console.log('Assigned menu to ADMIN role');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
