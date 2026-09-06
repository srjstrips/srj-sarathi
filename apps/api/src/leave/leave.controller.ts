import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { LeaveService } from './leave.service.js';
import {
  CreateLeaveTypeDto, UpdateLeaveTypeDto, ApplyLeaveDto,
  ReviewLeaveDto, LeaveQueryDto, AllocateLeaveDto,
} from './dto/leave.dto.js';

@ApiTags('Leave')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // ─── Leave Types ──────────────────────────────────────────────────────────

  @Get('types')
  @RequirePermissions('leave.view')
  listTypes(@Query('includeInactive') includeInactive?: string) {
    return this.leaveService.listLeaveTypes(includeInactive === 'true');
  }

  @Post('types')
  @RequirePermissions('leave.manage')
  createType(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveService.createLeaveType(dto);
  }

  @Patch('types/:id')
  @RequirePermissions('leave.manage')
  updateType(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.leaveService.updateLeaveType(id, dto);
  }

  // ─── Balances ─────────────────────────────────────────────────────────────

  @Get('balances/me')
  @RequirePermissions('leave.view')
  myBalances(@CurrentUser() user: any, @Query('year') year?: string) {
    return this.leaveService.getEmployeeBalances(user.sub, year ? parseInt(year) : undefined);
  }

  @Get('balances/:employeeId')
  @RequirePermissions('leave.manage')
  employeeBalances(@Param('employeeId') employeeId: string, @Query('year') year?: string) {
    return this.leaveService.getEmployeeBalances(employeeId, year ? parseInt(year) : undefined);
  }

  @Post('balances/allocate')
  @RequirePermissions('leave.manage')
  allocate(@Body() dto: AllocateLeaveDto) {
    return this.leaveService.allocateLeave(dto);
  }

  // ─── Applications ─────────────────────────────────────────────────────────

  @Get('applications')
  @RequirePermissions('leave.view')
  list(@Query() query: LeaveQueryDto) {
    return this.leaveService.listApplications(query);
  }

  @Get('applications/my')
  @RequirePermissions('leave.view')
  myApplications(@CurrentUser() user: any, @Query() query: LeaveQueryDto) {
    return this.leaveService.listApplications({ ...query, employeeId: user.sub });
  }

  @Post('applications')
  @RequirePermissions('leave.view')
  apply(@Body() dto: ApplyLeaveDto, @CurrentUser() user: any) {
    return this.leaveService.applyLeave(user.sub, dto);
  }

  @Patch('applications/:id/review')
  @RequirePermissions('leave.approve')
  review(@Param('id') id: string, @Body() dto: ReviewLeaveDto, @CurrentUser() user: any) {
    return this.leaveService.reviewLeave(id, user.sub, dto);
  }

  @Patch('applications/:id/cancel')
  @RequirePermissions('leave.view')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leaveService.cancelLeave(id, user.sub);
  }
}
