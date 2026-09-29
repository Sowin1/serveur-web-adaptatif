import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Injectable()
export class BatteryStrategy extends PassportStrategy(Strategy, 'battery') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(_username: string, password: string): Promise<any> {
    const hasValidate = await this.authService.verifyToken(password);
    if (!hasValidate) {
      throw new UnauthorizedException();
    }
    return hasValidate;
  }
}
