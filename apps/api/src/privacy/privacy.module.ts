import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { PrivacyController } from './privacy.controller.js';
import { PrivacyService } from './privacy.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [PrivacyController],
  providers: [PrivacyService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [PrivacyService],
})
export class PrivacyModule {}
