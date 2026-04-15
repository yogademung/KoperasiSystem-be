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
var SystemSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const system_date_service_1 = require("./system-date.service");
let SystemSchedulerService = SystemSchedulerService_1 = class SystemSchedulerService {
    systemDateService;
    logger = new common_1.Logger(SystemSchedulerService_1.name);
    constructor(systemDateService) {
        this.systemDateService = systemDateService;
    }
    async handleDailyDateAdvance() {
        this.logger.log('Running daily system date advance check...');
        try {
            const canAdvance = await this.systemDateService.canAdvanceDate();
            if (canAdvance) {
                const result = await this.systemDateService.advanceBusinessDate();
                if (result.success) {
                    this.logger.log(`System date auto-advanced: ${result.message}`);
                }
                else {
                    this.logger.warn(`Failed to auto-advance date: ${result.message}`);
                }
            }
            else {
                const status = await this.systemDateService.getSystemStatus();
                this.logger.warn(`Cannot auto-advance date. Pending shifts: ${status.unclosedShiftCount}`);
            }
        }
        catch (error) {
            this.logger.error('Error during daily date advance', error);
        }
    }
};
exports.SystemSchedulerService = SystemSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemSchedulerService.prototype, "handleDailyDateAdvance", null);
exports.SystemSchedulerService = SystemSchedulerService = SystemSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [system_date_service_1.SystemDateService])
], SystemSchedulerService);
//# sourceMappingURL=system.scheduler.js.map