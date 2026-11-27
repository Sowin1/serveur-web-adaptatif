import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerCustomOptions,
} from '@nestjs/swagger';
import { BatteryModule } from '../battery/battery.module.js';

export function setupBatterySwagger(app: NestFastifyApplication): void {
  const config = new DocumentBuilder()
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

  const options: SwaggerCustomOptions = { ui: true, raw: ['json'] };
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [BatteryModule],
    });

  SwaggerModule.setup('innovant/docs/battery', app, documentFactory, options);
}
