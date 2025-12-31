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
async function testLogin() {
    try {
        console.log('Testing login flow...');
        const user = await prisma.user.findUnique({
            where: { username: 'admin' },
            include: { role: true },
        });
        console.log('User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('User ID:', user.id);
            console.log('Username:', user.username);
            console.log('Full Name:', user.fullName);
            console.log('Is Active:', user.isActive);
            console.log('Role ID:', user.roleId);
            console.log('Role:', user.role);
        }
        if (!user) {
            console.error('User not found');
            return;
        }
        const testPassword = 'password123';
        const isPasswordValid = await bcrypt.compare(testPassword, user.password);
        console.log('Password valid:', isPasswordValid);
        if (!user.isActive) {
            console.error('User is not active');
            return;
        }
        console.log('✅ Login flow test successful!');
    }
    catch (error) {
        console.error('❌ Error during login test:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testLogin();
//# sourceMappingURL=test-login.js.map