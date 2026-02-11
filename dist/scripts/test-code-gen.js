"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const asset_service_1 = require("../src/accounting/asset/asset.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const assetService = app.get(asset_service_1.AssetService);
    try {
        const date = '2026-02-11';
        console.log(`Testing code generation for ${date}...`);
        const code1 = await assetService.generateAssetCode(date);
        console.log(`Generated Code 1: ${code1}`);
        const code2 = await assetService.generateAssetCode(date);
        console.log(`Generated Code 2: ${code2} (Should be same if not saved)`);
        const date2 = '2026-03-01';
        const code3 = await assetService.generateAssetCode(date2);
        console.log(`Generated Code for ${date2}: ${code3}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=test-code-gen.js.map