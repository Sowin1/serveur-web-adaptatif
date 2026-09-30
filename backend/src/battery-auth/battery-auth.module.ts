import { Module } from '@nestjs/common';
import { BatteryAuthService } from './battery-auth.service.js';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { BatteryAuthStrategy } from './battery-auth.strategy.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 33599,
        },
      }),
    }),
  ],
  providers: [BatteryAuthService, BatteryAuthStrategy],
  exports: [BatteryAuthService],
})
export class BatteryAuthModule {}
