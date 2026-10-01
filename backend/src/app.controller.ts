import { Controller, Get, Post, Request } from '@nestjs/common';
import { AppService } from './app.service.js';
import { BatteryAuthService } from './battery-auth/battery-auth.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
