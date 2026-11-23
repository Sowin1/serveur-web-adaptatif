export type ServiceStatus = 'active' | 'stopped' | 'error' | 'quarantine';

export type StopSource = 'admin' | 'auto';

export type QuarantineCause = 'start' | 'stop' | 'health';

export interface QuarantineInfo {
  cause: QuarantineCause;
  detail: string | null;
  failures: number;
  since: string;
}

export type OperatingLevel = 0 | 1 | 2 | 3 | 4;

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

export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
  minLevel: OperatingLevel;
}

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

export interface EnergyStatus {
  level: OperatingLevel | null;
  label: string | null;
  percentage: number | null;
  charging: boolean | null;
  batteryId: string | null;
  updatedAt: string | null;
  error: string | null;
}

export interface SiteSettings {
  priority?: number;
  alwaysOn?: boolean;
}

export interface ServiceSettings {
  priority?: boolean;
  neverAutoStop?: boolean;
}