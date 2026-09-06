import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, AccessTokenGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
