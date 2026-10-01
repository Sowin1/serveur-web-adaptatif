import { Controller, Post, Request } from '@nestjs/common';
import { BatteryAuthService } from './battery-auth.service.js';

@Controller()
export class BatteryAuthController {
  constructor(private batteryAuthService: BatteryAuthService) {}
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
