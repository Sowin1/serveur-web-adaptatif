import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealthStatus() {
    return {
      status: 'ok',
      uptime: process.uptime(), // Temps depuis lequel le serveur tourne
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    };
  }
}