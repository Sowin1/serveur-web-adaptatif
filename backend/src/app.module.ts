import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SitesStatusModule } from './sites-status/sites-status.module.js';

@Module({
  imports: [SitesStatusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
