import { BusinessUnitService } from './business-unit.service';
import { CreateBusinessUnitDto, UpdateBusinessUnitDto } from './dto/business-unit.dto';
export declare class BusinessUnitController {
    private readonly businessUnitService;
    constructor(businessUnitService: BusinessUnitService);
    findAll(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        code: string;
    }[]>;
    findActive(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        code: string;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        code: string;
    } | null>;
    create(dto: CreateBusinessUnitDto): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        code: string;
    }>;
    update(id: number, dto: UpdateBusinessUnitDto): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        code: string;
    }>;
    delete(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        code: string;
    }>;
}
