
async function testApi() {
    const baseUrl = 'http://192.168.1.19:3001';
    console.log(`Testing API at ${baseUrl}...`);

    try {
        // 1. Login with FORCE
        console.log('1. Attempting Login FORCE (admin/password123)...');
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123',
                forceLogin: true
            })
        });

        console.log('Login Status:', loginRes.status);
        if (!loginRes.ok) {
            console.error('Login Failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('Token acquired:', token ? 'YES' : 'NO');

        if (!token) {
            console.log('Response:', JSON.stringify(loginData));
            return;
        }

        // 2. Access Protected Route: Accounts
        console.log('2. Accessing GET /accounting/accounts...');
        const accountsRes = await fetch(`${baseUrl}/accounting/accounts`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Accounts Status:', accountsRes.status);
        const accountsData = await accountsRes.json();

        if (accountsData.data && Array.isArray(accountsData.data)) {
            console.log('Accounts Count:', accountsData.data.length);
        } else {
            console.log('Accounts Response:', accountsData);
        }

        // 3. Access Mappings
        console.log('3. Accessing GET /accounting/mappings...');
        const mapRes = await fetch(`${baseUrl}/accounting/mappings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Mappings Status:', mapRes.status);
        const mapData = await mapRes.json();

        if (Array.isArray(mapData)) {
            console.log('Mappings Count:', mapData.length);
        } else {
            console.log('Mappings Response:', mapData);
        }


    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testApi();
