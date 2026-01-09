const mysql = require('mysql2/promise');

async function migrationStatus() {
    require('dotenv').config();

    // Parse DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    const connection = await mysql.createConnection({
        host: url.hostname,
        port: url.port || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
    });

    try {
        const [migrations] = await connection.execute(`
      SELECT 
        migration_name,
        started_at,
        finished_at,
        rolled_back_at,
        CASE 
          WHEN rolled_back_at IS NOT NULL THEN 'ROLLED BACK'
          WHEN finished_at IS NOT NULL THEN 'APPLIED'
          ELSE 'FAILED'
        END as status
      FROM _prisma_migrations
      ORDER BY started_at DESC
    `);

        console.log('\n📋 Migration Status\n');
        console.log('─'.repeat(80));
        console.log(
            'Migration Name'.padEnd(40) +
            'Status'.padEnd(15) +
            'Applied At'
        );
        console.log('─'.repeat(80));

        for (const m of migrations) {
            const status = m.status === 'APPLIED' ? '✅' :
                m.status === 'ROLLED BACK' ? '↩️' : '❌';
            console.log(
                m.migration_name.padEnd(40) +
                `${status} ${m.status}`.padEnd(15) +
                (m.finished_at ? new Date(m.finished_at).toLocaleString('id-ID') : '-')
            );
        }

        console.log('─'.repeat(80));
        console.log(`\nTotal migrations: ${migrations.length}`);
        console.log(`Applied: ${migrations.filter(m => m.status === 'APPLIED').length}`);
        console.log(`Failed: ${migrations.filter(m => m.status === 'FAILED').length}`);
        console.log(`Rolled back: ${migrations.filter(m => m.status === 'ROLLED BACK').length}`);
        console.log('');

    } finally {
        await connection.end();
    }
}

migrationStatus().catch(console.error);
