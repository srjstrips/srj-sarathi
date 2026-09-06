import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { KraController } from './kra.controller.js';
import { KraService } from './kra.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [KraController],
  providers: [KraService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [KraService],
})
export class KraModule {}
