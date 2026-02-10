import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // Security: Log username only, never log passwords
    console.log('Login attempt for user:', loginDto.username);

    authenticator.options = { window: 1 }; // Allow 30s drift

    // 1. Find user
    const user = await this.prisma.user.findUnique({
      where: { username: loginDto.username },
      include: { role: true },
    });

    if (!user) {
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
      return {
        requiresForceLogin: true,
        message: 'Account is already logged in on another device',
      };
    }

    // 4. TOTP Check
    if (user.isTotpEnabled) {
      // Need to setup?
      if (!user.totpSecret) {
        // Generate secret and QR code for setup
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri(
          user.username,
          'Koperasi System',
          secret,
        );
        const qrCodeUrl = await toDataURL(otpauthUrl);

        return {
          requiresSetup2FA: true,
          userId: user.id,
          qrCodeUrl,
          secret, // Frontend sends this back with code for verification
          message: 'Please setup Two-Factor Authentication',
        };
      }

      // Already setup, requires code
      if (!loginDto.twoFactorCode) {
        return {
          requires2FA: true,
          message: 'Enter 2FA Code',
        };
      }

      // Verify Code
      const isValid = authenticator.verify({
        token: loginDto.twoFactorCode,
        secret: user.totpSecret,
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA Code');
      }
    }

    // 5. Generate tokens
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role?.roleName || null,
      rt_hash: refreshToken.slice(-10),
    };

    const accessToken = this.jwtService.sign(payload);

    // 6. Update token in database (finalize login)
    await this.prisma.user.update({
      where: { id: user.id },
      data: { token: refreshToken },
    });

    // 7. Fetch Menus
    const menuRoles = user.roleId
      ? await this.prisma.menuRole.findMany({
          where: {
            roleId: user.roleId,
            canRead: true,
            menu: { isActive: true },
          },
          include: {
            menu: true,
          },
          orderBy: {
            menu: { orderNum: 'asc' },
          },
        })
      : [];

    const menus = this.buildMenuTree(menuRoles);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role?.roleName || null,
        menus: menus,
      },
    };
  }

  async confirmTotpSetup(userId: number, secret: string, code: string) {
    const isValid = authenticator.verify({
      token: code,
      secret: secret,
    });

    if (!isValid) throw new UnauthorizedException('Invalid Code');

    await this.prisma.user.update({
      where: { id: userId },
      data: { totpSecret: secret },
    });

    return { success: true };
  }

  private buildMenuTree(menuRoles: any[]) {
    const menuMap = new Map();
    const rootMenus: any[] = [];

    // First pass: Create map of all menus
    menuRoles.forEach((mr) => {
      const menu = {
        id: mr.menu.id,
        label: mr.menu.menuName,
        path: mr.menu.path,
        icon: mr.menu.icon,
        module: mr.menu.module, // Include module for section mapping
        children: [],
        parentId: mr.menu.parentId,
      };
      menuMap.set(menu.id, menu);
    });

    // Second pass: Build hierarchy
    menuMap.forEach((menu) => {
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
