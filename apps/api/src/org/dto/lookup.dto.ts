import { IsString, IsOptional, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';

export class CreateLookupDto {
  @IsString() @MaxLength(20)  code: string;
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateLookupDto {
  @IsOptional() @IsString() @MaxLength(20)  code?: string;
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CreateEmployeeStatusConfigDto {
  @IsString() @MaxLength(20)  code: string;
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateEmployeeStatusConfigDto {
  @IsOptional() @IsString() @MaxLength(20)  code?: string;
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
