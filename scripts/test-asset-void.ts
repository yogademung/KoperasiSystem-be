import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AssetService } from '../src/accounting/asset/asset.service';
import { AccountingService } from '../src/accounting/accounting.service';
import { PrismaService } from '../src/database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const assetService = app.get(AssetService);
    const accountingService = app.get(AccountingService);
    const prisma = app.get(PrismaService);

    try {
        // 1. Ensure accounts exist for testing
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

        // 2. Create a dummy asset
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

        // 3. Delete the journal
        console.log('Deleting journal...');
        await accountingService.deleteJournal(journal.id, 1, 'Testing Void');

        // 4. Verify Asset Status
        const updatedAsset = await assetService.findOne(asset.id);
        console.log(`Updated Asset Status: ${updatedAsset.status}`);

        if (updatedAsset.status === 'INACTIVE') {
            console.log('SUCCESS: Asset is INACTIVE.');
            fs.writeFileSync(path.join(__dirname, 'test-result.txt'), 'SUCCESS: Asset is INACTIVE.');
            // Cleanup
            console.log('Cleaning up...');
            await prisma.asset.delete({ where: { id: asset.id } });
        } else {
            console.error('FAILED: Asset is NOT INACTIVE.');
            fs.writeFileSync(path.join(__dirname, 'test-result.txt'), `FAILED: Asset is ${updatedAsset.status}`);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
