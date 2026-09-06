import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, Min, MaxLength } from 'class-validator';

export class CreateSectionDto {
  @IsUUID()   departmentId: string;
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsString() @MaxLength(20) code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID()   subHodId?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateSectionDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(20)  code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUUID()   subHodId?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
