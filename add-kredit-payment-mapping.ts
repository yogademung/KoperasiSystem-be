import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addKreditPaymentMapping() {
    try {
        // Check if mapping already exists
        const existing = await prisma.productCoaMapping.findUnique({
            where: { transType: 'KREDIT_PAYMENT' }
        });

        if (existing) {
            console.log(' KREDIT_PAYMENT mapping already exists');
            return;
        }

        // Create KREDIT_PAYMENT mapping
        // Note: Payment uses multiple debits/credits, but mapping stores the primary pair
        // Actual journal entries will include additional lines for interest and penalty
        const mapping = await prisma.productCoaMapping.create({
            data: {
                module: 'KREDIT',
                transType: 'KREDIT_PAYMENT',
                description: 'Pembayaran Kredit (Payment Receipt)',
                debitAccount: '1.01.01',   // Kas (will receive full payment)
                creditAccount: '1.20.01'   // Piutang Pinjaman (principal reduction)
            }
        });

        console.log(' KREDIT_PAYMENT mapping created:', mapping);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

addKreditPaymentMapping();
