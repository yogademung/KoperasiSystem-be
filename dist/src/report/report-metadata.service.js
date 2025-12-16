"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportMetadataService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let ReportMetadataService = class ReportMetadataService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMetadata(productModule) {
        const variables = await this.prisma.reportVariable.findMany({
            where: {
                productModule: productModule.toUpperCase(),
            },
            orderBy: [
                { category: 'asc' },
                { variableKey: 'asc' },
            ],
        });
        const categoriesMap = new Map();
        for (const variable of variables) {
            if (!categoriesMap.has(variable.category)) {
                categoriesMap.set(variable.category, []);
            }
            const varDef = {
                key: variable.variableKey,
                name: variable.variableName,
                dataType: variable.dataType,
                category: variable.category,
                description: variable.description || undefined,
                sampleValue: variable.sampleValue || undefined,
                isArray: variable.isArray,
                formatOptions: variable.formatOptions,
            };
            categoriesMap.get(variable.category).push(varDef);
        }
        const categories = Array.from(categoriesMap.entries()).map(([name, variables]) => ({
            name,
            variables,
        }));
        return {
            productModule,
            categories,
        };
    }
    async getAllProductModules() {
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
    async getVariablesByCategory(productModule, category) {
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
    async createVariable(data) {
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
                formatOptions: data.formatOptions,
            },
        });
    }
    async bulkCreateVariables(variables) {
        const operations = variables.map(variable => this.prisma.reportVariable.upsert({
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
                formatOptions: variable.formatOptions,
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
                formatOptions: variable.formatOptions,
            },
        }));
        return this.prisma.$transaction(operations);
    }
};
exports.ReportMetadataService = ReportMetadataService;
exports.ReportMetadataService = ReportMetadataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportMetadataService);
//# sourceMappingURL=report-metadata.service.js.map