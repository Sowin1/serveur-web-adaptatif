import { Injectable } from '@nestjs/common';
import { SITES } from './sites.data.js';
import type { Site } from './sites.types.js';

@Injectable()
export class SitesStatusService {
  getSites(): Site[] {
    return SITES;
  }
}
