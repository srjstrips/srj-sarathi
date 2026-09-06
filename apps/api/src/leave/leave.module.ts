import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { LeaveController } from './leave.controller.js';
import { LeaveService } from './leave.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [LeaveController],
  providers: [LeaveService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [LeaveService],
})
export class LeaveModule {}
