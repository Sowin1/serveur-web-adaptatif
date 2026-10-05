'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchSites } from './_lib/api';
import { MOCK_SITES } from './_lib/mock';
import type { Site } from './_lib/types';

const REFRESH_MS = 15_000;

export default function ServicesActifsPage() {
  const [sites, setSites] = useState<Site[] | null>(null);
  const [simulated, setSimulated] = useState(false);

  const load = useCallback(async () => {
    try {
      setSites(await fetchSites());
      setSimulated(false);
    } catch {
      setSites(MOCK_SITES);
      setSimulated(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Active Services</h1>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
        
        {!sites && <p className="mt-6 text-gray-600">Loading...</p>}
        {sites?.length === 0 && <p className="mt-6 text-gray-600">No sites available at the moment.</p>}

        {sites?.map((site) => (
          <SiteBlock key={site.id} site={site} />
        ))}
      </div>
    </main>
  );
}

function SiteBlock({ site }: { site: Site }) {
  const actifs = site.services.filter((s) => s.active);

  return (
    <section className="mt-6 rounded border border-gray-200 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{site.name}</h2>
        <span className={site.active ? 'text-sm text-green-800' : 'text-sm text-gray-400'}>
          {site.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {!site.active ? (
        <p className="mt-2 text-sm text-gray-500">This site is offline.</p>
      ) : (
        <>
          <h3 className="mt-4 text-sm font-semibold text-gray-700">
            Services ({actifs.length} out of {site.services.length})
          </h3>
          {actifs.length === 0 ? (
            <p className="mt-1 text-sm text-gray-500">No active services.</p>
          ) : (
            <ul className="mt-1 text-sm">
              {actifs.map((svc) => (
                <li key={svc.id} className="flex justify-between border-b border-gray-100 py-1.5">
                  <span>{svc.name}</span>
                  {svc.route && <span className="text-gray-500">{svc.route}</span>}
                </li>
              ))}
            </ul>
          )}

          {site.features.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold text-gray-700">Features</h3>
              <ul className="mt-1 text-sm">
                {site.features.map((f) => (
                  <li key={f.id} className="flex justify-between border-b border-gray-100 py-1.5">
                    <span>{f.name}</span>
                    <span className={f.enabled ? 'text-green-800' : 'text-red-600'}>
                      {f.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}