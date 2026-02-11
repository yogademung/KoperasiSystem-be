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
const prisma_service_1 = require("../src/database/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const assetService = app.get(asset_service_1.AssetService);
    const prisma = app.get(prisma_service_1.PrismaService);
    const logFile = path.join(__dirname, 'test-asset-full-cycle-result.txt');
    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };
    fs.writeFileSync(logFile, 'STARTING TEST\n');
    try {
        log('1. Creating Asset (Expect Auto Code & Hutang Default)...');
        const dto = {
            name: 'Test Asset Lifecycle',
            code: 'AUTO',
            type: 'INVENTARIS',
            acquisitionDate: new Date().toISOString(),
            acquisitionCost: 12000000,
            residualValue: 2000000,
            usefulLifeYears: 5,
            depreciationRate: 20,
            depreciationMethod: 'STRAIGHT_LINE',
            assetAccountId: '1.30.02',
            accumDepreciationAccountId: '1.30.99',
            expenseAccountId: '5.30.02',
        };
        const { asset, journal: createdJournal } = await assetService.create(dto, 1);
        log(`CREATED Asset: ${asset.code} (ID: ${asset.id})`);
        const journal = await prisma.postedJournal.findUnique({
            where: { id: createdJournal.id },
            include: { details: true }
        });
        if (!journal)
            throw new Error('Journal not found');
        if (asset.code.startsWith('ASSET-')) {
            log('SUCCESS: Code Auto-Generated.');
        }
        else {
            log('FAILED: Code not auto-generated.');
        }
        const creditEntry = journal.details.find(d => Number(d.credit) > 0);
        if (creditEntry?.accountCode === '2.20.04') {
            log('SUCCESS: Default Source is Hutang Pembelian Aset (2.20.04).');
        }
        else {
            log(`FAILED: Source is ${creditEntry?.accountCode}, expected 2.20.04.`);
        }
        log('--------------------------------------------------');
        log('2. Paying Asset Purchase...');
        const paymentRes = await assetService.payAssetPurchase({
            assetId: asset.id,
            paymentAccountId: '1.01.01',
            amount: 12000000,
            userId: 1
        });
        if (paymentRes.id) {
            const paymentJournal = await prisma.postedJournal.findUnique({
                where: { id: paymentRes.id },
                include: { details: true }
            });
            if (paymentJournal) {
                log(`SUCCESS: Payment Journal Posted (ID: ${paymentJournal.id}, No: ${paymentJournal.journalNumber}).`);
            }
            else {
                log('FAILED: Payment Journal found in DB is null.');
            }
        }
        else {
            log('FAILED: Payment Journal ID missing in response.');
        }
        log('--------------------------------------------------');
        log('3. Running Depreciation (Simulate 1 Month)...');
        log('4. Disposing Asset (Gain Scenario)...');
        const disposalRes = await assetService.disposeAsset({
            assetId: asset.id,
            saleAmount: 13000000,
            paymentAccountId: '1.01.01',
            userId: 1
        });
        if (disposalRes.journal) {
            const disposalJournal = await prisma.postedJournal.findUnique({
                where: { id: disposalRes.journal.id },
                include: { details: true }
            });
            if (disposalJournal) {
                log(`DISPOSED Journal ID: ${disposalJournal.id}`);
            }
        }
        log(`Calculated Gain/Loss: ${disposalRes.gainLoss}`);
        const updatedAsset = await prisma.asset.findUnique({ where: { id: asset.id } });
        if (updatedAsset?.status === 'DISPOSED') {
            log('SUCCESS: Asset Status is DISPOSED.');
        }
        else {
            log(`FAILED: Asset Status is ${updatedAsset?.status}.`);
        }
        if (Number(disposalRes.gainLoss) === 1000000) {
            log('SUCCESS: Gain calculation correct (1M).');
        }
        else {
            log(`FAILED: Gain is ${disposalRes.gainLoss}, expected 1000000.`);
        }
        log('--------------------------------------------------');
        log('Cleaning up...');
        await prisma.postedJournalDetail.deleteMany({ where: { journalId: journal.id } });
        await prisma.postedJournal.delete({ where: { id: journal.id } });
        if (paymentRes && paymentRes.id) {
            await prisma.postedJournalDetail.deleteMany({ where: { journalId: paymentRes.id } });
            await prisma.postedJournal.delete({ where: { id: paymentRes.id } });
        }
        if (disposalRes && disposalRes.journal && disposalRes.journal.id) {
            await prisma.postedJournalDetail.deleteMany({ where: { journalId: disposalRes.journal.id } });
            await prisma.postedJournal.delete({ where: { id: disposalRes.journal.id } });
        }
        await prisma.asset.delete({ where: { id: asset.id } });
        log('Cleanup Complete.');
    }
    catch (error) {
        log(`ERROR: ${error.message}`);
        console.error(error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=test-asset-full-cycle.js.map