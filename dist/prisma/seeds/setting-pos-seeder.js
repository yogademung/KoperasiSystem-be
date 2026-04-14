"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingPosSeeder = settingPosSeeder;
async function settingPosSeeder(prisma) {
    console.log('📦 Seeding POS & Inventory Settings into s_lov_value...');
    const settings = [
        {
            code: 'STORE_SETTING',
            codeValue: 'AUTO_DEDUCT_STOCK',
            description: '0',
        },
        {
            code: 'STORE_SETTING',
            codeValue: 'POS_BILL_COUNTER',
            description: '1',
        }
    ];
    for (const setting of settings) {
        await prisma.lovValue.upsert({
            where: { code_codeValue: { code: setting.code, codeValue: setting.codeValue } },
            update: {},
            create: {
                ...setting,
                createdBy: 'SYSTEM'
            }
        });
    }
    console.log(`✅ Seeded ${settings.length} POS & Inventory Settings`);
}
//# sourceMappingURL=setting-pos-seeder.js.map