import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SERVICE_RUNNER } from './service-runner.js';
import type { ServiceRef, ServiceRunner } from './service-runner.js';
import { SITE_DEFINITIONS } from './sites.data.js';
import type {
  Feature,
  OperatingLevel,
  QuarantineCause,
  QuarantineInfo,
  QuarantinedService,
  Service,
  ServiceDefinition,
  ServiceSettings,
  Site,
  SiteDefinition,
  SiteSettings,
  StopSource,
} from './sites.types.js';

export const MAX_FAILURES = 3;

interface ServiceState extends ServiceDefinition {
  failures: number;
  manual: boolean;
  lastError: string | null;
  failureCause: QuarantineCause | null;
  quarantine: QuarantineInfo | null;
}

interface SiteState {
  id: string;
  name: string;
  priority: number;
  alwaysOn: boolean;
  services: ServiceState[];
  features: Feature[];
}

@Injectable()
export class SitesStatusService {
  private readonly logger = new Logger(SitesStatusService.name);
  private readonly sites: SiteState[];
  private level: OperatingLevel | null = null;

  constructor(
    @Inject(SERVICE_RUNNER) private readonly runner: ServiceRunner,
    @Inject(SITE_DEFINITIONS) definitions: SiteDefinition[],
  ) {
    this.sites = structuredClone(definitions).map((site, index) => ({
      ...site,
      priority: index + 1,
      alwaysOn: false,
      services: site.services.map((service) => ({
        ...service,
        failures: 0,
        manual: false,
        lastError: null,
        failureCause: null,
        quarantine: null,
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
    for (const site of this.sites) await this.applyLevelToSite(site, level);
    return this.getSites();
  }

  getSite(siteId: string): Site {
    return this.toSite(this.findSite(siteId));
  }

  async updateSite(siteId: string, body: unknown): Promise<Site[]> {
    const site = this.findSite(siteId);
    const settings = this.parseSiteSettings(body);
    if (settings.alwaysOn !== undefined) {
      site.alwaysOn = settings.alwaysOn;
      if (site.alwaysOn && this.level !== null) {
        await this.applyLevelToSite(site, this.level);
      }
    }
    if (settings.priority !== undefined) {
      const others = this.sites.filter((s) => s.id !== siteId);
      others.splice(settings.priority - 1, 0, site);
      others.forEach((s, index) => (s.priority = index + 1));
      this.sites.splice(0, this.sites.length, ...others);
    }
    return this.getSites();
  }

  async startSite(siteId: string): Promise<Site> {
    const site = this.findSite(siteId);
    for (const service of site.services) {
      if (service.status === 'quarantine') continue;
      service.manual = true;
      if (service.status !== 'active') await this.launch(site, service);
    }
    return this.toSite(site);
  }

  async stopSite(siteId: string): Promise<Site> {
    const site = this.findSite(siteId);
    for (const service of site.services) {
      service.manual = true;
      await this.halt(site, service);
    }
    return this.toSite(site);
  }

  async restartSite(siteId: string): Promise<Site> {
    const site = this.findSite(siteId);
    for (const service of site.services) {
      await this.relaunch(site, service);
    }
    return this.toSite(site);
  }

  async refreshStatuses(): Promise<Site[]> {
    for (const site of this.sites) {
      for (const service of site.services) {
        const watched =
          service.status === 'active' ||
          (service.status === 'error' && service.failureCause === 'health');
        if (!watched) continue;
        let failure: unknown = null;
        const healthy = await this.runner
          .isHealthy(this.ref(site, service))
          .catch((error: unknown) => {
            failure = error;
            return false;
          });
        if (!healthy) {
          await this.recordFailure(site, service, 'health', failure);
        } else if (service.status === 'error') {
          service.status = 'active';
          this.clearQuarantine(service);
        }
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
    if (source === 'auto' && (service.neverAutoStop || site.alwaysOn)) {
      throw new ConflictException(
        `Service ${serviceId} must never be stopped automatically`,
      );
    }
    if (source === 'admin') service.manual = true;
    return this.halt(site, service);
  }

  async restartService(siteId: string, serviceId: string): Promise<Service> {
    const { site, service } = this.find(siteId, serviceId);
    return this.relaunch(site, service);
  }

  getQuarantine(): QuarantinedService[] {
    return this.sites.flatMap((site) =>
      site.services
        .filter((service) => service.quarantine !== null)
        .map((service) => ({
          siteId: site.id,
          siteName: site.name,
          serviceId: service.id,
          serviceName: service.name,
          ...(service.quarantine as QuarantineInfo),
        })),
    );
  }

  releaseService(siteId: string, serviceId: string): Service {
    const { site, service } = this.find(siteId, serviceId);
    if (service.status !== 'quarantine') {
      throw new ConflictException(`Service ${serviceId} is not in quarantine`);
    }
    this.clearQuarantine(service);
    service.status = 'stopped';
    service.manual = true;
    this.logger.log(
      `Service ${service.id} of site ${site.id} released from quarantine`,
    );
    return this.toService(service);
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
      this.clearQuarantine(service);
    } catch (error) {
      await this.recordFailure(site, service, 'start', error);
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
    } catch (error) {
      await this.recordFailure(site, service, 'stop', error);
    }
    return this.toService(service);
  }

  private async relaunch(
    site: SiteState,
    service: ServiceState,
  ): Promise<Service> {
    if (service.status === 'active' || service.status === 'error') {
      await this.runner.stop(this.ref(site, service)).catch(() => undefined);
    }
    this.clearQuarantine(service);
    service.manual = true;
    return this.launch(site, service);
  }

  private async applyLevelToSite(
    site: SiteState,
    level: OperatingLevel,
  ): Promise<void> {
    for (const feature of site.features) {
      feature.enabled = level >= feature.minLevel;
    }
    for (const service of site.services) {
      if (service.manual) continue;
      const allowed = site.alwaysOn || level >= service.minLevel;
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

  private parseSiteSettings(body: unknown): SiteSettings {
    if (typeof body !== 'object' || body === null) {
      throw new BadRequestException('Body must be a JSON object');
    }
    const { priority, alwaysOn } = body as Record<string, unknown>;
    if (priority === undefined && alwaysOn === undefined) {
      throw new BadRequestException('Body must contain priority or alwaysOn');
    }
    if (
      priority !== undefined &&
      (typeof priority !== 'number' ||
        !Number.isInteger(priority) ||
        priority < 1 ||
        priority > this.sites.length)
    ) {
      throw new BadRequestException(
        `priority must be an integer between 1 and ${this.sites.length}`,
      );
    }
    if (alwaysOn !== undefined && typeof alwaysOn !== 'boolean') {
      throw new BadRequestException('alwaysOn must be a boolean');
    }
    return { priority, alwaysOn };
  }

  private async recordFailure(
    site: SiteState,
    service: ServiceState,
    cause: QuarantineCause,
    error: unknown,
  ): Promise<void> {
    service.failures += 1;
    service.failureCause = cause;
    service.lastError =
      error instanceof Error ? error.message : error ? String(error) : null;
    if (service.failures < MAX_FAILURES) {
      service.status = 'error';
      return;
    }
    service.status = 'quarantine';
    service.quarantine = {
      cause,
      detail: service.lastError,
      failures: service.failures,
      since: new Date().toISOString(),
    };
    await this.runner.stop(this.ref(site, service)).catch(() => undefined);
    this.logger.warn(
      `Service ${service.id} of site ${site.id} put in quarantine after ${service.failures} failed ${cause} attempts` +
        (service.lastError ? `: ${service.lastError}` : ''),
    );
  }

  private clearQuarantine(service: ServiceState): void {
    service.failures = 0;
    service.lastError = null;
    service.failureCause = null;
    service.quarantine = null;
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
    const {
      manual: _manual,
      lastError: _lastError,
      failureCause: _failureCause,
      ...rest
    } = service;
    return { ...rest, active: service.status === 'active' };
  }

  private toSite(site: SiteState): Site {
    const services = site.services.map((service) => this.toService(service));
    return {
      id: site.id,
      name: site.name,
      priority: site.priority,
      alwaysOn: site.alwaysOn,
      active: services.some((service) => service.active),
      services,
      features: site.features.map((feature) => ({ ...feature })),
    };
  }
}
