import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { now } from '../../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateDirectDto, CreateGroupDto, UpdateConversationDto,
  UpdateGroupSettingsDto, AddMemberDto, UpdateMemberRoleDto,
  ConversationFilterDto, MarkReadDto, MuteConversationDto,
} from '../dto/chat.dto.js';

@Injectable()
export class ChatConversationService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── My conversations ─────────────────────────────────────────────────────

  async listMine(actorId: string, filter: ConversationFilterDto) {
    // Get conversation IDs the actor is a member of
    const memberships = await this.prisma.orm.public.ChatConversationMember
      .where({ userId: actorId, leftAt: null })
      .all() as any[];

    const conversationIds = memberships.map((m: any) => m.conversationId);
    if (!conversationIds.length) return [];

    // Build enriched list: conversation + member state
    const result: any[] = [];
    for (const conversationId of conversationIds) {
      const conv = await this.prisma.orm.public.ChatConversation
        .where({ id: conversationId, isArchived: filter.isArchived ?? false })
        .first() as any;
      if (!conv) continue;
      if (filter.type && conv.type !== filter.type) continue;

      const membership = memberships.find((m: any) => m.conversationId === conversationId);
      const unreadCount = await this.countUnread(conversationId, actorId, membership?.lastReadMessageId);

      result.push({ ...conv, membership, unreadCount });
    }

    // Sort by lastMessageAt desc
    result.sort((a, b) => {
      const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bt - at;
    });

    return result.slice(0, filter.limit ?? 50);
  }

  async get(id: string, actorId: string) {
    const conv = await this.prisma.orm.public.ChatConversation.where({ id }).first() as any;
    if (!conv) throw new NotFoundException('Conversation not found');
    await this.assertMember(id, actorId);

    const members = await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId: id, leftAt: null }).all();
    const groupSettings = await this.prisma.orm.public.ChatGroupSettings
      .where({ conversationId: id }).first();

    return { ...conv, members, groupSettings };
  }

  // ─── Direct chat ──────────────────────────────────────────────────────────

  async createDirect(dto: CreateDirectDto, actorId: string) {
    if (dto.userId === actorId) throw new BadRequestException('Cannot create a chat with yourself');

    // Check if direct already exists
    const myMemberships = await this.prisma.orm.public.ChatConversationMember
      .where({ userId: actorId, leftAt: null }).all() as any[];

    for (const m of myMemberships) {
      const conv = await this.prisma.orm.public.ChatConversation
        .where({ id: m.conversationId, type: 'DIRECT' as any }).first() as any;
      if (!conv) continue;
      const other = await this.prisma.orm.public.ChatConversationMember
        .where({ conversationId: conv.id, userId: dto.userId }).first();
      if (other) return this.get(conv.id, actorId);
    }

    // Create new direct conversation
    const conv = await this.prisma.orm.public.ChatConversation.create({
      id:          uuidv4(),
      type:        'DIRECT' as any,
      createdById: actorId,
      createdAt:   now() as any,
      updatedAt:   now() as any,
    } as any);

    const convId = (conv as any).id;
    await this.addMemberRecord(convId, actorId, 'MEMBER');
    await this.addMemberRecord(convId, dto.userId, 'MEMBER');

    return this.get(convId, actorId);
  }

  // ─── Group / typed conversation ───────────────────────────────────────────

  async createGroup(dto: CreateGroupDto, actorId: string) {
    const conv = await this.prisma.orm.public.ChatConversation.create({
      id:           uuidv4(),
      type:         'GROUP' as any,
      name:         dto.name as any,
      description:  dto.description ?? null,
      companyId:    dto.companyId    ?? null,
      departmentId: dto.departmentId ?? null,
      createdById:  actorId,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);

    const convId = (conv as any).id;

    // Creator is owner
    await this.addMemberRecord(convId, actorId, 'OWNER');

    // Add requested members
    for (const userId of (dto.memberIds ?? [])) {
      if (userId !== actorId) await this.addMemberRecord(convId, userId, 'MEMBER');
    }

    // Default group settings
    await this.prisma.orm.public.ChatGroupSettings.create({
      id:             uuidv4(),
      conversationId: convId,
      createdAt:      now() as any,
      updatedAt:      now() as any,
    } as any);

    return this.get(convId, actorId);
  }

  async createContextConversation(
    type: string, name: string, memberIds: string[],
    actorId: string, refs: { projectId?: string; taskId?: string; departmentId?: string; sectionId?: string }
  ) {
    const conv = await this.prisma.orm.public.ChatConversation.create({
      id:           uuidv4(),
      type:         type as any,
      name:         name as any,
      projectId:    refs.projectId    ?? null,
      taskId:       refs.taskId       ?? null,
      departmentId: refs.departmentId ?? null,
      sectionId:    refs.sectionId    ?? null,
      createdById:  actorId,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);

    const convId = (conv as any).id;
    for (const userId of memberIds) {
      const role = userId === actorId ? 'OWNER' : 'MEMBER';
      await this.addMemberRecord(convId, userId, role);
    }

    return convId;
  }

  async update(id: string, dto: UpdateConversationDto, actorId: string) {
    await this.assertRole(id, actorId, ['OWNER', 'ADMIN']);
    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.name !== undefined)       changes['name']       = dto.name as any;
    if (dto.description !== undefined) changes['description'] = dto.description;
    if (dto.isReadOnly !== undefined)  changes['isReadOnly']  = dto.isReadOnly;
    await this.prisma.orm.public.ChatConversation.where({ id }).update(changes as any);
    return this.get(id, actorId);
  }

  async updateGroupSettings(id: string, dto: UpdateGroupSettingsDto, actorId: string) {
    await this.assertRole(id, actorId, ['OWNER', 'ADMIN']);
    const settings = await this.prisma.orm.public.ChatGroupSettings.where({ conversationId: id }).first();
    if (!settings) throw new NotFoundException('Group settings not found');

    const changes: Record<string, unknown> = { updatedAt: now() as any };
    for (const [k, v] of Object.entries(dto)) {
      if (v !== undefined) changes[k] = v;
    }
    await this.prisma.orm.public.ChatGroupSettings
      .where({ conversationId: id }).update(changes as any);
    return this.prisma.orm.public.ChatGroupSettings.where({ conversationId: id }).first();
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  async listMembers(conversationId: string, actorId: string) {
    await this.assertMember(conversationId, actorId);
    return this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, leftAt: null }).all();
  }

  async addMember(conversationId: string, dto: AddMemberDto, actorId: string) {
    await this.assertRole(conversationId, actorId, ['OWNER', 'ADMIN', 'MODERATOR']);

    const existing = await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: dto.userId }).first() as any;

    if (existing && !existing.leftAt) throw new ConflictException('User is already a member');

    if (existing?.leftAt) {
      await this.prisma.orm.public.ChatConversationMember
        .where({ id: existing.id })
        .update({ leftAt: null, joinedAt: now() as any, role: (dto.role ?? 'MEMBER') as any } as any);
    } else {
      await this.addMemberRecord(conversationId, dto.userId, dto.role ?? 'MEMBER');
    }

    return { added: true };
  }

  async updateMemberRole(conversationId: string, memberId: string, dto: UpdateMemberRoleDto, actorId: string) {
    await this.assertRole(conversationId, actorId, ['OWNER', 'ADMIN']);
    const member = await this.prisma.orm.public.ChatConversationMember
      .where({ id: memberId, conversationId }).first();
    if (!member) throw new NotFoundException('Member not found');
    await this.prisma.orm.public.ChatConversationMember
      .where({ id: memberId }).update({ role: dto.role as any } as any);
    return { updated: true };
  }

  async removeMember(conversationId: string, userId: string, actorId: string) {
    await this.assertRole(conversationId, actorId, ['OWNER', 'ADMIN', 'MODERATOR']);
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId })
      .update({ leftAt: now() as any } as any);
    return { removed: true };
  }

  async leave(conversationId: string, actorId: string) {
    const conv = await this.prisma.orm.public.ChatConversation.where({ id: conversationId }).first() as any;
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.type === 'DIRECT') throw new BadRequestException('Cannot leave a direct conversation');
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: actorId })
      .update({ leftAt: now() as any } as any);
    return { left: true };
  }

  async transferOwnership(conversationId: string, newOwnerId: string, actorId: string) {
    await this.assertRole(conversationId, actorId, ['OWNER']);
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: actorId })
      .update({ role: 'ADMIN' as any } as any);
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: newOwnerId })
      .update({ role: 'OWNER' as any } as any);
    return { transferred: true };
  }

  // ─── Pinned messages ──────────────────────────────────────────────────────

  async getPinned(conversationId: string, actorId: string) {
    await this.assertMember(conversationId, actorId);
    return this.prisma.orm.public.ChatPinnedMessage.where({ conversationId }).all();
  }

  // ─── Mute / Archive ───────────────────────────────────────────────────────

  async mute(conversationId: string, actorId: string, dto: MuteConversationDto) {
    await this.assertMember(conversationId, actorId);
    const mutedUntil = dto.durationMinutes
      ? new Date(Date.now() + dto.durationMinutes * 60 * 1000) as any
      : new Date('2099-12-31') as any;
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: actorId })
      .update({ mutedUntil, notifyMode: 'MUTED' as any } as any);
    return { muted: true };
  }

  async unmute(conversationId: string, actorId: string) {
    await this.assertMember(conversationId, actorId);
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: actorId })
      .update({ mutedUntil: null, notifyMode: 'ALL' as any } as any);
    return { unmuted: true };
  }

  async archive(conversationId: string, actorId: string) {
    await this.assertMember(conversationId, actorId);
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: actorId })
      .update({ isArchived: true, archivedAt: now() as any } as any);
    return { archived: true };
  }

  async unarchive(conversationId: string, actorId: string) {
    await this.assertMember(conversationId, actorId);
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: actorId })
      .update({ isArchived: false, archivedAt: null } as any);
    return { unarchived: true };
  }

  // ─── Read / Unread ────────────────────────────────────────────────────────

  async markRead(conversationId: string, dto: MarkReadDto, actorId: string) {
    await this.assertMember(conversationId, actorId);
    await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId: actorId })
      .update({ lastReadMessageId: dto.lastReadMessageId, lastReadAt: now() as any } as any);
    return { read: true };
  }

  async getUnreadCounts(actorId: string) {
    const memberships = await this.prisma.orm.public.ChatConversationMember
      .where({ userId: actorId, leftAt: null }).all() as any[];

    const counts: { conversationId: string; unread: number }[] = [];
    let globalUnread = 0;

    for (const m of memberships) {
      const unread = await this.countUnread(m.conversationId, actorId, m.lastReadMessageId);
      counts.push({ conversationId: m.conversationId, unread });
      globalUnread += unread;
    }

    return { global: globalUnread, conversations: counts };
  }

  // ─── Media / Files / Links ────────────────────────────────────────────────

  async getMedia(conversationId: string, actorId: string) {
    await this.assertMember(conversationId, actorId);
    const imageTypes = ['IMAGE', 'VIDEO', 'GIF'];
    const messages = await this.prisma.orm.public.ChatMessage
      .where({ conversationId, isDeletedForAll: false })
      .orderBy(m => (m as any).createdAt.desc())
      .all() as any[];
    const mediaMessages = messages.filter((m: any) => imageTypes.includes(m.type));
    const ids = mediaMessages.map((m: any) => m.id);
    const attachments: any[] = [];
    for (const id of ids) {
      const atts = await this.prisma.orm.public.ChatMessageAttachment.where({ messageId: id }).all();
      attachments.push(...atts);
    }
    return attachments;
  }

  async getFiles(conversationId: string, actorId: string) {
    await this.assertMember(conversationId, actorId);
    const fileMessages = await this.prisma.orm.public.ChatMessage
      .where({ conversationId, type: 'DOCUMENT' as any, isDeletedForAll: false })
      .orderBy(m => (m as any).createdAt.desc())
      .all() as any[];
    const result: any[] = [];
    for (const m of fileMessages) {
      const atts = await this.prisma.orm.public.ChatMessageAttachment.where({ messageId: m.id }).all();
      result.push(...atts);
    }
    return result;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async assertMember(conversationId: string, userId: string) {
    const m = await this.prisma.orm.public.ChatConversationMember
      .where({ conversationId, userId, leftAt: null }).first();
    if (!m) throw new ForbiddenException('You are not a member of this conversation');
    return m;
  }

  async assertRole(conversationId: string, userId: string, roles: string[]) {
    const m = await this.assertMember(conversationId, userId) as any;
    if (!roles.includes(m.role)) {
      throw new ForbiddenException(`Requires one of roles: ${roles.join(', ')}`);
    }
    return m;
  }

  private async addMemberRecord(conversationId: string, userId: string, role: string) {
    await this.prisma.orm.public.ChatConversationMember.create({
      id:             uuidv4(),
      conversationId,
      userId,
      role:           role as any,
      joinedAt:       now() as any,
      notifyMode:     'ALL' as any,
    } as any);
  }

  private async countUnread(conversationId: string, userId: string, lastReadMessageId: string | null | undefined): Promise<number> {
    const all = await this.prisma.orm.public.ChatMessage
      .where({ conversationId, isDeletedForAll: false })
      .orderBy(m => (m as any).createdAt.asc())
      .all() as any[];

    if (!lastReadMessageId) return all.length;

    const readIdx = all.findIndex((m: any) => m.id === lastReadMessageId);
    if (readIdx === -1) return all.length;
    return all.length - readIdx - 1;
  }
}
