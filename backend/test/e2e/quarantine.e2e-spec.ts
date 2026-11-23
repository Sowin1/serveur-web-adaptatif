import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module.js';
import { ENERGY_SOURCE } from '../../src/sites-status/energy-source.js';
import { SERVICE_RUNNER } from '../../src/sites-status/service-runner.js';
import type { ServiceRef } from '../../src/sites-status/service-runner.js';
import { expect } from 'vitest';

describe('Quarantine', () => {
  let app: NestFastifyApplication;
  const failingStarts = new Set<string>();
  const unhealthy = new Set<string>();
  const stops: string[] = [];

  const key = (ref: ServiceRef) => `${ref.siteId}/${ref.serviceId}`;

  const action = (path: string) =>
    app.inject({ method: 'POST', url: `/sites/${path}` });

  const getService = async (siteId: string, serviceId: string) => {
    const result = await app.inject({ method: 'GET', url: `/sites/${siteId}` });
    return result
      .json()
      .services.find((service: any) => service.id === serviceId);
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ENERGY_SOURCE)
      .useValue({
        read: async () => ({
          batteryId: 'test-battery',
          percentage: 60,
          charging: false,
        }),
      })
      .overrideProvider(SERVICE_RUNNER)
      .useValue({
        start: async (ref: ServiceRef) => {
          if (failingStarts.has(key(ref))) {
            throw new Error('port 8080 already in use');
          }
          unhealthy.delete(key(ref));
        },
        stop: async (ref: ServiceRef) => {
          stops.push(key(ref));
        },
        isHealthy: async (ref: ServiceRef) => !unhealthy.has(key(ref)),
      })
      .compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    await action('level/refresh');
  });

  it(`Quarantine, no service should be in quarantine at startup`, () => {
    return app
      .inject({ method: 'GET', url: '/sites/quarantine' })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.json()).toEqual([]);
      });
  });

  it(`Quarantine, a service should go into error after a failed start`, async () => {
    await action('portail/services/galerie/stop');
    failingStarts.add('portail/galerie');
    const result = await action('portail/services/galerie/start');
    expect(result.statusCode).toEqual(200);
    expect(result.json().status).toEqual('error');
    expect(result.json().failures).toEqual(1);
    expect(result.json().quarantine).toBeNull();
  });

  it(`Quarantine, a service should be put in quarantine after 3 failed starts`, async () => {
    stops.length = 0;
    await action('portail/services/galerie/start');
    const result = await action('portail/services/galerie/start');
    const service = result.json();
    expect(service.status).toEqual('quarantine');
    expect(service.failures).toEqual(3);
    expect(service.quarantine.cause).toEqual('start');
    expect(service.quarantine.detail).toEqual('port 8080 already in use');
    expect(service.quarantine.failures).toEqual(3);
    expect(Number.isNaN(Date.parse(service.quarantine.since))).toBe(false);
  });

  it(`Quarantine, the service should be stopped automatically`, () => {
    expect(stops).toContain('portail/galerie');
  });

  it(`Quarantine, the admin should find it in the quarantine list`, () => {
    return app
      .inject({ method: 'GET', url: '/sites/quarantine' })
      .then((result) => {
        expect(result.json()).toHaveLength(1);
        const entry = result.json()[0];
        expect(entry.siteId).toEqual('portail');
        expect(entry.serviceId).toEqual('galerie');
        expect(entry.siteName).toBeDefined();
        expect(entry.serviceName).toBeDefined();
        expect(entry.cause).toEqual('start');
        expect(entry.detail).toEqual('port 8080 already in use');
      });
  });

  it(`Quarantine, a manual start should be refused`, () => {
    return action('portail/services/galerie/start').then((result) => {
      expect(result.statusCode).toEqual(409);
    });
  });

  it(`Quarantine, the service should not be restarted by the energy level`, async () => {
    failingStarts.delete('portail/galerie');
    await action('level/refresh');
    expect((await getService('portail', 'galerie')).status).toEqual(
      'quarantine',
    );
  });

  it(`Quarantine, the service should not be restarted with its site`, async () => {
    await action('portail/start');
    expect((await getService('portail', 'galerie')).status).toEqual(
      'quarantine',
    );
  });

  it(`Quarantine, the service should not be restarted on an always-on site`, async () => {
    await app.inject({
      method: 'POST',
      url: '/sites/portail/settings',
      headers: { 'content-type': 'application/json' },
      body: { alwaysOn: true },
    });
    expect((await getService('portail', 'galerie')).status).toEqual(
      'quarantine',
    );
    await app.inject({
      method: 'POST',
      url: '/sites/portail/settings',
      headers: { 'content-type': 'application/json' },
      body: { alwaysOn: false },
    });
  });

  it(`Quarantine, the released service should start again`, () => {
    return action('portail/services/galerie/start').then((result) => {
      expect(result.json().status).toEqual('active');
    });
  });

  it(`Quarantine, releasing a service that is not in quarantine should return 409`, () => {
    return action('portail/services/galerie/release').then((result) => {
      expect(result.statusCode).toEqual(409);
    });
  });

  it(`Quarantine, a service that answers again should go back to running`, async () => {
    unhealthy.add('blog/commentaires');
    await app.inject({ method: 'GET', url: '/sites/status' });
    expect((await getService('blog', 'commentaires')).status).toEqual('error');
    unhealthy.delete('blog/commentaires');
    await app.inject({ method: 'GET', url: '/sites/status' });
    const service = await getService('blog', 'commentaires');
    expect(service.status).toEqual('active');
    expect(service.failures).toEqual(0);
  });

  afterAll(async () => {
    await app.close();
  });
});