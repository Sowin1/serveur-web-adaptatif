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
import { AppModule } from './app.module.js';
import { BatteryModule } from './battery/battery.module.js';
import { BatteryAuthModule } from './battery-auth/battery-auth.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

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
  SwaggerModule.setup('docs/auth', app, authDocumentFactory, optionAuth);

  /**
   * Swagger battery
   */
  const configBattery = new DocumentBuilder()
    .setTitle('Battery api documentation')
    .setVersion('1.0')
    .setDescription('Take a look to docs/auth for more information about JWT')
    .build();
  const optionBattery: SwaggerCustomOptions = { ui: true, raw: ['json'] };
  const batteryDocumentFactory = () =>
    SwaggerModule.createDocument(app, configBattery, {
      include: [BatteryModule],
    });
  SwaggerModule.setup(
    'docs/battery',
    app,
    batteryDocumentFactory,
    optionBattery,
  );

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
