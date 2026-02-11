import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AssetService } from '../src/accounting/asset/asset.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const assetService = app.get(AssetService);

    try {
        const date = '2026-02-11';
        console.log(`Testing code generation for ${date}...`);
        const code1 = await assetService.generateAssetCode(date);
        console.log(`Generated Code 1: ${code1}`);

        const code2 = await assetService.generateAssetCode(date);
        console.log(`Generated Code 2: ${code2} (Should be same if not saved)`);

        // Test with different date
        const date2 = '2026-03-01';
        const code3 = await assetService.generateAssetCode(date2);
        console.log(`Generated Code for ${date2}: ${code3}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
