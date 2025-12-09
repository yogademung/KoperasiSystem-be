"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function debugLogin() {
    console.log('--- Debugging Login Script ---');
    const user = await prisma.user.findUnique({
        where: { username: 'admin' },
    });
    if (!user) {
        console.log('User "admin" not found in DB!');
        return;
    }
    console.log('User found:', user.username);
    console.log('Stored Hash:', user.password);
    const candidate = 'password123';
    console.log(`Testing against password: "${candidate}"`);
    const isMatch = await bcrypt.compare(candidate, user.password);
    console.log('bcrypt.compare result:', isMatch);
    if (isMatch) {
        console.log('SUCCESS: Password matches hash.');
    }
    else {
        console.log('FAILURE: Password does NOT match hash.');
        const newHash = await bcrypt.hash(candidate, 10);
        console.log('Expected Hash (newly generated):', newHash);
    }
}
debugLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=debug-login.js.map