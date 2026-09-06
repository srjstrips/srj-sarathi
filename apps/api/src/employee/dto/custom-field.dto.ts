import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, MaxLength, IsObject } from 'class-validator';

export class CreateCustomFieldDto {
  @IsString() @MaxLength(50)  code: string;
  @IsString() @MaxLength(200) name: string;
  @IsEnum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTISELECT']) fieldType: string;
  @IsOptional() @IsBoolean() isRequired?: boolean;
  @IsOptional() @IsString() defaultValue?: string;
  @IsOptional() @IsObject() options?: Record<string, unknown>;
  @IsOptional() @IsString() validationRule?: string;
  @IsOptional() @IsString() visibleTo?: string;
  @IsOptional() @IsString() editableBy?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateCustomFieldDto {
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsBoolean() isRequired?: boolean;
  @IsOptional() @IsString() defaultValue?: string;
  @IsOptional() @IsObject() options?: Record<string, unknown>;
  @IsOptional() @IsString() validationRule?: string;
  @IsOptional() @IsString() visibleTo?: string;
  @IsOptional() @IsString() editableBy?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

export class SetCustomFieldValueDto {
  @IsString() fieldId: string;
  @IsOptional() @IsString() value?: string;
}
