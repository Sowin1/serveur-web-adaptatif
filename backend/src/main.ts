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

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configBattery = new DocumentBuilder()
    .setTitle('Battery api documentation')
    .setVersion('1.0')
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
