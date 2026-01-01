"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Adding Retained Earnings COA Mapping...');
    const transType = 'sys_RETAINED_EARNINGS';
    const existing = await prisma.productCoaMapping.findUnique({
        where: { transType }
    });
    if (existing) {
        console.log('Mapping already exists:', existing);
    }
    else {
        const accountCode = '3.20.01';
        const account = await prisma.journalAccount.findUnique({ where: { accountCode } });
        if (!account) {
            console.log(`Account ${accountCode} not found. Creating placeholder...`);
            await prisma.journalAccount.create({
                data: {
                    accountCode,
                    accountName: 'SHU Tahun Lalu / Ditahan',
                    accountType: 'EQT',
                    debetPoleFlag: false,
                    isActive: true,
                    createdBy: 'SYSTEM'
                }
            });
        }
        const mapping = await prisma.productCoaMapping.create({
            data: {
                module: 'ACCOUNTING',
                transType,
                description: 'Allocation of Retained Earnings (SHU Ditahan)',
                debitAccount: accountCode,
                creditAccount: accountCode
            }
        });
        console.log('Created Mapping:', mapping);
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add-retained-earnings-mapping.js.map