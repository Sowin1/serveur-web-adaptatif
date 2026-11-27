import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import {
  DocumentBuilder,
  SwaggerModule,
  type SwaggerCustomOptions,
} from '@nestjs/swagger';
import { SitesStatusModule } from '../sites-status/sites-status.module.js';

export function setupSiteStatusSwagger(app: NestFastifyApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Sites-Status Documentation')
    .setVersion('1.0')
    .build();

  const options: SwaggerCustomOptions = { ui: true, raw: ['json'] };
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      include: [SitesStatusModule],
    });

  SwaggerModule.setup(
    'innovant/docs/sites-status',
    app,
    documentFactory,
    options,
  );
}
