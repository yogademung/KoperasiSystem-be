import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedAccounting } from './seeds/accounting-seeder';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Upsert Admin Role
    const adminRole = await prisma.role.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            roleName: 'ADMIN', // Matches schema @map('nama_role')
            description: 'Administrator',
            isActive: true,
            createdBy: 'SYSTEM',
        },
    });
    console.log({ adminRole });

    // 2. Upsert Admin User
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword, // Ensure password is correct if user exists
            isActive: true,
            roleId: 1,
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            fullName: 'Administrator',
            roleId: 1,
            isActive: true,
            createdBy: 'SYSTEM',
        },
    });
    console.log({ adminUser });

    // 3. Seed Configuration Parameters
    // Add LAST_CLOSING_MONTH setting (will be updated when first closing happens)
    const lastClosingConfig = await prisma.lovValue.upsert({
        where: { code_codeValue: { code: 'ACCOUNTING', codeValue: 'LAST_CLOSING_MONTH' } },
        update: {},
        create: {
            code: 'ACCOUNTING',
            codeValue: 'LAST_CLOSING_MONTH',
            description: null, // Will be set to period (e.g., '2024-12') when first closing happens
            orderNum: 1,
            isActive: true,
            createdBy: 'SYSTEM',
        },
    });
    console.log('Configuration parameter seeded:', lastClosingConfig);

    // 4. Seed Accounting Module
    await seedAccounting();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
