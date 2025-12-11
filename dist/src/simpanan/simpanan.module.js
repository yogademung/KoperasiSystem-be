"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpananModule = void 0;
const common_1 = require("@nestjs/common");
const anggota_controller_1 = require("./anggota/anggota.controller");
const anggota_service_1 = require("./anggota/anggota.service");
const tabrela_controller_1 = require("./tabrela/tabrela.controller");
const tabrela_service_1 = require("./tabrela/tabrela.service");
const deposito_controller_1 = require("./deposito/deposito.controller");
const deposito_service_1 = require("./deposito/deposito.service");
const brahmacari_controller_1 = require("./brahmacari/brahmacari.controller");
const brahmacari_service_1 = require("./brahmacari/brahmacari.service");
const balimesari_controller_1 = require("./balimesari/balimesari.controller");
const balimesari_service_1 = require("./balimesari/balimesari.service");
const wanaprasta_controller_1 = require("./wanaprasta/wanaprasta.controller");
const wanaprasta_service_1 = require("./wanaprasta/wanaprasta.service");
const simpanan_interest_service_1 = require("./simpanan-interest.service");
let SimpananModule = class SimpananModule {
};
exports.SimpananModule = SimpananModule;
exports.SimpananModule = SimpananModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            anggota_controller_1.AnggotaController,
            tabrela_controller_1.TabrelaController,
            deposito_controller_1.DepositoController,
            brahmacari_controller_1.BrahmacariController,
            balimesari_controller_1.BalimesariController,
            wanaprasta_controller_1.WanaprastaController
        ],
        providers: [
            anggota_service_1.AnggotaService,
            tabrela_service_1.TabrelaService,
            deposito_service_1.DepositoService,
            brahmacari_service_1.BrahmacariService,
            balimesari_service_1.BalimesariService,
            wanaprasta_service_1.WanaprastaService,
            simpanan_interest_service_1.SimpananInterestService
        ],
        exports: [
            anggota_service_1.AnggotaService,
            tabrela_service_1.TabrelaService,
            deposito_service_1.DepositoService,
            brahmacari_service_1.BrahmacariService,
            balimesari_service_1.BalimesariService,
            wanaprasta_service_1.WanaprastaService,
            simpanan_interest_service_1.SimpananInterestService
        ]
    })
], SimpananModule);
//# sourceMappingURL=simpanan.module.js.map