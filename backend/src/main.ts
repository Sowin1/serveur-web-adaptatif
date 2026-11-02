import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import cookie from '@fastify/cookie';
import { AppModule } from './app.module.js';
import { BatteryModule } from './battery/battery.module.js';
import { BatteryAuthModule } from './battery-auth/battery-auth.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix('innovants');
  app.enableCors();

  await app.register(cookie);

  /**
   * Swagger auth
   */
  const configAuth = new DocumentBuilder()
    .setTitle('Auth api documentation')
    .setVersion('1.0')
    .build();
  const optionAuth: SwaggerCustomOptions = { ui: true, raw: ['json'] };
  const authDocumentFactory = () =>
    SwaggerModule.createDocument(app, configAuth, {
      include: [BatteryAuthModule],
    });
  SwaggerModule.setup(
    'innovant/docs/auth',
    app,
    authDocumentFactory,
    optionAuth,
  );

  /**
   * Swagger battery
   */
  const configBattery = new DocumentBuilder()
    .setTitle('Battery api documentation')
    .setVersion('1.0')
    .setDescription('Take a look to docs/auth for more information about JWT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Paste access token without Bearer prefix',
      },
      'bearerBattery',
    )
    .addSecurityRequirements('bearerBattery')
    .build();
  const optionBattery: SwaggerCustomOptions = { ui: true, raw: ['json'] };
  const batteryDocumentFactory = () =>
    SwaggerModule.createDocument(app, configBattery, {
      include: [BatteryModule],
    });
  SwaggerModule.setup(
    'innovant/docs/battery',
    app,
    batteryDocumentFactory,
    optionBattery,
  );

  await app.listen({
    port: Number(process.env.PORT ?? 3000),
    host: '127.0.0.1',
  });
}

bootstrap();
