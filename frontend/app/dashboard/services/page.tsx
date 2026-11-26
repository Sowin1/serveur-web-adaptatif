'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { SiteTab } from './_components/SiteTab';
import { SitesTab } from './_components/SitesTab';
import { describeLevel, describeQuarantine } from './_components/ui';
import {
  fetchLevel,
  fetchSites,
  quarantineService,
  quarantineSite,
  releaseSite,
  runServiceAction,
  runSiteAction,
  updateServiceSettings,
  updateSite,
} from './_lib/api';
import type { Action } from './_lib/api';
import { MOCK_SITES } from './_lib/mock';
import type { EnergyStatus, Service, Site } from './_lib/types';

const REFRESH_MS = 15_000;

export default function ServicesPage() {
  const [sites, setSites] = useState<Site[] | null>(null);
  const [level, setLevel] = useState<EnergyStatus | null>(null);
  const [offline, setOffline] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openSiteId, setOpenSiteId] = useState<string | null>(null);
  const [tab, setTab] = useState<'sites' | 'site'>('sites');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      Promise.all([fetchSites(), fetchLevel().catch(() => null)])
        .then(([data, energy]) => {
          if (cancelled) return;
          setSites(data);
          setLevel(energy);
          setOffline(false);
        })
        .catch(() => {
          if (cancelled) return;
          setSites(MOCK_SITES);
          setLevel(null);
          setOffline(true);
        });
    };

    load();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refreshKey]);

  const run = (
    task: () => Promise<unknown>,
    preview?: (current: Site[]) => Site[],
  ) => {
    if (preview) setSites((current) => current && preview(current));
    setPending(true);
    setError(null);
    task()
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      )
      .finally(() => {
        setPending(false);
        setRefreshKey((k) => k + 1);
      });
  };

  const changeSite =
    (siteId: string, change: Partial<Site>) => (current: Site[]) =>
      current.map((s) => (s.id === siteId ? { ...s, ...change } : s));

  const changeService =
    (siteId: string, serviceId: string, change: Partial<Service>) =>
    (current: Site[]) =>
      current.map((s) =>
        s.id === siteId
          ? {
              ...s,
              services: s.services.map((svc) =>
                svc.id === serviceId ? { ...svc, ...change } : svc,
              ),
            }
          : s,
      );

  const openSite = (siteId: string) => {
    setOpenSiteId(siteId);
    setTab('site');
  };

  const closeSite = () => {
    setOpenSiteId(null);
    setTab('sites');
  };

  const currentSite = sites?.find((s) => s.id === openSiteId) ?? null;
  const disabled = pending || offline;

  const toggleRunning = (site: Site, service: Service, running: boolean) => {
    const action: Action = running ? 'start' : 'stop';
    run(
      () => runServiceAction(site.id, service.id, action),
      changeService(site.id, service.id, {
        active: running,
        status: running ? 'active' : 'stopped',
      }),
    );
  };

  const release = (site: Site, service: Service) =>
    run(
      () => runServiceAction(site.id, service.id, 'release'),
      changeService(site.id, service.id, {
        status: 'stopped',
        active: false,
        failures: 0,
        quarantine: null,
      }),
    );

  const quarantined =
    sites?.flatMap((site) =>
      site.services
        .filter((service) => service.quarantine !== null)
        .map((service) => ({ site, service })),
    ) ?? [];

  const moveSite = (siteId: string, priority: number) =>
    run(
      () => updateSite(siteId, { priority }),
      (current) => {
        const moved = current.find((s) => s.id === siteId);
        if (!moved) return current;
        const others = current.filter((s) => s.id !== siteId);
        others.splice(priority - 1, 0, moved);
        return others.map((s, index) => ({ ...s, priority: index + 1 }));
      },
    );

  const setAlwaysOn = (siteId: string, alwaysOn: boolean) =>
    run(
      () => updateSite(siteId, { alwaysOn }),
      changeSite(siteId, { alwaysOn }),
    );

  return (
    <main className="min-h-screen bg-white font-sans text-neutral-800">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header>
          <h1 className="text-3xl font-medium text-neutral-900">Sites</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {offline ? 'Serveur injoignable' : describeLevel(level)}
            <span className="mx-2 text-neutral-300">·</span>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="underline-offset-4 hover:text-neutral-900 hover:underline"
            >
              Actualiser
            </button>
            {pending && (
              <span className="ml-2 text-neutral-400">Enregistrement…</span>
            )}
          </p>
        </header>

        {offline && (
          <p
            role="status"
            className="mt-6 border-l-2 border-neutral-300 pl-4 text-sm text-neutral-600"
          >
            Le serveur ne répond pas pour le moment. Ce sont des données
            d’exemple, les modifications sont donc désactivées.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-red-300 pl-4 text-sm text-red-700"
          >
            {error}{' '}
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-2 text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
            >
              Fermer
            </button>
          </p>
        )}

        {!offline && quarantined.length > 0 && (
          <div
            role="status"
            className="mt-6 border-l-2 border-red-300 pl-4 text-sm"
          >
            <p className="text-neutral-800">
              {quarantined.length === 1
                ? 'Un service est en quarantaine.'
                : `${quarantined.length} services sont en quarantaine.`}
            </p>
            <ul className="mt-1 space-y-1 text-neutral-500">
              {quarantined.map(({ site, service }) => (
                <li key={`${site.id}/${service.id}`}>
                  <button
                    type="button"
                    onClick={() => openSite(site.id)}
                    className="text-neutral-800 underline underline-offset-4 hover:text-neutral-950"
                  >
                    {service.name}
                  </button>{' '}
                  ({site.name}) :{' '}
                  {service.quarantine &&
                    describeQuarantine(service.quarantine).toLowerCase()}
                  .
                </li>
              ))}
            </ul>
          </div>
        )}

        <nav
          role="tablist"
          className="mt-10 flex gap-6 border-b border-neutral-200"
        >
          <TabButton active={tab === 'sites'} onClick={() => setTab('sites')}>
            Tous les sites
          </TabButton>
          {currentSite && (
            <span className="flex items-center gap-1">
              <TabButton active={tab === 'site'} onClick={() => setTab('site')}>
                {currentSite.name}
              </TabButton>
              <button
                type="button"
                onClick={closeSite}
                aria-label={`Fermer ${currentSite.name}`}
                className="pb-3 text-neutral-400 hover:text-neutral-800"
              >
                ×
              </button>
            </span>
          )}
        </nav>

        {!sites && <p className="mt-8 text-neutral-500">Chargement…</p>}

        {sites && (tab === 'sites' || !currentSite) && (
          <SitesTab
            sites={sites}
            disabled={disabled}
            onOpen={openSite}
            onMove={moveSite}
            onAlwaysOn={setAlwaysOn}
            onAction={(siteId, action) =>
              run(() => runSiteAction(siteId, action))
            }
          />
        )}

        {sites && tab === 'site' && currentSite && (
          <SiteTab
            site={currentSite}
            total={sites.length}
            disabled={disabled}
            onBack={() => setTab('sites')}
            onAlwaysOn={(alwaysOn) => setAlwaysOn(currentSite.id, alwaysOn)}
            onSiteAction={(action) =>
              run(() => runSiteAction(currentSite.id, action))
            }
            onToggleRunning={(service, running) =>
              toggleRunning(currentSite, service, running)
            }
            onToggleNeverStop={(service, neverAutoStop) =>
              run(
                () =>
                  updateServiceSettings(currentSite.id, service.id, {
                    neverAutoStop,
                  }),
                changeService(currentSite.id, service.id, { neverAutoStop }),
              )
            }
            onRelease={(service) => release(currentSite, service)}
            onQuarantineService={(service, reason) =>
              run(() => quarantineService(currentSite.id, service.id, reason))
            }
            onQuarantineSite={(reason) =>
              run(() => quarantineSite(currentSite.id, reason))
            }
            onReleaseSite={() => run(() => releaseSite(currentSite.id))}
          />
        )}
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px border-b pb-3 text-sm ${
        active
          ? 'border-neutral-900 text-neutral-900'
          : 'border-transparent text-neutral-500 hover:text-neutral-800'
      }`}
    >
      {children}
    </button>
  );
}
