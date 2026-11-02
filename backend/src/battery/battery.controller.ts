import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BatteryService } from './battery.service.js';

@Controller('battery')
export class BatteryController {
  constructor(private readonly batteryService: BatteryService) {}

  @UseGuards(AuthGuard('battery'))
  @Get('list')
  getBatteryList(): Promise<any> {
    return this.batteryService.getBatteryList();
  }

  @UseGuards(AuthGuard('battery'))
  @Get(':id')
  getBatteryInformation(@Param('id') id: string): Promise<any> {
    return this.batteryService.getBatteryInformation(id);
  }

  @UseGuards(AuthGuard('battery'))
  @Get(':id/percentage')
  getBatteryPercentage(@Param('id') id: string): Promise<any> {
    return this.batteryService.getBatteryPercentage(id);
  }

  @UseGuards(AuthGuard('battery'))
  @Get(':id/state')
  getBatteryState(@Param('id') id: string): Promise<any> {
    return this.batteryService.getBatteryState(id);
  }

  // @UseGuards(AuthGuard('battery'))
  // @Post(':id/update-level')
  // updateBatteryState(
  //   @Param('id') id: string,
  //   @Body('battery-level') state: number,
  // ): Promise<any> {
  //   return this.batteryService.changeBatteryLevel(id, level);
  // }
}
