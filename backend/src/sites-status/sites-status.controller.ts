import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { EnergyLevelService } from './energy-level.service.js';
import { SitesStatusService } from './sites-status.service.js';
import type {
  EnergyStatus,
  QuarantinedService,
  Service,
  Site,
} from './sites.types.js';

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

  @Get('quarantine')
  getQuarantine(): QuarantinedService[] {
    return this.sitesStatusService.getQuarantine();
  }

  @Get(':siteId')
  getSite(@Param('siteId') siteId: string): Site {
    return this.sitesStatusService.getSite(siteId);
  }

  @Post(':siteId/settings')
  @HttpCode(200)
  updateSite(
    @Param('siteId') siteId: string,
    @Body() body: unknown,
  ): Promise<Site[]> {
    return this.sitesStatusService.updateSite(siteId, body);
  }

  @Post(':siteId/start')
  @HttpCode(200)
  startSite(@Param('siteId') siteId: string): Promise<Site> {
    return this.sitesStatusService.startSite(siteId);
  }

  @Post(':siteId/stop')
  @HttpCode(200)
  stopSite(@Param('siteId') siteId: string): Promise<Site> {
    return this.sitesStatusService.stopSite(siteId);
  }

  @Post(':siteId/restart')
  @HttpCode(200)
  restartSite(@Param('siteId') siteId: string): Promise<Site> {
    return this.sitesStatusService.restartSite(siteId);
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

  @Post(':siteId/services/:serviceId/release')
  @HttpCode(200)
  release(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Service {
    return this.sitesStatusService.releaseService(siteId, serviceId);
  }

  @Post(':siteId/services/:serviceId/settings')
  @HttpCode(200)
  updateSettings(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
    @Body() body: unknown,
  ): Service {
    return this.sitesStatusService.updateSettings(siteId, serviceId, body);
  }
}
