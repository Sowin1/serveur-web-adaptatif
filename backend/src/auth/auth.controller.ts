import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Create cookies if the login is successful
  @Post('login')
  async login(
    @Body() body: { password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.login(body.password);

    res.cookie('isAdmin', 'true', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
  }

  // Delete the cookie if the admin logout
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('isAdmin', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
  }

  // Verify if you are logged as admin
  @Get('admin')
  @UseGuards(AuthGuard)
  admin() {
    return;
  }
}
