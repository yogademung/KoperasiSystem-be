import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { startOfDay, endOfDay, addDays, format } from 'date-fns';

@Injectable()
export class SystemDateService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the current business date from system configuration
   */
  async getCurrentBusinessDate(): Promise<Date> {
    const config = await this.prisma.lovValue.findUnique({
      where: {
        code_codeValue: {
          code: 'SYSTEM',
          codeValue: 'CURRENT_BUSINESS_DATE',
        },
      },
    });

    if (!config || !config.description) {
      // Fallback to current date if not configured
      return startOfDay(new Date());
    }

    return startOfDay(new Date(config.description));
  }

  /**
   * Get the actual server date
   */
  getServerDate(): Date {
    return startOfDay(new Date());
  }

  /**
   * Check if business date is different from server date
   */
  async isDateMismatch(): Promise<boolean> {
    const businessDate = await this.getCurrentBusinessDate();
    const serverDate = this.getServerDate();

    return businessDate.getTime() !== serverDate.getTime();
  }

  /**
   * Get all unclosed shifts for a specific date
   */
  async getUnclosedShifts(date?: Date) {
    const targetDate = date || (await this.getCurrentBusinessDate());
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    return this.prisma.collectorShift.findMany({
      where: {
        status: 'ACTIVE',
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Check if the system can advance to the next business date
   * Returns true if all shifts for current business date are closed
   */
  async canAdvanceDate(): Promise<boolean> {
    const businessDate = await this.getCurrentBusinessDate();
    const unclosedShifts = await this.getUnclosedShifts(businessDate);

    return unclosedShifts.length === 0;
  }

  /**
   * Advance the business date to the next day
   * Only succeeds if all shifts are closed
   */
  async advanceBusinessDate(): Promise<{
    success: boolean;
    newDate?: Date;
    message: string;
  }> {
    const canAdvance = await this.canAdvanceDate();

    if (!canAdvance) {
      return {
        success: false,
        message: 'Cannot advance date: There are unclosed shifts',
      };
    }

    const currentBusinessDate = await this.getCurrentBusinessDate();
    const nextBusinessDate = addDays(currentBusinessDate, 1);
    const serverDate = this.getServerDate();

    // Only advance up to server date
    if (nextBusinessDate.getTime() > serverDate.getTime()) {
      return {
        success: false,
        message: 'Business date is already at server date',
      };
    }

    // Update the business date in configuration
    await this.prisma.lovValue.update({
      where: {
        code_codeValue: {
          code: 'SYSTEM',
          codeValue: 'CURRENT_BUSINESS_DATE',
        },
      },
      data: {
        description: format(nextBusinessDate, 'yyyy-MM-dd'),
        updatedAt: new Date(),
        updatedBy: 'SYSTEM_AUTO_ADVANCE',
      },
    });

    console.log(
      `✅ Business date advanced: ${format(currentBusinessDate, 'yyyy-MM-dd')} → ${format(nextBusinessDate, 'yyyy-MM-dd')}`,
    );

    return {
      success: true,
      newDate: nextBusinessDate,
      message: `Business date advanced to ${format(nextBusinessDate, 'yyyy-MM-dd')}`,
    };
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus() {
    const businessDate = await this.getCurrentBusinessDate();
    const serverDate = this.getServerDate();
    const isDateMismatch = await this.isDateMismatch();
    const unclosedShifts = await this.getUnclosedShifts(businessDate);
    const canAdvance = await this.canAdvanceDate();

    return {
      businessDate: format(businessDate, 'yyyy-MM-dd'),
      serverDate: format(serverDate, 'yyyy-MM-dd'),
      isDateMismatch,
      unclosedShifts: unclosedShifts.map((shift) => ({
        collectorName: shift.user.fullName,
        startTime: shift.startTime,
      })),
      unclosedShiftCount: unclosedShifts.length,
      canAdvanceDate: canAdvance,
    };
  }
}
