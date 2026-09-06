import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class CheckInDto {
  @IsOptional() @IsDateString() checkIn?: string;
  @IsOptional() @IsString() remarks?: string;
}

export class CheckOutDto {
  @IsOptional() @IsDateString() checkOut?: string;
  @IsOptional() @IsString() remarks?: string;
}

export class AttendanceQueryDto {
  @IsOptional() @IsString() employeeId?: string;
  @IsOptional() @IsString() fromDate?: string;
  @IsOptional() @IsString() toDate?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}

export class RegularizationRequestDto {
  @IsString() attendanceId!: string;
  @IsString() reason!: string;
  @IsOptional() @IsDateString() requestedIn?: string;
  @IsOptional() @IsDateString() requestedOut?: string;
}

export class ReviewRegularizationDto {
  @IsEnum(['APPROVED', 'REJECTED']) status!: 'APPROVED' | 'REJECTED';
  @IsOptional() @IsString() reviewNote?: string;
}

export class CreateShiftDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsString() startTime!: string;
  @IsString() endTime!: string;
  @IsOptional() graceMinutes?: number;
  @IsOptional() @IsBoolean() isNightShift?: boolean;
}

export class AssignShiftDto {
  @IsString() employeeId!: string;
  @IsString() shiftId!: string;
  @IsDateString() fromDate!: string;
  @IsOptional() @IsDateString() toDate?: string;
}

export class CreateHolidayDto {
  @IsString() name!: string;
  @IsDateString() date!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isOptional?: boolean;
  @IsOptional() @IsString() companyId?: string;
}
