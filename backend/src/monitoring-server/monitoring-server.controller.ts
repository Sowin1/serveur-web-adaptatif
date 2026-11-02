import { Controller, Get } from '@nestjs/common';
import type { ServerInfo } from './monitoring-server.service.js';

import { MonitoringServerService } from './monitoring-server.service.js';

@Controller('monitoring-server')
export class MonitoringServerController {
  constructor(
    private readonly monitoringServerService: MonitoringServerService,
  ) {}

  @Get('cpu')
  getMonitoringCpuUsage(): Promise<any> {
    return this.monitoringServerService.cpuUsage();
  }

  @Get('ram')
  getMonitoringRamUsage(): ServerInfo[] {
    return this.monitoringServerService.usedServerRam();
  }
  //   @UseGuards(AuthGuard('battery'))
  //   @Get('list')
  //   getBatteryList(): Promise<any> {
  //     return this.batteryService.getBatteryList();
  //   }
}
