import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPeriodLock() {
  console.log('\n=== TESTING PERIOD LOCK LOGIC ===\n');

  // 1. Check LAST_CLOSING_MONTH value
  const lastClosingRec = await prisma.lovValue.findUnique({
    where: { code_codeValue: { code: 'COMPANY_PROFILE', codeValue: 'LAST_CLOSING_MONTH' } }
  });
  
  console.log('1. LAST_CLOSING_MONTH from DB:');
  console.log(JSON.stringify(lastClosingRec, null, 2));
  const lastClosingMonth = lastClosingRec?.description || null;
  console.log(`   Value: "${lastClosingMonth}"\n`);

  // 2. Test comparison logic
  const testPeriods = ['2025-11', '2025-12', '2026-01'];
  
  console.log('2. Testing period comparisons:');
  for (const period of testPeriods) {
    const shouldBeLocked = lastClosingMonth && period <= lastClosingMonth;
    console.log(`   Period: ${period}`);
    console.log(`   ${period} <= ${lastClosingMonth} = ${shouldBeLocked ? 'TRUE (LOCKED)' : 'FALSE (UNLOCKED)'}\n`);
  }

  // 3. Check for actual lock records in DB
  console.log('3. Checking PeriodLock table:');
  const locks = await prisma.periodLock.findMany({
    orderBy: { period: 'desc' },
    take: 5
  });
  console.log(`   Found ${locks.length} lock records:`);
  locks.forEach(lock => {
    console.log(`   - ${lock.period}: ${lock.status}`);
  });

  console.log('\n=== TEST COMPLETE ===\n');
}

testPeriodLock()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
