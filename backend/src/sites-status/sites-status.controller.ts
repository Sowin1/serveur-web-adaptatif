import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EnergyLevelService } from './energy-level.service.js';
import { SitesStatusService } from './sites-status.service.js';
import type { EnergyStatus, Service, Site } from './sites.types.js';

@Controller('sites')
export class SitesStatusController {
  constructor(
    private readonly sitesStatusService: SitesStatusService,
    private readonly energyLevelService: EnergyLevelService,
  ) {}

  @Get('status')
  getStatus(): Promise<Site[]> {
    return this.sitesStatusService.refreshStatuses();
  }

  @Get('level')
  getLevel(): EnergyStatus {
    return this.energyLevelService.getStatus();
  }

  @Post('level/refresh')
  @HttpCode(200)
  refreshLevel(): Promise<EnergyStatus> {
    return this.energyLevelService.refresh();
  }

  @Get(':siteId')
  getSite(@Param('siteId') siteId: string): Site {
    return this.sitesStatusService.getSite(siteId);
  }

  @Post(':siteId/services/:serviceId/start')
  @HttpCode(200)
  start(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<Service> {
    return this.sitesStatusService.startService(siteId, serviceId);
  }

  @Post(':siteId/services/:serviceId/stop')
  @HttpCode(200)
  stop(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<Service> {
    return this.sitesStatusService.stopService(siteId, serviceId, 'admin');
  }

  @Post(':siteId/services/:serviceId/restart')
  @HttpCode(200)
  restart(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<Service> {
    return this.sitesStatusService.restartService(siteId, serviceId);
  }

  @Patch(':siteId/services/:serviceId')
  updateSettings(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
    @Body() body: unknown,
  ): Service {
    return this.sitesStatusService.updateSettings(siteId, serviceId, body);
  }
}
