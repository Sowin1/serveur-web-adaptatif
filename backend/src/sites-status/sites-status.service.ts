import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SERVICE_RUNNER } from './service-runner.js';
import type { ServiceRef, ServiceRunner } from './service-runner.js';
import { SITE_DEFINITIONS } from './sites.data.js';
import type {
  Feature,
  OperatingLevel,
  Service,
  ServiceDefinition,
  ServiceSettings,
  Site,
  SiteDefinition,
  StopSource,
} from './sites.types.js';

export const MAX_FAILURES = 3;

interface ServiceState extends ServiceDefinition {
  failures: number;
  manual: boolean;
}

interface SiteState {
  id: string;
  name: string;
  services: ServiceState[];
  features: Feature[];
}

@Injectable()
export class SitesStatusService {
  private readonly sites: SiteState[];
  private level: OperatingLevel | null = null;

  constructor(
    @Inject(SERVICE_RUNNER) private readonly runner: ServiceRunner,
    @Inject(SITE_DEFINITIONS) definitions: SiteDefinition[],
  ) {
    this.sites = structuredClone(definitions).map((site) => ({
      ...site,
      services: site.services.map((service) => ({
        ...service,
        failures: 0,
        manual: false,
      })),
    }));
  }

  getSites(): Site[] {
    return this.sites.map((site) => this.toSite(site));
  }

  getLevel(): OperatingLevel | null {
    return this.level;
  }

  async applyLevel(level: OperatingLevel): Promise<Site[]> {
    if (level !== this.level) {
      for (const site of this.sites) {
        for (const service of site.services) service.manual = false;
      }
    }
    this.level = level;
    for (const site of this.sites) {
      for (const feature of site.features) {
        feature.enabled = level >= feature.minLevel;
      }
      for (const service of site.services) {
        if (service.manual) continue;
        const allowed = level >= service.minLevel;
        if (
          allowed &&
          (service.status === 'stopped' || service.status === 'error')
        ) {
          await this.launch(site, service);
        } else if (!allowed && !service.neverAutoStop) {
          await this.halt(site, service);
        }
      }
    }
    return this.getSites();
  }

  getSite(siteId: string): Site {
    return this.toSite(this.findSite(siteId));
  }

  async refreshStatuses(): Promise<Site[]> {
    for (const site of this.sites) {
      for (const service of site.services) {
        if (service.status !== 'active') continue;
        const healthy = await this.runner
          .isHealthy(this.ref(site, service))
          .catch(() => false);
        if (!healthy) this.recordFailure(service);
      }
    }
    return this.getSites();
  }

  async startService(siteId: string, serviceId: string): Promise<Service> {
    const { site, service } = this.find(siteId, serviceId);
    if (service.status === 'quarantine') {
      throw new ConflictException(
        `Service ${serviceId} is in quarantine, restart it to try again`,
      );
    }
    service.manual = true;
    if (service.status === 'active') return this.toService(service);
    return this.launch(site, service);
  }

  async stopService(
    siteId: string,
    serviceId: string,
    source: StopSource = 'admin',
  ): Promise<Service> {
    const { site, service } = this.find(siteId, serviceId);
    if (source === 'auto' && service.neverAutoStop) {
      throw new ConflictException(
        `Service ${serviceId} must never be stopped automatically`,
      );
    }
    if (source === 'admin') service.manual = true;
    return this.halt(site, service);
  }

  async restartService(siteId: string, serviceId: string): Promise<Service> {
    const { site, service } = this.find(siteId, serviceId);
    if (service.status === 'active' || service.status === 'error') {
      await this.runner.stop(this.ref(site, service)).catch(() => undefined);
    }
    service.failures = 0;
    service.manual = true;
    return this.launch(site, service);
  }

  updateSettings(
    siteId: string,
    serviceId: string,
    settings: unknown,
  ): Service {
    const { service } = this.find(siteId, serviceId);
    const parsed = this.parseSettings(settings);
    if (parsed.priority !== undefined) service.priority = parsed.priority;
    if (parsed.neverAutoStop !== undefined) {
      service.neverAutoStop = parsed.neverAutoStop;
    }
    return this.toService(service);
  }

  private async launch(
    site: SiteState,
    service: ServiceState,
  ): Promise<Service> {
    try {
      await this.runner.start(this.ref(site, service));
      service.status = 'active';
      service.failures = 0;
    } catch {
      this.recordFailure(service);
    }
    return this.toService(service);
  }

  private async halt(site: SiteState, service: ServiceState): Promise<Service> {
    if (service.status === 'stopped' || service.status === 'quarantine') {
      return this.toService(service);
    }
    try {
      await this.runner.stop(this.ref(site, service));
      service.status = 'stopped';
    } catch {
      this.recordFailure(service);
    }
    return this.toService(service);
  }

  private recordFailure(service: ServiceState): void {
    service.failures += 1;
    service.status = service.failures >= MAX_FAILURES ? 'quarantine' : 'error';
  }

  private parseSettings(settings: unknown): ServiceSettings {
    if (typeof settings !== 'object' || settings === null) {
      throw new BadRequestException('Body must be a JSON object');
    }
    const { priority, neverAutoStop } = settings as Record<string, unknown>;
    if (priority === undefined && neverAutoStop === undefined) {
      throw new BadRequestException(
        'Body must contain priority or neverAutoStop',
      );
    }
    if (priority !== undefined && typeof priority !== 'boolean') {
      throw new BadRequestException('priority must be a boolean');
    }
    if (neverAutoStop !== undefined && typeof neverAutoStop !== 'boolean') {
      throw new BadRequestException('neverAutoStop must be a boolean');
    }
    return { priority, neverAutoStop };
  }

  private findSite(siteId: string): SiteState {
    const site = this.sites.find((s) => s.id === siteId);
    if (!site) throw new NotFoundException(`Site ${siteId} not found`);
    return site;
  }

  private find(
    siteId: string,
    serviceId: string,
  ): { site: SiteState; service: ServiceState } {
    const site = this.findSite(siteId);
    const service = site.services.find((s) => s.id === serviceId);
    if (!service) {
      throw new NotFoundException(
        `Service ${serviceId} not found on site ${siteId}`,
      );
    }
    return { site, service };
  }

  private ref(site: SiteState, service: ServiceState): ServiceRef {
    return { siteId: site.id, serviceId: service.id, route: service.route };
  }

  private toService(service: ServiceState): Service {
    const { manual: _manual, ...rest } = service;
    return { ...rest, active: service.status === 'active' };
  }

  private toSite(site: SiteState): Site {
    const services = site.services.map((service) => this.toService(service));
    return {
      id: site.id,
      name: site.name,
      active: services.some((service) => service.active),
      services,
      features: site.features.map((feature) => ({ ...feature })),
    };
  }
}
