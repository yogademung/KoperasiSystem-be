import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
            role: string | null;
            menus: any[];
        };
        requiresForceLogin?: undefined;
        message?: undefined;
    }>;
    private buildMenuTree;
    logout(userId: number): Promise<void>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
}
