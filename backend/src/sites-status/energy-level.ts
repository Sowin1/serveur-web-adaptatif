import type { OperatingLevel } from './sites.types.js';

export const LEVEL_LABELS: Record<OperatingLevel, string> = {
  0: 'Shutdown',
  1: 'Survival',
  2: 'Economy',
  3: 'Normal',
  4: 'Abundance',
};

export const LEVEL_THRESHOLDS = {
  shutdown: 5,
  survival: 20,
  economy: 50,
  abundance: 90,
};

export function computeLevel(
  percentage: number,
  charging: boolean,
): OperatingLevel {
  if (percentage <= LEVEL_THRESHOLDS.shutdown) return 0;
  if (percentage < LEVEL_THRESHOLDS.survival) return 1;
  if (percentage < LEVEL_THRESHOLDS.economy) return 2;
  if (percentage >= LEVEL_THRESHOLDS.abundance && charging) return 4;
  return 3;
}
