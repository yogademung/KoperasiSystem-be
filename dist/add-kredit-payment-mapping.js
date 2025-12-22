"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function addKreditPaymentMapping() {
    try {
        const existing = await prisma.productCoaMapping.findUnique({
            where: { transType: 'KREDIT_PAYMENT' }
        });
        if (existing) {
            console.log(' KREDIT_PAYMENT mapping already exists');
            return;
        }
        const mapping = await prisma.productCoaMapping.create({
            data: {
                module: 'KREDIT',
                transType: 'KREDIT_PAYMENT',
                description: 'Pembayaran Kredit (Payment Receipt)',
                debitAccount: '1.01.01',
                creditAccount: '1.20.01'
            }
        });
        console.log(' KREDIT_PAYMENT mapping created:', mapping);
    }
    catch (error) {
        console.error('❌ Error:', error.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
addKreditPaymentMapping();
//# sourceMappingURL=add-kredit-payment-mapping.js.map