import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, Min, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsUUID()   divisionId: string;
  @IsString() @MaxLength(200) name: string;
  @IsString() @MaxLength(20)  code: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID()   hodId?: string;
  @IsOptional() @IsUUID()   parentId?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateDepartmentDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(20)  code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID()   hodId?: string;
  @IsOptional() @IsUUID()   parentId?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
