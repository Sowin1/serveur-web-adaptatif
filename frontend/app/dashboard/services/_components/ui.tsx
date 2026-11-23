import { useState } from 'react';
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
  manual: '',
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
  if (quarantine.cause === 'manual') {
    return `Mis en quarantaine à la main le ${since}`;
  }
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
  const startable = site.services.some(
    (s) => !s.active && s.status !== 'quarantine',
  );
  const running = site.services.some((s) => s.active);
  return (
    <div className="flex flex-wrap gap-2">
      {startable && (
        <TextButton disabled={disabled} onClick={() => onAction('start')}>
          Démarrer
        </TextButton>
      )}
      {running && (
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

export function QuarantineForm({
  label,
  disabled,
  onConfirm,
}: {
  label: string;
  disabled: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label}
      </button>
    );
  }

  const confirm = () => {
    onConfirm(reason.trim());
    setOpen(false);
    setReason('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        confirm();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        type="text"
        value={reason}
        maxLength={200}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Raison (facultatif)"
        aria-label="Raison de la mise en quarantaine"
        autoFocus
        className="w-56 rounded-md border border-neutral-300 px-2 py-1.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Confirmer
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setReason('');
        }}
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        Annuler
      </button>
    </form>
  );
}
