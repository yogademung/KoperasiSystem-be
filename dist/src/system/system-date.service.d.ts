import { PrismaService } from '../database/prisma.service';
export declare class SystemDateService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentBusinessDate(): Promise<Date>;
    getServerDate(): Date;
    isDateMismatch(): Promise<boolean>;
    getUnclosedShifts(date?: Date): Promise<any>;
    canAdvanceDate(): Promise<boolean>;
    advanceBusinessDate(): Promise<{
        success: boolean;
        newDate?: Date;
        message: string;
    }>;
    getSystemStatus(): Promise<{
        businessDate: string;
        serverDate: string;
        isDateMismatch: boolean;
        unclosedShifts: any;
        unclosedShiftCount: any;
        canAdvanceDate: boolean;
    }>;
}
