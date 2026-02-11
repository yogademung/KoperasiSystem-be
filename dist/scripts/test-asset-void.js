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
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const asset_service_1 = require("../src/accounting/asset/asset.service");
const accounting_service_1 = require("../src/accounting/accounting.service");
const prisma_service_1 = require("../src/database/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const assetService = app.get(asset_service_1.AssetService);
    const accountingService = app.get(accounting_service_1.AccountingService);
    const prisma = app.get(prisma_service_1.PrismaService);
    try {
        console.log('Ensuring test accounts exist...');
        const accounts = [
            { code: '99991', name: 'Test Asset', type: 'ASSET' },
            { code: '99992', name: 'Test Accum Depr', type: 'ASSET' },
            { code: '99993', name: 'Test Expense', type: 'EXPENSE' },
            { code: '99994', name: 'Test Cash', type: 'ASSET' }
        ];
        for (const acc of accounts) {
            await prisma.journalAccount.upsert({
                where: { accountCode: acc.code },
                update: {},
                create: {
                    accountCode: acc.code,
                    accountName: acc.name,
                    accountType: acc.type,
                    isActive: true
                }
            });
        }
        const assetData = {
            name: 'Test Asset Void',
            code: 'VOID-TEST-' + Date.now(),
            type: 'EQUIPMENT',
            acquisitionDate: '2024-01-01',
            acquisitionCost: 1000000,
            residualValue: 0,
            usefulLifeYears: 5,
            depreciationRate: 20,
            depreciationMethod: 'STRAIGHT_LINE',
            assetAccountId: '99991',
            accumDepreciationAccountId: '99992',
            expenseAccountId: '99993',
            sourceAccountId: '99994'
        };
        console.log('Creating asset...');
        const result = await assetService.create(assetData, 1);
        const { asset, journal } = result;
        console.log(`Asset Created: ${asset.id} (${asset.status})`);
        console.log(`Journal Created: ${journal.id}`);
        console.log('Deleting journal...');
        await accountingService.deleteJournal(journal.id, 1, 'Testing Void');
        const updatedAsset = await assetService.findOne(asset.id);
        console.log(`Updated Asset Status: ${updatedAsset.status}`);
        if (updatedAsset.status === 'INACTIVE') {
            console.log('SUCCESS: Asset is INACTIVE.');
            fs.writeFileSync(path.join(__dirname, 'test-result.txt'), 'SUCCESS: Asset is INACTIVE.');
            console.log('Cleaning up...');
            await prisma.asset.delete({ where: { id: asset.id } });
        }
        else {
            console.error('FAILED: Asset is NOT INACTIVE.');
            fs.writeFileSync(path.join(__dirname, 'test-result.txt'), `FAILED: Asset is ${updatedAsset.status}`);
        }
    }
    catch (error) {
        console.error('Test Failed:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=test-asset-void.js.map