import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BatteryController } from './battery.controller.js';
import { BatteryService } from './battery.service.js';

@Module({
  imports: [HttpModule],
  controllers: [BatteryController],
  providers: [BatteryService],
})
export class BatteryModule {}
