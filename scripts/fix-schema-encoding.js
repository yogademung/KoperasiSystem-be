const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
const backupPath = path.join(__dirname, '../prisma/schema.prisma.backup');

console.log('🔧 Fixing Prisma schema encoding...\n');

// Backup original
fs.copyFileSync(schemaPath, backupPath);
console.log('✓ Backed up to schema.prisma.backup');

// Read file
const content = fs.readFileSync(schemaPath, 'utf8');

// Remove BOM if present
const cleanContent = content.replace(/^\uFEFF/, '');

// Write back with clean UTF-8 (no BOM)
fs.writeFileSync(schemaPath, cleanContent, { encoding: 'utf8' });

console.log('✓ Removed BOM and saved as clean UTF-8');
console.log('\n📝 File info:');
console.log(`  Path: ${schemaPath}`);
console.log(`  Size: ${fs.statSync(schemaPath).size} bytes`);
console.log(`  First char code: ${cleanContent.charCodeAt(0)} (should be 103 for 'g')`);
console.log('\n✅ Done! Try: npx prisma validate');
