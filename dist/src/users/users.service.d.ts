import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<any>;
    findAll(): Promise<any>;
    getRoles(): Promise<any>;
    createRole(data: {
        roleName: string;
        description?: string;
        isActive: boolean;
    }): Promise<any>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<any>;
}
