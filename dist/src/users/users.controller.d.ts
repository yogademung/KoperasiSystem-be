import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        role: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            roleName: string;
            description: string | null;
        };
    } & {
        username: string;
        password: string;
        fullName: string;
        staffId: string | null;
        regionCode: string | null;
        token: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        roleId: number;
    }>;
    findAll(): Promise<({
        role: {
            isActive: boolean;
            createdBy: string | null;
            createdAt: Date;
            updatedBy: string | null;
            updatedAt: Date | null;
            id: number;
            roleName: string;
            description: string | null;
        };
    } & {
        username: string;
        password: string;
        fullName: string;
        staffId: string | null;
        regionCode: string | null;
        token: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        roleId: number;
    })[]>;
    getRoles(): Promise<{
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        id: number;
        roleName: string;
        description: string | null;
    }[]>;
}
