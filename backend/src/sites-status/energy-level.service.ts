import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENERGY_SOURCE } from './energy-source.js';
import type { EnergySource } from './energy-source.js';
import { LEVEL_LABELS, computeLevel } from './energy-level.js';
import { SitesStatusService } from './sites-status.service.js';
import type { EnergyStatus } from './sites.types.js';

/** Delay between two battery readings when ENERGY_CHECK_INTERVAL_MS is not set. */
export const DEFAULT_CHECK_INTERVAL_MS = 60_000;

/**
 * Daemon that reads the battery on a regular basis, computes the operating
 * level and applies it to the sites and services.
 */
@Injectable()
export class EnergyLevelService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(EnergyLevelService.name);
  private readonly intervalMs: number;
  private timer: ReturnType<typeof setInterval> | null = null;
  private status: EnergyStatus = {
    level: null,
    label: null,
    percentage: null,
    charging: null,
    batteryId: null,
    updatedAt: null,
    error: null,
  };

  constructor(
    @Inject(ENERGY_SOURCE) private readonly source: EnergySource,
    private readonly sitesStatusService: SitesStatusService,
    configService: ConfigService,
  ) {
    const interval = Number(configService.get('ENERGY_CHECK_INTERVAL_MS'));
    this.intervalMs =
      Number.isFinite(interval) && interval > 0
        ? interval
        : DEFAULT_CHECK_INTERVAL_MS;
  }

  /** Reads the battery once at startup, then at every interval. */
  onApplicationBootstrap(): void {
    void this.refresh();
    this.timer = setInterval(() => void this.refresh(), this.intervalMs);
  }

  /** Stops the interval when the application closes. */
  onApplicationShutdown(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  /** Returns the last known energy status (level is null before the first reading). */
  getStatus(): EnergyStatus {
    return { ...this.status };
  }

  /**
   * Reads the battery now and applies the new level to the services.
   * If the battery cannot be read, keeps the last level and stores the error.
   */
  async refresh(): Promise<EnergyStatus> {
    try {
      const reading = await this.source.read();
      const level = computeLevel(reading.percentage, reading.charging);
      await this.sitesStatusService.applyLevel(level);
      this.status = {
        level,
        label: LEVEL_LABELS[level],
        percentage: reading.percentage,
        charging: reading.charging,
        batteryId: reading.batteryId,
        updatedAt: new Date().toISOString(),
        error: null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Cannot read battery level: ${message}`);
      this.status = { ...this.status, error: message };
    }
    return this.getStatus();
  }
}
