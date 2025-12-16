export interface TemplateSchema {
    version: string;
    paperSize: 'A4' | 'LETTER' | 'LEGAL' | 'CUSTOM';
    orientation: 'portrait' | 'landscape';
    customDimensions?: {
        width: number;
        height: number;
    };
    margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    elements: TemplateElement[];
}
export interface TemplateElement {
    id: string;
    type: 'text' | 'variable' | 'image' | 'shape' | 'table' | 'passbook-grid';
    x: number;
    y: number;
    width?: number;
    height?: number;
    content?: string;
    variableKey?: string;
    imageSrc?: string;
    style: ElementStyle;
    tableConfig?: TableConfig;
    passbookConfig?: PassbookConfig;
}
export interface ElementStyle {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    border?: {
        width: number;
        color: string;
        style: 'solid' | 'dashed' | 'dotted';
    };
}
export interface TableConfig {
    columns: TableColumn[];
    dataSource: string;
    headerStyle?: Partial<ElementStyle>;
    rowStyle?: Partial<ElementStyle>;
}
export interface TableColumn {
    key: string;
    header: string;
    width: number;
    align: 'left' | 'center' | 'right';
}
export interface PassbookConfig {
    startLine: number;
    linesPerPage: number;
    columns: PassbookColumn[];
}
export interface PassbookColumn {
    key: string;
    width: number;
    xPosition: number;
    align: 'left' | 'center' | 'right';
    dataType?: 'STRING' | 'NUMBER' | 'DATE' | 'CURRENCY';
}
export interface ReportVariableDefinition {
    key: string;
    name: string;
    dataType: 'STRING' | 'NUMBER' | 'DATE' | 'CURRENCY' | 'BOOLEAN' | 'ARRAY';
    category: string;
    description?: string;
    sampleValue?: string;
    isArray?: boolean;
    arrayFields?: ReportVariableDefinition[];
    formatOptions?: {
        dateFormat?: string;
        currencySymbol?: string;
        decimalPlaces?: number;
    };
}
export interface ReportMetadata {
    productModule: string;
    categories: {
        name: string;
        variables: ReportVariableDefinition[];
    }[];
}
export interface GenerateReportRequest {
    templateId: number;
    format: 'PDF' | 'EXCEL';
    recordId?: string;
    parameters?: Record<string, any>;
    passbookOptions?: PassbookPrintOptions;
}
export interface PassbookPrintOptions {
    startLine?: number;
    mode: 'NEW_ONLY' | 'ALL' | 'RANGE';
    rangeStart?: number;
    rangeEnd?: number;
}
export interface GenerateReportResponse {
    success: boolean;
    logId: number;
    fileUrl: string;
    fileSize: number;
    generatedAt: Date;
}
