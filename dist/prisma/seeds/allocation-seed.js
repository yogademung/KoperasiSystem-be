"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAllocationRules = seedAllocationRules;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedAllocationRules() {
    console.log('Seeding allocation rules...');
    const count = await prisma.allocationRule.count();
    if (count > 0) {
        console.log('Allocation rules already exist, skipping.');
        return;
    }
    const admin = await prisma.user.findFirst();
    if (!admin) {
        console.log('No user found');
        return;
    }
    const costCenters = await prisma.costCenter.findMany({
        where: { isActive: true },
        take: 3
    });
    if (costCenters.length < 2) {
        console.log('Not enough cost centers to seed allocation rules');
        return;
    }
    await prisma.allocationRule.create({
        data: {
            name: 'Alokasi Biaya Listrik',
            description: 'Alokasi biaya listrik berdasarkan luas area (simulasi)',
            sourceAccountCode: '5.2.01',
            allocationMethod: 'AREA',
            isActive: true,
            createdBy: admin.id,
            targets: {
                create: costCenters.map((cc, index) => ({
                    costCenterId: cc.id,
                    weight: index === 0 ? 100 : (index === 1 ? 150 : 50),
                }))
            }
        }
    });
    console.log('Created rule: Alokasi Biaya Listrik');
    await prisma.allocationRule.create({
        data: {
            name: 'Alokasi Sewa Kantor',
            description: 'Alokasi biaya sewa dibagi rata ke semua unit',
            sourceAccountCode: '5.2.02',
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
//# sourceMappingURL=allocation-seed.js.map