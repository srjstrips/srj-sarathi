import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, IsEnum, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsInt() @Min(0) defaultDaysPerYear?: number;
  @IsOptional() @IsInt() @Min(0) maxCarryForward?: number;
  @IsOptional() @IsBoolean() allowHalfDay?: boolean;
  @IsOptional() @IsBoolean() requiresApproval?: boolean;
}

export class UpdateLeaveTypeDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsInt() @Min(0) defaultDaysPerYear?: number;
  @IsOptional() @IsInt() @Min(0) maxCarryForward?: number;
  @IsOptional() @IsBoolean() allowHalfDay?: boolean;
  @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class ApplyLeaveDto {
  @IsString() leaveTypeId!: string;
  @IsDateString() fromDate!: string;
  @IsDateString() toDate!: string;
  @IsOptional() @IsBoolean() isHalfDay?: boolean;
  @IsOptional() @IsString() reason?: string;
}

export class ReviewLeaveDto {
  @IsEnum(['APPROVED', 'REJECTED']) status!: 'APPROVED' | 'REJECTED';
  @IsOptional() @IsString() reviewNote?: string;
}

export class LeaveQueryDto {
  @IsOptional() @IsString() employeeId?: string;
  @IsOptional() @IsString() leaveTypeId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() fromDate?: string;
  @IsOptional() @IsString() toDate?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}

export class AllocateLeaveDto {
  @IsString() employeeId!: string;
  @IsString() leaveTypeId!: string;
  @IsInt() year!: number;
  @IsInt() @Min(0) allocated!: number;
  @IsOptional() @IsInt() @Min(0) carryForward?: number;
}
