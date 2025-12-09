import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        role: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            roleName: string;
            description: string | null;
        };
    } & {
        id: number;
        username: string;
        password: string;
        fullName: string;
        staffId: string | null;
        roleId: number;
        regionCode: string | null;
        token: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
    }>;
    findAll(): Promise<({
        role: {
            id: number;
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            roleName: string;
            description: string | null;
        };
    } & {
        id: number;
        username: string;
        password: string;
        fullName: string;
        staffId: string | null;
        roleId: number;
        regionCode: string | null;
        token: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
    })[]>;
    getRoles(): Promise<{
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        roleName: string;
        description: string | null;
    }[]>;
}
