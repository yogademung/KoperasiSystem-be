import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@CurrentUser() user) {
        return this.authService.logout(user.id);
    }

    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser() user) {
        return user;
    }

    @Post('2fa/confirm')
    async confirm2FA(@Body() body: { userId: number; secret: string; code: string }) {
        return this.authService.confirmTotpSetup(body.userId, body.secret, body.code);
    }
}
