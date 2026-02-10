import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'secret', // TODO: Ensure JWT_SECRET is set in .env
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    // Check for Single Session Enforcement
    // We compare the 'rt_hash' in the Access Token with the current Refresh Token in DB.
    // If they don't match, it means a new login (Force Login) happened and this token is old.
    if (payload.rt_hash && user.token) {
      const currentHash = user.token.slice(-10);
      if (payload.rt_hash !== currentHash) {
        throw new UnauthorizedException(
          'Session expired due to login on another device',
        );
      }
    }

    return user;
  }
}
