import { Injectable } from '@nestjs/common';

export interface ServiceRef {
  siteId: string;
  serviceId: string;
  route: string | null;
}

export interface ServiceRunner {
  start(ref: ServiceRef): Promise<void>;
  stop(ref: ServiceRef): Promise<void>;
  isHealthy(ref: ServiceRef): Promise<boolean>;
}

export const SERVICE_RUNNER = Symbol('SERVICE_RUNNER');

@Injectable()
export class SimulatedServiceRunner implements ServiceRunner {
  private readonly down = new Set<string>();

  private key(ref: ServiceRef): string {
    return `${ref.siteId}/${ref.serviceId}`;
  }

  async start(ref: ServiceRef): Promise<void> {
    this.down.delete(this.key(ref));
  }

  async stop(ref: ServiceRef): Promise<void> {
    this.down.add(this.key(ref));
  }

  async isHealthy(ref: ServiceRef): Promise<boolean> {
    return !this.down.has(this.key(ref));
  }
}
