import { IsOptional, IsUUID, IsEnum, IsArray, IsString, IsBoolean } from 'class-validator';

export const EXPORTABLE_FIELDS = [
  'employeeCode', 'firstName', 'lastName', 'displayName',
  'gender', 'maritalStatus', 'dateOfBirth', 'joiningDate', 'exitDate',
  'officialEmail', 'personalEmail', 'mobile', 'status',
  'companyId', 'locationId', 'divisionId', 'departmentId', 'sectionId',
  'designationId', 'jobGradeId', 'employmentTypeId', 'employmentCategoryId',
  'managerId', 'profilePicUrl', 'createdAt',
] as const;

export class CreateExportJobDto {
  @IsOptional() @IsUUID()    companyId?: string;
  @IsOptional() @IsUUID()    locationId?: string;
  @IsOptional() @IsUUID()    divisionId?: string;
  @IsOptional() @IsUUID()    departmentId?: string;
  @IsOptional() @IsUUID()    sectionId?: string;
  @IsOptional() @IsEnum(['ACTIVE', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'EXITED']) status?: string;
  @IsOptional() @IsBoolean() includeDeleted?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];
}
