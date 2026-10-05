import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { BatteryModule } from './battery/battery.module.js';
import { BatteryAuthModule } from './battery-auth/battery-auth.module.js';
import { SitesStatusModule } from './sites-status/sites-status.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    HttpModule,
    BatteryModule,
    BatteryAuthModule,
    SitesStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
