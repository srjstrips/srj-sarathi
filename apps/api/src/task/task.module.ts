import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';
import { ProjectController } from './project.controller.js';
import { ProjectService } from './project.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [TaskController, ProjectController],
  providers: [TaskService, ProjectService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [TaskService, ProjectService],
})
export class TaskModule {}
