import { PrismaClient } from '@prisma/client';

export async function categorySeeder(prisma: PrismaClient) {
    console.log('🌱 Seeding Product Categories (Main Groups)...');

    const mainGroups = [
        { name: 'Food', description: 'Makanan Utama & Ringan' },
        { name: 'Beverage', description: 'Minuman' },
        { name: 'Other', description: 'Kebutuhan Lainnya' }
    ];

    for (const group of mainGroups) {
        const existing = await prisma.productCategory.findFirst({ where: { name: group.name } });
        if (!existing) {
            await prisma.productCategory.create({
                data: {
                    name: group.name,
                    description: group.description,
                    level: 1,
                    isActive: true,
                    createdBy: 'SYSTEM'
                }
            });
        }
    }

    console.log(`✅ Seeded ${mainGroups.length} Main Group Categories`);
}
