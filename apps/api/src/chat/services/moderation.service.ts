import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { now } from '../../common/utils/temporal.js';
import { AuthorizationService } from '../../authorization/authorization.service.js';
import { ChatConversationService } from './conversation.service.js';

@Injectable()
export class ChatModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthorizationService,
    private readonly convService: ChatConversationService,
  ) {}

  // ─── Reports ──────────────────────────────────────────────────────────────

  async listReports(actorId: string, status?: string) {
    const hasAccess = await this.authz.can(actorId, 'chat:moderation:view');
    if (!hasAccess) throw new ForbiddenException('Insufficient permissions');
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.orm.public.ChatReport.where(where)
      .orderBy(m => (m as any).createdAt.desc()).all();
  }

  async getReport(reportId: string, actorId: string) {
    const hasAccess = await this.authz.can(actorId, 'chat:moderation:view');
    if (!hasAccess) throw new ForbiddenException('Insufficient permissions');
    const report = await this.prisma.orm.public.ChatReport.where({ id: reportId }).first();
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async resolveReport(reportId: string, actorId: string, resolution: string) {
    const hasAccess = await this.authz.can(actorId, 'chat:moderation:manage');
    if (!hasAccess) throw new ForbiddenException('Insufficient permissions');
    const report = await this.prisma.orm.public.ChatReport.where({ id: reportId }).first();
    if (!report) throw new NotFoundException('Report not found');
    await this.prisma.orm.public.ChatReport.where({ id: reportId }).update({
      status:       'RESOLVED' as any,
      resolvedById: actorId,
      resolution:   resolution as any,
      resolvedAt:   now() as any,
      updatedAt:    now() as any,
    } as any);
    return { resolved: true };
  }

  async dismissReport(reportId: string, actorId: string) {
    const hasAccess = await this.authz.can(actorId, 'chat:moderation:manage');
    if (!hasAccess) throw new ForbiddenException('Insufficient permissions');
    await this.prisma.orm.public.ChatReport.where({ id: reportId }).update({
      status:       'DISMISSED' as any,
      resolvedById: actorId,
      updatedAt:    now() as any,
    } as any);
    return { dismissed: true };
  }

  // ─── Delete message as moderator ─────────────────────────────────────────

  async moderatorDeleteMessage(messageId: string, actorId: string, reason: string) {
    const hasAccess = await this.authz.can(actorId, 'chat:moderation:manage');
    if (!hasAccess) throw new ForbiddenException('Insufficient permissions');

    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');

    await this.prisma.orm.public.ChatMessage.where({ id: messageId }).update({
      isDeletedForAll: true,
      text:            null,
      metadata:        { moderationReason: reason } as any,
      deletedAt:       now() as any,
      updatedAt:       now() as any,
    } as any);

    return { deleted: true };
  }
}
