import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString() @MaxLength(200) name: string;
  @IsString() @MaxLength(20)  code: string;
  @IsOptional() @IsString() @MaxLength(200) legalName?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() logoUrl?: string;
}

export class UpdateCompanyDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(20)  code?: string;
  @IsOptional() @IsString() @MaxLength(200) legalName?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
