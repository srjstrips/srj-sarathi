import { IsString, IsOptional } from 'class-validator';

export class DeletionRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReviewDeletionDto {
  @IsString()
  decision: 'APPROVE' | 'REJECT';

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
