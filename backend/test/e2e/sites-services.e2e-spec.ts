import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module.js';
import { expect } from 'vitest';

describe('Sites status', () => {
  let app: NestFastifyApplication;
  let sites: any[] = [];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`Sites status, should return a list of sites`, () => {
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

  it(`Sites status, each site should have services and features`, () => {
    for (const site of sites) {
      expect(site.id).toBeDefined();
      expect(site.name).toBeDefined();
      expect(typeof site.active).toBe('boolean');
      expect(Array.isArray(site.services)).toBe(true);
      expect(Array.isArray(site.features)).toBe(true);
    }
  });

  it(`Sites status, each feature should be enabled or disabled`, () => {
    for (const site of sites) {
      for (const feature of site.features) {
        expect(feature.name).toBeDefined();
        expect(typeof feature.enabled).toBe('boolean');
      }
    }
  });

  it(`Sites status, an offline site should have no active service`, () => {
    const offlineSites = sites.filter((site) => !site.active);
    for (const site of offlineSites) {
      const activeServices = site.services.filter((service: any) => service.active);
      expect(activeServices).toHaveLength(0);
    }
  });

  it(`Sites status, an online site should have at least one active service`, () => {
    const onlineSites = sites.filter((site) => site.active);
    for (const site of onlineSites) {
      const activeServices = site.services.filter((service: any) => service.active);
      expect(activeServices.length).toBeGreaterThan(0);
    }
  });

  it(`Sites status, each service should be active or inactive`, () => {
    for (const site of sites) {
      for (const service of site.services) {
        expect(service.name).toBeDefined();
        expect(typeof service.active).toBe('boolean');
      }
    }
  });

  it(`Sites status, GET should not return 404`, () => {
    return app
      .inject({
        method: 'GET',
        url: '/sites/status',
      })
      .then((result) => {
        expect(result.statusCode).not.toEqual(404);
      });
  });

  it(`Sites status, POST should not exist`, () => {
    return app
      .inject({
        method: 'POST',
        url: '/sites/status',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(404);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});