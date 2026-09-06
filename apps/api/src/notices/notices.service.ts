import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateNoticeDto, UpdateNoticeDto, NoticeQueryDto, AddCommentDto,
} from './dto/notices.dto.js';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: NoticeQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.status)   where['status']   = query.status;
    if (query.category) where['category'] = query.category;
    if (query.priority) where['priority'] = query.priority;

    const page  = parseInt(query.page  ?? '1',  10);
    const limit = parseInt(query.limit ?? '20', 10);
    const skip  = (page - 1) * limit;

    const items = await this.prisma.orm.public.Notice
      .where(where as any)
      .orderBy(m => (m as any).createdAt.desc())
      .skip(skip)
      .take(limit)
      .all();

    const total = Number(await this.prisma.orm.public.Notice.where(where as any).count());
    return { items, total, page, limit };
  }

  async getOne(id: string) {
    const notice = await this.prisma.orm.public.Notice.where({ id } as any).first();
    if (!notice) throw new NotFoundException('Notice not found');
    const [comments, ackCount] = await Promise.all([
      this.prisma.orm.public.NoticeComment.where({ noticeId: id } as any).orderBy(m => (m as any).createdAt.desc()).all(),
      this.prisma.orm.public.NoticeAcknowledgement.where({ noticeId: id } as any).count(),
    ]);
    return { ...notice, comments, acknowledgementCount: Number(ackCount) };
  }

  async create(dto: CreateNoticeDto, createdById: string) {
    const status = dto.publishedAt ? 'PUBLISHED' : 'DRAFT';
    return this.prisma.orm.public.Notice.create({
      id:          uuidv4(),
      title:       dto.title as any,
      content:     dto.content as any,
      category:    dto.category ?? null,
      status:      status as any,
      priority:    (dto.priority ?? 'NORMAL') as any,
      isPinned:    dto.isPinned ?? false,
      requiresAck: dto.requiresAck ?? false,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) as any : null,
      expiresAt:   dto.expiresAt   ? new Date(dto.expiresAt)   as any : null,
      createdById,
      imageUrl:    dto.imageUrl ?? null,
      createdAt:   now() as any,
      updatedAt:   now() as any,
    } as any);
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const notice = await this.prisma.orm.public.Notice.where({ id } as any).first();
    if (!notice) throw new NotFoundException('Notice not found');

    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.title       !== undefined) changes['title']       = dto.title as any;
    if (dto.content     !== undefined) changes['content']     = dto.content as any;
    if (dto.category    !== undefined) changes['category']    = dto.category;
    if (dto.priority    !== undefined) changes['priority']    = dto.priority as any;
    if (dto.isPinned    !== undefined) changes['isPinned']    = dto.isPinned;
    if (dto.requiresAck !== undefined) changes['requiresAck'] = dto.requiresAck;
    if (dto.expiresAt   !== undefined) changes['expiresAt']   = new Date(dto.expiresAt!);
    if (dto.imageUrl    !== undefined) changes['imageUrl']    = dto.imageUrl;

    await this.prisma.orm.public.Notice.where({ id } as any).update(changes as any);
    return this.prisma.orm.public.Notice.where({ id } as any).first();
  }

  async publish(id: string) {
    const notice = await this.prisma.orm.public.Notice.where({ id } as any).first();
    if (!notice) throw new NotFoundException('Notice not found');
    await this.prisma.orm.public.Notice
      .where({ id } as any)
      .update({ status: 'PUBLISHED' as any, publishedAt: now() as any, updatedAt: now() as any } as any);
    return this.prisma.orm.public.Notice.where({ id } as any).first();
  }

  async archive(id: string) {
    const notice = await this.prisma.orm.public.Notice.where({ id } as any).first();
    if (!notice) throw new NotFoundException('Notice not found');
    await this.prisma.orm.public.Notice
      .where({ id } as any)
      .update({ status: 'ARCHIVED' as any, updatedAt: now() as any } as any);
    return this.prisma.orm.public.Notice.where({ id } as any).first();
  }

  async acknowledge(noticeId: string, employeeId: string) {
    const notice = await this.prisma.orm.public.Notice.where({ id: noticeId } as any).first();
    if (!notice) throw new NotFoundException('Notice not found');

    const existing = await this.prisma.orm.public.NoticeAcknowledgement
      .where({ noticeId, employeeId } as any)
      .first();
    if (existing) return existing;

    return this.prisma.orm.public.NoticeAcknowledgement.create({
      id:             uuidv4(),
      noticeId,
      employeeId,
      acknowledgedAt: now() as any,
    } as any);
  }

  async addComment(noticeId: string, authorId: string, dto: AddCommentDto) {
    const notice = await this.prisma.orm.public.Notice.where({ id: noticeId } as any).first();
    if (!notice) throw new NotFoundException('Notice not found');
    return this.prisma.orm.public.NoticeComment.create({
      id:        uuidv4(),
      noticeId,
      authorId,
      content:   dto.content as any,
      createdAt: now() as any,
      updatedAt: now() as any,
    } as any);
  }

  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const comment = await this.prisma.orm.public.NoticeComment.where({ id: commentId } as any).first();
    if (!comment) throw new NotFoundException('Comment not found');
    if (!isAdmin && (comment as any).authorId !== userId) {
      throw new ForbiddenException('Cannot delete another user\'s comment');
    }
    await this.prisma.orm.public.NoticeComment.where({ id: commentId } as any).delete();
    return { success: true };
  }
}
