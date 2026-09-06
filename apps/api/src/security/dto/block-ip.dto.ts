import { IsString, IsIP, IsOptional, IsDateString } from 'class-validator';

export class BlockIpDto {
  @IsIP()
  ipAddress: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
