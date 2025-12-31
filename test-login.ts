// Quick debug script to test auth login

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
    try {
        console.log('Testing login flow...');

        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { username: 'admin' },
            include: { role: true },
        });

        console.log('User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('User ID:', user.id);
            console.log('Username:', user.username);
            console.log('Full Name:', user.fullName);
            console.log('Is Active:', user.isActive);
            console.log('Role ID:', user.roleId);
            console.log('Role:', user.role);
        }

        if (!user) {
            console.error('User not found');
            return;
        }

        // 2. Test password
        const testPassword = 'password123';
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!user.isActive) {
            console.error('User is not active');
            return;
        }

        console.log('✅ Login flow test successful!');
    } catch (error) {
        console.error('❌ Error during login test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
