export type ServiceStatus = 'active' | 'stopped' | 'error' | 'quarantine';

export type StopSource = 'admin' | 'auto';

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
  active: boolean;
  services: Service[];
  features: Feature[];
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

export interface ServiceDefinition {
  id: string;
  name: string;
  route: string | null;
  status: ServiceStatus;
  priority: boolean;
  neverAutoStop: boolean;
  minLevel: OperatingLevel;
}

export interface SiteDefinition {
  id: string;
  name: string;
  services: ServiceDefinition[];
  features: Feature[];
}

export interface ServiceSettings {
  priority?: boolean;
  neverAutoStop?: boolean;
}
