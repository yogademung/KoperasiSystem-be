// Template Schema Interfaces
export interface TemplateSchema {
    version: string;
    paperSize: 'A4' | 'LETTER' | 'LEGAL' | 'CUSTOM';
    orientation: 'portrait' | 'landscape';
    customDimensions?: {
        width: number; // in mm
        height: number; // in mm
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
    x: number; // Position in mm
    y: number;
    width?: number;
    height?: number;

    // Type-specific properties
    content?: string; // For text elements
    variableKey?: string; // For variable elements
    imageSrc?: string; // For image elements

    // Styling
    style: ElementStyle;

    // For table elements
    tableConfig?: TableConfig;

    // For passbook grid
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
    dataSource: string; // Variable key for array data
    headerStyle?: Partial<ElementStyle>;
    rowStyle?: Partial<ElementStyle>;
}

export interface TableColumn {
    key: string; // Variable key
    header: string;
    width: number; // in mm
    align: 'left' | 'center' | 'right';
}

export interface PassbookConfig {
    startLine: number; // Starting line offset
    linesPerPage: number;
    columns: PassbookColumn[];
}

export interface PassbookColumn {
    key: string;
    width: number;
    xPosition: number; // Absolute X position in mm
    align: 'left' | 'center' | 'right';
    dataType?: 'STRING' | 'NUMBER' | 'DATE' | 'CURRENCY';
}

// Report Variable Interfaces
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

// Report Generation Interfaces
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
