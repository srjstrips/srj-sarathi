import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { AuthorizationController } from './authorization.controller.js';
import { AuthorizationService } from './authorization.service.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, AccessTokenGuard, PermissionsGuard, RolesGuard],
  exports: [AuthorizationService, PermissionsGuard, RolesGuard],
})
export class AuthorizationModule {}
