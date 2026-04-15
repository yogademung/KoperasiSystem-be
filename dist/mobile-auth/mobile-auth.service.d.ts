import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginMobileDto } from './dto/login-mobile.dto';
export declare class MobileAuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(dto: LoginMobileDto): Promise<{
        access_token: string;
        user: {
            id: number;
            nasabahId: number;
            username: string;
        };
    }>;
    registerDevice(mobileUserId: number, fcmToken: string): Promise<{
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
    logout(mobileUserId: number): Promise<{
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
}
