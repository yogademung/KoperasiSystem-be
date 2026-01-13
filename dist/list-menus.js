"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function listAllMenus() {
    const prisma = new client_1.PrismaClient();
    try {
        const menus = await prisma.menu.findMany();
        console.log('--- ALL MENUS ---');
        menus.forEach(m => console.log(`ID: ${m.id}, Name: '${m.menuName}', Path: ${m.path}, Parent: ${m.parentId}`));
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
listAllMenus();
//# sourceMappingURL=list-menus.js.map