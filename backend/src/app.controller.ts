import {
  Controller,
  Get,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service.js';
import { BatteryAuthService } from './battery-auth/battery-auth.service.js';
import { BatteryAuthGuard } from './battery-auth/battery-auth.guard.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private batteryAuthService: BatteryAuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('battery/login')
  async authenticate(@Request() req: any) {
    try {
      await this.batteryAuthService.validate(req.body.password);
      return this.batteryAuthService.authenticate();
    } catch (e) {
      throw e;
    }
  }
}
