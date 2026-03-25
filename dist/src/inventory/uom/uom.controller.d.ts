import { UomService } from './uom.service';
export declare class UomController {
    private readonly uomService;
    constructor(uomService: UomService);
    create(data: {
        code: string;
        name: string;
    }): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        code: string;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        code: string;
    }[]>;
    update(id: string, data: {
        code?: string;
        name?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        code: string;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        isActive: boolean;
        code: string;
    }>;
}
