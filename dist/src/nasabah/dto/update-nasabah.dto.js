"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNasabahDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_nasabah_dto_1 = require("./create-nasabah.dto");
class UpdateNasabahDto extends (0, mapped_types_1.PartialType)(create_nasabah_dto_1.CreateNasabahDto) {
}
exports.UpdateNasabahDto = UpdateNasabahDto;
//# sourceMappingURL=update-nasabah.dto.js.map