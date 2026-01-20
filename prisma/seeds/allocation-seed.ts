import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAllocationRules() {
    console.log('Seeding allocation rules...');

    // Check if rules exist
    const count = await prisma.allocationRule.count();
    if (count > 0) {
        console.log('Allocation rules already exist, skipping.');
        return;
    }

    // Get admin user
    const admin = await prisma.user.findFirst();
    if (!admin) {
        console.log('No user found');
        return;
    }

    // Get some cost centers
    const costCenters = await prisma.costCenter.findMany({
        where: { isActive: true },
        take: 3
    });

    if (costCenters.length < 2) {
        console.log('Not enough cost centers to seed allocation rules');
        return;
    }

    // 1. Rule: Electric Bill (Area Based)
    await prisma.allocationRule.create({
        data: {
            name: 'Alokasi Biaya Listrik',
            description: 'Alokasi biaya listrik berdasarkan luas area (simulasi)',
            sourceAccountCode: '5.2.01', // Example Electricity Expense
            allocationMethod: 'AREA',
            isActive: true,
            createdBy: admin.id,
            targets: {
                create: costCenters.map((cc, index) => ({
                    costCenterId: cc.id,
                    weight: index === 0 ? 100 : (index === 1 ? 150 : 50), // Dummy area: 100m, 150m, 50m
                }))
            }
        }
    });
    console.log('Created rule: Alokasi Biaya Listrik');

    // 2. Rule: Office Rent (Equal Split)
    await prisma.allocationRule.create({
        data: {
            name: 'Alokasi Sewa Kantor',
            description: 'Alokasi biaya sewa dibagi rata ke semua unit',
            sourceAccountCode: '5.2.02', // Example Rent Expense
            allocationMethod: 'EQUAL',
            isActive: true,
            createdBy: admin.id,
            targets: {
                create: costCenters.map(cc => ({
                    costCenterId: cc.id,
                }))
            }
        }
    });
    console.log('Created rule: Alokasi Sewa Kantor');

    console.log('Allocation Rules seeded successfully');
}
