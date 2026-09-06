import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateEmergencyContactDto {
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsString() @MaxLength(100) relationship?: string;
  @IsString() @MaxLength(20)  phone: string;
  @IsOptional() @IsString() @MaxLength(20) alternatePhone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsInt() @Min(1) priority?: number;
}

export class UpdateEmergencyContactDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() @MaxLength(100) relationship?: string;
  @IsOptional() @IsString() @MaxLength(20)  phone?: string;
  @IsOptional() @IsString() @MaxLength(20)  alternatePhone?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsInt() @Min(1) priority?: number;
}
