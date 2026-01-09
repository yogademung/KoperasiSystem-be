const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function deployMigrations() {
    console.log('🚀 Starting migration deployment...\n');

    // Load environment variables
    require('dotenv').config();

    // Parse DATABASE_URL or use individual vars
    let dbConfig;
    if (process.env.DATABASE_URL) {
        // Parse mysql://user:password@host:port/database
        const url = new URL(process.env.DATABASE_URL);
        dbConfig = {
            host: url.hostname,
            port: url.port || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            multipleStatements: true
        };
    } else {
        dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'koperasisystem_koperasi',
            multipleStatements: true
        };
    }

    const connection = await mysql.createConnection(dbConfig);

    try {
        console.log(`✓ Connected to database: ${dbConfig.database}`); console.log('');

        // Ensure migrations table exists
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`_prisma_migrations\` (
        \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
        \`checksum\` VARCHAR(64) NOT NULL,
        \`finished_at\` DATETIME(3),
        \`migration_name\` VARCHAR(255) NOT NULL,
        \`logs\` TEXT,
        \`rolled_back_at\` DATETIME(3),
        \`started_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`applied_steps_count\` INT UNSIGNED NOT NULL DEFAULT 0
      )
    `);
        console.log('✓ Migration tracking table ready\n');

        // Get list of migrations
        const migrationsDir = path.join(__dirname, '../prisma/migrations');
        const migrations = fs.readdirSync(migrationsDir)
            .filter(f => {
                const fullPath = path.join(migrationsDir, f);
                return fs.statSync(fullPath).isDirectory();
            })
            .sort();

        console.log(`Found ${migrations.length} migration(s)\n`);

        let appliedCount = 0;
        let skippedCount = 0;

        for (const migrationName of migrations) {
            // Check if already applied
            const [existing] = await connection.execute(
                'SELECT migration_name FROM _prisma_migrations WHERE migration_name = ? AND rolled_back_at IS NULL',
                [migrationName]
            );

            if (existing.length > 0) {
                console.log(`⏭️  ${migrationName} (already applied)`);
                skippedCount++;
                continue;
            }

            // Read migration SQL
            const sqlPath = path.join(migrationsDir, migrationName, 'migration.sql');
            if (!fs.existsSync(sqlPath)) {
                console.log(`⚠️  ${migrationName} (no migration.sql found)`);
                continue;
            }

            const sql = fs.readFileSync(sqlPath, 'utf8');
            const checksum = crypto.createHash('sha256').update(sql).digest('hex');
            const migrationId = crypto.randomUUID();

            console.log(`⏳ Applying ${migrationName}...`);

            try {
                // Execute migration
                await connection.query(sql);

                // Record migration
                await connection.execute(`
          INSERT INTO _prisma_migrations 
          (id, checksum, migration_name, finished_at, applied_steps_count)
          VALUES (?, ?, ?, NOW(3), 1)
        `, [migrationId, checksum, migrationName]);

                console.log(`✅ ${migrationName} - SUCCESS\n`);
                appliedCount++;
            } catch (error) {
                console.error(`❌ ${migrationName} - FAILED`);
                console.error(`   Error: ${error.message}\n`);

                // Record failure
                await connection.execute(`
          INSERT INTO _prisma_migrations 
          (id, checksum, migration_name, started_at, logs)
          VALUES (?, ?, ?, NOW(3), ?)
        `, [migrationId, checksum, migrationName, error.message]);

                throw error;
            }
        }

        console.log('─'.repeat(50));
        console.log(`✓ Migration deployment complete`);
        console.log(`  Applied: ${appliedCount}`);
        console.log(`  Skipped: ${skippedCount}`);
        console.log(`  Total: ${migrations.length}`);
        console.log('─'.repeat(50));

    } catch (error) {
        console.error('\n❌ Migration deployment failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run
deployMigrations()
    .then(() => {
        console.log('\n✓ Done');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n✗ Failed');
        process.exit(1);
    });
