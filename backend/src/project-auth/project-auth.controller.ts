import { Controller, Post, Request } from '@nestjs/common';
import { ProjectAuthService } from './project-auth.service.js';

@Controller()
export class ProjectAuthController {
  constructor(private projectAuthService: ProjectAuthService) {}
  @Post('prj-auth/login')
  async authenticate(@Request() _req: any) {
    return await this.projectAuthService.authenticate();
  }
}
