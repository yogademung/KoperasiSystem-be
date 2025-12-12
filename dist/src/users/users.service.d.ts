import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        role: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            description: string | null;
            roleName: string;
        };
    } & {
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        username: string;
        password: string;
        fullName: string;
        staffId: string | null;
        roleId: number;
        regionCode: string | null;
        token: string | null;
    }>;
    findAll(): Promise<({
        role: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            description: string | null;
            roleName: string;
        };
    } & {
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        username: string;
        password: string;
        fullName: string;
        staffId: string | null;
        roleId: number;
        regionCode: string | null;
        token: string | null;
    })[]>;
    getRoles(): Promise<{
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        description: string | null;
        roleName: string;
    }[]>;
}
