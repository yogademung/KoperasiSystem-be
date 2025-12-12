"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkMappings() {
    const keys = [
        'ANGGOTA_SETOR_POKOK',
        'ANGGOTA_SETOR_WAJIB',
        'ANGGOTA_SETOR_SUKARELA'
    ];
    const mappings = await prisma.productCoaMapping.findMany({
        where: { transType: { in: keys } }
    });
    console.log('Found Mappings:', mappings.map(m => m.transType));
    const all = await prisma.productCoaMapping.findMany();
    console.log('All TransTypes:', all.map(m => m.transType));
}
checkMappings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-mappings.js.map