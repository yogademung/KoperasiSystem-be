import { AssetService } from './asset.service';
export declare class AssetController {
    private readonly assetService;
    constructor(assetService: AssetService);
    create(user: any, createAssetDto: any): Promise<any>;
    findAll(page?: string, limit?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateAssetDto: any): Promise<any>;
    remove(id: string): Promise<any>;
    runDepreciation(user: any, dateStr?: string): Promise<any>;
    calculateDepreciation(id: string, dateStr?: string): Promise<number>;
}
