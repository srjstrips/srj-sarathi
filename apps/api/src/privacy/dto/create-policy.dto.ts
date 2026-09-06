import { IsString, IsEnum, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';

export enum PolicyType {
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  TERMS_OF_USE = 'TERMS_OF_USE',
  COOKIE_POLICY = 'COOKIE_POLICY',
  DATA_RETENTION_POLICY = 'DATA_RETENTION_POLICY',
  SECURITY_POLICY = 'SECURITY_POLICY',
}

export class CreatePolicyDto {
  @IsEnum(PolicyType)
  policyType: PolicyType;

  @IsString()
  @MaxLength(20)
  version: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsDateString()
  effectiveAt?: string;
}

export class UpdatePolicyDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @IsOptional()
  @IsDateString()
  effectiveAt?: string;
}

export class PublishPolicyDto {
  @IsOptional()
  @IsDateString()
  effectiveAt?: string;
}
