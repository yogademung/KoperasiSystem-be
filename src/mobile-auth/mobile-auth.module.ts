import { Module } from '@nestjs/common';
import { MobileAuthService } from './mobile-auth.service';
import { MobileAuthController } from './mobile-auth.controller';
import { PrismaModule } from '../database/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { MobileJwtStrategy } from './strategies/mobile-jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'secret',
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  controllers: [MobileAuthController],
  providers: [MobileAuthService, MobileJwtStrategy],
  exports: [MobileAuthService],
})
export class MobileAuthModule {}
