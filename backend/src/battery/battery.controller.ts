import { Controller, Get, Param } from '@nestjs/common';
import { BatteryService } from './battery.service.js';

@Controller('battery')
export class BatteryController {
  constructor(private readonly batteryService: BatteryService) {}
  @Get('list')
  getBatteryList(): Promise<any> {
    return this.batteryService.getBatteryList();
  }

  @Get(':id')
  getBatteryInformation(@Param('id') id: string): Promise<any> {
    return this.batteryService.getBatteryInformation(id);
  }

  @Get(':id/percentage')
  getBatteryPercentage(@Param('id') id: string): Promise<any> {
    return this.batteryService.getBatteryPercentage(id);
  }
  @Get(':id/state')
  getBatteryState(@Param('id') id: string): Promise<any> {
    return this.batteryService.getBatteryState(id);
  }
}
