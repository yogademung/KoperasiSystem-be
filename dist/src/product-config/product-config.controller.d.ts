import { ProductConfigService } from './product-config.service';
import { Prisma } from '@prisma/client';
export declare class ProductConfigController {
    private readonly productConfigService;
    constructor(productConfigService: ProductConfigService);
    getAllProducts(): Promise<{
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
    }[]>;
    getEnabledProducts(): Promise<{
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
    }[]>;
    getProductByCode(code: string): Promise<{
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
    }>;
    hasExistingAccounts(code: string): Promise<{
        hasAccounts: boolean;
        count: number;
    }>;
    toggleProduct(code: string): Promise<{
        message: string;
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
    }>;
    updateProduct(code: string, data: Prisma.ProductConfigUpdateInput): Promise<{
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
    }>;
    reorderProducts(body: {
        order: {
            productCode: string;
            displayOrder: number;
        }[];
    }): Promise<{
        id: number;
        updatedAt: Date;
        createdAt: Date;
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
    }[]>;
}
