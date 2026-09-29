import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { BatteryStrategy } from './auth.strategy.js';

@Module({
  imports: [PassportModule],
  providers: [AuthService, BatteryStrategy],
})
export class AuthModule {}
