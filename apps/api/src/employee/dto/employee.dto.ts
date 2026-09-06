import {
  IsString, IsOptional, IsUUID, IsEnum, IsEmail,
  IsDateString, MaxLength, IsBoolean,
} from 'class-validator';

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export class CreateEmployeeDto {
  @IsString() @MaxLength(50)  employeeCode: string;
  @IsUUID()   companyId: string;
  @IsOptional() @IsUUID()   userId?: string;
  @IsOptional() @IsUUID()   locationId?: string;
  @IsOptional() @IsUUID()   divisionId?: string;
  @IsOptional() @IsUUID()   departmentId?: string;
  @IsOptional() @IsUUID()   sectionId?: string;
  @IsOptional() @IsUUID()   designationId?: string;
  @IsOptional() @IsUUID()   jobGradeId?: string;
  @IsOptional() @IsUUID()   employmentTypeId?: string;
  @IsOptional() @IsUUID()   employmentCategoryId?: string;
  @IsOptional() @IsUUID()   managerId?: string;
  @IsOptional() @IsUUID()   hodId?: string;
  @IsOptional() @IsUUID()   subHodId?: string;
  @IsString() @MaxLength(100) firstName: string;
  @IsString() @MaxLength(100) lastName: string;
  @IsOptional() @IsString() @MaxLength(200) displayName?: string;
  @IsOptional() @IsEnum(['MALE', 'FEMALE', 'OTHER']) gender?: string;
  @IsOptional() @IsEnum(MaritalStatus) maritalStatus?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsDateString() joiningDate: string;
  @IsOptional() @IsEmail() @MaxLength(200) officialEmail?: string;
  @IsOptional() @IsEmail() @MaxLength(200) personalEmail?: string;
  @IsOptional() @IsString() @MaxLength(20) mobile?: string;
  @IsOptional() @IsString() profilePicUrl?: string;
}

export class UpdateEmployeeDto {
  @IsOptional() @IsUUID()   locationId?: string;
  @IsOptional() @IsUUID()   divisionId?: string;
  @IsOptional() @IsUUID()   departmentId?: string;
  @IsOptional() @IsUUID()   sectionId?: string;
  @IsOptional() @IsUUID()   designationId?: string;
  @IsOptional() @IsUUID()   jobGradeId?: string;
  @IsOptional() @IsUUID()   employmentTypeId?: string;
  @IsOptional() @IsUUID()   employmentCategoryId?: string;
  @IsOptional() @IsUUID()   managerId?: string;
  @IsOptional() @IsUUID()   hodId?: string;
  @IsOptional() @IsUUID()   subHodId?: string;
  @IsOptional() @IsString() @MaxLength(100) firstName?: string;
  @IsOptional() @IsString() @MaxLength(100) lastName?: string;
  @IsOptional() @IsString() @MaxLength(200) displayName?: string;
  @IsOptional() @IsEnum(['MALE', 'FEMALE', 'OTHER']) gender?: string;
  @IsOptional() @IsEnum(MaritalStatus) maritalStatus?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsDateString() joiningDate?: string;
  @IsOptional() @IsEmail() @MaxLength(200) officialEmail?: string;
  @IsOptional() @IsEmail() @MaxLength(200) personalEmail?: string;
  @IsOptional() @IsString() @MaxLength(20) mobile?: string;
  @IsOptional() @IsString() profilePicUrl?: string;
}

export class EmployeeListQueryDto {
  @IsOptional() @IsUUID()   companyId?: string;
  @IsOptional() @IsUUID()   locationId?: string;
  @IsOptional() @IsUUID()   divisionId?: string;
  @IsOptional() @IsUUID()   departmentId?: string;
  @IsOptional() @IsUUID()   sectionId?: string;
  @IsOptional() @IsUUID()   designationId?: string;
  @IsOptional() @IsUUID()   managerId?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'EXITED']) status?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsBoolean() includeDeleted?: boolean;
}

export class TransferEmployeeDto {
  @IsOptional() @IsUUID()   companyId?: string;
  @IsOptional() @IsUUID()   locationId?: string;
  @IsOptional() @IsUUID()   divisionId?: string;
  @IsOptional() @IsUUID()   departmentId?: string;
  @IsOptional() @IsUUID()   sectionId?: string;
  @IsOptional() @IsUUID()   designationId?: string;
  @IsOptional() @IsUUID()   managerId?: string;
  @IsOptional() @IsDateString() effectiveFrom?: string;
  @IsOptional() @IsString() reason?: string;
}

export class ExitEmployeeDto {
  @IsDateString() exitDate: string;
  @IsOptional() @IsEnum(['RESIGNED', 'TERMINATED', 'EXITED']) exitStatus?: string;
  @IsOptional() @IsString() reason?: string;
}

export class AssignManagerDto {
  @IsOptional() @IsUUID() managerId?: string | null;
}
