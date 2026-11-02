import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class ProjectAuthService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validate(arg: string): Promise<boolean> {
    const expectedPass: string | undefined =
      this.configService.get<string>('AUTH_PROJECT_PASS');
    if (!expectedPass || !(await argon2.verify(expectedPass, arg))) {
      throw new UnauthorizedException('Invalid password');
    }
    return true;
  }

  async authenticate(): Promise<{ access_token: string }> {
    return {
      access_token: this.jwtService.sign({
        sub: 'project-api',
      }),
    };
  }
}
