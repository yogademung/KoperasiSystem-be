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
exports.CreateExternalLoanDto = void 0;
const class_validator_1 = require("class-validator");
class CreateExternalLoanDto {
    bankName;
    contractNumber;
    loanDate;
    maturityDate;
    principal;
    interestRate;
    termMonths;
    installmentType;
}
exports.CreateExternalLoanDto = CreateExternalLoanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExternalLoanDto.prototype, "bankName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExternalLoanDto.prototype, "contractNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExternalLoanDto.prototype, "loanDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExternalLoanDto.prototype, "maturityDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateExternalLoanDto.prototype, "principal", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateExternalLoanDto.prototype, "interestRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateExternalLoanDto.prototype, "termMonths", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ANUITAS', 'FLAT']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateExternalLoanDto.prototype, "installmentType", void 0);
//# sourceMappingURL=create-loan.dto.js.map