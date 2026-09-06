import { IsString, IsOptional, IsBoolean, IsInt, IsArray, IsIn, Min, IsDateString } from 'class-validator';

export const CONVERSATION_TYPES = ['DIRECT', 'GROUP', 'DEPARTMENT', 'SECTION', 'PROJECT', 'TASK', 'ANNOUNCEMENT_CHANNEL'] as const;
export const MEMBER_ROLES       = ['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER', 'OBSERVER'] as const;
export const MESSAGE_TYPES      = ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'VOICE', 'DOCUMENT', 'GIF', 'STICKER', 'POLL', 'LOCATION', 'LINK', 'CONTACT', 'SYSTEM', 'CALL', 'FILE'] as const;
export const REPORT_CATEGORIES  = ['SPAM', 'HARASSMENT', 'ABUSE', 'CONFIDENTIAL_DATA', 'SECURITY', 'POLICY_VIOLATION', 'OTHER'] as const;
export const NOTIFY_MODES       = ['ALL', 'MENTIONS', 'MUTED'] as const;

// ─── Conversation DTOs ────────────────────────────────────────────────────────

export class CreateDirectDto {
  @IsString() userId!: string;
}

export class CreateGroupDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) memberIds?: string[];
  @IsOptional() @IsString() companyId?: string;
  @IsOptional() @IsString() departmentId?: string;
}

export class UpdateConversationDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isReadOnly?: boolean;
}

export class UpdateGroupSettingsDto {
  @IsOptional() @IsBoolean() allowSendMessages?: boolean;
  @IsOptional() @IsBoolean() allowSendMedia?: boolean;
  @IsOptional() @IsBoolean() allowSendDocuments?: boolean;
  @IsOptional() @IsBoolean() allowSendPolls?: boolean;
  @IsOptional() @IsBoolean() allowAddMembers?: boolean;
  @IsOptional() @IsBoolean() allowPinMessages?: boolean;
  @IsOptional() @IsBoolean() allowDeleteMessages?: boolean;
  @IsOptional() @IsInt() maxMembers?: number;
  @IsOptional() @IsInt() disappearingTimer?: number;
  @IsOptional() @IsBoolean() forwardingRestricted?: boolean;
  @IsOptional() @IsBoolean() downloadRestricted?: boolean;
}

export class AddMemberDto {
  @IsString() userId!: string;
  @IsOptional() @IsString() role?: string;
}

export class UpdateMemberRoleDto {
  @IsString() role!: string;
}

export class ConversationFilterDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsBoolean() isArchived?: boolean;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
}

// ─── Message DTOs ─────────────────────────────────────────────────────────────

export class SendMessageDto {
  @IsOptional() @IsString() clientMessageId?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() replyToId?: string;
  @IsOptional() @IsString() classification?: string;
  @IsOptional() metadata?: any;
}

export class EditMessageDto {
  @IsString() text!: string;
}

export class ForwardMessageDto {
  @IsArray() @IsString({ each: true }) conversationIds!: string[];
}

export class MarkReadDto {
  @IsString() lastReadMessageId!: string;
}

export class AddReactionDto {
  @IsString() emoji!: string;
}

export class MessageCursorDto {
  @IsOptional() @IsString() cursor?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsString() before?: string;
  @IsOptional() @IsString() after?: string;
}

export class SearchMessagesDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() conversationId?: string;
  @IsOptional() @IsString() senderId?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
  @IsOptional() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsString() cursor?: string;
}

// ─── Draft DTOs ───────────────────────────────────────────────────────────────

export class SaveDraftDto {
  @IsString() conversationId!: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() replyToId?: string;
}

// ─── Scheduled message DTOs ───────────────────────────────────────────────────

export class ScheduleMessageDto {
  @IsString() conversationId!: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() text?: string;
  @IsDateString() scheduledAt!: string;
}

// ─── Poll DTOs ────────────────────────────────────────────────────────────────

export class CreatePollDto {
  @IsString() question!: string;
  @IsArray() @IsString({ each: true }) options!: string[];
  @IsOptional() @IsBoolean() isMultiChoice?: boolean;
  @IsOptional() @IsBoolean() isAnonymous?: boolean;
}

export class VotePollDto {
  @IsArray() @IsString({ each: true }) optionIds!: string[];
}

// ─── Mute / Archive DTOs ─────────────────────────────────────────────────────

export class MuteConversationDto {
  @IsOptional() @IsInt() durationMinutes?: number;
}

// ─── Report DTO ───────────────────────────────────────────────────────────────

export class ReportMessageDto {
  @IsString() category!: string;
  @IsOptional() @IsString() description?: string;
}

// ─── Call DTOs ────────────────────────────────────────────────────────────────

export class InitiateCallDto {
  @IsArray() @IsString({ each: true }) recipientIds!: string[];
  @IsString() type!: string;
  @IsOptional() @IsString() conversationId?: string;
}
