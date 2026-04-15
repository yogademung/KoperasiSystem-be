import { MobileAuthService } from './mobile-auth.service';
import { LoginMobileDto } from './dto/login-mobile.dto';
export declare class MobileAuthController {
    private readonly mobileAuthService;
    constructor(mobileAuthService: MobileAuthService);
    login(dto: LoginMobileDto): Promise<{
        access_token: string;
        user: {
            id: number;
            nasabahId: number;
            username: string;
        };
    }>;
    registerDevice(req: any, fcmToken: string): Promise<{
        username: string;
        password: string;
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        nasabahId: number;
        lastLoginAt: Date | null;
        fcmToken: string | null;
    }>;
    logout(req: any): Promise<{
        username: string;
        password: string;
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        nasabahId: number;
        lastLoginAt: Date | null;
        fcmToken: string | null;
    }>;
    getProfile(req: any): any;
}
