import { PrismaService } from '../database/prisma.service';
export declare class ProductConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllProducts(): Promise<any>;
    getEnabledProducts(): Promise<any>;
    getProductByCode(code: string): Promise<any>;
    toggleProduct(code: string): Promise<any>;
    updateProduct(code: string, data: any): Promise<any>;
    reorderProducts(order: {
        productCode: string;
        displayOrder: number;
    }[]): Promise<any>;
    hasExistingAccounts(code: string): Promise<{
        hasAccounts: boolean;
        count: number;
    }>;
}
