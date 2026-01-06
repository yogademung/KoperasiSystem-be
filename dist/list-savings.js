"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const tabs = await prisma.nasabahTab.findMany({ take: 5 });
    console.log('Tabrela Accounts:', tabs.map(t => t.noTab));
    const balimesari = await prisma.nasabahBalimesari.findMany({ take: 5 });
    console.log('Balimesari Accounts:', balimesari.map(b => b.noBalimesari));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=list-savings.js.map