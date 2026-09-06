import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { NoticesController } from './notices.controller.js';
import { NoticesService } from './notices.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [NoticesController],
  providers: [NoticesService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [NoticesService],
})
export class NoticesModule {}
