import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  // Handle the login with only the password
  async login(password: string) {
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (password !== adminPassword) {
      throw new Error('Wrong password');
    }

    return true;
  }
}
