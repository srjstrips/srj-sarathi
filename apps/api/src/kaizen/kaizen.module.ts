import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { KaizenController, KaizenCategoryController } from './kaizen.controller.js';
import { KaizenService } from './kaizen.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [KaizenController, KaizenCategoryController],
  providers: [KaizenService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [KaizenService],
})
export class KaizenModule {}
