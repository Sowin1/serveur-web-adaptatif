import type { Service, Site } from '../_lib/types';
import {
  Checkbox,
  describeQuarantine,
  describeSite,
  QuarantineForm,
  SiteActions,
  STATUS_TEXT,
  TextButton,
} from './ui';
import type { SiteAction } from './ui';

export function SiteTab({
  site,
  total,
  disabled,
  onBack,
  onAlwaysOn,
  onSiteAction,
  onToggleRunning,
  onToggleNeverStop,
  onRelease,
  onQuarantineService,
  onQuarantineSite,
  onReleaseSite,
}: {
  site: Site;
  total: number;
  disabled: boolean;
  onBack: () => void;
  onAlwaysOn: (alwaysOn: boolean) => void;
  onSiteAction: (action: SiteAction) => void;
  onToggleRunning: (service: Service, running: boolean) => void;
  onToggleNeverStop: (service: Service, neverAutoStop: boolean) => void;
  onRelease: (service: Service) => void;
  onQuarantineService: (service: Service, reason: string) => void;
  onQuarantineSite: (reason: string) => void;
  onReleaseSite: () => void;
}) {
  const inQuarantine = site.services.filter((s) => s.quarantine !== null);
  const available = site.features.filter((f) => f.enabled);
  const paused = site.features.filter((f) => !f.enabled);

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        ← Tous les sites
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-neutral-900">{site.name}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {describeSite(site)} · Priorité {site.priority} sur {total}
          </p>
        </div>
        <SiteActions site={site} disabled={disabled} onAction={onSiteAction} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
        {inQuarantine.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={onReleaseSite}
            className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sortir le site de quarantaine
          </button>
        )}
        {inQuarantine.length < site.services.length && (
          <QuarantineForm
            label="Mettre le site en quarantaine"
            disabled={disabled}
            onConfirm={onQuarantineSite}
          />
        )}
      </div>

      <div className="mt-6 border-l-2 border-neutral-200 pl-4">
        <Checkbox
          checked={site.alwaysOn}
          disabled={disabled}
          onChange={onAlwaysOn}
        >
          Garder ce site en marche même batterie faible
        </Checkbox>
        <p className="mt-1 text-xs text-neutral-500">
          Ses services restent allumés même quand la batterie est presque vide.
          Les fonctionnalités comme les vidéos suivent toujours le niveau
          d’énergie.
        </p>
      </div>

      <section className="mt-10">
        <h3 className="text-sm font-medium text-neutral-500">Services</h3>
        <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
          {site.services.map((service) => {
            const status = STATUS_TEXT[service.status];
            const quarantined = service.quarantine !== null;
            return (
              <li
                key={service.id}
                data-testid={`service-${service.id}`}
                className="py-4"
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="min-w-48 flex-1">
                    <p className="text-neutral-900">{service.name}</p>
                    <p className="mt-0.5 text-sm">
                      <span className={status.tone}>{status.label}</span>
                      {!quarantined && service.failures > 0 && (
                        <span className="text-neutral-400">
                          {' '}
                          · {service.failures} tentative
                          {service.failures > 1 ? 's' : ''} échouée
                          {service.failures > 1 ? 's' : ''}
                        </span>
                      )}
                      {service.route && (
                        <span className="font-mono text-xs text-neutral-400">
                          {' '}
                          · {service.route}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <Checkbox
                      checked={service.active}
                      disabled={disabled || quarantined}
                      onChange={(checked) => onToggleRunning(service, checked)}
                    >
                      Allumé
                    </Checkbox>
                    <Checkbox
                      checked={service.neverAutoStop}
                      disabled={disabled}
                      onChange={(checked) =>
                        onToggleNeverStop(service, checked)
                      }
                    >
                      Ne jamais arrêter automatiquement
                    </Checkbox>
                  </div>
                </div>

                {!quarantined && (
                  <div className="mt-2">
                    <QuarantineForm
                      label="Mettre en quarantaine"
                      disabled={disabled}
                      onConfirm={(reason) =>
                        onQuarantineService(service, reason)
                      }
                    />
                  </div>
                )}

                {service.quarantine && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-l-2 border-red-200 pl-4">
                    <div className="text-sm">
                      <p className="text-neutral-700">
                        {describeQuarantine(service.quarantine)}.
                      </p>
                      {service.quarantine.detail && (
                        <p className="mt-0.5 text-neutral-500">
                          Raison : {service.quarantine.detail}
                        </p>
                      )}
                      <p className="mt-0.5 text-neutral-500">
                        Il ne sera pas relancé automatiquement.
                      </p>
                    </div>
                    <TextButton
                      disabled={disabled}
                      onClick={() => onRelease(service)}
                    >
                      Sortir de quarantaine
                    </TextButton>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {site.features.length > 0 && (
        <section className="mt-10">
          <h3 className="text-sm font-medium text-neutral-500">
            Fonctionnalités
          </h3>
          <p className="mt-3 text-sm text-neutral-700">
            {available.length > 0
              ? `Disponibles : ${available.map((f) => f.name).join(', ')}.`
              : 'Aucune fonctionnalité disponible pour le moment.'}
          </p>
          {paused.length > 0 && (
            <p className="mt-1 text-sm text-neutral-500">
              En pause pour économiser l’énergie :{' '}
              {paused.map((f) => f.name).join(', ')}.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
