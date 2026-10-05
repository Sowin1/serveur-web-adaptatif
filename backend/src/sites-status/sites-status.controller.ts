import { Controller, Get } from '@nestjs/common';
import { SitesStatusService } from './sites-status.service.js';
import type { Site } from './sites.types.js';

@Controller('sites')
export class SitesStatusController {
  constructor(private readonly sitesStatusService: SitesStatusService) {}

  // GET /sites/status
  @Get('status')
  getStatus(): Site[] {
    return this.sitesStatusService.getSites();
  }
}
