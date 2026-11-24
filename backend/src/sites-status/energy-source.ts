import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BatteryService } from '../battery/battery.service.js';

/** One reading of the battery. */
export interface EnergyReading {
  batteryId: string;
  percentage: number;
  charging: boolean;
}

/** Gives the current battery state. Replaced by a fake in the e2e tests. */
export interface EnergySource {
  read(): Promise<EnergyReading>;
}

/** Injection token of the energy source used by EnergyLevelService. */
export const ENERGY_SOURCE = Symbol('ENERGY_SOURCE');

/** Reads the battery through the BatteryService of the battery module (Enode API). */
@Injectable()
export class BatteryEnergySource implements EnergySource {
  private batteryId: string | null;

  constructor(
    private readonly batteryService: BatteryService,
    configService: ConfigService,
  ) {
    this.batteryId = configService.get<string>('BATTERY_ID') || null;
  }

  /**
   * Returns the percentage and charging state of the battery.
   * Throws if the battery cannot be read.
   */
  async read(): Promise<EnergyReading> {
    const batteryId = await this.resolveBatteryId();
    const info = await this.batteryService.getBatteryInformation(batteryId);
    const percentage = Number(info?.chargeState?.batteryLevel);
    if (!Number.isFinite(percentage)) {
      throw new Error(`Battery ${batteryId} returned no battery level`);
    }
    return {
      batteryId,
      percentage,
      charging: info.chargeState.status === 'CHARGING',
    };
  }

  /**
   * Uses BATTERY_ID from the .env, otherwise the first battery of the list.
   * The id is kept so the list is only requested once.
   */
  private async resolveBatteryId(): Promise<string> {
    if (this.batteryId) return this.batteryId;
    const batteries = await this.batteryService.getBatteryList();
    const id = batteries?.[0]?.id;
    if (!id) throw new Error('No battery available');
    this.batteryId = id;
    return id;
  }
}
