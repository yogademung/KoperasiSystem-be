import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        requiresForceLogin: boolean;
        message: string;
        requiresSetup2FA?: undefined;
        userId?: undefined;
        qrCodeUrl?: undefined;
        secret?: undefined;
        requires2FA?: undefined;
        accessToken?: undefined;
        refreshToken?: undefined;
        user?: undefined;
    } | {
        requiresSetup2FA: boolean;
        userId: any;
        qrCodeUrl: string;
        secret: string;
        message: string;
        requiresForceLogin?: undefined;
        requires2FA?: undefined;
        accessToken?: undefined;
        refreshToken?: undefined;
        user?: undefined;
    } | {
        requires2FA: boolean;
        message: string;
        requiresForceLogin?: undefined;
        requiresSetup2FA?: undefined;
        userId?: undefined;
        qrCodeUrl?: undefined;
        secret?: undefined;
        accessToken?: undefined;
        refreshToken?: undefined;
        user?: undefined;
    } | {
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            username: any;
            fullName: any;
            role: any;
            menus: any[];
        };
        requiresForceLogin?: undefined;
        message?: undefined;
        requiresSetup2FA?: undefined;
        userId?: undefined;
        qrCodeUrl?: undefined;
        secret?: undefined;
        requires2FA?: undefined;
    }>;
    logout(user: any): Promise<void>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    getProfile(user: any): Promise<any>;
    confirm2FA(body: {
        userId: number;
        secret: string;
        code: string;
    }): Promise<{
        success: boolean;
    }>;
}
