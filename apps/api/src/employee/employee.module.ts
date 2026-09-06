import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { EmployeeController, CustomFieldController, DocumentCategoryController } from './employee.controller.js';
import { EmployeeService } from './employee.service.js';

@Module({
  imports: [AuthenticationModule],
  controllers: [EmployeeController, CustomFieldController, DocumentCategoryController],
  providers: [EmployeeService, AuthorizationService, AccessTokenGuard, PermissionsGuard],
  exports: [EmployeeService],
})
export class EmployeeModule {}
