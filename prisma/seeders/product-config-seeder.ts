import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Product Configuration...');

    const products = [
        {
            productCode: 'ANGGOTA',
            productName: 'Simpanan Anggota',
            tableName: 'anggota_account',
            isCore: true,
            isEnabled: true,
            displayOrder: 1,
            routePath: '/simpanan/anggota',
            icon: 'Users',
            defaultInterestRate: null, // Anggota typically has no interest
            minInterestRate: null,
            maxInterestRate: null,
        },
        {
            productCode: 'TABRELA',
            productName: 'Tabungan Rela',
            tableName: 'm_nasabah_tab',
            isCore: false,
            isEnabled: true,
            displayOrder: 2,
            routePath: '/simpanan/tabrela',
            icon: 'Wallet',
            defaultInterestRate: 2.5,
            minInterestRate: 1.0,
            maxInterestRate: 5.0,
        },
        {
            productCode: 'DEPOSITO',
            productName: 'Simpanan Berjangka',
            tableName: 'm_nasabah_jangka',
            isCore: false,
            isEnabled: true,
            displayOrder: 3,
            routePath: '/simpanan/deposito',
            icon: 'PiggyBank',
            defaultInterestRate: 4.0,
            minInterestRate: 3.0,
            maxInterestRate: 7.0,
        },
        {
            productCode: 'BRAHMACARI',
            productName: 'Simpanan Brahmacari',
            tableName: 'm_nasabah_brahmacari',
            isCore: false,
            isEnabled: true,
            displayOrder: 4,
            routePath: '/simpanan/brahmacari',
            icon: 'TrendingUp',
            defaultInterestRate: 3.0,
            minInterestRate: 2.0,
            maxInterestRate: 6.0,
        },
        {
            productCode: 'BALIMESARI',
            productName: 'Simpanan Balimesari',
            tableName: 'm_nasabah_balimesari',
            isCore: false,
            isEnabled: true,
            displayOrder: 5,
            routePath: '/simpanan/balimesari',
            icon: 'Sparkles',
            defaultInterestRate: 3.5,
            minInterestRate: 2.5,
            maxInterestRate: 6.5,
        },
        {
            productCode: 'WANAPRASTA',
            productName: 'Simpanan Wanaprasta',
            tableName: 'm_nasabah_wanaprasta',
            isCore: false,
            isEnabled: true,
            displayOrder: 6,
            routePath: '/simpanan/wanaprasta',
            icon: 'Leaf',
            defaultInterestRate: 4.5,
            minInterestRate: 3.5,
            maxInterestRate: 7.5,
        },
    ];

    for (const product of products) {
        await prisma.productConfig.upsert({
            where: { productCode: product.productCode },
            update: product,
            create: product,
        });
        console.log(`✅ ${product.productName} (${product.productCode})`);
    }

    console.log('✨ Product configuration seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
