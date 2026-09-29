import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}
  async verifyToken(arg: string): Promise<any> {
    const expectedPass: string | undefined =
      this.configService.get<string>('AUTH_PASS');
    if (!expectedPass || !(await argon2.verify(expectedPass, arg))) {
      throw new UnauthorizedException('Invalid password');
    }
    return true;
  }
}
