import { Injectable } from '@nestjs/common';
import * as os from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

export type ServerInfo = {
  label: string;
  value: number;
};

type CPUInfo = {
  idle: number;
  total: number;
};

@Injectable()
export class MonitoringServerService {
  /**
   * Retrieve CPU time information
   */
  private _getCPUInfo(): CPUInfo {
    const cpus = os.cpus();

    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
      const times = cpu.times;

      idle += times.idle;
      total += times.user + times.nice + times.sys + times.irq + times.idle;
    }

    return { idle, total };
  }
  /**
   * Retrieve server RAM information
   */
  usedServerRam(): ServerInfo[] {
    const ramTotal = os.totalmem();
    const ramFree = os.freemem();

    return [
      { label: 'Server ram total', value: ramTotal / 1024 ** 3 },
      { label: 'Server ram free', value: ramFree / 1024 ** 3 },
      {
        label: 'Server ram used',
        value: (ramTotal - ramFree) / 1024 ** 3,
      },
    ];
  }

  /**
   * Retrieve global CPU usage percentage
   */
  async cpuUsage(): Promise<number> {
    const start = this._getCPUInfo();

    await sleep(1000);

    const end = this._getCPUInfo();

    const idleDifference = end.idle - start.idle;
    const totalDifference = end.total - start.total;

    if (totalDifference === 0) {
      return 0;
    }

    return 100 * (1 - idleDifference / totalDifference);
  }
}
