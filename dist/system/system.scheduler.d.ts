import { SystemDateService } from './system-date.service';
export declare class SystemSchedulerService {
    private readonly systemDateService;
    private readonly logger;
    constructor(systemDateService: SystemDateService);
    handleDailyDateAdvance(): Promise<void>;
}
