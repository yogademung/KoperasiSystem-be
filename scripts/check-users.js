const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('Users in DB:');
  users.forEach(u => console.log(`- ${u.username} (Role: ${u.role?.roleName}, Active: ${u.isActive}, Token: ${u.token ? 'exists' : 'null'})`));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
