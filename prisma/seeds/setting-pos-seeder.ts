import { PrismaClient } from '@prisma/client';

export async function settingPosSeeder(prisma: PrismaClient) {
    console.log('📦 Seeding POS & Inventory Settings into s_lov_value...');

    const settings = [
        {
            code: 'STORE_SETTING',
            codeValue: 'AUTO_DEDUCT_STOCK',
            description: '0', // 0 = manual deduction / batching (default), 1 = real-time
        },
        {
            code: 'STORE_SETTING',
            codeValue: 'POS_BILL_COUNTER',
            description: '1', // Counter for POS transaction receipt numbers
        }
    ];

    for (const setting of settings) {
        await prisma.lovValue.upsert({
            where: { code_codeValue: { code: setting.code, codeValue: setting.codeValue } },
            update: {}, // Don't override if user already changed it
            create: {
                ...setting,
                createdBy: 'SYSTEM'
            }
        });
    }

    console.log(`✅ Seeded ${settings.length} POS & Inventory Settings`);
}
