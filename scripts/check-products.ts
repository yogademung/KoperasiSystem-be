
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Product Configuration ---');
    const products = await prisma.productConfig.findMany({
        orderBy: { displayOrder: 'asc' }
    });

    if (products.length === 0) {
        console.log('No products found in ProductConfig table.');
    } else {
        products.forEach(p => {
            console.log(`[${p.isEnabled ? 'ENABLED' : 'DISABLED'}] ${p.productCode} - ${p.productName} (Table: ${p.tableName})`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
