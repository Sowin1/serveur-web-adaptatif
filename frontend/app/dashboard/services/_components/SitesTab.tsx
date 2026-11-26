import { useState } from 'react';
import type { DragEvent } from 'react';
import type { Site } from '../_lib/types';
import { Checkbox, describeSite, SiteActions } from './ui';
import type { SiteAction } from './ui';

export function SitesTab({
  sites,
  disabled,
  onOpen,
  onMove,
  onAlwaysOn,
  onAction,
}: {
  sites: Site[];
  disabled: boolean;
  onOpen: (siteId: string) => void;
  onMove: (siteId: string, priority: number) => void;
  onAlwaysOn: (siteId: string, alwaysOn: boolean) => void;
  onAction: (siteId: string, action: SiteAction) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const resetDrag = () => {
    setDraggedId(null);
    setDropIndex(null);
  };

  const dragOver = (e: DragEvent<HTMLLIElement>, index: number) => {
    if (!draggedId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    setDropIndex(after ? index + 1 : index);
  };

  const drop = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    const from = sites.findIndex((s) => s.id === draggedId);
    if (draggedId && from !== -1 && dropIndex !== null) {
      const target = dropIndex > from ? dropIndex - 1 : dropIndex;
      if (target !== from) onMove(draggedId, target + 1);
    }
    resetDrag();
  };

  const fromIndex = sites.findIndex((s) => s.id === draggedId);
  const showDrop =
    dropIndex !== null &&
    fromIndex !== -1 &&
    dropIndex !== fromIndex &&
    dropIndex !== fromIndex + 1;

  if (sites.length === 0) {
    return (
      <p className="mt-8 text-neutral-500">
        Aucun site sur ce serveur pour le moment.
      </p>
    );
  }

  return (
    <>
      <p className="mt-8 text-sm text-neutral-500">
        Les sites sont classés par priorité. Quand l’énergie baisse, les
        premiers sont les derniers à être éteints. Glissez un site pour changer
        sa place.
      </p>
      <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
        {sites.map((site, index) => {
          const issues = site.services.filter(
            (s) => s.status === 'error' || s.status === 'quarantine',
          ).length;

          return (
            <li
              key={site.id}
              data-testid={`site-${site.id}`}
              draggable={!disabled}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', site.id);
                setDraggedId(site.id);
              }}
              onDragOver={(e) => dragOver(e, index)}
              onDrop={drop}
              onDragEnd={resetDrag}
              className={`flex flex-wrap items-start gap-x-6 gap-y-4 py-5 ${
                draggedId === site.id ? 'opacity-40' : ''
              } ${
                showDrop && dropIndex === index
                  ? 'shadow-[inset_0_2px_0_0_#404040]'
                  : showDrop &&
                      dropIndex === index + 1 &&
                      index === sites.length - 1
                    ? 'shadow-[inset_0_-2px_0_0_#404040]'
                    : ''
              } ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}`}
            >
              <div className="flex w-10 flex-col items-center">
                <span
                  aria-hidden="true"
                  title="Glisser pour changer la priorité"
                  className="text-xs leading-none text-neutral-300"
                >
                  ⋮⋮
                </span>
                <span className="text-2xl font-light tabular-nums text-neutral-400">
                  {site.priority}
                </span>
                <div className="mt-1 flex gap-1">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => onMove(site.id, site.priority - 1)}
                    aria-label={`Monter ${site.name}`}
                    className="px-1 text-sm text-neutral-500 hover:text-neutral-900 disabled:invisible"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === sites.length - 1}
                    onClick={() => onMove(site.id, site.priority + 1)}
                    aria-label={`Descendre ${site.name}`}
                    className="px-1 text-sm text-neutral-500 hover:text-neutral-900 disabled:invisible"
                  >
                    ↓
                  </button>
                </div>
              </div>

              <div className="min-w-56 flex-1">
                <button
                  type="button"
                  onClick={() => onOpen(site.id)}
                  className="text-left text-lg font-medium text-neutral-900 underline-offset-4 hover:underline"
                >
                  {site.name}
                </button>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {describeSite(site)}
                  {issues > 0 && (
                    <span className="text-amber-700">
                      {' '}
                      · {issues} à surveiller
                    </span>
                  )}
                </p>
                <div className="mt-3">
                  <Checkbox
                    checked={site.alwaysOn}
                    disabled={disabled}
                    onChange={(checked) => onAlwaysOn(site.id, checked)}
                  >
                    Garder en marche batterie faible
                  </Checkbox>
                </div>
              </div>

              <SiteActions
                site={site}
                disabled={disabled}
                onAction={(action) => onAction(site.id, action)}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
