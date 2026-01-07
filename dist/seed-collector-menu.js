"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log('Starting seed for Collector Menu...');
        let shiftMenu = await prisma.menu.findFirst({
            where: { path: '/collector' }
        });
        if (!shiftMenu) {
            console.log('Creating Shift Harian menu...');
            shiftMenu = await prisma.menu.create({
                data: {
                    menuName: 'Shift Harian',
                    path: '/collector',
                    icon: 'Clock',
                    module: 'SIMPANAN',
                    orderNum: 5,
                    isActive: true
                }
            });
        }
        else {
            console.log('Shift Harian menu already exists.');
        }
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
            }
            else {
                console.log('Menu already assigned to COLLECTOR role.');
            }
        }
        else {
            console.warn('COLLECTOR role not found!');
        }
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
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=seed-collector-menu.js.map