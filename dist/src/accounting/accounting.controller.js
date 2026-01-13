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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingController = void 0;
const common_1 = require("@nestjs/common");
const accounting_service_1 = require("./accounting.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
let AccountingController = class AccountingController {
    accountingService;
    constructor(accountingService) {
        this.accountingService = accountingService;
    }
    getAccounts(type, page, limit) {
        console.log('GET /accounting/accounts hit. Type:', type, 'Page:', page, 'Limit:', limit);
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        return this.accountingService.getAccounts(type, pageNum, limitNum);
    }
    getParentAccounts() {
        return this.accountingService.getParentAccounts();
    }
    getNextCode(parentCode) {
        return this.accountingService.generateNextCode(parentCode);
    }
    createAccount(data) {
        return this.accountingService.createAccount(data);
    }
    updateAccount(code, data) {
        return this.accountingService.updateAccount(code, data);
    }
    getMappings(module) {
        return this.accountingService.getMappings(module);
    }
    updateMapping(transType, body) {
        return this.accountingService.updateMapping(transType, body.debitAccount, body.creditAccount);
    }
    getJournals(startDate, endDate, status, sourceCode, fromAccount, toAccount, page, limit) {
        return this.accountingService.getJournals({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status,
            sourceCode,
            fromAccount,
            toAccount,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });
    }
    getDeletedJournals(startDate, endDate, page, limit) {
        return this.accountingService.getDeletedJournals({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
        });
    }
    getJournalDetail(id) {
        return this.accountingService.getJournalDetail(+id);
    }
    createManualJournal(req, body) {
        const userId = req.user?.id || req.user?.userId;
        return this.accountingService.createManualJournal({
            date: new Date(body.date),
            description: body.description,
            userId: userId ? +userId : 1,
            details: body.details
        });
    }
    async updateManualJournal(id, body, req) {
        return this.accountingService.updateManualJournal(Number(id), {
            date: new Date(body.date),
            description: body.description,
            userId: req.user.userId,
            details: body.details
        });
    }
    async deleteJournal(id, reason, req) {
        try {
            const userId = req.user?.id || req.user?.userId || 0;
            return await this.accountingService.deleteJournal(Number(id), Number(userId), reason || 'Deleted by User');
        }
        catch (error) {
            console.error('Delete Journal Controller Error:', error);
            throw error;
        }
    }
    getDailyReport(date) {
        return this.accountingService.getDailyReportData(date ? new Date(date) : new Date());
    }
};
exports.AccountingController = AccountingController;
__decorate([
    (0, common_1.Get)('accounts'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getAccounts", null);
__decorate([
    (0, common_1.Get)('accounts/parents'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getParentAccounts", null);
__decorate([
    (0, common_1.Get)('accounts/next-code'),
    __param(0, (0, common_1.Query)('parentCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getNextCode", null);
__decorate([
    (0, common_1.Post)('accounts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createAccount", null);
__decorate([
    (0, common_1.Put)('accounts/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "updateAccount", null);
__decorate([
    (0, common_1.Get)('mappings'),
    __param(0, (0, common_1.Query)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getMappings", null);
__decorate([
    (0, common_1.Put)('mappings/:transType'),
    __param(0, (0, common_1.Param)('transType')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "updateMapping", null);
__decorate([
    (0, common_1.Get)('journals'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('sourceCode')),
    __param(4, (0, common_1.Query)('fromAccount')),
    __param(5, (0, common_1.Query)('toAccount')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getJournals", null);
__decorate([
    (0, common_1.Get)('journals/deleted'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getDeletedJournals", null);
__decorate([
    (0, common_1.Get)('journals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getJournalDetail", null);
__decorate([
    (0, common_1.Post)('journals/manual'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "createManualJournal", null);
__decorate([
    (0, common_1.Put)('/journals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "updateManualJournal", null);
__decorate([
    (0, common_1.Delete)('/journals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AccountingController.prototype, "deleteJournal", null);
__decorate([
    (0, common_1.Get)('reports/daily'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccountingController.prototype, "getDailyReport", null);
exports.AccountingController = AccountingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/accounting'),
    __metadata("design:paramtypes", [accounting_service_1.AccountingService])
], AccountingController);
//# sourceMappingURL=accounting.controller.js.map