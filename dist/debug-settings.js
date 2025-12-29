"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Checking COMPANY_PROFILE Settings ---');
    const settings = await prisma.lovValue.findMany({
        where: { code: 'COMPANY_PROFILE' }
    });
    console.log(JSON.stringify(settings, null, 2));
    console.log('--- Checking ACCOUNTING Settings ---');
    const accounting = await prisma.lovValue.findMany({
        where: { code: 'ACCOUNTING' }
    });
    console.log(JSON.stringify(accounting, null, 2));
    console.log('--- SEEDING LAST_CLOSING_MONTH ---');
    await prisma.lovValue.upsert({
        where: { code_codeValue: { code: 'COMPANY_PROFILE', codeValue: 'LAST_CLOSING_MONTH' } },
        create: {
            code: 'COMPANY_PROFILE',
            codeValue: 'LAST_CLOSING_MONTH',
            description: '2025-12',
            isActive: true,
            createdBy: 'DEBUG'
        },
        update: {
            description: '2025-12'
        }
    });
    console.log('Seeded LAST_CLOSING_MONTH = 2025-12');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=debug-settings.js.map