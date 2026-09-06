import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  resource: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  action: string;

  @IsOptional()
  @IsString()
  description?: string;
}
