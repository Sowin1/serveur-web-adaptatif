import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../../src/app.module.js';
import { expect } from 'vitest';

describe('Battery', () => {
  let app: NestFastifyApplication;
  let token: string = '';
  let password: string = '';
  let batteryList: any = '';
  let currentBatteryState: string = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const configService = moduleRef.get(ConfigService);
    password = configService.getOrThrow<string>('AUTH_BATTERY');
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it(`Battery Auth JWT Authentication: should work`, async () => {
    const result = await app
      .inject({
        method: 'POST',
        url: '/battery/login',
        headers: { 'content-type': 'application/json' },
        body: {
          password: `${password}`,
        },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(201);
        const body = result.json();
        expect(body.access_token).toBeDefined();
      });
  });

  beforeEach(async () => {
    await app
      .inject({
        method: 'POST',
        url: '/battery/login',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          password: `${password}`,
        },
      })
      .then((result) => {
        const body = result.json();
        token = body.access_token;
      });
  });

  it(`Battery list, should be unauthorized`, () => {
    return app
      .inject({
        method: 'GET',
        url: '/battery/list',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(401);
        expect(result.statusMessage).toEqual('Unauthorized');
      });
  });

  it(`Battery list, should return a list of battery`, () => {
    return app
      .inject({
        method: 'GET',
        url: '/battery/list',
        headers: { authorization: `Bearer ${token}` },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        expect(result.statusMessage).toEqual('OK');
        batteryList = result.json();
      });
  }, 15_000);

  it(`Battery state, should return the state of the battery`, () => {
    // console.log(batteryList);
    const batteryId = batteryList[0].id;
    return app
      .inject({
        method: 'GET',
        url: `/battery/${batteryId}`,
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
        currentBatteryState = result.body;
      });
  });

  it(`Battery state change`, () => {
    const batteryId = batteryList[0].id;
    const batteryState = batteryList[0].state; // T A changer par batterie info tout court
    return app
      .inject({
        method: 'POST',
        url: `/battery/${batteryId}/update-state`,
        body: {
          state: 3,
        },
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);
      });

    // T Vérifier que le state à bien changé
    // T REvenir à la version précedente
  });

  afterAll(async () => {
    await app.close();
  });
});
