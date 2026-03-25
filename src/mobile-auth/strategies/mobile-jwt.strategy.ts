import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MobileJwtStrategy extends PassportStrategy(Strategy, 'mobile-jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'secret',
    });
  }

  async validate(payload: any) {
    if (payload.type !== 'MOBILE') {
      throw new UnauthorizedException('Invalid token type for mobile access');
    }

    const mobileUser = await this.prisma.mobileUser.findUnique({
      where: { id: payload.sub },
      include: { nasabah: true },
    });

    if (!mobileUser || !mobileUser.isActive) {
      throw new UnauthorizedException('Mobile access deactivated or user not found');
    }

    return mobileUser;
  }
}
