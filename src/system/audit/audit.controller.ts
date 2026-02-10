import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs with filters' })
  async findAll(
    @Query('tableName') tableName?: string,
    @Query('recordId') recordId?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.auditService.findAll({
      tableName,
      recordId,
      action,
      userId,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log details' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(+id);
  }
}
