import { IsString, IsOptional, IsBoolean, IsUUID, MaxLength } from 'class-validator';

export class CreateDivisionDto {
  @IsUUID()   locationId: string;
  @IsString() @MaxLength(200) name: string;
  @IsString() @MaxLength(20)  code: string;
  @IsOptional() @IsString() description?: string;
}

export class UpdateDivisionDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(20)  code?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
