const fs = require('fs');
const content = `DATABASE_URL="mysql://root:@localhost:3306/koperasi_system"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"`;

fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env created successfully');
