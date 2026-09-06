import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, Min, MaxLength } from 'class-validator';

export class CreateDesignationDto {
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsString() @MaxLength(20) code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) level?: number;
  @IsOptional() @IsUUID()   jobGradeId?: string;
  @IsOptional() @IsUUID()   sectionId?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateDesignationDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(20)  code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) level?: number;
  @IsOptional() @IsUUID()   jobGradeId?: string;
  @IsOptional() @IsUUID()   sectionId?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
