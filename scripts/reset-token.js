const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { username: 'admin' },
    data: { token: null }
  });
  console.log('Token for admin set to NULL');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
