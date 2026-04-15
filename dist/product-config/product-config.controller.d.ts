import { ProductConfigService } from './product-config.service';
import { Prisma } from '@prisma/client';
export declare class ProductConfigController {
    private readonly productConfigService;
    constructor(productConfigService: ProductConfigService);
    getAllProducts(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        productCode: string;
        productName: string;
        tableName: string;
        isEnabled: boolean;
        isCore: boolean;
        displayOrder: number;
        routePath: string;
        defaultInterestRate: Prisma.Decimal | null;
        minInterestRate: Prisma.Decimal | null;
        maxInterestRate: Prisma.Decimal | null;
        interestPeriod: string | null;
    }[]>;
    getEnabledProducts(): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        productCode: string;
        productName: string;
        tableName: string;
        isEnabled: boolean;
        isCore: boolean;
        displayOrder: number;
        routePath: string;
        defaultInterestRate: Prisma.Decimal | null;
        minInterestRate: Prisma.Decimal | null;
        maxInterestRate: Prisma.Decimal | null;
        interestPeriod: string | null;
    }[]>;
    getProductByCode(code: string): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        productCode: string;
        productName: string;
        tableName: string;
        isEnabled: boolean;
        isCore: boolean;
        displayOrder: number;
        routePath: string;
        defaultInterestRate: Prisma.Decimal | null;
        minInterestRate: Prisma.Decimal | null;
        maxInterestRate: Prisma.Decimal | null;
        interestPeriod: string | null;
    }>;
    hasExistingAccounts(code: string): Promise<{
        hasAccounts: boolean;
        count: number;
    }>;
    toggleProduct(code: string): Promise<{
        message: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        productCode: string;
        productName: string;
        tableName: string;
        isEnabled: boolean;
        isCore: boolean;
        displayOrder: number;
        routePath: string;
        defaultInterestRate: Prisma.Decimal | null;
        minInterestRate: Prisma.Decimal | null;
        maxInterestRate: Prisma.Decimal | null;
        interestPeriod: string | null;
    }>;
    updateProduct(code: string, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        productCode: string;
        productName: string;
        tableName: string;
        isEnabled: boolean;
        isCore: boolean;
        displayOrder: number;
        routePath: string;
        defaultInterestRate: Prisma.Decimal | null;
        minInterestRate: Prisma.Decimal | null;
        maxInterestRate: Prisma.Decimal | null;
        interestPeriod: string | null;
    }>;
    reorderProducts(body: {
        order: {
            productCode: string;
            displayOrder: number;
        }[];
    }): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        icon: string | null;
        productCode: string;
        productName: string;
        tableName: string;
        isEnabled: boolean;
        isCore: boolean;
        displayOrder: number;
        routePath: string;
        defaultInterestRate: Prisma.Decimal | null;
        minInterestRate: Prisma.Decimal | null;
        maxInterestRate: Prisma.Decimal | null;
        interestPeriod: string | null;
    }[]>;
}
