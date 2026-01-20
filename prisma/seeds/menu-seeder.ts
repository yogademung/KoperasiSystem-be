// Menu Seeder for Production Migration
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMenus() {
    console.log('🌱 Seeding menu data...');

    const menus = [
        // Main Section
        { id: 1, menuName: 'Dashboard', path: '/dashboard', icon: 'Home', module: 'MAIN', orderNum: 1, parentId: null },
        { id: 2, menuName: 'Nasabah', path: '/nasabah', icon: 'Users', module: 'MAIN', orderNum: 2, parentId: null },

        // Simpanan Section
        { id: 3, menuName: 'Simpanan', path: '/simpanan', icon: 'Wallet', module: 'SIMPANAN', orderNum: 3, parentId: null },
        { id: 31, menuName: 'Anggota', path: '/simpanan/anggota', module: 'SIMPANAN', orderNum: 1, parentId: 3 },
        { id: 32, menuName: 'Tabungan Sukarela', path: '/simpanan/tabrela', module: 'SIMPANAN', orderNum: 2, parentId: 3 },
        { id: 33, menuName: 'Deposito', path: '/simpanan/deposito', module: 'SIMPANAN', orderNum: 3, parentId: 3 },
        { id: 34, menuName: 'Brahmacari', path: '/simpanan/brahmacari', module: 'SIMPANAN', orderNum: 4, parentId: 3 },
        { id: 35, menuName: 'Bali Mesari', path: '/simpanan/balimesari', module: 'SIMPANAN', orderNum: 5, parentId: 3 },
        { id: 36, menuName: 'Wanaprasta', path: '/simpanan/wanaprasta', module: 'SIMPANAN', orderNum: 6, parentId: 3 },
        { id: 37, menuName: 'Simulasi & Tools', path: '/simpanan/simulasi', module: 'SIMPANAN', orderNum: 7, parentId: 3 },

        // Kredit
        { id: 4, menuName: 'Kredit', path: '/kredit', icon: 'CreditCard', module: 'KREDIT', orderNum: 4, parentId: null },

        // Shift Harian (Collector)
        { id: 9, menuName: 'Shift Harian', path: '/dashboard', icon: 'Clock', module: 'COLLECTOR', orderNum: 4.5, parentId: null },

        // Modal
        { id: 5, menuName: 'Manajemen Modal', path: '/capital', module: 'ACCOUNTING', orderNum: 2, parentId: 6 },

        // Akuntansi Section
        { id: 6, menuName: 'Akuntansi', path: '/accounting', icon: 'PieChart', module: 'ACCOUNTING', orderNum: 6, parentId: null },
        // { id: 61, menuName: 'Master Akun', path: '/accounting/accounts', module: 'ACCOUNTING', orderNum: 1, parentId: 6 }, // MOVED TO SETTINGS
        // { id: 62, menuName: 'Konfigurasi Mapping', path: '/accounting/config/mappings', module: 'ACCOUNTING', orderNum: 2, parentId: 6 }, // MOVED TO SETTINGS
        { id: 63, menuName: 'Jurnal Umum', path: '/accounting/journals', module: 'ACCOUNTING', orderNum: 3, parentId: 6 },
        { id: 64, menuName: 'Jurnal Terhapus', path: '/accounting/deleted-journals', module: 'ACCOUNTING', orderNum: 4, parentId: 6 },
        { id: 65, menuName: 'Journal List', path: '/accounting/reports', module: 'ACCOUNTING', orderNum: 5, parentId: 6 },
        { id: 66, menuName: 'Manajemen Aset', path: '/accounting/assets', module: 'ACCOUNTING', orderNum: 6, parentId: 6 },
        { id: 67, menuName: 'Depresiasi Bulanan', path: '/accounting/depreciation', module: 'ACCOUNTING', orderNum: 7, parentId: 6 },
        { id: 68, menuName: 'Penutupan Periode', path: '/accounting/closing', module: 'ACCOUNTING', orderNum: 8, parentId: 6 },
        { id: 902, menuName: 'Mutasi Antar Unit', path: '/business-units/transactions', module: 'ACCOUNTING', orderNum: 10, parentId: 6 },

        // Laporan Section
        { id: 7, menuName: 'Laporan', path: '/laporan', icon: 'FileText', module: 'LAPORAN', orderNum: 7, parentId: null },
        { id: 71, menuName: 'Template Laporan', path: '/laporan/templates', module: 'LAPORAN', orderNum: 1, parentId: 7 },
        { id: 72, menuName: 'Generator Laporan', path: '/laporan', module: 'LAPORAN', orderNum: 2, parentId: 7 },
        { id: 73, menuName: 'Laporan Harian', path: '/accounting/reports/daily-transaction', module: 'LAPORAN', orderNum: 3, parentId: 7 },

        // Pengaturan Section
        { id: 8, menuName: 'Pengaturan', path: '/settings', icon: 'Settings', module: 'SETTINGS', orderNum: 8, parentId: null },
        { id: 81, menuName: 'Profil Koperasi', path: '/settings/profile', module: 'SETTINGS', orderNum: 1, parentId: 8 },
        { id: 61, menuName: 'Master Akun', path: '/accounting/accounts', module: 'SETTINGS', orderNum: 1.5, parentId: 8 },
        { id: 82, menuName: 'Manajemen User', path: '/users', module: 'SETTINGS', orderNum: 2, parentId: 8 },
        { id: 83, menuName: 'Migrasi Data', path: '/settings/migration', module: 'SETTINGS', orderNum: 3, parentId: 8 },
        { id: 84, menuName: 'Produk', path: '/settings/products', module: 'SETTINGS', orderNum: 4, parentId: 8 },
        { id: 89, menuName: 'Konfigurasi Mapping', path: '/accounting/config/mappings', icon: 'FileText', module: 'SETTINGS', orderNum: 9, parentId: 8 },

        { id: 85, menuName: 'Master Unit Kerja', path: '/settings/business-units', module: 'SETTINGS', orderNum: 5, parentId: 8 },
        { id: 91, menuName: 'Cost Centers', path: '/cost-centers', module: 'SETTINGS', orderNum: 6, parentId: 8 },

        // Phase 13: Budget & Allocation
        { id: 100, menuName: 'Anggaran', path: '#', icon: 'DollarSign', module: 'SETTINGS', orderNum: 7, parentId: 8 },
        { id: 101, menuName: 'Periode Anggaran', path: '/budget/periods', module: 'SETTINGS', orderNum: 1, parentId: 100 },
        { id: 102, menuName: 'Input Anggaran', path: '/budget/entries', module: 'SETTINGS', orderNum: 2, parentId: 100 },
        { id: 103, menuName: 'Pantau Anggaran', path: '/budget/variance', module: 'SETTINGS', orderNum: 3, parentId: 100 },

        { id: 110, menuName: 'Aturan Alokasi', path: '#', icon: 'PieChart', module: 'SETTINGS', orderNum: 8, parentId: 8 },
        { id: 111, menuName: 'Daftar Aturan', path: '/allocations/rules', module: 'SETTINGS', orderNum: 1, parentId: 110 },
        { id: 112, menuName: 'Jalankan Alokasi', path: '/allocations/execute', module: 'SETTINGS', orderNum: 2, parentId: 110 },
        { id: 113, menuName: 'Riwayat Alokasi', path: '/allocations/history', module: 'SETTINGS', orderNum: 3, parentId: 110 },
    ];

    // Insert menus
    for (const menu of menus) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { icon, ...menuData } = menu;

        await prisma.menu.upsert({
            where: { id: menu.id },
            update: menu,
            create: {
                ...menu,
                isActive: true,
                createdBy: 'system',
                createdAt: new Date(),
            },
        });
    }

    console.log(`✅ Created/Updated ${menus.length} menus`);

    // Remove deprecated menus if they exist
    const deprecatedIds = [62, 90, 901, 911, 912];

    // cleanup dependants
    await prisma.menuRole.deleteMany({
        where: { menuId: { in: deprecatedIds } }
    });

    await prisma.menu.deleteMany({
        where: {
            id: { in: deprecatedIds }
        }
    });

    // 1. ADMIN ROLE ASSIGNMENT
    const adminRole = await prisma.role.findFirst({ where: { roleName: 'ADMIN' } });
    if (adminRole) {
        console.log('📋 Assigning menus to ADMIN role...');
        await prisma.menuRole.deleteMany({ where: { roleId: adminRole.id } });
        const menuRoles = menus.map(menu => ({
            roleId: adminRole.id,
            menuId: menu.id,
            canCreate: true, canRead: true, canUpdate: true, canDelete: true,
        }));
        await prisma.menuRole.createMany({ data: menuRoles });
        console.log(`✅ Assigned ${menuRoles.length} menus to ADMIN`);
    }

    // 2. COLLECTOR ROLE ASSIGNMENT
    const collectorRole = await prisma.role.upsert({
        where: { id: 2 },
        update: {},
        create: {
            id: 2,
            roleName: 'COLLECTOR',
            description: 'Petugas Pungut',
            isActive: true,
            createdBy: 'SYSTEM'
        }
    });

    if (collectorRole) {
        console.log('📋 Assigning menus to COLLECTOR role...');
        // Grant Collector access to Dashboard, Nasabah, Simpanan, Kredit, and Shift Harian
        // IDs: 1 (Dashboard), 2 (Nasabah)
        // IDs: 3 (Simpanan), 31-36 (Submenus)
        // IDs: 4 (Kredit)
        // IDs: 9 (Shift Harian)
        // IDs: 73 (Laporan Harian - optional/useful)

        const collectorMenuIds = [1, 2, 3, 31, 32, 33, 34, 35, 36, 4, 9]; // Include Shift Harian (ID 9)
        const collectorMenus = menus.filter(m => collectorMenuIds.includes(m.id));

        // Delete existing
        await prisma.menuRole.deleteMany({ where: { roleId: collectorRole.id } });

        const menuRoles = collectorMenus.map(menu => ({
            roleId: collectorRole.id,
            menuId: menu.id,
            canCreate: true, canRead: true, canUpdate: true, canDelete: false,
        }));

        await prisma.menuRole.createMany({ data: menuRoles });
        console.log(`✅ Assigned ${menuRoles.length} menus to COLLECTOR`);
    }
}
