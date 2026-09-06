import { IsString, IsEnum, IsOptional, IsIP } from 'class-validator';

export enum ConsentStatus {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export class RecordConsentDto {
  @IsString()
  policyId: string;

  @IsEnum(ConsentStatus)
  status: ConsentStatus;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
