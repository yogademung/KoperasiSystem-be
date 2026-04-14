import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginMobileDto } from './dto/login-mobile.dto';

@Injectable()
export class MobileAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginMobileDto) {
    const { kodeKoperasi, username, password } = dto;

    const koperasiConfig = await this.prisma.lovValue.findUnique({
      where: {
        code_codeValue: {
          code: 'KOPERASI_CONFIG',
          codeValue: 'KOPERASI_CODE',
        },
      },
    });

    if (!koperasiConfig || koperasiConfig.description !== kodeKoperasi) {
      throw new UnauthorizedException('Kode Koperasi tidak valid');
    }

    const mobileUser = await this.prisma.mobileUser.findUnique({
      where: { username },
    });

    if (!mobileUser || !mobileUser.isActive) {
      throw new UnauthorizedException('Kredensial tidak valid atau akun dinonaktifkan');
    }

    const isMatch = await bcrypt.compare(password, mobileUser.password);
    if (!isMatch) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    await this.prisma.mobileUser.update({
      where: { id: mobileUser.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = {
      sub: mobileUser.id,
      nasabahId: mobileUser.nasabahId,
      username: mobileUser.username,
      type: 'MOBILE',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: mobileUser.id,
        nasabahId: mobileUser.nasabahId,
        username: mobileUser.username,
      },
    };
  }

  async registerDevice(mobileUserId: number, fcmToken: string) {
    return this.prisma.mobileUser.update({
      where: { id: mobileUserId },
      data: { fcmToken, updatedAt: new Date() },
    });
  }

  async logout(mobileUserId: number) {
    return this.prisma.mobileUser.update({
      where: { id: mobileUserId },
      data: { fcmToken: null },
    });
  }
}
