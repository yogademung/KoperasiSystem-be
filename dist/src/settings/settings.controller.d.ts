import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getProfile(): Promise<Record<string, string>>;
    updateProfile(data: any): Promise<Record<string, string>>;
    uploadLogo(file: Express.Multer.File): {
        url: string;
    };
}
