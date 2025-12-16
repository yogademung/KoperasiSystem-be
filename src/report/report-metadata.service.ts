import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ReportMetadata, ReportVariableDefinition } from './interfaces/report.interfaces';

@Injectable()
export class ReportMetadataService {
    constructor(private prisma: PrismaService) { }

    async getMetadata(productModule: string): Promise<ReportMetadata> {
        const variables = await this.prisma.reportVariable.findMany({
            where: {
                productModule: productModule.toUpperCase(),
            },
            orderBy: [
                { category: 'asc' },
                { variableKey: 'asc' },
            ],
        });

        // Group variables by category
        const categoriesMap = new Map<string, ReportVariableDefinition[]>();

        for (const variable of variables) {
            if (!categoriesMap.has(variable.category)) {
                categoriesMap.set(variable.category, []);
            }

            const varDef: ReportVariableDefinition = {
                key: variable.variableKey,
                name: variable.variableName,
                dataType: variable.dataType as any,
                category: variable.category,
                description: variable.description || undefined,
                sampleValue: variable.sampleValue || undefined,
                isArray: variable.isArray,
                formatOptions: variable.formatOptions as any,
            };

            categoriesMap.get(variable.category)!.push(varDef);
        }

        // Convert map to array
        const categories = Array.from(categoriesMap.entries()).map(([name, variables]) => ({
            name,
            variables,
        }));

        return {
            productModule,
            categories,
        };
    }

    async getAllProductModules(): Promise<string[]> {
        const modules = await this.prisma.reportVariable.findMany({
            select: {
                productModule: true,
            },
            distinct: ['productModule'],
            orderBy: {
                productModule: 'asc',
            },
        });

        return modules.map(m => m.productModule);
    }

    async getVariablesByCategory(productModule: string, category: string) {
        return this.prisma.reportVariable.findMany({
            where: {
                productModule: productModule.toUpperCase(),
                category: category.toUpperCase(),
            },
            orderBy: {
                variableKey: 'asc',
            },
        });
    }

    async createVariable(data: {
        productModule: string;
        variableKey: string;
        variableName: string;
        dataType: string;
        category: string;
        description?: string;
        sampleValue?: string;
        isArray?: boolean;
        formatOptions?: any;
    }) {
        return this.prisma.reportVariable.create({
            data: {
                productModule: data.productModule.toUpperCase(),
                variableKey: data.variableKey,
                variableName: data.variableName,
                dataType: data.dataType,
                category: data.category.toUpperCase(),
                description: data.description,
                sampleValue: data.sampleValue,
                isArray: data.isArray || false,
                formatOptions: data.formatOptions as any,
            },
        });
    }

    async bulkCreateVariables(variables: Array<{
        productModule: string;
        variableKey: string;
        variableName: string;
        dataType: string;
        category: string;
        description?: string;
        sampleValue?: string;
        isArray?: boolean;
        formatOptions?: any;
    }>) {
        const operations = variables.map(variable =>
            this.prisma.reportVariable.upsert({
                where: {
                    productModule_variableKey: {
                        productModule: variable.productModule.toUpperCase(),
                        variableKey: variable.variableKey,
                    },
                },
                update: {
                    variableName: variable.variableName,
                    dataType: variable.dataType,
                    category: variable.category.toUpperCase(),
                    description: variable.description,
                    sampleValue: variable.sampleValue,
                    isArray: variable.isArray || false,
                    formatOptions: variable.formatOptions as any,
                },
                create: {
                    productModule: variable.productModule.toUpperCase(),
                    variableKey: variable.variableKey,
                    variableName: variable.variableName,
                    dataType: variable.dataType,
                    category: variable.category.toUpperCase(),
                    description: variable.description,
                    sampleValue: variable.sampleValue,
                    isArray: variable.isArray || false,
                    formatOptions: variable.formatOptions as any,
                },
            })
        );

        return this.prisma.$transaction(operations);
    }
}
