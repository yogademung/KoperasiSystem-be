import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        // 1. Find user
        const user = await this.prisma.user.findUnique({
            where: { username: loginDto.username },
            include: { role: true },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 2. Verify password
        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // 3. Check existing session (multi-device prevention)
        if (user.token && !loginDto.forceLogin) {
            // If strict session is required, we return a flag.
            // But if user just closed browser and re-opened, token in DB is still there.
            // Unless logout cleared it.
            // So this might be annoying for users if they didn't logout.
            // But I will follow the prompt's requirement.
            return {
                requiresForceLogin: true,
                message: 'Account is already logged in on another device',
            };
        }

        // 4. Generate tokens
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role.roleName, // Schema uses roleName
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(
            { sub: user.id },
            { expiresIn: '7d' },
        );

        // 5. Update token in database
        await this.prisma.user.update({
            where: { id: user.id },
            data: { token: refreshToken },
        });

        // 6. Fetch Menus for the Role
        const menuRoles = await this.prisma.menuRole.findMany({
            where: {
                roleId: user.roleId,
                canRead: true, // Only menus they can read
                menu: { isActive: true } // Only active menus
            },
            include: {
                menu: true,
            },
            orderBy: {
                menu: { orderNum: 'asc' }
            }
        });

        const menus = this.buildMenuTree(menuRoles);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                role: user.role.roleName,
                menus: menus, // Return the structured menu tree
            },
        };
    }

    private buildMenuTree(menuRoles: any[]) {
        const menuMap = new Map();
        const rootMenus: any[] = [];

        // First pass: Create map of all menus
        menuRoles.forEach(mr => {
            const menu = {
                id: mr.menu.id,
                label: mr.menu.menuName,
                path: mr.menu.path,
                icon: mr.menu.icon,
                module: mr.menu.module, // Include module for section mapping
                children: [],
                parentId: mr.menu.parentId,
                // permissions: { create: mr.canCreate, update: mr.canUpdate, delete: mr.canDelete } // Optional: verify if needed by frontend
            };
            menuMap.set(menu.id, menu);
        });

        // Second pass: Build hierarchy
        menuMap.forEach(menu => {
            if (menu.parentId) {
                const parent = menuMap.get(menu.parentId);
                if (parent) {
                    parent.children.push(menu);
                }
            } else {
                rootMenus.push(menu);
            }
        });

        return rootMenus;
    }

    async logout(userId: number) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { token: null },
        });
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || user.token !== refreshToken) {
                throw new UnauthorizedException();
            }

            const newAccessToken = this.jwtService.sign({
                sub: user.id,
                username: user.username,
            });

            return { accessToken: newAccessToken };
        } catch {
            throw new UnauthorizedException();
        }
    }
}
