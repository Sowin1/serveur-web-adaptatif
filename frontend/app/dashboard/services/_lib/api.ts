import type { Site } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchSites(): Promise<Site[]> {
  if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL n’est pas défini');
  const res = await fetch(`${API_URL}/sites/status`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`le backend a répondu ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('réponse au mauvais format');
  return data as Site[];
}
