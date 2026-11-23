import { Controller, Post, Request } from '@nestjs/common';
import { BatteryAuthService } from './battery-auth.service.js';

@Controller()
export class BatteryAuthController {
  constructor(private batteryAuthService: BatteryAuthService) {}
  @Post('battery/login')
  async authenticate(@Request() _req: any) {
    return await this.batteryAuthService.authenticate();
  }
}
