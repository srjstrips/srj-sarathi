import { IsString, IsOptional, IsInt, IsDateString, IsEnum, Min, Max } from 'class-validator';

export enum KraCycleStatusDto { DRAFT = 'DRAFT', ACTIVE = 'ACTIVE', CLOSED = 'CLOSED' }
export enum KraRaterTypeDto { SELF = 'SELF', HOD = 'HOD', HEAD = 'HEAD', ADMIN = 'ADMIN' }

export class CreateKraCycleDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() periodFrom!: string;
  @IsDateString() periodTo!: string;
}

export class CreateKraObjectiveDto {
  @IsString() cycleId!: string;
  @IsString() employeeId!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) weightage?: number;
  @IsOptional() @IsString() target?: string;
  @IsOptional() @IsString() unit?: string;
}

export class SubmitKraRatingDto {
  @IsInt() @Min(1) @Max(5) rating!: number;
  @IsOptional() @IsString() remarks?: string;
}

export class KraQueryDto {
  @IsOptional() @IsString() cycleId?: string;
  @IsOptional() @IsString() employeeId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}
