import { IsString, IsOptional, IsUUID, IsEnum, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeSearchDto {
  @IsOptional() @IsString()  q?: string;
  @IsOptional() @IsUUID()    companyId?: string;
  @IsOptional() @IsUUID()    locationId?: string;
  @IsOptional() @IsUUID()    divisionId?: string;
  @IsOptional() @IsUUID()    departmentId?: string;
  @IsOptional() @IsUUID()    sectionId?: string;
  @IsOptional() @IsUUID()    designationId?: string;
  @IsOptional() @IsUUID()    jobGradeId?: string;
  @IsOptional() @IsUUID()    employmentTypeId?: string;
  @IsOptional() @IsUUID()    employmentCategoryId?: string;
  @IsOptional() @IsUUID()    managerId?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'EXITED']) status?: string;
  @IsOptional() @IsEnum(['MALE', 'FEMALE', 'OTHER']) gender?: string;
  @IsOptional() @IsBoolean() @Type(() => Boolean) includeDeleted?: boolean;
  @IsOptional() @IsInt() @Min(1) @Max(200) @Type(() => Number) limit?: number;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) offset?: number;
  @IsOptional() @IsEnum(['firstName', 'lastName', 'employeeCode', 'joiningDate', 'createdAt']) sortBy?: string;
  @IsOptional() @IsEnum(['asc', 'desc']) sortDir?: string;
}

export class BulkUpdateStatusDto {
  @IsUUID(undefined, { each: true }) ids: string[];
  @IsEnum(['ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'EXITED']) status: string;
}

export class BulkTransferDto {
  @IsUUID(undefined, { each: true }) ids: string[];
  @IsOptional() @IsUUID() locationId?: string;
  @IsOptional() @IsUUID() divisionId?: string;
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsUUID() sectionId?: string;
  @IsOptional() @IsUUID() designationId?: string;
  @IsOptional() @IsUUID() managerId?: string;
}

export class BulkAssignManagerDto {
  @IsUUID(undefined, { each: true }) ids: string[];
  @IsOptional() @IsUUID() managerId?: string | null;
}
