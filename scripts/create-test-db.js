const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupFreshDatabase() {
    console.log('🔄 Setting up fresh database for testing...\n');

    // Parse current DATABASE_URL
    const currentUrl = new URL(process.env.DATABASE_URL);
    const newDbName = 'koperasisystem_test_' + Date.now();

    // Connect to MySQL without database selection
    const rootConnection = await mysql.createConnection({
        host: currentUrl.hostname,
        port: currentUrl.port || 3306,
        user: currentUrl.username,
        password: currentUrl.password,
    });

    try {
        console.log(`Creating database: ${newDbName}`);
        await rootConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${newDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✓ Database created: ${newDbName}\n`);

        // Construct new DATABASE_URL
        const newDatabaseUrl = `mysql://${currentUrl.username}:${currentUrl.password}@${currentUrl.hostname}:${currentUrl.port || 3306}/${newDbName}`;

        console.log('─'.repeat(60));
        console.log('📝 Update your .env file:');
        console.log('─'.repeat(60));
        console.log(`DATABASE_URL="${newDatabaseUrl}"`);
        console.log('─'.repeat(60));
        console.log('\n📋 Next steps:');
        console.log('1. Update DATABASE_URL in .env');
        console.log('2. Run: npm run migrate:deploy');
        console.log('3. Run: npx prisma generate');
        console.log('4. Run: npx prisma db seed');
        console.log('5. Test: npm run start:dev');
        console.log('');
        console.log('💡 To drop this test database later:');
        console.log(`   DROP DATABASE \`${newDbName}\`;`);
        console.log('');

    } finally {
        await rootConnection.end();
    }
}

setupFreshDatabase().catch(console.error);
