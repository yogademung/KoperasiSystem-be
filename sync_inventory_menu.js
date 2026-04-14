const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const inventoryMenus = [
  { label: 'Master Barang', path: '/inventory/items', icon: null },
  { label: 'Master Gudang', path: '/inventory/categories', icon: null },
  { label: 'Master Vendor', path: '/inventory/vendors', icon: null },
  { label: 'Penerimaan Barang', path: '/inventory/receipts', icon: null },
  { label: 'Stock Opname', path: '/inventory/adjustments', icon: null },
  { label: 'Stock Transfer', path: '/inventory/transfer', icon: null },
];

async function main() {
  // 1. Ensure 'Inventory' parent exists
  let invParent = await prisma.menu.findFirst({
    where: { menuName: 'Inventory', parentId: null }
  });

  if (!invParent) {
    console.log('Creating Inventory parent menu...');
    invParent = await prisma.menu.create({
      data: {
        menuName: 'Inventory',
        module: 'ACCOUNTING', // Or wherever
        path: '/inventory',
        icon: 'Package',
        orderNum: 4, // Adjust based on others
        isActive: true,
        createdBy: 'SYSTEM'
      }
    });

    const adminRole = await prisma.role.findFirst({ where: { roleName: 'ADMIN' } });
    if (adminRole) {
      await prisma.menuRole.create({
        data: { roleId: adminRole.id, menuId: invParent.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true }
      });
    }
  }

  // 2. Ensure all submenus exist
  const adminRole = await prisma.role.findFirst({ where: { roleName: 'ADMIN' } });
  
  for (let i = 0; i < inventoryMenus.length; i++) {
    const item = inventoryMenus[i];
    let existing = await prisma.menu.findFirst({
      where: { parentId: invParent.id, path: item.path }
    });

    if (!existing) {
      existing = await prisma.menu.create({
        data: {
          menuName: item.label,
          path: item.path,
          parentId: invParent.id,
          module: 'ACCOUNTING',
          icon: item.icon,
          orderNum: i + 1,
          isActive: true,
          createdBy: 'SYSTEM'
        }
      });
      console.log(`Created submenu: ${existing.menuName}`);

      if (adminRole) {
        await prisma.menuRole.create({
          data: { roleId: adminRole.id, menuId: existing.id, canCreate: true, canRead: true, canUpdate: true, canDelete: true }
        });
      }
    } else {
      console.log(`Submenu already exists: ${existing.menuName}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
