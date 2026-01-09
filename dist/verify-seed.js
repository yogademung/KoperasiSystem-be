"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function verify() {
    try {
        const products = await prisma.productConfig.findMany({
            orderBy: { displayOrder: 'asc' }
        });
        console.log('--- PRODUCT CONFIG VERIFICATION ---');
        console.log(`Total Products Found: ${products.length}`);
        products.forEach(p => {
            console.log(`- [${p.productCode}] ${p.productName} (Route: ${p.routePath}) ${p.isEnabled ? '✅ Enabled' : '❌ Disabled'}`);
        });
        console.log('-----------------------------------');
    }
    catch (e) {
        console.error('Verification failed:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
verify();
//# sourceMappingURL=verify-seed.js.map