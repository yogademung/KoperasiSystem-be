"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
async function seedProductsOnly() {
    console.log('--- STARTING SURGICAL SEED: PRODUCTS & MENUS ---');
    try {
        let settingsMenu = await prisma.menu.findFirst({
            where: { menuName: 'Pengaturan' }
        });
        if (!settingsMenu) {
            settingsMenu = await prisma.menu.findFirst({
                where: { menuName: 'Settings' }
            });
        }
        if (!settingsMenu) {
            console.error('CRITICAL: Settings menu not found. Cannot proceed safely.');
            return;
        }
        console.log(`Parent Menu 'Pengaturan' ID: ${settingsMenu.id}`);
        const productMenuData = {
            menuName: 'Produk',
            path: '/settings/products',
            icon: 'Package',
            module: 'SETTINGS',
            parentId: settingsMenu.id,
            orderNum: 5,
            isActive: true,
            createdBy: 'SYSTEM'
        };
        const existingProductMenu = await prisma.menu.findFirst({
            where: { path: '/settings/products' }
        });
        if (!existingProductMenu) {
            console.log('Inserting Missing Menu: Produk...');
            const newMenu = await prisma.menu.create({ data: productMenuData });
            await prisma.menuRole.create({
                data: {
                    roleId: 1,
                    menuId: newMenu.id,
                    canRead: true,
                    canCreate: true,
                    canUpdate: true,
                    canDelete: true,
                    createdBy: 'SYSTEM'
                }
            });
            console.log('✅ Menu Config Created & Assigned to Admin');
        }
        else {
            console.log('ℹ️ Menu Config already exists.');
        }
        const products = [
            { code: 'ANGGOTA', name: 'Simpanan Anggota', table: 's_account_anggota', core: true, order: 1, icon: 'Users' },
            { code: 'TABRELA', name: 'Tabungan Sukarela', table: 's_nasabah_tab', core: false, order: 2, icon: 'Wallet' },
            { code: 'DEPOSITO', name: 'Simpanan Berjangka', table: 's_nasabah_jangka', core: false, order: 3, icon: 'PiggyBank' },
            { code: 'BRAHMACARI', name: 'Simpanan Brahmacari', table: 's_nasabah_brahmacari', core: false, order: 4, icon: 'TrendingUp' },
            { code: 'BALIMESARI', name: 'Simpanan Balimesari', table: 's_nasabah_balimesari', core: false, order: 5, icon: 'Sparkles' },
            { code: 'WANAPRASTA', name: 'Simpanan Wanaprasta', table: 's_nasabah_wanaprasta', core: false, order: 6, icon: 'Leaf' },
        ];
        for (const p of products) {
            const existing = await prisma.productConfig.findUnique({
                where: { productCode: p.code }
            });
            if (!existing) {
                console.log(`Inserting Missing Product Config: ${p.name}...`);
                await prisma.productConfig.create({
                    data: {
                        productCode: p.code,
                        productName: p.name,
                        tableName: p.table,
                        isCore: p.core,
                        isEnabled: true,
                        displayOrder: p.order,
                        icon: p.icon,
                        routePath: p.code === 'ANGGOTA' ? '/simpanan/anggota' : `/simpanan/${p.code.toLowerCase()}`,
                        defaultInterestRate: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
            }
        }
        console.log('✅ Product Configuration Seeded.');
    }
    catch (e) {
        console.error('Error during surgical seed:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedProductsOnly();
//# sourceMappingURL=seed-products-only.js.map