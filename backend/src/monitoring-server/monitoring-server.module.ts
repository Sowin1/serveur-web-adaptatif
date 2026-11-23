import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {} from './monitoring-server.controller.js';
import { MonitoringServerService } from './monitoring-server.service.js';
import { MonitoringServerController } from './monitoring-server.controller.js';

@Module({
  imports: [HttpModule],
  controllers: [MonitoringServerController],
  providers: [MonitoringServerService],
})
export class BatteryModule {}
