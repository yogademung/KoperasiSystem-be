import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function debugLogin() {
    console.log('--- Debugging Login Script ---');

    // 1. Fetch User
    const user = await prisma.user.findUnique({
        where: { username: 'admin' },
    });

    if (!user) {
        console.log('User "admin" not found in DB!');
        return;
    }

    console.log('User found:', user.username);
    console.log('Stored Hash:', user.password);

    // 2. Test Compare
    const candidate = 'password123';
    console.log(`Testing against password: "${candidate}"`);

    const isMatch = await bcrypt.compare(candidate, user.password);
    console.log('bcrypt.compare result:', isMatch);

    if (isMatch) {
        console.log('SUCCESS: Password matches hash.');
    } else {
        console.log('FAILURE: Password does NOT match hash.');

        // Generate what it SHOULD be
        const newHash = await bcrypt.hash(candidate, 10);
        console.log('Expected Hash (newly generated):', newHash);
    }
}

debugLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
