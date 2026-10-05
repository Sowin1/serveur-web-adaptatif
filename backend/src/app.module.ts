import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { SitesStatusModule } from './sites-status/sites-status.module.js';

@Module({
  imports: [SitesStatusModule],
import { ConfigModule } from '@nestjs/config';
import { BatteryModule } from './battery/battery.module.js';
import { BatteryAuthModule } from './battery-auth/battery-auth.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    HttpModule,
    BatteryModule,
    BatteryAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
