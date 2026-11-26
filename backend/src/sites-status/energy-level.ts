import type { OperatingLevel } from './sites.types.js';

/** Name of each operating level, as returned by the API. */
export const LEVEL_LABELS: Record<OperatingLevel, string> = {
  0: 'Shutdown',
  1: 'Survival',
  2: 'Economy',
  3: 'Normal',
  4: 'Abundance',
};

/** Battery percentages used to pick the operating level. */
export const LEVEL_THRESHOLDS = {
  shutdown: 5,
  survival: 20,
  economy: 50,
  abundance: 90,
};

/**
 * Computes the operating level (0 to 4) from the battery.
 * Level 4 (abundance) needs a nearly full battery that is charging.
 * @param percentage battery level, from 0 to 100
 * @param charging true when the battery is charging
 */
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
