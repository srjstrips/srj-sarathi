import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { OrgController } from './org.controller.js';
import { OrgService } from './org.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [OrgController],
  providers: [OrgService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [OrgService],
})
export class OrgModule {}
