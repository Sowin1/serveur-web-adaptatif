import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BatteryService } from '../battery/battery.service.js';
import { EnergyLevelService } from './energy-level.service.js';
import { BatteryEnergySource, ENERGY_SOURCE } from './energy-source.js';
import { SERVICE_RUNNER, SimulatedServiceRunner } from './service-runner.js';
import { SitesStatusController } from './sites-status.controller.js';
import { SitesStatusService } from './sites-status.service.js';
import { SITE_DEFINITIONS, SITES } from './sites.data.js';

/**
 * Sites and services module. Exports SitesStatusService and EnergyLevelService
 * so other modules (arbitration, cache...) can use them.
 */
@Module({
  imports: [HttpModule],
  controllers: [SitesStatusController],
  providers: [
    SitesStatusService,
    EnergyLevelService,
    BatteryService,
    { provide: ENERGY_SOURCE, useClass: BatteryEnergySource },
    { provide: SERVICE_RUNNER, useClass: SimulatedServiceRunner },
    { provide: SITE_DEFINITIONS, useValue: SITES },
  ],
  exports: [SitesStatusService, EnergyLevelService],
})
export class SitesStatusModule {}
