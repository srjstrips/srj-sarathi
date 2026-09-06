import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AttendanceService } from './attendance.service.js';
import {
  CheckInDto, CheckOutDto, AttendanceQueryDto, RegularizationRequestDto,
  ReviewRegularizationDto, CreateShiftDto, AssignShiftDto, CreateHolidayDto,
} from './dto/attendance.dto.js';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ─── Attendance Records ───────────────────────────────────────────────────

  @Get()
  @RequirePermissions('attendance.view')
  list(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.list(query);
  }

  @Get('my')
  @RequirePermissions('attendance.view')
  myAttendance(@CurrentUser() user: any, @Query() query: AttendanceQueryDto) {
    return this.attendanceService.list({ ...query, employeeId: user.sub });
  }

  @Get('report/:employeeId')
  @RequirePermissions('attendance.view')
  monthlyReport(
    @Param('employeeId') employeeId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.attendanceService.getMonthlyReport(
      employeeId,
      parseInt(year ?? String(new Date().getFullYear())),
      parseInt(month ?? String(new Date().getMonth() + 1)),
    );
  }

  @Post('check-in')
  @RequirePermissions('attendance.view')
  checkIn(@Body() dto: CheckInDto, @CurrentUser() user: any) {
    return this.attendanceService.checkIn(user.sub, dto);
  }

  @Post('check-out')
  @RequirePermissions('attendance.view')
  checkOut(@Body() dto: CheckOutDto, @CurrentUser() user: any) {
    return this.attendanceService.checkOut(user.sub, dto);
  }

  // ─── Regularizations ──────────────────────────────────────────────────────

  @Get('regularizations')
  @RequirePermissions('attendance.manage')
  listRegularizations(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceService.listRegularizations({ employeeId, status, page, limit });
  }

  @Post('regularizations')
  @RequirePermissions('attendance.view')
  requestRegularization(@Body() dto: RegularizationRequestDto, @CurrentUser() user: any) {
    return this.attendanceService.requestRegularization(user.sub, dto);
  }

  @Patch('regularizations/:id/review')
  @RequirePermissions('attendance.manage')
  reviewRegularization(
    @Param('id') id: string,
    @Body() dto: ReviewRegularizationDto,
    @CurrentUser() user: any,
  ) {
    return this.attendanceService.reviewRegularization(id, user.sub, dto);
  }

  // ─── Shifts ───────────────────────────────────────────────────────────────

  @Get('shifts')
  @RequirePermissions('attendance.view')
  listShifts() {
    return this.attendanceService.listShifts();
  }

  @Post('shifts')
  @RequirePermissions('attendance.manage')
  createShift(@Body() dto: CreateShiftDto) {
    return this.attendanceService.createShift(dto);
  }

  @Post('shifts/assign')
  @RequirePermissions('attendance.manage')
  assignShift(@Body() dto: AssignShiftDto) {
    return this.attendanceService.assignShift(dto);
  }

  // ─── Holidays ─────────────────────────────────────────────────────────────

  @Get('holidays')
  @RequirePermissions('attendance.view')
  listHolidays(@Query('year') year?: string) {
    return this.attendanceService.listHolidays(year ? parseInt(year) : undefined);
  }

  @Post('holidays')
  @RequirePermissions('attendance.manage')
  createHoliday(@Body() dto: CreateHolidayDto) {
    return this.attendanceService.createHoliday(dto);
  }
}
