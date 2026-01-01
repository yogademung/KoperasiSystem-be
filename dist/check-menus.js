"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=check-menus.js.map