import { Module } from '@nestjs/common';
import { AuthorizationController } from './authorization.controller.js';
import { AuthorizationService } from './authorization.service.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  controllers: [AuthorizationController],
  providers: [AuthorizationService, PermissionsGuard, RolesGuard],
  exports: [AuthorizationService, PermissionsGuard, RolesGuard],
})
export class AuthorizationModule {}
