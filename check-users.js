const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in DB:', users.map(u => ({ username: u.username, role: u.role, is_active: u.isActive })));
  
  // also check if "LovValue" has KOPERASI_CODE
  const kode = await prisma.lovValue.findUnique({ where: { code_codeValue: { code: 'COMPANY_PROFILE', codeValue: 'NAME' } } });
  console.log('Koperasi Name:', kode);
}
main().catch(console.error).finally(() => prisma.$disconnect());
