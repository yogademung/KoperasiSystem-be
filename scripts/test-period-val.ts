import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AssetService } from '../src/accounting/asset/asset.service';
import { PrismaService } from '../src/database/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const assetService = app.get(AssetService);
    const prisma = app.get(PrismaService);

    try {
        console.log('1. Setting last_closing_month to 2026-01...');
        await prisma.lovValue.upsert({
            where: { code_codeValue: { code: 'COMPANY_PROFILE', codeValue: 'LAST_CLOSING_MONTH' } },
            update: { description: '2026-01' },
            create: { code: 'COMPANY_PROFILE', codeValue: 'LAST_CLOSING_MONTH', description: '2026-01' }
        });

        console.log('2. Attempting to create asset in 2026-01 (Should FAIL)...');
        const dto = {
            name: 'Locked Period Test',
            code: 'AUTO',
            type: 'INVENTARIS',
            acquisitionDate: '2026-01-15T00:00:00.000Z',
            acquisitionCost: 1000000,
            residualValue: 0,
            usefulLifeYears: 5,
            depreciationRate: 20,
            depreciationMethod: 'STRAIGHT_LINE',
            assetAccountId: '1.30.02',
            accumDepreciationAccountId: '1.30.99',
            expenseAccountId: '5.30.02',
        };

        try {
            await assetService.create(dto, 1);
            console.log('FAILED: Asset creation succeeded but should have been blocked.');
        } catch (e) {
            console.log(`SUCCESS: Blocked correctly. Error: ${e.message}`);
        }

        console.log('3. Attempting to create asset in 2026-02 (Should SUCCEED)...');
        dto.acquisitionDate = '2026-02-15T00:00:00.000Z';
        try {
            const { asset } = await assetService.create(dto, 1);
            console.log(`SUCCESS: Asset created in open period: ${asset.code}`);

            // Cleanup asset
            await prisma.postedJournalDetail.deleteMany({ where: { journal: { description: { contains: asset.code } } } }); // Loose cleanup or just rely on manual
            // Better cleanup
            const journals = await prisma.postedJournal.findMany({ where: { description: { contains: asset.code } } });
            for (const j of journals) {
                await prisma.postedJournalDetail.deleteMany({ where: { journalId: j.id } });
                await prisma.postedJournal.delete({ where: { id: j.id } });
            }
            await prisma.asset.delete({ where: { id: asset.id } });
            console.log('Cleanup Done.');
        } catch (e) {
            console.log(`FAILED: Could not create asset in open period: ${e.message}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
