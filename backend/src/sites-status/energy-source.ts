import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BatteryService } from '../battery/battery.service.js';

export interface EnergyReading {
  batteryId: string;
  percentage: number;
  charging: boolean;
}

export interface EnergySource {
  read(): Promise<EnergyReading>;
}

export const ENERGY_SOURCE = Symbol('ENERGY_SOURCE');

@Injectable()
export class BatteryEnergySource implements EnergySource {
  private batteryId: string | null;

  constructor(
    private readonly batteryService: BatteryService,
    configService: ConfigService,
  ) {
    this.batteryId = configService.get<string>('BATTERY_ID') || null;
  }

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

  private async resolveBatteryId(): Promise<string> {
    if (this.batteryId) return this.batteryId;
    const batteries = await this.batteryService.getBatteryList();
    const id = batteries?.[0]?.id;
    if (!id) throw new Error('No battery available');
    this.batteryId = id;
    return id;
  }
}
