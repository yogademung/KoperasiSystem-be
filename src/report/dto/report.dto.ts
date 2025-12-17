import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
    // @ApiProperty({ example: 'S01_CUSTOM' })
    @IsString()
    code: string;

    // @ApiProperty({ example: 'Custom Nominatif Template' })
    @IsString()
    name: string;

    // @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    // @ApiProperty({ example: 'SIMPANAN' })
    @IsString()
    productModule: string;

    // @ApiProperty({ example: 'REPORT' })
    @IsString()
    category: string;

    // @ApiProperty({ type: 'object' })
    @IsObject()
    jsonSchema: any;

    // @ApiPropertyOptional({ example: 'A4' })
    @IsOptional()
    @IsString()
    paperSize?: string;

    // @ApiPropertyOptional({ example: 'portrait' })
    @IsOptional()
    @IsString()
    orientation?: string;

    // @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    parentId?: number;
}

export class UpdateTemplateDto {
    // @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    // @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    // @ApiPropertyOptional({ type: 'object' })
    @IsOptional()
    @IsObject()
    jsonSchema?: any;

    // @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class PassbookOptionsDto {
    // @ApiPropertyOptional({ example: 5 })
    @IsOptional()
    @IsNumber()
    startLine?: number;

    // @ApiProperty({ example: 'NEW_ONLY', enum: ['NEW_ONLY', 'ALL', 'RANGE'] })
    @IsEnum(['NEW_ONLY', 'ALL', 'RANGE'])
    mode: 'NEW_ONLY' | 'ALL' | 'RANGE';

    // @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    rangeStart?: number;

    // @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    rangeEnd?: number;
}

export class GenerateReportDto {
    // @ApiProperty({ example: 1 })
    @IsNumber()
    templateId: number;

    // @ApiProperty({ example: 'PDF', enum: ['PDF', 'EXCEL'] })
    @IsEnum(['PDF', 'EXCEL'])
    format: 'PDF' | 'EXCEL';

    // @ApiPropertyOptional({ example: 'TAB001' })
    @IsOptional()
    @IsString()
    recordId?: string;

    // @ApiPropertyOptional({ type: 'object' })
    @IsOptional()
    @IsObject()
    parameters?: Record<string, any>;

    // @ApiPropertyOptional({ type: PassbookOptionsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => PassbookOptionsDto)
    passbookOptions?: PassbookOptionsDto;
}
