import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        // Check if username exists
        const existingUser = await this.prisma.user.findUnique({
            where: { username: createUserDto.username },
        });

        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        return this.prisma.user.create({
            data: {
                username: createUserDto.username,
                password: hashedPassword,
                fullName: createUserDto.fullName,
                roleId: createUserDto.roleId,
                staffId: createUserDto.staffId,
                regionCode: createUserDto.regionCode,
                isActive: createUserDto.isActive ?? true,
                createdBy: 'ADMIN', // Should strictly come from CurrentUser but simplifying for now
            },
            include: {
                role: true,
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            include: {
                role: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getRoles() {
        return this.prisma.role.findMany({
            where: { isActive: true },
            orderBy: { roleName: 'asc' },
        });
    }
    async update(id: number, updateUserDto: UpdateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data: {
                ...updateUserDto,
                updatedBy: 'ADMIN', // Placeholder for current user
            },
        });
    }
}
