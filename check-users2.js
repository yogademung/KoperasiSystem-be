const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
async function main() {
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    console.log('password hash:', users[0].password);
    console.log('password123 matches:', await bcrypt.compare('password123', users[0].password));
    console.log('admin matches:', await bcrypt.compare('admin', users[0].password));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
