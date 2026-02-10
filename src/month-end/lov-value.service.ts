import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LovValueService {
  constructor(private prisma: PrismaService) {}

  async getValue(code: string, codeValue: string): Promise<string | null> {
    try {
      const lov = await this.prisma.lovValue.findUnique({
        where: { code_codeValue: { code, codeValue } },
      });
      return lov?.description || null;
    } catch (error) {
      // If table doesn't exist yet, return null
      return null;
    }
  }

  async setValue(
    code: string,
    codeValue: string,
    description: string,
    userId: string,
  ) {
    return this.prisma.lovValue.upsert({
      where: { code_codeValue: { code, codeValue } },
      update: { description, updatedBy: userId },
      create: { code, codeValue, description, createdBy: userId },
    });
  }

  async getLastClosingMonth(): Promise<string | null> {
    // Use code = 'COMPANY_PROFILE', codeValue = 'LAST_CLOSING_MONTH'
    // Store the period value in description field
    // Matches SettingsService location
    return this.getValue('COMPANY_PROFILE', 'LAST_CLOSING_MONTH');
  }

  async setLastClosingMonth(period: string, userId: string) {
    // Store period value (e.g., '2024-12') in description field
    return this.setValue(
      'COMPANY_PROFILE',
      'LAST_CLOSING_MONTH',
      period,
      userId,
    );
  }
}
