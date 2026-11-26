import { Injectable } from '@nestjs/common';

/** Identifies a service for the runner. */
export interface ServiceRef {
  siteId: string;
  serviceId: string;
  route: string | null;
}

/**
 * Low-level layer that really starts, stops and checks a service.
 * Swap the implementation to drive real processes (child process, Docker, systemd...).
 */
export interface ServiceRunner {
  /** Starts the service. Throws if the start fails. */
  start(ref: ServiceRef): Promise<void>;
  /** Stops the service. Throws if the stop fails. */
  stop(ref: ServiceRef): Promise<void>;
  /** Returns false (or throws) when the service does not answer. */
  isHealthy(ref: ServiceRef): Promise<boolean>;
}

/** Injection token of the runner used by SitesStatusService. */
export const SERVICE_RUNNER = Symbol('SERVICE_RUNNER');

/**
 * Fake runner used while the real services do not exist.
 * It never fails and only remembers which services were stopped.
 */
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
