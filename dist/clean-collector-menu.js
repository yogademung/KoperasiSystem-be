"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log('Cleaning Collector Menu...');
        const deleted = await prisma.menu.deleteMany({
            where: { path: '/collector' }
        });
        console.log(`Deleted ${deleted.count} menu(s) with path '/collector'.`);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=clean-collector-menu.js.map