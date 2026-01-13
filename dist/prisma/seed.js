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
const bcrypt = __importStar(require("bcrypt"));
const accounting_seeder_1 = require("./seeds/accounting-seeder");
const menu_seeder_1 = require("./seeds/menu-seeder");
const product_config_seeder_1 = require("./seeds/product-config-seeder");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
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
    const businessDateConfig = await prisma.lovValue.upsert({
        where: { code_codeValue: { code: 'SYSTEM', codeValue: 'CURRENT_BUSINESS_DATE' } },
        update: {},
        create: {
            code: 'SYSTEM',
            codeValue: 'CURRENT_BUSINESS_DATE',
            description: new Date().toISOString().split('T')[0],
            orderNum: 1,
            isActive: true,
            createdBy: 'SYSTEM',
        },
    });
    console.log('Business date configuration seeded:', businessDateConfig);
    await (0, accounting_seeder_1.seedAccounting)();
    await (0, menu_seeder_1.seedMenus)();
    console.log('\n5. Seeding product configuration...');
    await (0, product_config_seeder_1.seedProductConfig)();
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
//# sourceMappingURL=seed.js.map