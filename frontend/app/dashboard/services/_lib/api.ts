import type {
  EnergyStatus,
  Service,
  ServiceSettings,
  Site,
  SiteSettings,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Action = 'start' | 'stop' | 'restart';

export type ServiceAction = Action | 'release';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL n’est pas défini');
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', ...init });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data
        ? String(data.message)
        : `Le serveur a répondu ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export async function fetchSites(): Promise<Site[]> {
  const data = await request<unknown>('/sites/status');
  if (!Array.isArray(data)) throw new Error('Réponse au mauvais format');
  return data as Site[];
}

export function fetchLevel(): Promise<EnergyStatus> {
  return request<EnergyStatus>('/sites/level');
}

export function updateSite(
  siteId: string,
  settings: SiteSettings,
): Promise<Site[]> {
  return send<Site[]>('POST', `/sites/${siteId}/settings`, settings);
}

export function runSiteAction(siteId: string, action: Action): Promise<Site> {
  return send<Site>('POST', `/sites/${siteId}/${action}`);
}

export function runServiceAction(
  siteId: string,
  serviceId: string,
  action: ServiceAction,
): Promise<Service> {
  return send<Service>(
    'POST',
    `/sites/${siteId}/services/${serviceId}/${action}`,
  );
}

export function updateServiceSettings(
  siteId: string,
  serviceId: string,
  settings: ServiceSettings,
): Promise<Service> {
  return send<Service>(
    'POST',
    `/sites/${siteId}/services/${serviceId}/settings`,
    settings,
  );
}

export function quarantineService(
  siteId: string,
  serviceId: string,
  reason: string,
): Promise<Service> {
  return send<Service>(
    'POST',
    `/sites/${siteId}/services/${serviceId}/quarantine`,
    { reason },
  );
}

export function quarantineSite(siteId: string, reason: string): Promise<Site> {
  return send<Site>('POST', `/sites/${siteId}/quarantine`, { reason });
}

export function releaseSite(siteId: string): Promise<Site> {
  return send<Site>('POST', `/sites/${siteId}/release`);
}
