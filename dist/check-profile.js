"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const logoEntry = await prisma.lovValue.findFirst({
            where: {
                code: 'COMPANY_PROFILE',
                codeValue: 'LOGO'
            }
        });
        console.log('LOGO_PATH:', logoEntry?.description);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=check-profile.js.map