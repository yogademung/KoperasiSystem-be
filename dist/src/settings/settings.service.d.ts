import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
export declare class SettingsService implements OnModuleInit {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private ensureDefaults;
    getProfile(): Promise<Record<string, string>>;
    updateProfile(data: Record<string, string>): Promise<Record<string, string>>;
}
