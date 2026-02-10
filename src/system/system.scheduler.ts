import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SystemDateService } from './system-date.service';

@Injectable()
export class SystemSchedulerService {
  private readonly logger = new Logger(SystemSchedulerService.name);

  constructor(private readonly systemDateService: SystemDateService) {}

  /**
   * Auto-advance system date every day at 00:01 AM
   * Checks if all shifts are closed and advances date if possible
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyDateAdvance() {
    this.logger.log('Running daily system date advance check...');

    try {
      const canAdvance = await this.systemDateService.canAdvanceDate();

      if (canAdvance) {
        const result = await this.systemDateService.advanceBusinessDate();
        if (result.success) {
          this.logger.log(`System date auto-advanced: ${result.message}`);
        } else {
          this.logger.warn(`Failed to auto-advance date: ${result.message}`);
        }
      } else {
        const status = await this.systemDateService.getSystemStatus();
        this.logger.warn(
          `Cannot auto-advance date. Pending shifts: ${status.unclosedShiftCount}`,
        );
      }
    } catch (error) {
      this.logger.error('Error during daily date advance', error);
    }
  }
}
