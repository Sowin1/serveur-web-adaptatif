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

  it(`Quarantine, the admin should release the service`, () => {
    return action('portail/services/galerie/release').then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.json().status).toEqual('stopped');
      expect(result.json().failures).toEqual(0);
      expect(result.json().quarantine).toBeNull();
    });
  });

  it(`Quarantine, the list should be empty after the release`, () => {
    return app
      .inject({ method: 'GET', url: '/sites/quarantine' })
      .then((result) => {
        expect(result.json()).toEqual([]);
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

  it(`Quarantine, a service failing its health check 3 times should be put in quarantine`, async () => {
    stops.length = 0;
    unhealthy.add('blog/articles');
    for (let i = 0; i < 3; i++) {
      await app.inject({ method: 'GET', url: '/sites/status' });
    }
    const service = await getService('blog', 'articles');
    expect(service.status).toEqual('quarantine');
    expect(service.quarantine.cause).toEqual('health');
    expect(stops).toContain('blog/articles');
  });

  it(`Quarantine, restart should also take the service out of quarantine`, async () => {
    const result = await action('blog/services/articles/restart');
    expect(result.json().status).toEqual('active');
    expect(result.json().quarantine).toBeNull();
  });

  it(`Manual quarantine, the admin should put a service in quarantine with a reason`, async () => {
    stops.length = 0;
    const result = await app.inject({
      method: 'POST',
      url: '/sites/blog/services/commentaires/quarantine',
      headers: { 'content-type': 'application/json' },
      body: { reason: 'spam en cours' },
    });
    expect(result.statusCode).toEqual(200);
    const service = result.json();
    expect(service.status).toEqual('quarantine');
    expect(service.quarantine.cause).toEqual('manual');
    expect(service.quarantine.detail).toEqual('spam en cours');
    expect(stops).toContain('blog/commentaires');
  });

  it(`Manual quarantine, it should appear in the quarantine list`, () => {
    return app
      .inject({ method: 'GET', url: '/sites/quarantine' })
      .then((result) => {
        const entry = result
          .json()
          .find((item: any) => item.serviceId === 'commentaires');
        expect(entry.cause).toEqual('manual');
      });
  });

  it(`Manual quarantine, the service should not be restarted by the energy level`, async () => {
    await action('level/refresh');
    expect((await getService('blog', 'commentaires')).status).toEqual(
      'quarantine',
    );
  });

  it(`Manual quarantine, a service already in quarantine should return 409`, () => {
    return action('blog/services/commentaires/quarantine').then((result) => {
      expect(result.statusCode).toEqual(409);
    });
  });

  it(`Manual quarantine, the reason should be optional`, async () => {
    const result = await action('blog/services/articles/quarantine');
    expect(result.statusCode).toEqual(200);
    expect(result.json().quarantine.cause).toEqual('manual');
    expect(result.json().quarantine.detail).toBeNull();
    await action('blog/services/articles/release');
  });

  it(`Manual quarantine, an invalid reason should return 400`, async () => {
    for (const reason of [42, 'x'.repeat(201)]) {
      const result = await app.inject({
        method: 'POST',
        url: '/sites/blog/services/articles/quarantine',
        headers: { 'content-type': 'application/json' },
        body: { reason },
      });
      expect(result.statusCode).toEqual(400);
    }
  });

  it(`Manual quarantine, the admin should put a whole site in quarantine`, async () => {
    const result = await app.inject({
      method: 'POST',
      url: '/sites/blog/quarantine',
      headers: { 'content-type': 'application/json' },
      body: { reason: 'maintenance' },
    });
    expect(result.statusCode).toEqual(200);
    const site = result.json();
    expect(site.active).toBe(false);
    for (const service of site.services) {
      expect(service.status).toEqual('quarantine');
    }
    const articles = site.services.find((s: any) => s.id === 'articles');
    expect(articles.quarantine.detail).toEqual('maintenance');
    const comments = site.services.find((s: any) => s.id === 'commentaires');
    expect(comments.quarantine.detail).toEqual('spam en cours');
  });

  it(`Manual quarantine, a site fully in quarantine should return 409`, () => {
    return action('blog/quarantine').then((result) => {
      expect(result.statusCode).toEqual(409);
    });
  });

  it(`Manual quarantine, the admin should take a whole site out of quarantine`, async () => {
    const result = await action('blog/release');
    expect(result.statusCode).toEqual(200);
    for (const service of result.json().services) {
      expect(service.status).toEqual('stopped');
      expect(service.quarantine).toBeNull();
    }
    const list = await app.inject({ method: 'GET', url: '/sites/quarantine' });
    expect(
      list.json().filter((item: any) => item.siteId === 'blog'),
    ).toHaveLength(0);
  });

  it(`Manual quarantine, releasing a site without quarantine should return 409`, () => {
    return action('blog/release').then((result) => {
      expect(result.statusCode).toEqual(409);
    });
  });

  it(`Manual quarantine, an unknown site or service should return 404`, async () => {
    expect((await action('unknown/quarantine')).statusCode).toEqual(404);
    expect(
      (await action('blog/services/unknown/quarantine')).statusCode,
    ).toEqual(404);
  });

  afterAll(async () => {
    await app.close();
  });
});