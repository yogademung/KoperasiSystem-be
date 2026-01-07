import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemDateService } from './system-date.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/system')
@UseGuards(JwtAuthGuard)
export class SystemController {
    constructor(private readonly systemDateService: SystemDateService) { }

    @Get('status')
    async getSystemStatus() {
        return this.systemDateService.getSystemStatus();
    }
}
