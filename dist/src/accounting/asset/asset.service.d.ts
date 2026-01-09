import { PrismaService } from '../../database/prisma.service';
import { AccountingService } from '../accounting.service';
export declare class AssetService {
    private prisma;
    private accountingService;
    constructor(prisma: PrismaService, accountingService: AccountingService);
    create(createAssetDto: any, userId: number): Promise<any>;
    findAll(page?: number, limit?: number): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    update(id: number, data: any): Promise<any>;
    remove(id: number): Promise<any>;
    calculateMonthlyDepreciation(assetId: number, date: Date): Promise<number>;
    runDepreciationProcess(userId: number, date: Date): Promise<any>;
    getBalanceSheet(date: Date): Promise<{
        date: Date;
        totalAcquisition: any;
        totalBookValue: any;
        details: any[];
    }>;
    getAssetMutations(startDate: Date, endDate: Date): Promise<{
        startDate: Date;
        endDate: Date;
        acquisitions: any;
        depreciations: any;
    }>;
}
