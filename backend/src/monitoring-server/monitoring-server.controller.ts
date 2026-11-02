import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ServerInfo } from './monitoring-server.service.js';

import { MonitoringServerService } from './monitoring-server.service.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('monitoring-server')
export class MonitoringServerController {
  constructor(
    private readonly monitoringServerService: MonitoringServerService,
  ) {}

  @UseGuards(AuthGuard('project'))
  @Get('cpu')
  getMonitoringCpuUsage(): Promise<any> {
    return this.monitoringServerService.cpuUsage();
  }

  @UseGuards(AuthGuard('project'))
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
