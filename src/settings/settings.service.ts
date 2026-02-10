import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

const PROFILE_CODE = 'COMPANY_PROFILE';
const KEYS = [
  'NAME',
  'ADDRESS',
  'PHONE',
  'EMAIL',
  'WEBSITE',
  'LOGO',
  'THEME_COLOR',
  'FONT_COLOR',
  'LAST_CLOSING_MONTH',
  'COA_FORMAT',
  'IDLE_TIMEOUT',
];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaults();
  }

  private async ensureDefaults() {
    const count = await this.prisma.lovValue.count({
      where: { code: PROFILE_CODE },
    });
    if (count === 0) {
      const defaults = [
        { codeValue: 'NAME', description: 'Koperasi Simpan Pinjam Sejahtera' },
        {
          codeValue: 'ADDRESS',
          description: 'Jl. Raya Utama No. 123, Denpasar, Bali',
        },
        { codeValue: 'PHONE', description: '(0361) 123456' },
        { codeValue: 'EMAIL', description: 'info@kspsejahtera.com' },
        { codeValue: 'WEBSITE', description: 'www.kspsejahtera.com' },
        { codeValue: 'LOGO', description: '' },
        { codeValue: 'THEME_COLOR', description: 'oklch(0.208 0.042 265.755)' }, // Default dark blue
        { codeValue: 'FONT_COLOR', description: 'oklch(0.985 0 0)' }, // Default white
        { codeValue: 'LAST_CLOSING_MONTH', description: '' }, // Format: YYYY-MM
        { codeValue: 'COA_FORMAT', description: 'xxx-xxx-xxx' }, // Default Format
        { codeValue: 'IDLE_TIMEOUT', description: '15' }, // Default 15 minutes
      ];

      for (const d of defaults) {
        await this.prisma.lovValue.create({
          data: {
            code: PROFILE_CODE,
            codeValue: d.codeValue,
            description: d.description,
            orderNum: 0,
            isActive: true,
            createdBy: 'SYSTEM',
          },
        });
      }
      console.log('✅ Company Profile defaults seeded.');
    }
  }

  async getProfile() {
    const items = await this.prisma.lovValue.findMany({
      where: { code: PROFILE_CODE, isActive: true },
    });

    // Convert array to object
    const profile: Record<string, string> = {};
    KEYS.forEach((k) => {
      const found = items.find((i) => i.codeValue === k);
      profile[k.toLowerCase()] = found?.description || '';
    });

    return profile;
  }

  async updateProfile(data: Record<string, string>) {
    for (const key of KEYS) {
      const val = data[key.toLowerCase()];
      if (val !== undefined) {
        await this.prisma.lovValue.upsert({
          where: {
            code_codeValue: {
              code: PROFILE_CODE,
              codeValue: key,
            },
          },
          update: {
            description: val,
            updatedAt: new Date(),
            updatedBy: 'ADMIN',
          },
          create: {
            code: PROFILE_CODE,
            codeValue: key,
            description: val,
            isActive: true,
            createdBy: 'ADMIN',
          },
        });
      }
    }
    return this.getProfile();
  }
}
