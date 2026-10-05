import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  // Verify if you are connected as admin
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.cookies.isAdmin !== 'true') {
      throw new Error('You are not logged in');
    }

    return true;
  }
}
