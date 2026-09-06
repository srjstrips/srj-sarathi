import { IsString, IsOptional, IsBoolean, IsInt, IsDateString, Min, Max, IsIn, IsArray } from 'class-validator';

export const TASK_STATUSES = [
  'DRAFT', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS',
  'SUBMITTED_FOR_REVIEW', 'APPROVED', 'COMPLETED',
  'PENDING', 'ON_HOLD', 'REWORK', 'OVERDUE', 'CANCELLED', 'REOPENED',
] as const;

export const TASK_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const TASK_TYPES = [
  'ASSIGNED', 'PERSONAL', 'DEPARTMENT', 'PROJECT',
  'SUBTASK', 'CHECKLIST', 'RECURRING', 'FOLLOW_UP', 'APPROVAL', 'MEETING_ACTION',
] as const;

export const DEPENDENCY_TYPES = [
  'BLOCKED_BY', 'BLOCKS', 'RELATED_TO', 'DUPLICATE_OF', 'PARENT_OF', 'SUBTASK_OF',
] as const;

export class CreateTaskDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() taskType?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @IsOptional() @IsBoolean() isPersonal?: boolean;
  @IsOptional() @IsBoolean() isRecurring?: boolean;
  @IsOptional() @IsString() recurringRule?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) assigneeIds?: string[];
  @IsOptional() @IsArray() checklistItems?: { title: string; assignedToId?: string; dueDate?: string }[];
}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() taskType?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @IsOptional() @IsBoolean() isRecurring?: boolean;
  @IsOptional() @IsString() recurringRule?: string;
}

export class UpdateTaskStatusDto {
  @IsString() status!: string;
  @IsOptional() @IsString() note?: string;
}

export class UpdateTaskProgressDto {
  @IsInt() @Min(0) @Max(100) progress!: number;
}

export class AssignTaskDto {
  @IsArray() @IsString({ each: true }) userIds!: string[];
}

export class AddChecklistItemDto {
  @IsString() title!: string;
  @IsOptional() @IsString() assignedToId?: string;
  @IsOptional() @IsDateString() dueDate?: string;
}

export class UpdateChecklistItemDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsBoolean() isCompleted?: boolean;
  @IsOptional() @IsString() assignedToId?: string;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsInt() displayOrder?: number;
}

export class AddCommentDto {
  @IsString() body!: string;
}

export class UpdateCommentDto {
  @IsString() body!: string;
}

export class AddDependencyDto {
  @IsString() dependsOnTaskId!: string;
  @IsOptional() @IsString() dependencyType?: string;
}

export class AddReminderDto {
  @IsDateString() remindAt!: string;
}

export class TaskFilterDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() taskType?: string;
  @IsOptional() @IsString() projectId?: string;
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional() @IsString() createdById?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsBoolean() isPersonal?: boolean;
  @IsOptional() @IsBoolean() isOverdue?: boolean;
  @IsOptional() @IsBoolean() isArchived?: boolean;
  @IsOptional() @IsString() dueBefore?: string;
  @IsOptional() @IsString() dueAfter?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsInt() @Min(0) offset?: number;
}
