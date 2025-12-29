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
exports.PeriodLockGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const period_lock_service_1 = require("../../month-end/period-lock.service");
let PeriodLockGuard = class PeriodLockGuard {
    reflector;
    periodLockService;
    constructor(reflector, periodLockService) {
        this.reflector = reflector;
        this.periodLockService = periodLockService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const body = request.body;
            let dateToCheck = body.journalDate || body.date || body.transactionDate;
            if (dateToCheck) {
                const dateObj = new Date(dateToCheck);
                if (!isNaN(dateObj.getTime())) {
                    const period = dateObj.toISOString().slice(0, 7);
                    const isLocked = await this.periodLockService.isPeriodLocked(period);
                    if (isLocked) {
                        throw new common_1.BadRequestException(`Period ${period} is LOCKED. Cannot modify transactions.`);
                    }
                }
            }
        }
        return true;
    }
};
exports.PeriodLockGuard = PeriodLockGuard;
exports.PeriodLockGuard = PeriodLockGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        period_lock_service_1.PeriodLockService])
], PeriodLockGuard);
//# sourceMappingURL=period-lock.guard.js.map