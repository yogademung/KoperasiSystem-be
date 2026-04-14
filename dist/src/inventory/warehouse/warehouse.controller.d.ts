import { WarehouseService } from './warehouse.service';
export declare class WarehouseController {
    private readonly warehouseService;
    constructor(warehouseService: WarehouseService);
    create(data: any): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        address: string | null;
    }>;
}
