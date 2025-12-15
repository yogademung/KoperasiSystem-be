
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testDownload() {
    // 1. Login first to get token
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password123', forceLogin: true })
    });

    if (!loginRes.ok) {
        console.error('Login Failed:', await loginRes.text());
        return;
    }

    const data = await loginRes.json();
    console.log('Login Response:', data);
    const { accessToken } = data;
    console.log('Login Success. Token:', accessToken ? 'Received' : 'Missing');

    // 2. Test PDF Download
    console.log('Testing PDF Download...');
    const pdfRes = await fetch('http://localhost:3001/accounting/reports/simpanan/rekap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            format: 'PDF',
            regionCode: ''
        })
    });

    if (pdfRes.ok) {
        const contentType = pdfRes.headers.get('content-type');
        const buffer = await pdfRes.buffer();
        console.log(`PDF Success! Type: ${contentType}, Size: ${buffer.length} bytes`);
        fs.writeFileSync('test-report.pdf', buffer);
    } else {
        console.error('PDF Failed:', pdfRes.status, await pdfRes.text());
    }

    // 3. Test Excel Download
    console.log('Testing Excel Download...');
    const excelRes = await fetch('http://localhost:3001/accounting/reports/simpanan/rekap', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            format: 'EXCEL',
            regionCode: ''
        })
    });

    if (excelRes.ok) {
        const contentType = excelRes.headers.get('content-type');
        const buffer = await excelRes.buffer();
        console.log(`Excel Success! Type: ${contentType}, Size: ${buffer.length} bytes`);
        fs.writeFileSync('test-report.xlsx', buffer);
    } else {
        console.error('Excel Failed:', excelRes.status, await excelRes.text());
    }
}

testDownload();
