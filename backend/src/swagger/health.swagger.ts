import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerCustomOptions,
} from '@nestjs/swagger';
import { HealthModule } from '../health/health.module.js';

export function setupHealthSwagger(app: NestFastifyApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Health Documentation')
    .setVersion('1.0')
    .build();

  const options: SwaggerCustomOptions = { ui: true, raw: ['json'] };
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [HealthModule],
    });

  SwaggerModule.setup('innovant/docs/health', app, documentFactory, options);
}
