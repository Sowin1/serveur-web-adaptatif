import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerCustomOptions,
} from '@nestjs/swagger';
import { BatteryAuthModule } from '../battery-auth/battery-auth.module.js';

export function setupAuthSwagger(app: NestFastifyApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Auth api documentation')
    .setVersion('1.0')
    .build();

  const options: SwaggerCustomOptions = { ui: true, raw: ['json'] };
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [BatteryAuthModule],
    });

  SwaggerModule.setup('innovant/docs/auth', app, documentFactory, options);
}
