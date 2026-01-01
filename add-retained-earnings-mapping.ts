
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Adding Retained Earnings COA Mapping...');

    const transType = 'sys_RETAINED_EARNINGS';

    // Check if exists
    const existing = await prisma.productCoaMapping.findUnique({
        where: { transType }
    });

    if (existing) {
        console.log('Mapping already exists:', existing);
    } else {
        // Create Default Mapping
        // Using 3.20.01 for both Debit/Credit as it's the target equity account
        // (Debit if Loss, Credit if Profit)
        // Ensure account exists first
        const accountCode = '3.20.01';
        const account = await prisma.journalAccount.findUnique({ where: { accountCode } });

        if (!account) {
            console.log(`Account ${accountCode} not found. Creating placeholder...`);
            await prisma.journalAccount.create({
                data: {
                    accountCode,
                    accountName: 'SHU Tahun Lalu / Ditahan',
                    accountType: 'EQT',
                    debetPoleFlag: false, // Equity normal credit
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
