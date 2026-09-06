import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';

export class CreateNoticeDto {
  @IsString() title!: string;
  @IsString() content!: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT']) priority?: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsBoolean() requiresAck?: boolean;
  @IsOptional() @IsDateString() publishedAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsString() imageUrl?: string;
}

export class UpdateNoticeDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT']) priority?: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsBoolean() requiresAck?: boolean;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @IsString() imageUrl?: string;
}

export class NoticeQueryDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}

export class AddCommentDto {
  @IsString() content!: string;
}
