import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SleepingService} from './sleeping-service.js';

@Controller('service')
export class servicesController {
  constructor(private readonly batteryService: servicesController) {}



}