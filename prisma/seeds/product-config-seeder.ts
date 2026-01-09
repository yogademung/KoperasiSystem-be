
import { PrismaClient } from '@prisma/client';

export const seedProductConfig = async () => {
    const prisma = new PrismaClient();
    console.log('Seeding Product Config...');

    const products = [
        {
            productCode: 'ANGGOTA',
            productName: 'Simpanan Anggota',
            tableName: 'm_nasabah_anggota',
            isEnabled: true,
            isCore: true,
            displayOrder: 1,
            routePath: '/simpanan/anggota',
            icon: 'Users',
            defaultInterestRate: 0.00,
        },
        {
            productCode: 'TABRELA',
            productName: 'Simpanan Tabrela',
            tableName: 'm_nasabah_tab',
            isEnabled: true,
            isCore: false,
            displayOrder: 2,
            routePath: '/simpanan/tabrela',
            icon: 'Wallet',
            defaultInterestRate: 2.00,
            minInterestRate: 1.00,
            maxInterestRate: 5.00,
        },
        {
            productCode: 'SIJANGKA',
            productName: 'Simpanan Berjangka',
            tableName: 'm_nasabah_jangka',
            isEnabled: true,
            isCore: false,
            displayOrder: 3,
            routePath: '/simpanan/deposito',
            icon: 'PiggyBank',
            defaultInterestRate: 5.00,
            minInterestRate: 3.00,
            maxInterestRate: 8.00,
        },
        {
            productCode: 'BRAHMACARI',
            productName: 'Simpanan Brahmacari',
            tableName: 'm_nasabah_brahmacari',
            isEnabled: true,
            isCore: false,
            displayOrder: 4,
            routePath: '/simpanan/brahmacari',
            icon: 'TrendingUp',
            defaultInterestRate: 3.00,
        },
        {
            productCode: 'BALIMESARI',
            productName: 'Simpanan Balimesari',
            tableName: 'm_nasabah_balimesari',
            isEnabled: true,
            isCore: false,
            displayOrder: 5,
            routePath: '/simpanan/balimesari',
            icon: 'Sparkles',
            defaultInterestRate: 3.50,
        },
        {
            productCode: 'WANAPRASTA',
            productName: 'Simpanan Wanaprasta',
            tableName: 'm_nasabah_wanaprasta',
            isEnabled: true,
            isCore: false,
            displayOrder: 6,
            routePath: '/simpanan/wanaprasta',
            icon: 'Leaf',
            defaultInterestRate: 4.00,
        }
    ];

    for (const product of products) {
        await prisma.productConfig.upsert({
            where: { productCode: product.productCode },
            update: {
                // Ensure critical fields are accurate if re-seeding
                tableName: product.tableName,
                routePath: product.routePath,
                icon: product.icon,
                isCore: product.isCore
            },
            create: product,
        });
    }

    console.log('Product Config Seeded');
};
