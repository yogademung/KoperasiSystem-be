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
exports.PosShiftController = void 0;
const common_1 = require("@nestjs/common");
const pos_shift_service_1 = require("./pos-shift.service");
let PosShiftController = class PosShiftController {
    posShiftService;
    constructor(posShiftService) {
        this.posShiftService = posShiftService;
    }
    openShift(data) {
        return this.posShiftService.openShift(data.userId, data.startingCash);
    }
    closeShift(id, data) {
        return this.posShiftService.closeShift(+id, data.endingCash);
    }
    getActiveShift(userId) {
        return this.posShiftService.getActiveShift(+userId);
    }
    logVoid(data) {
        return this.posShiftService.logVoid(data);
    }
};
exports.PosShiftController = PosShiftController;
__decorate([
    (0, common_1.Post)('open'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PosShiftController.prototype, "openShift", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PosShiftController.prototype, "closeShift", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PosShiftController.prototype, "getActiveShift", null);
__decorate([
    (0, common_1.Post)('void'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PosShiftController.prototype, "logVoid", null);
exports.PosShiftController = PosShiftController = __decorate([
    (0, common_1.Controller)('pos/shifts'),
    __metadata("design:paramtypes", [pos_shift_service_1.PosShiftService])
], PosShiftController);
//# sourceMappingURL=pos-shift.controller.js.map