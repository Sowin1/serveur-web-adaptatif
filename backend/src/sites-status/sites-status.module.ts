import { Module } from '@nestjs/common';
import { SitesStatusController } from './sites-status.controller.js';
import { SitesStatusService } from './sites-status.service.js';

@Module({
  controllers: [SitesStatusController],
  providers: [SitesStatusService],
})
export class SitesStatusModule {}
