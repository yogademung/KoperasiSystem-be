import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedCollectorRole() {
    console.log('🌱 Seeding COLLECTOR role...');

    try {
        // Create COLLECTOR role
        const collectorRole = await prisma.role.upsert({
            where: { id: 3 },
            update: {
                roleName: 'COLLECTOR',
                description: 'Kolektor Lapangan - Field Collection',
                isActive: true
            },
            create: {
                id: 3,
                roleName: 'COLLECTOR',
                description: 'Kolektor Lapangan - Field Collection',
                isActive: true,
                createdBy: 'SYSTEM'
            }
        });

        console.log('✅ COLLECTOR role created:', collectorRole);

        // Create sample collector user (for testing)
        const hashedPassword = await bcrypt.hash('collector123', 10);

        const collectorUser = await prisma.user.upsert({
            where: { username: 'collector1' },
            update: {
                password: hashedPassword,
                fullName: 'Kolektor Lapangan 1',
                roleId: 3,
                isActive: true
            },
            create: {
                username: 'collector1',
                password: hashedPassword,
                fullName: 'Kolektor Lapangan 1',
                roleId: 3,
                isActive: true,
                createdBy: 'SYSTEM'
            }
        });

        console.log('✅ Sample collector user created:', collectorUser);
        console.log('\n📝 Login credentials:');
        console.log('   Username: collector1');
        console.log('   Password: collector123');

    } catch (error) {
        console.error('❌ Error seeding collector:', error);
        throw error;
    }
}

// Run seeder
seedCollectorRole()
    .then(() => {
        console.log('\n✅ Collector seeding completed');
        process.exit(0);
    })
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
