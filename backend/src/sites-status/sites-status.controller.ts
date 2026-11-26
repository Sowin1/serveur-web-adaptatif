import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { EnergyLevelService } from './energy-level.service.js';
import { SitesStatusService } from './sites-status.service.js';
import type {
  EnergyStatus,
  QuarantinedService,
  Service,
  Site,
} from './sites.types.js';

/** Routes of the sites and services part of the admin dashboard. */
@Controller('sites')
export class SitesStatusController {
  constructor(
    private readonly sitesStatusService: SitesStatusService,
    private readonly energyLevelService: EnergyLevelService,
  ) {}

  /** List of every site with its services, after a health check. */
  @Get('status')
  getStatus(): Promise<Site[]> {
    return this.sitesStatusService.refreshStatuses();
  }

  /** Current operating level computed from the battery. */
  @Get('level')
  getLevel(): EnergyStatus {
    return this.energyLevelService.getStatus();
  }

  /** Reads the battery now and applies the level. */
  @Post('level/refresh')
  @HttpCode(200)
  refreshLevel(): Promise<EnergyStatus> {
    return this.energyLevelService.refresh();
  }

  /** List of the services in quarantine. */
  @Get('quarantine')
  getQuarantine(): QuarantinedService[] {
    return this.sitesStatusService.getQuarantine();
  }

  /** One site with its services. */
  @Get(':siteId')
  getSite(@Param('siteId') siteId: string): Site {
    return this.sitesStatusService.getSite(siteId);
  }

  /** Changes the priority and/or alwaysOn setting of a site. */
  @Post(':siteId/settings')
  @HttpCode(200)
  updateSite(
    @Param('siteId') siteId: string,
    @Body() body: unknown,
  ): Promise<Site[]> {
    return this.sitesStatusService.updateSite(siteId, body);
  }

  /** Starts every service of a site. */
  @Post(':siteId/start')
  @HttpCode(200)
  startSite(@Param('siteId') siteId: string): Promise<Site> {
    return this.sitesStatusService.startSite(siteId);
  }

  /** Stops every service of a site. */
  @Post(':siteId/stop')
  @HttpCode(200)
  stopSite(@Param('siteId') siteId: string): Promise<Site> {
    return this.sitesStatusService.stopSite(siteId);
  }

  /** Restarts every service of a site. */
  @Post(':siteId/restart')
  @HttpCode(200)
  restartSite(@Param('siteId') siteId: string): Promise<Site> {
    return this.sitesStatusService.restartSite(siteId);
  }

  /** Puts every service of a site in quarantine. */
  @Post(':siteId/quarantine')
  @HttpCode(200)
  quarantineSite(
    @Param('siteId') siteId: string,
    @Body() body: unknown,
  ): Promise<Site> {
    return this.sitesStatusService.quarantineSite(siteId, body);
  }

  /** Takes a site out of quarantine. */
  @Post(':siteId/release')
  @HttpCode(200)
  releaseSite(@Param('siteId') siteId: string): Site {
    return this.sitesStatusService.releaseSite(siteId);
  }

  /** Starts a service. */
  @Post(':siteId/services/:serviceId/start')
  @HttpCode(200)
  start(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<Service> {
    return this.sitesStatusService.startService(siteId, serviceId);
  }

  /** Stops a service (admin action, allowed on protected services). */
  @Post(':siteId/services/:serviceId/stop')
  @HttpCode(200)
  stop(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<Service> {
    return this.sitesStatusService.stopService(siteId, serviceId, 'admin');
  }

  /** Restarts a service and takes it out of quarantine. */
  @Post(':siteId/services/:serviceId/restart')
  @HttpCode(200)
  restart(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Promise<Service> {
    return this.sitesStatusService.restartService(siteId, serviceId);
  }

  /** Puts a service in quarantine. */
  @Post(':siteId/services/:serviceId/quarantine')
  @HttpCode(200)
  quarantine(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
    @Body() body: unknown,
  ): Promise<Service> {
    return this.sitesStatusService.quarantineService(siteId, serviceId, body);
  }

  /** Takes a service out of quarantine. */
  @Post(':siteId/services/:serviceId/release')
  @HttpCode(200)
  release(
    @Param('siteId') siteId: string,
    @Param('serviceId') serviceId: string,
  ): Service {
    return this.sitesStatusService.releaseService(siteId, serviceId);
  }

  /** Changes the priority and/or neverAutoStop flags of a service. */
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
