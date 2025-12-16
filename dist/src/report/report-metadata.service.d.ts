import { PrismaService } from '../database/prisma.service';
import { ReportMetadata } from './interfaces/report.interfaces';
export declare class ReportMetadataService {
    private prisma;
    constructor(prisma: PrismaService);
    getMetadata(productModule: string): Promise<ReportMetadata>;
    getAllProductModules(): Promise<string[]>;
    getVariablesByCategory(productModule: string, category: string): Promise<{
        id: number;
        productModule: string;
        variableKey: string;
        variableName: string;
        dataType: string;
        category: string;
        description: string | null;
        sampleValue: string | null;
        isArray: boolean;
        formatOptions: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date | null;
    }[]>;
    createVariable(data: {
        productModule: string;
        variableKey: string;
        variableName: string;
        dataType: string;
        category: string;
        description?: string;
        sampleValue?: string;
        isArray?: boolean;
        formatOptions?: any;
    }): Promise<{
        id: number;
        productModule: string;
        variableKey: string;
        variableName: string;
        dataType: string;
        category: string;
        description: string | null;
        sampleValue: string | null;
        isArray: boolean;
        formatOptions: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date | null;
    }>;
    bulkCreateVariables(variables: Array<{
        productModule: string;
        variableKey: string;
        variableName: string;
        dataType: string;
        category: string;
        description?: string;
        sampleValue?: string;
        isArray?: boolean;
        formatOptions?: any;
    }>): Promise<{
        id: number;
        productModule: string;
        variableKey: string;
        variableName: string;
        dataType: string;
        category: string;
        description: string | null;
        sampleValue: string | null;
        isArray: boolean;
        formatOptions: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date | null;
    }[]>;
}
