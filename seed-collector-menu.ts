
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting seed for Collector Menu...');

        // 1. Ensure 'Shift Harian' menu exists
        let shiftMenu = await prisma.menu.findFirst({
            where: { path: '/collector' }
        });

        if (!shiftMenu) {
            console.log('Creating Shift Harian menu...');
            // Find a suitable orderNum (e.g. after existing menus)
            // For simplicity, using a hardcoded high number or finding max
            shiftMenu = await prisma.menu.create({
                data: {
                    menuName: 'Shift Harian',
                    path: '/collector',
                    // Assuming 'Clock' icon or similar, passing string for now if icon is string in DB
                    // Update: schema for icon is likely string.
                    icon: 'Clock',
                    module: 'SIMPANAN', // Or appropriate module
                    orderNum: 5, // Adjust as needed
                    isActive: true
                }
            });
        } else {
            console.log('Shift Harian menu already exists.');
        }

        // 2. Assign to COLLECTOR role
        const collectorRole = await prisma.role.findFirst({
            where: { roleName: 'COLLECTOR' }
        });

        if (collectorRole) {
            const existingAssignment = await prisma.menuRole.findFirst({
                where: {
                    roleId: collectorRole.id,
                    menuId: shiftMenu.id
                }
            });

            if (!existingAssignment) {
                console.log('Assigning menu to COLLECTOR role...');
                await prisma.menuRole.create({
                    data: {
                        roleId: collectorRole.id,
                        menuId: shiftMenu.id,
                        canRead: true,
                        canCreate: true,
                        canUpdate: true,
                        canDelete: false
                    }
                });
            } else {
                console.log('Menu already assigned to COLLECTOR role.');
            }
        } else {
            console.warn('COLLECTOR role not found!');
        }

        // 3. Assign to ADMIN role as well
        const adminRole = await prisma.role.findFirst({
            where: { roleName: 'ADMIN' }
        });

        if (adminRole) {
            const existingAssignment = await prisma.menuRole.findFirst({
                where: {
                    roleId: adminRole.id,
                    menuId: shiftMenu.id
                }
            });

            if (!existingAssignment) {
                console.log('Assigning menu to ADMIN role...');
                await prisma.menuRole.create({
                    data: {
                        roleId: adminRole.id,
                        menuId: shiftMenu.id,
                        canRead: true,
                        canCreate: true,
                        canUpdate: true,
                        canDelete: true
                    }
                });
            }
        }


        console.log('Seed completed.');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
