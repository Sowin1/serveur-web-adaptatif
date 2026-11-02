import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ProjectAuthService } from './project-auth.service.js';
import { ProjectAuthStrategy } from './project-auth.strategy.js';
import { ProjectAuthController } from './project-auth.controller.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET_PROJECT'),
        signOptions: {
          expiresIn: 33599,
        },
      }),
    }),
  ],
  providers: [ProjectAuthService, ProjectAuthStrategy],
  controllers: [ProjectAuthController],
  exports: [ProjectAuthService],
})
export class ProjectAuthModule {}
