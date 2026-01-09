import { ProductConfigService } from './product-config.service';
export declare class ProductConfigController {
    private readonly productConfigService;
    constructor(productConfigService: ProductConfigService);
    getAllProducts(): Promise<any>;
    getEnabledProducts(): Promise<any>;
    getProductByCode(code: string): Promise<any>;
    hasExistingAccounts(code: string): Promise<{
        hasAccounts: boolean;
        count: number;
    }>;
    toggleProduct(code: string): Promise<any>;
    updateProduct(code: string, data: any): Promise<any>;
    reorderProducts(body: {
        order: {
            productCode: string;
            displayOrder: number;
        }[];
    }): Promise<any>;
}
