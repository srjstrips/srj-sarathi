import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CorrectionRequestDto {
  @IsString()
  @MaxLength(100)
  field: string;

  @IsString()
  requestedValue: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewCorrectionDto {
  @IsString()
  @IsOptional()
  reviewNote?: string;
}
