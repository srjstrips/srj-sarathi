import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceService } from './attendance.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [AttendanceService],
})
export class AttendanceModule {}
