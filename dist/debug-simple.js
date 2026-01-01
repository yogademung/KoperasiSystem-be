"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const j = await prisma.postedJournal.findUnique({ where: { journalNumber: 'MIG/2025/12/4579' } });
    if (j)
        console.log(`POSTING_TYPE: ${j.postingType}`);
    else
        console.log('NOT_FOUND');
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=debug-simple.js.map