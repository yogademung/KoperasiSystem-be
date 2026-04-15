import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
        } | null;
    } & {
        username: string;
        password: string;
        id: number;
        fullName: string;
        staffId: string | null;
        roleId: number | null;
        regionCode: string | null;
        token: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        isTotpEnabled: boolean;
        totpSecret: string | null;
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
        } | null;
    } & {
        username: string;
        password: string;
        id: number;
        fullName: string;
        staffId: string | null;
        roleId: number | null;
        regionCode: string | null;
        token: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        isTotpEnabled: boolean;
        totpSecret: string | null;
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
    createRole(createRoleDto: {
        roleName: string;
        description?: string;
        isActive: boolean;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        roleName: string;
        description: string | null;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        username: string;
        password: string;
        id: number;
        fullName: string;
        staffId: string | null;
        roleId: number | null;
        regionCode: string | null;
        token: string | null;
        isActive: boolean;
        createdBy: string | null;
        createdAt: Date;
        updatedBy: string | null;
        updatedAt: Date | null;
        isTotpEnabled: boolean;
        totpSecret: string | null;
    }>;
}
