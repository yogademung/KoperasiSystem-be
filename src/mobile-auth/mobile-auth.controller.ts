import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { MobileAuthService } from './mobile-auth.service';
import { MobileJwtAuthGuard } from './guards/mobile-jwt-auth.guard';
import { LoginMobileDto } from './dto/login-mobile.dto';

@Controller('api/mobile/auth')
export class MobileAuthController {
  constructor(private readonly mobileAuthService: MobileAuthService) {}

  @Post('login')
  login(@Body() dto: LoginMobileDto) {
    return this.mobileAuthService.login(dto);
  }

  @UseGuards(MobileJwtAuthGuard)
  @Post('register-device')
  registerDevice(@Request() req, @Body('fcmToken') fcmToken: string) {
    return this.mobileAuthService.registerDevice(req.user.id, fcmToken);
  }

  @UseGuards(MobileJwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    return this.mobileAuthService.logout(req.user.id);
  }

  @UseGuards(MobileJwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
