
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const logoEntry = await prisma.lovValue.findFirst({
            where: {
                code: 'COMPANY_PROFILE',
                codeValue: 'LOGO'
            }
        });
        console.log('LOGO_PATH:', logoEntry?.description);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
