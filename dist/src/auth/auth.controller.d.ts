import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        requiresForceLogin: boolean;
        message: string;
        accessToken?: undefined;
        refreshToken?: undefined;
        user?: undefined;
    } | {
        accessToken: string;
        refreshToken: string;
        user: {
            id: number;
            username: string;
            fullName: string;
            role: string;
            menus: any[];
        };
        requiresForceLogin?: undefined;
        message?: undefined;
    }>;
    logout(user: any): Promise<void>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    getProfile(user: any): Promise<any>;
}
