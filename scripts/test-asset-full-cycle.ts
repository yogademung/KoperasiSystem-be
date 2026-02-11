import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AssetService } from '../src/accounting/asset/asset.service';
import { PrismaService } from '../src/database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const assetService = app.get(AssetService);
    const prisma = app.get(PrismaService);
    const logFile = path.join(__dirname, 'test-asset-full-cycle-result.txt');

    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    // Reset log file
    fs.writeFileSync(logFile, 'STARTING TEST\n');

    try {
        log('1. Creating Asset (Expect Auto Code & Hutang Default)...');
        const dto = {
            name: 'Test Asset Lifecycle',
            code: 'AUTO',
            type: 'INVENTARIS',
            acquisitionDate: new Date().toISOString(),
            acquisitionCost: 12000000, // 12 Juta
            residualValue: 2000000, // 2 Juta
            usefulLifeYears: 5,
            depreciationRate: 20,
            depreciationMethod: 'STRAIGHT_LINE',
            assetAccountId: '1.30.02', // Inventaris
            accumDepreciationAccountId: '1.30.99',
            expenseAccountId: '5.30.02',
            // Source account defaults to 2.20.04 in service logic
        };

        const { asset, journal: createdJournal } = await assetService.create(dto, 1);
        log(`CREATED Asset: ${asset.code} (ID: ${asset.id})`);

        // Fetch journal with details
        const journal = await prisma.postedJournal.findUnique({
            where: { id: createdJournal.id },
            include: { details: true }
        });

        if (!journal) throw new Error('Journal not found');

        // Verify Code
        if (asset.code.startsWith('ASSET-')) {
            log('SUCCESS: Code Auto-Generated.');
        } else {
            log('FAILED: Code not auto-generated.');
        }

        // Verify Journal Source (Credit Side)
        const creditEntry = journal.details.find(d => Number(d.credit) > 0);
        if (creditEntry?.accountCode === '2.20.04') {
            log('SUCCESS: Default Source is Hutang Pembelian Aset (2.20.04).');
        } else {
            log(`FAILED: Source is ${creditEntry?.accountCode}, expected 2.20.04.`);
        }

        log('--------------------------------------------------');
        log('2. Paying Asset Purchase...');
        const paymentRes: any = await assetService.payAssetPurchase({
            assetId: asset.id,
            paymentAccountId: '1.01.01', // Kas Kantor
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
            } else {
                log('FAILED: Payment Journal found in DB is null.');
            }
        } else {
            log('FAILED: Payment Journal ID missing in response.');
        }

        log('--------------------------------------------------');
        log('3. Running Depreciation (Simulate 1 Month)...');

        log('4. Disposing Asset (Gain Scenario)...');

        const disposalRes: any = await assetService.disposeAsset({
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
        } else {
            log(`FAILED: Asset Status is ${updatedAsset?.status}.`);
        }

        if (Number(disposalRes.gainLoss) === 1000000) {
            log('SUCCESS: Gain calculation correct (1M).');
        } else {
            log(`FAILED: Gain is ${disposalRes.gainLoss}, expected 1000000.`);
        }

        // Cleanup
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

    } catch (error) {
        log(`ERROR: ${error.message}`);
        console.error(error);
    } finally {
        await app.close();
    }
}

bootstrap();
