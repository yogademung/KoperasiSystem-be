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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma = new client_1.PrismaClient();
async function runMigration() {
    try {
        console.log('Running CRUD permissions migration...');
        const sqlPath = path.join(__dirname, '../../prisma/migrations/add_crud_permissions.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        const statements = sql
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));
        for (const statement of statements) {
            if (statement.toUpperCase().includes('ALTER TABLE')) {
                console.log('Executing:', statement.substring(0, 50) + '...');
                await prisma.$executeRawUnsafe(statement);
            }
            else if (statement.toUpperCase().includes('UPDATE')) {
                console.log('Executing:', statement.substring(0, 50) + '...');
                await prisma.$executeRawUnsafe(statement);
            }
        }
        console.log('✅ Migration completed successfully!');
        console.log('Added columns: can_create, can_read, can_update, can_delete');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
runMigration();
//# sourceMappingURL=run-crud-migration.js.map