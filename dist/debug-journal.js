"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const journalNo = 'MIG/2025/12/4579';
    console.log(`Inspecting Journal: ${journalNo}`);
    const journal = await prisma.postedJournal.findUnique({
        where: { journalNumber: journalNo }
    });
    if (!journal) {
        console.log('Journal NOT FOUND.');
        const similar = await prisma.postedJournal.findFirst({
            where: { journalNumber: { contains: 'MIG' } }
        });
        console.log('Sample MIG journal:', JSON.stringify(similar, null, 2));
        return;
    }
    console.log('Journal Details:', JSON.stringify(journal, null, 2));
    const period = journal.journalDate.toISOString().slice(0, 7);
    const lock = await prisma.periodLock.findUnique({
        where: { period }
    });
    console.log(`Lock for ${period}:`, JSON.stringify(lock, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=debug-journal.js.map