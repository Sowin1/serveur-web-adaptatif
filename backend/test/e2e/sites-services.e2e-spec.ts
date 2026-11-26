import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module.js';
import { ENERGY_SOURCE } from '../../src/sites-status/energy-source.js';
import type { EnergyReading } from '../../src/sites-status/energy-source.js';
import { expect } from 'vitest';

describe('Sites status', () => {
  let app: NestFastifyApplication;
  let sites: any[] = [];

  const STATUSES = ['active', 'stopped', 'error', 'quarantine'];

  const energy: { reading: EnergyReading } = {
    reading: { batteryId: 'test-battery', percentage: 30, charging: false },
  };

  const refreshLevel = () => action('level/refresh');

  const action = (path: string) =>
    app.inject({ method: 'POST', url: `/sites/${path}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ENERGY_SOURCE)
      .useValue({ read: async () => energy.reading })
      .compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    await refreshLevel();
  });

  it('Sites status, should return a list of sites', () => {
    return app
      .inject({
        method: 'GET',
        url: '/sites/status',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.statusMessage).toEqual('OK');
        sites = result.json();
        expect(Array.isArray(sites)).toBe(true);
        expect(sites.length).toBeGreaterThan(0);
      });
  });

  it('Sites status, each site should have services and features', () => {
    for (const site of sites) {
      expect(site.id).toBeDefined();
      expect(site.name).toBeDefined();
      expect(typeof site.active).toBe('boolean');
      expect(Array.isArray(site.services)).toBe(true);
      expect(Array.isArray(site.features)).toBe(true);
    }
  });

  it('Sites status, each feature should be enabled or disabled', () => {
    for (const site of sites) {
      for (const feature of site.features) {
        expect(feature.name).toBeDefined();
        expect(typeof feature.enabled).toBe('boolean');
      }
    }
  });

  it('Sites status, each service should have a status and settings', () => {
    for (const site of sites) {
      for (const service of site.services) {
        expect(service.name).toBeDefined();
        expect(STATUSES).toContain(service.status);
        expect(service.active).toBe(service.status === 'active');
        expect(typeof service.priority).toBe('boolean');
        expect(typeof service.neverAutoStop).toBe('boolean');
        expect(typeof service.failures).toBe('number');
        expect([0, 1, 2, 3, 4]).toContain(service.minLevel);
      }
    }
  });

  it('Sites status, an offline site should have no active service', () => {
    const offlineSites = sites.filter((site) => !site.active);
    for (const site of offlineSites) {
      const activeServices = site.services.filter(
        (service: any) => service.active,
      );
      expect(activeServices).toHaveLength(0);
    }
  });

  it('Sites status, an online site should have at least one active service', () => {
    const onlineSites = sites.filter((site) => site.active);
    for (const site of onlineSites) {
      const activeServices = site.services.filter(
        (service: any) => service.active,
      );
      expect(activeServices.length).toBeGreaterThan(0);
    }
  });

  it('Sites status, POST should not exist', () => {
    return action('status').then((result) => {
      expect(result.statusCode).toEqual(404);
    });
  });

  it('Site, should return a single site', () => {
    return app.inject({ method: 'GET', url: '/sites/blog' }).then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.json().id).toEqual('blog');
    });
  });

  it('Site, unknown site should return 404', () => {
    return app
      .inject({ method: 'GET', url: '/sites/unknown' })
      .then((result) => {
        expect(result.statusCode).toEqual(404);
      });
  });

  it('Service, should start a stopped service', () => {
    return action('portail/services/galerie/start').then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.json().status).toEqual('active');
      expect(result.json().active).toBe(true);
    });
  });

  it('Service, should stop an active service', () => {
    return action('portail/services/galerie/stop').then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.json().status).toEqual('stopped');
      expect(result.json().active).toBe(false);
    });
  });

  it('Service, should restart a service', () => {
    return action('blog/services/articles/restart').then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.json().status).toEqual('active');
    });
  });

  it('Service, the new state should be visible in the list', async () => {
    await action('blog/services/commentaires/stop');
    const result = await app.inject({ method: 'GET', url: '/sites/status' });
    const blog = result.json().find((site: any) => site.id === 'blog');
    const comments = blog.services.find(
      (service: any) => service.id === 'commentaires',
    );
    expect(comments.status).toEqual('stopped');
  });

  it('Service, the site should be inactive when all its services are stopped', async () => {
    await action('blog/services/articles/stop');
    await action('blog/services/commentaires/stop');
    const result = await app.inject({ method: 'GET', url: '/sites/blog' });
    expect(result.json().active).toBe(false);
    await action('blog/services/articles/start');
    await action('blog/services/commentaires/start');
  });

  it('Service, unknown service should return 404', () => {
    return action('blog/services/unknown/start').then((result) => {
      expect(result.statusCode).toEqual(404);
    });
  });

  it('Service, unknown action should return 404', () => {
    return action('blog/services/articles/pause').then((result) => {
      expect(result.statusCode).toEqual(404);
    });
  });

  it('Settings, admin should define a priority service', () => {
    return app
      .inject({
        method: 'PATCH',
        url: '/sites/blog/services/articles',
        headers: { 'content-type': 'application/json' },
        body: { priority: true },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.json().priority).toBe(true);
      });
  });

  it('Settings, admin should define a service never stopped automatically', () => {
    return app
      .inject({
        method: 'PATCH',
        url: '/sites/blog/services/articles',
        headers: { 'content-type': 'application/json' },
        body: { neverAutoStop: true },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.json().neverAutoStop).toBe(true);
        expect(result.json().priority).toBe(true);
      });
  });

  it('Settings, invalid body should return 400', () => {
    return app
      .inject({
        method: 'PATCH',
        url: '/sites/blog/services/articles',
        headers: { 'content-type': 'application/json' },
        body: { priority: 'yes' },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(400);
      });
  });

  it('Settings, empty body should return 400', () => {
    return app
      .inject({
        method: 'PATCH',
        url: '/sites/blog/services/articles',
        headers: { 'content-type': 'application/json' },
        body: {},
      })
      .then((result) => {
        expect(result.statusCode).toEqual(400);
      });
  });

  it('Level, should return the level computed from the battery', () => {
    return app.inject({ method: 'GET', url: '/sites/level' }).then((result) => {
      expect(result.statusCode).toEqual(200);
      const status = result.json();
      expect(status.level).toEqual(2);
      expect(status.label).toEqual('Economy');
      expect(status.percentage).toEqual(30);
      expect(status.charging).toBe(false);
      expect(status.batteryId).toEqual('test-battery');
      expect(status.error).toBeNull();
    });
  });

  it('Level, economy should disable images and videos', async () => {
    const result = await app.inject({ method: 'GET', url: '/sites/portail' });
    const features = result.json().features;
    const enabled = (id: string) =>
      features.find((feature: any) => feature.id === id).enabled;
    expect(enabled('images')).toBe(false);
    expect(enabled('videos')).toBe(false);
    expect(enabled('recherche')).toBe(true);
  });

  it('Level, survival should keep only the essential services', async () => {
    energy.reading = { ...energy.reading, percentage: 10 };
    const result = await refreshLevel();
    expect(result.statusCode).toEqual(200);
    expect(result.json().level).toEqual(1);
    const sitesResult = await app.inject({
      method: 'GET',
      url: '/sites/status',
    });
    const all = sitesResult.json();
    const portail = all.find((site: any) => site.id === 'portail');
    const accueil = portail.services.find((s: any) => s.id === 'accueil');
    expect(accueil.status).toEqual('active');
    const blog = all.find((site: any) => site.id === 'blog');
    const status = (id: string) =>
      blog.services.find((s: any) => s.id === id).status;
    expect(status('commentaires')).toEqual('stopped');
    expect(status('articles')).toEqual('active');
    expect(all.find((site: any) => site.id === 'carto').active).toBe(false);
  });

  it('Level, abundance when the battery is full and charging', async () => {
    energy.reading = { ...energy.reading, percentage: 95, charging: true };
    const result = await refreshLevel();
    expect(result.json().level).toEqual(4);
    expect(result.json().label).toEqual('Abundance');
    const sitesResult = await app.inject({
      method: 'GET',
      url: '/sites/status',
    });
    for (const site of sitesResult.json()) {
      expect(site.active).toBe(true);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
