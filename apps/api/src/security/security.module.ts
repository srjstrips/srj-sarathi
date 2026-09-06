import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { SecurityController } from './security.controller.js';
import { SecurityService } from './security.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [SecurityController],
  providers: [SecurityService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [SecurityService],
})
export class SecurityModule {}
