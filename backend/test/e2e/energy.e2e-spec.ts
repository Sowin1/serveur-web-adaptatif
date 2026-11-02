import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module.js';
import { ENERGY_SOURCE } from '../../src/sites-status/energy-source.js';
import type { EnergyReading } from '../../src/sites-status/energy-source.js';
import { expect } from 'vitest';

describe('Energy', () => {
  let app: NestFastifyApplication;
  let reading: EnergyReading = {
    batteryId: 'test-battery',
    percentage: 60,
    charging: false,
  };
  let failure: Error | null = null;

  const refreshLevel = () =>
    app.inject({ method: 'POST', url: '/sites/level/refresh' });

  const getSites = () => app.inject({ method: 'GET', url: '/sites/status' });

  const findSite = (sites: any[], siteId: string) =>
    sites.find((site: any) => site.id === siteId);

  const findService = (sites: any[], siteId: string, serviceId: string) =>
    findSite(sites, siteId).services.find(
      (service: any) => service.id === serviceId,
    );

  const findFeature = (sites: any[], siteId: string, featureId: string) =>
    findSite(sites, siteId).features.find(
      (feature: any) => feature.id === featureId,
    );

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ENERGY_SOURCE)
      .useValue({
        read: async () => {
          if (failure) throw failure;
          return reading;
        },
      })
      .compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it("Energy level, should return the current level", () => {
    return refreshLevel().then(() =>
      app.inject({ method: 'GET', url: '/sites/level' }).then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.statusMessage).toEqual('OK');
        const status = result.json();
        expect(status.level).toEqual(3);
        expect(status.label).toEqual('Normal');
        expect(status.percentage).toEqual(60);
        expect(status.charging).toBe(false);
        expect(status.batteryId).toEqual('test-battery');
        expect(status.updatedAt).toBeDefined();
        expect(status.error).toBeNull();
      }),
    );
  });

  it("Energy level, POST should not exist", () => {
    return app
      .inject({ method: 'POST', url: '/sites/level' })
      .then((result) => {
        expect(result.statusCode).toEqual(404);
      });
  });

  it("Energy refresh, level 0 should stop every unprotected service", async () => {
    reading = { ...reading, percentage: 3, charging: false };
    await refreshLevel().then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.json().level).toEqual(0);
      expect(result.json().label).toEqual('Shutdown');
    });
    const sites = (await getSites()).json();
    for (const site of sites) {
      for (const service of site.services) {
        expect(service.status).toEqual(
          service.neverAutoStop ? 'active' : 'stopped',
        );
      }
      for (const feature of site.features) {
        expect(feature.enabled).toBe(false);
      }
    }
  });

  it("Energy refresh, level 1 should keep only the survival services", async () => {
    reading = { ...reading, percentage: 10 };
    await refreshLevel().then((result) => {
      expect(result.json().level).toEqual(1);
      expect(result.json().label).toEqual('Survival');
    });
    const sites = (await getSites()).json();
    expect(findService(sites, 'portail', 'accueil').status).toEqual('active');
    expect(findService(sites, 'portail', 'energie').status).toEqual('active');
    expect(findService(sites, 'portail', 'urgence').status).toEqual('active');
    expect(findService(sites, 'portail', 'galerie').status).toEqual('stopped');
    expect(findSite(sites, 'blog').active).toBe(false);
    expect(findSite(sites, 'carto').active).toBe(false);
  });

  it("Energy refresh, level 2 should disable images and videos", async () => {
    reading = { ...reading, percentage: 30 };
    await refreshLevel().then((result) => {
      expect(result.json().level).toEqual(2);
      expect(result.json().label).toEqual('Economy');
    });
    const sites = (await getSites()).json();
    expect(findService(sites, 'blog', 'articles').status).toEqual('active');
    expect(findService(sites, 'blog', 'commentaires').status).toEqual('active');
    expect(findService(sites, 'portail', 'galerie').status).toEqual('stopped');
    expect(findFeature(sites, 'portail', 'images').enabled).toBe(false);
    expect(findFeature(sites, 'portail', 'videos').enabled).toBe(false);
    expect(findFeature(sites, 'portail', 'recherche').enabled).toBe(true);
    expect(findFeature(sites, 'blog', 'traitements').enabled).toBe(false);
  });

  it("Energy refresh, level 3 should start every service", async () => {
    reading = { ...reading, percentage: 60 };
    await refreshLevel().then((result) => {
      expect(result.json().level).toEqual(3);
    });
    const sites = (await getSites()).json();
    for (const site of sites) {
      expect(site.active).toBe(true);
      for (const service of site.services) {
        expect(service.status).toEqual('active');
      }
      for (const feature of site.features) {
        expect(feature.enabled).toBe(true);
      }
    }
  });

  it("Energy refresh, a full battery that is not charging should stay at level 3", () => {
    reading = { ...reading, percentage: 95, charging: false };
    return refreshLevel().then((result) => {
      expect(result.json().level).toEqual(3);
      expect(result.json().charging).toBe(false);
    });
  });

  it("Energy refresh, a full battery that is charging should give level 4", () => {
    reading = { ...reading, percentage: 95, charging: true };
    return refreshLevel().then((result) => {
      expect(result.json().level).toEqual(4);
      expect(result.json().label).toEqual('Abundance');
      expect(result.json().charging).toBe(true);
    });
  });

  it("Energy refresh, a protected service should never be stopped automatically", async () => {
    await app.inject({
      method: 'PATCH',
      url: '/sites/blog/services/articles',
      headers: { 'content-type': 'application/json' },
      body: { neverAutoStop: true },
    });
    reading = { ...reading, percentage: 10, charging: false };
    await refreshLevel();
    const sites = (await getSites()).json();
    expect(findService(sites, 'blog', 'articles').status).toEqual('active');
    expect(findService(sites, 'blog', 'commentaires').status).toEqual(
      'stopped',
    );
  });

  it("Energy refresh, should keep the last level when the battery cannot be read", () => {
    failure = new Error('battery unreachable');
    return refreshLevel().then((result) => {
      expect(result.statusCode).toEqual(200);
      expect(result.json().level).toEqual(1);
      expect(result.json().percentage).toEqual(10);
      expect(result.json().error).toEqual('battery unreachable');
    });
  });

  it("Energy refresh, should clear the error once the battery answers again", () => {
    failure = null;
    reading = { ...reading, percentage: 60 };
    return refreshLevel().then((result) => {
      expect(result.json().level).toEqual(3);
      expect(result.json().error).toBeNull();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
