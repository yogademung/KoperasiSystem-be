import { SystemDateService } from './system-date.service';
export declare class SystemController {
    private readonly systemDateService;
    constructor(systemDateService: SystemDateService);
    getSystemStatus(): Promise<{
        businessDate: string;
        serverDate: string;
        isDateMismatch: boolean;
        unclosedShifts: any;
        unclosedShiftCount: any;
        canAdvanceDate: boolean;
    }>;
    advanceDate(): Promise<{
        success: boolean;
        newDate?: Date;
        message: string;
    }>;
}
