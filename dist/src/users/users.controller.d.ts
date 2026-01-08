import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
        } | null;
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
        regionCode: string | null;
        token: string | null;
        isTotpEnabled: boolean;
        totpSecret: string | null;
        roleId: number | null;
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
        } | null;
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
        regionCode: string | null;
        token: string | null;
        isTotpEnabled: boolean;
        totpSecret: string | null;
        roleId: number | null;
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
    createRole(createRoleDto: {
        roleName: string;
        description?: string;
        isActive: boolean;
    }): Promise<{
        id: number;
        description: string | null;
        updatedAt: Date | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        roleName: string;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
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
        regionCode: string | null;
        token: string | null;
        isTotpEnabled: boolean;
        totpSecret: string | null;
        roleId: number | null;
    }>;
}
