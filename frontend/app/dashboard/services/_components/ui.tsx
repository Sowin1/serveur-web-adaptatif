import type { ReactNode } from 'react';
import type {
  EnergyStatus,
  OperatingLevel,
  QuarantineCause,
  QuarantineInfo,
  ServiceStatus,
  Site,
} from '../_lib/types';

export type SiteAction = 'start' | 'stop' | 'restart';

export const STATUS_TEXT: Record<
  ServiceStatus,
  { label: string; tone: string }
> = {
  active: { label: 'En marche', tone: 'text-neutral-800' },
  stopped: { label: 'Arrêté', tone: 'text-neutral-400' },
  error: { label: 'Ne répond pas', tone: 'text-amber-700' },
  quarantine: { label: 'En quarantaine', tone: 'text-red-700' },
};

const LEVEL_LABELS: Record<OperatingLevel, string> = {
  0: 'arrêt',
  1: 'survie',
  2: 'économie',
  3: 'normal',
  4: 'abondance',
};

const CAUSE_TEXT: Record<QuarantineCause, string> = {
  start: 'échecs de démarrage',
  stop: "échecs d'arrêt",
  health: 'contrôles de santé échoués',
};

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

export function siteState(site: Site): 'running' | 'partial' | 'stopped' {
  const running = site.services.filter((s) => s.active).length;
  if (running === 0) return 'stopped';
  return running === site.services.length ? 'running' : 'partial';
}

export function describeSite(site: Site): string {
  const running = site.services.filter((s) => s.active).length;
  const total = site.services.length;
  const state = siteState(site);
  if (state === 'stopped') return 'Arrêté';
  if (state === 'running') {
    return total === 1 ? 'En marche' : `En marche, les ${total} services`;
  }
  return `En partie, ${running} services sur ${total}`;
}

export function describeLevel(status: EnergyStatus | null): string {
  if (!status || status.level === null) return 'Niveau de batterie inconnu';
  const parts: string[] = [];
  if (status.percentage !== null) {
    parts.push(
      `Batterie ${status.percentage} %${status.charging ? ', en charge' : ''}`,
    );
  }
  parts.push(`mode ${LEVEL_LABELS[status.level]}`);
  return parts.join(' · ');
}

export function describeQuarantine(quarantine: QuarantineInfo): string {
  const since = DATE_FORMAT.format(new Date(quarantine.since));
  return `Arrêté le ${since}, après ${quarantine.failures} ${CAUSE_TEXT[quarantine.cause]}`;
}

export function TextButton({
  disabled,
  onClick,
  label,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  label?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function Checkbox({
  checked,
  disabled,
  onChange,
  children,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-600 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-neutral-800"
      />
      {children}
    </label>
  );
}

export function SiteActions({
  site,
  disabled,
  onAction,
}: {
  site: Site;
  disabled: boolean;
  onAction: (action: SiteAction) => void;
}) {
  const state = siteState(site);
  return (
    <div className="flex flex-wrap gap-2">
      {state !== 'running' && (
        <TextButton disabled={disabled} onClick={() => onAction('start')}>
          Démarrer
        </TextButton>
      )}
      {state !== 'stopped' && (
        <TextButton disabled={disabled} onClick={() => onAction('stop')}>
          Arrêter
        </TextButton>
      )}
      <TextButton disabled={disabled} onClick={() => onAction('restart')}>
        Redémarrer
      </TextButton>
    </div>
  );
}
