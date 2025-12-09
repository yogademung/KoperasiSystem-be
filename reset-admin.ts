import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function reset() {
    console.log('Resetting Admin User...');

    // 1. Delete existing admin
    await prisma.user.deleteMany({
        where: { username: 'admin' }
    });

    // 2. Create new
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated Hash:', hashedPassword);

    await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            fullName: 'Administrator',
            roleId: 1,
            isActive: true,
            createdBy: 'RESET_SCRIPT'
        }
    });

    // 3. Verify immediately
    const saved = await prisma.user.findUnique({ where: { username: 'admin' } });
    const match = await bcrypt.compare(password, saved?.password || '');
    console.log('Immediate Verification Match:', match);
}

reset()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
