// Quick script to run CRUD permissions migration
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log('Running CRUD permissions migration...');

        // Read SQL file
        const sqlPath = path.join(__dirname, '../../prisma/migrations/add_crud_permissions.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');

        // Split by semicolon and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

        for (const statement of statements) {
            if (statement.toUpperCase().includes('ALTER TABLE')) {
                console.log('Executing:', statement.substring(0, 50) + '...');
                await prisma.$executeRawUnsafe(statement);
            } else if (statement.toUpperCase().includes('UPDATE')) {
                console.log('Executing:', statement.substring(0, 50) + '...');
                await prisma.$executeRawUnsafe(statement);
            }
        }

        console.log('✅ Migration completed successfully!');
        console.log('Added columns: can_create, can_read, can_update, can_delete');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
