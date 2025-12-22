import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        role: {
            id: number;
            description: string | null;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            roleName: string;
        };
    } & {
        id: number;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
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
            id: number;
            description: string | null;
            updatedAt: Date | null;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            roleName: string;
        };
    } & {
        id: number;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        username: string;
        password: string;
        fullName: string;
        staffId: string | null;
        roleId: number;
        regionCode: string | null;
        token: string | null;
    })[]>;
    getRoles(): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        roleName: string;
    }[]>;
}
