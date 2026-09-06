import { IsString, IsInt, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateRetentionPolicyDto {
  @IsString()
  @MaxLength(100)
  dataCategory: string;

  @IsInt()
  @Min(1)
  retentionDays: number;

  @IsOptional()
  @IsString()
  retentionBasis?: string;

  @IsString()
  @MaxLength(50)
  deletionBehavior: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  anonymizationBehavior?: string;
}

export class UpdateRetentionPolicyDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  retentionDays?: number;

  @IsOptional()
  @IsString()
  retentionBasis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  deletionBehavior?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  anonymizationBehavior?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
