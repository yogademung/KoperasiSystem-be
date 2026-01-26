import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedAccounting } from './seeds/accounting-seeder';
import { seedMenus } from './seeds/menu-seeder';
import { seedProductConfig } from './seeds/product-config-seeder';
import { seedAllocationRules } from './seeds/allocation-seed';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');



    // 1. Upsert Admin Role
    const adminRole = await prisma.role.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            roleName: 'ADMIN',
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
            password: hashedPassword,
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
    const lastClosingConfig = await prisma.lovValue.upsert({
        where: { code_codeValue: { code: 'ACCOUNTING', codeValue: 'LAST_CLOSING_MONTH' } },
        update: {},
        create: {
            code: 'ACCOUNTING',
            codeValue: 'LAST_CLOSING_MONTH',
            description: null,
            orderNum: 1,
            isActive: true,
            createdBy: 'SYSTEM',
        },
    });
    console.log('Configuration parameter seeded:', lastClosingConfig);

    // 4. Seed System Business Date (for date lock mechanism)
    const businessDateConfig = await prisma.lovValue.upsert({
        where: { code_codeValue: { code: 'SYSTEM', codeValue: 'CURRENT_BUSINESS_DATE' } },
        update: {},
        create: {
            code: 'SYSTEM',
            codeValue: 'CURRENT_BUSINESS_DATE',
            description: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            orderNum: 1,
            isActive: true,
            createdBy: 'SYSTEM',
        },
    });
    console.log('Business date configuration seeded:', businessDateConfig);

    // 5. Seed Idle Timeout Config
    const idleTimeoutConfig = await prisma.lovValue.upsert({
        where: { code_codeValue: { code: 'COMPANY_PROFILE', codeValue: 'IDLE_TIMEOUT' } },
        update: {},
        create: {
            code: 'COMPANY_PROFILE',
            codeValue: 'IDLE_TIMEOUT',
            description: '15',
            orderNum: 0,
            isActive: true,
            createdBy: 'SYSTEM',
        },
    });
    console.log('Idle timeout configuration seeded:', idleTimeoutConfig);

    // 5. Seed Accounting Module
    await seedAccounting();

    // 6. Seed Menus (Phase 10)
    await seedMenus();

    // 5. Seed Product Configuration
    // TODO: Re-enable after Prisma client regenerated
    console.log('\n5. Seeding product configuration...');
    await seedProductConfig();

    console.log('\n8. Seeding allocation rules...');
    await seedAllocationRules();

    console.log('\n✅ Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
