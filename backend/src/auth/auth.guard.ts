import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const isAdmin = request.cookies.isAdmin;

    if (isAdmin !== 'true') {
      throw new Error('Unauthorized');
    }

    return true;
  }
}
