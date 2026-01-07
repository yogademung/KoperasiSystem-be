
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const validLogo = '/uploads/logo/file-1766474013257-971196573.png';
    try {
        const minirevert = await prisma.lovValue.updateMany({
            where: {
                code: 'COMPANY_PROFILE',
                codeValue: 'LOGO'
            },
            data: {
                description: validLogo,
                updatedAt: new Date(),
                updatedBy: 'SYSTEM_FIX'
            }
        });
        console.log('Updated records:', minirevert.count);
        console.log('Set logo to:', validLogo);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
