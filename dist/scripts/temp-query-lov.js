"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const regions = await prisma.user.findMany({
        select: { regionCode: true },
        distinct: ['regionCode'],
        where: { regionCode: { not: null } }
    });
    console.log(JSON.stringify(regions, null, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=temp-query-lov.js.map