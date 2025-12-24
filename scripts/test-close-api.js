
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3001/api';
// Assumed user 1 exists, customer 1 exists (from seeds)
const CUSTOMER_ID = 1;

async function runTest() {
    console.log('🚀 Starting Anggota Close Test...');

    // 1. Create New Anggota Account
    console.log('\nCreating new Anggota account...');
    let createRes;
    try {
        createRes = await fetch(`${BASE_URL}/simpanan/anggota`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: CUSTOMER_ID,
                principal: 100000,
                mandatoryInit: 25000,
                regionCode: '01', // Denpasar ?
                groupCode: 'C01',
                remark: 'Test Account for Closure'
            })
        });
    } catch (err) {
        console.error('Fetch Error:', err);
        return;
    }

    if (!createRes.ok) {
        const txt = await createRes.text();
        console.error('Failed to create account:', createRes.status, txt);
        // If it fails because "Account already exists" (unlikely with new sequence logic, but possibly customer uniqueness constraint), try to find one?
        // But Anggota is usually 1 per customer.
        // Let's assume seeded customers are available or customer 1 doesn't have one yet or allows multiple (schema: NO_ANGGOTA is PK, customerId is FK non-unique? Check schema.)
        // Schema: customerId Int @map("NASABAH_ID"), customer Nasabah. No unique constraint on customerId in AnggotaAccount model.
        return;
    }

    const account = await createRes.json();
    console.log('✅ Account Created:', account.accountNumber);
    console.log('   Principal:', account.principal);
    console.log('   Balance:', account.balance);

    // 2. Add some transactions (Penalty test needs balance > penalty)
    // 100k principal + 25k mandatory. Total balance should be 125k or similar depending on implementation.
    // If balance is 0 initially (only principal stored separately), we might need to Deposit.
    // But my previous check showed createTransaction adds to balance.
    // Let's check balance from response.

    // 3. Close Account with Penalty
    console.log(`\nClosing Account ${account.accountNumber}...`);
    const closeRes = await fetch(`${BASE_URL}/simpanan/anggota/${account.accountNumber}/tutup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            reason: 'Testing Procedure',
            penaltyAmount: 5000,
            adminFee: 2000
        })
    });

    if (!closeRes.ok) {
        const json = await closeRes.json();
        console.error('Failed to close account:', closeRes.status, json.message);
        return;
    }

    const closeResult = await closeRes.json();
    console.log('✅ Account Closed:', closeResult);

    // 4. Verify Journals via API (if possible) or just trust logs.
    // I can fetch transactions to see if they were created.
    const transRes = await fetch(`${BASE_URL}/simpanan/anggota/${account.accountNumber}/transactions`);
    const transactions = await transRes.json();

    console.log('\nTransaction History:');
    if (transactions.data) {
        transactions.data.forEach(t => {
            console.log(` - [${t.transType}] Amount: ${t.amount} | Bal: ${t.balanceAfter} | Desc: ${t.description}`);
        });
    }

    console.log('\nDone.');
}

runTest();
