/** State of a service. 'error' = failed less than MAX_FAILURES times. */
export type ServiceStatus = 'active' | 'stopped' | 'error' | 'quarantine';

/** Who asks for a stop: the admin or the automatic energy management. */
export type StopSource = 'admin' | 'auto';

/** What put a service in quarantine ('manual' = the admin). */
export type QuarantineCause = 'start' | 'stop' | 'health' | 'manual';

/** Why and since when a service is in quarantine. */
export interface QuarantineInfo {
  cause: QuarantineCause;
  detail: string | null;
  failures: number;
  since: string;
}

/** Operating level: 0 shutdown, 1 survival, 2 economy, 3 normal, 4 abundance. */
export type OperatingLevel = 0 | 1 | 2 | 3 | 4;

/** A service as returned by the API. minLevel is the lowest level where it runs. */
export interface Service {
  id: string;
  name: string;
  route: string | null;
  status: ServiceStatus;
  active: boolean;
  priority: boolean;
  neverAutoStop: boolean;
  failures: number;
  minLevel: OperatingLevel;
  quarantine: QuarantineInfo | null;
}

/** A feature of a site (images, videos...), enabled from minLevel. */
export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
  minLevel: OperatingLevel;
}

/**
 * A site as returned by the API. priority 1 is the most important site,
 * alwaysOn keeps its services running even on low battery.
 */
export interface Site {
  id: string;
  name: string;
  priority: number;
  alwaysOn: boolean;
  active: boolean;
  services: Service[];
  features: Feature[];
}

export interface QuarantinedService extends QuarantineInfo {
  siteId: string;
  siteName: string;
  serviceId: string;
  serviceName: string;
}

/** Result of GET /sites/level. */
export interface EnergyStatus {
  level: OperatingLevel | null;
  label: string | null;
  percentage: number | null;
  charging: boolean | null;
  batteryId: string | null;
  updatedAt: string | null;
  error: string | null;
}

/** Initial definition of a service, used in sites.data.ts. */
export interface ServiceDefinition {
  id: string;
  name: string;
  route: string | null;
  status: ServiceStatus;
  priority: boolean;
  neverAutoStop: boolean;
  minLevel: OperatingLevel;
}

/** Initial definition of a site, used in sites.data.ts. */
export interface SiteDefinition {
  id: string;
  name: string;
  services: ServiceDefinition[];
  features: Feature[];
}

export interface SiteSettings {
  priority?: number;
  alwaysOn?: boolean;
}

export interface ServiceSettings {
  priority?: boolean;
  neverAutoStop?: boolean;
}
