import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, Min, Max, IsArray, IsIn } from 'class-validator';

export class CreateProjectDto {
  @IsString() name!: string;
  @IsString() code!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() companyId!: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsString() managerId!: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) memberIds?: string[];
}

export class UpdateProjectDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() managerId?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
}

export class UpdateProjectStatusDto {
  @IsString() status!: string;
}

export class UpdateProjectProgressDto {
  @IsInt() @Min(0) @Max(100) progress!: number;
}

export class AddProjectMemberDto {
  @IsString() userId!: string;
  @IsOptional() @IsString() role?: string;
}

export class UpdateProjectMemberDto {
  @IsString() role!: string;
}

export class ProjectFilterDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() managerId?: string;
  @IsOptional() @IsBoolean() isArchived?: boolean;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsInt() @Min(0) offset?: number;
}
