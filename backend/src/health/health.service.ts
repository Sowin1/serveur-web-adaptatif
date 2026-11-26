import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealthStatus() {
    return {
      status: 'ok',
      uptime: process.uptime(), // Time the server has been running
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    };
  }
}
