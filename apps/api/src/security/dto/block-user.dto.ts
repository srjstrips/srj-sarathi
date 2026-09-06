import { IsString, IsOptional, IsDateString } from 'class-validator';

export class BlockUserDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
