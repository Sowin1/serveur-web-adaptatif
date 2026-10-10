import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // API for login
  @Post('login')
  async login(
    @Body() body: { password: string },
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.login(body.password);

    reply.setCookie('isAdmin', 'true', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  }

  // API that handle the logout
  @Post('logout')
  logout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('isAdmin', {
      path: '/',
    });

    return { success: true };
  }

  // API to verify if the admin is login or not
  @Get('admin')
  @UseGuards(AuthGuard)
  admin() {
    return { authenticated: true };
  }
}
