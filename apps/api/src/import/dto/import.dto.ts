import { IsString, IsOptional, IsUUID, IsEnum, IsBoolean, IsInt, Min, MaxLength, IsArray } from 'class-validator';

export class CreateImportTemplateDto {
  @IsString() @MaxLength(200) name: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(['EMPLOYEE', 'ORG']) templateType: string;
  @IsOptional() @IsEnum(['SKIP', 'UPDATE', 'ERROR']) duplicateStrategy?: string;
}

export class UpdateImportTemplateDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(['SKIP', 'UPDATE', 'ERROR']) duplicateStrategy?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class AddTemplateMappingDto {
  @IsString() @MaxLength(200) sourceColumn: string;
  @IsString() @MaxLength(100) targetField: string;
  @IsOptional() @IsBoolean() isRequired?: boolean;
  @IsOptional() @IsString() defaultValue?: string;
  @IsOptional() @IsString() transformation?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class CreateImportJobDto {
  @IsOptional() @IsUUID() templateId?: string;
  @IsOptional() @IsEnum(['SKIP', 'UPDATE', 'ERROR']) duplicateStrategy?: string;
  @IsArray() columnMappings: Array<{ sourceColumn: string; targetField: string }>;
  rows: Record<string, unknown>[];
}

export class ConfirmImportJobDto {
  @IsOptional() @IsBoolean() dryRun?: boolean;
}
