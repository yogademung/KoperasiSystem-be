import { SystemDateService } from './system-date.service';
export declare class SystemController {
    private readonly systemDateService;
    constructor(systemDateService: SystemDateService);
    getSystemStatus(): Promise<{
        businessDate: string;
        serverDate: string;
        isDateMismatch: boolean;
        unclosedShifts: {
            collectorName: string;
            startTime: Date;
        }[];
        unclosedShiftCount: number;
        canAdvanceDate: boolean;
    }>;
}
