"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function checkMenuAndProducts() {
    const prisma = new client_1.PrismaClient();
    try {
        await prisma.$connect();
        console.log('--- CHECKING MENUS ---');
        const settingsMenu = await prisma.menu.findFirst({
            where: {
                OR: [
                    { menuName: 'Pengaturan' },
                    { menuName: 'Settings' }
                ]
            }
        });
        if (settingsMenu) {
            console.log(`Parent Menu Found: ${settingsMenu.menuName} (ID: ${settingsMenu.id})`);
            const children = await prisma.menu.findMany({
                where: { parentId: settingsMenu.id }
            });
            console.log('Children:', children.map(c => c.menuName));
        }
        else {
            console.log('Settings Menu Parent NOT FOUND');
        }
        console.log('\n--- CHECKING PRODUCT CONFIGS ---');
        const products = await prisma.productConfig.findMany();
        console.log(`Products found: ${products.length}`);
        products.forEach(p => console.log(`- ${p.productCode}: ${p.productName}`));
    }
    catch (e) {
        console.error('Error:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkMenuAndProducts();
//# sourceMappingURL=check-menu.js.map