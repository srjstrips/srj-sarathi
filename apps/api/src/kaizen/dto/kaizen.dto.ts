import {
  IsString, IsOptional, IsBoolean, IsArray, IsInt, IsDateString, Min, Max,
} from 'class-validator';

export const KAIZEN_STATUSES = [
  'DRAFT', 'SUBMITTED', 'HOD_REVIEW', 'DIRECTOR_REVIEW',
  'APPROVED', 'REWORK_REQUIRED', 'REJECTED', 'ON_HOLD',
  'IMPLEMENTATION', 'IMPLEMENTED', 'CLOSED', 'CANCELLED',
] as const;

export const REVIEW_DECISIONS = ['APPROVE', 'REQUEST_REWORK', 'REJECT', 'APPROVE_FOR_IMPLEMENTATION'] as const;

export const BENEFIT_OPTIONS = [
  'COST_SAVINGS', 'INCREASED_EFFICIENCY', 'IMPROVED_SAFETY',
  'ENHANCED_QUALITY', 'OTHER',
] as const;

export const IMPL_STATUSES = [
  'PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED',
] as const;

export class KaizenParticipantDto {
  @IsString() name!: string;
  @IsOptional() @IsString() departmentOrCompany?: string;
}

export class CreateKaizenDto {
  @IsString() title!: string;
  @IsString() description!: string;
  @IsString() benefitDetails!: string;
  @IsString() implementationSuggestion!: string;
  @IsOptional() @IsString() additionalComments?: string;
  @IsString() signature!: string;
  @IsBoolean() declarationAccepted!: boolean;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() sectionId?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
  @IsOptional() @IsArray() participants?: KaizenParticipantDto[];
}

export class UpdateKaizenDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() benefitDetails?: string;
  @IsOptional() @IsString() implementationSuggestion?: string;
  @IsOptional() @IsString() additionalComments?: string;
  @IsOptional() @IsString() signature?: string;
  @IsOptional() @IsBoolean() declarationAccepted?: boolean;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() sectionId?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
  @IsOptional() @IsArray() participants?: KaizenParticipantDto[];
}

export class SubmitKaizenDto {
  @IsOptional() @IsString() signature?: string;
}

export class HodReviewDto {
  @IsOptional() @IsInt() @Min(1) @Max(5) feasibilityScore?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) impactScore?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) safetyScore?: number;
  @IsOptional() @IsString() estimatedSavings?: string;
  @IsOptional() @IsString() comments?: string;
  @IsString() decision!: string;
}

export class DirectorReviewDto {
  @IsOptional() @IsString() comments?: string;
  @IsString() decision!: string;
}

export class AddCommentDto {
  @IsString() body!: string;
}

export class UpdateCommentDto {
  @IsString() body!: string;
}

export class CreateKaizenImplementationDto {
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() responsibleDeptId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() targetCompletionDate?: string;
  @IsOptional() @IsString() requiredBudget?: string;
  @IsOptional() @IsString() requiredResources?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateKaizenImplementationDto {
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() responsibleDeptId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() targetCompletionDate?: string;
  @IsOptional() @IsDateString() actualCompletionDate?: string;
  @IsOptional() @IsString() requiredBudget?: string;
  @IsOptional() @IsString() actualCost?: string;
  @IsOptional() @IsString() requiredResources?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}

export class AddKaizenResultDto {
  @IsString() metric!: string;
  @IsOptional() @IsString() beforeValue?: string;
  @IsOptional() @IsString() afterValue?: string;
  @IsOptional() @IsString() improvement?: string;
  @IsOptional() @IsString() unit?: string;
}

export class CreateCategoryDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() displayOrder?: number;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsInt() displayOrder?: number;
}

export class KaizenFilterDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() submittedById?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsBoolean() isArchived?: boolean;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsInt() @Min(0) offset?: number;
}
