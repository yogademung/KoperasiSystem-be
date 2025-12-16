export declare class CreateTemplateDto {
    code: string;
    name: string;
    description?: string;
    productModule: string;
    category: string;
    jsonSchema: any;
    paperSize?: string;
    orientation?: string;
    parentId?: number;
}
export declare class UpdateTemplateDto {
    name?: string;
    description?: string;
    jsonSchema?: any;
    isActive?: boolean;
}
export declare class PassbookOptionsDto {
    startLine?: number;
    mode: 'NEW_ONLY' | 'ALL' | 'RANGE';
    rangeStart?: number;
    rangeEnd?: number;
}
export declare class GenerateReportDto {
    templateId: number;
    format: 'PDF' | 'EXCEL';
    recordId?: string;
    parameters?: Record<string, any>;
    passbookOptions?: PassbookOptionsDto;
}
