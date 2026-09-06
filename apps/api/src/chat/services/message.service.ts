import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { now } from '../../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  SendMessageDto, EditMessageDto, ForwardMessageDto,
  AddReactionDto, MessageCursorDto, SearchMessagesDto,
} from '../dto/chat.dto.js';
import { ChatConversationService } from './conversation.service.js';

@Injectable()
export class ChatMessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly convService: ChatConversationService,
  ) {}

  // ─── Send ─────────────────────────────────────────────────────────────────

  async send(conversationId: string, dto: SendMessageDto, actorId: string) {
    await this.convService.assertMember(conversationId, actorId);

    const conv = await this.prisma.orm.public.ChatConversation
      .where({ id: conversationId }).first() as any;
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.isReadOnly) throw new BadRequestException('Conversation is read-only');

    // Idempotency: check clientMessageId
    if (dto.clientMessageId) {
      const existing = await this.prisma.orm.public.ChatMessage
        .where({ conversationId, clientMessageId: dto.clientMessageId as any })
        .first();
      if (existing) return existing;
    }

    if (dto.replyToId) {
      const parent = await this.prisma.orm.public.ChatMessage
        .where({ id: dto.replyToId, conversationId }).first();
      if (!parent) throw new BadRequestException('Reply target not found in this conversation');
    }

    const msg = await this.prisma.orm.public.ChatMessage.create({
      id:              uuidv4(),
      conversationId,
      senderId:        actorId,
      clientMessageId: dto.clientMessageId as any ?? null,
      type:            (dto.type ?? 'TEXT') as any,
      text:            dto.text ?? null,
      replyToId:       dto.replyToId ?? null,
      classification:  (dto.classification ?? 'NORMAL') as any,
      metadata:        dto.metadata ?? null,
      isEdited:        false,
      isDeletedForAll: false,
      createdAt:       now() as any,
      updatedAt:       now() as any,
    } as any);

    // Update conversation lastMessageAt
    await this.prisma.orm.public.ChatConversation.where({ id: conversationId }).update({
      lastMessageAt: now() as any,
      lastMessageId: (msg as any).id,
      updatedAt:     now() as any,
    } as any);

    // Extract and store mentions (@userId pattern in metadata.mentions)
    if (dto.metadata?.mentions?.length) {
      for (const mentionedId of dto.metadata.mentions) {
        await this.prisma.orm.public.ChatMessageMention.create({
          id:          uuidv4(),
          messageId:   (msg as any).id,
          mentionedId,
        } as any);
      }
    }

    return msg;
  }

  // ─── History (cursor pagination) ─────────────────────────────────────────

  async getHistory(conversationId: string, query: MessageCursorDto, actorId: string) {
    await this.convService.assertMember(conversationId, actorId);

    const limit = Math.min(query.limit ?? 50, 100);

    let messages: any[];

    if (query.cursor) {
      // Decode cursor → messageId/createdAt
      const cursorMsg = await this.prisma.orm.public.ChatMessage
        .where({ id: query.cursor }).first() as any;
      if (!cursorMsg) throw new BadRequestException('Invalid cursor');

      messages = await this.prisma.orm.public.ChatMessage
        .where({ conversationId, isDeletedForAll: false })
        .orderBy(m => (m as any).createdAt.desc())
        .all() as any[];

      // Filter to messages older than cursor
      const cursorIdx = messages.findIndex((m: any) => m.id === query.cursor);
      messages = cursorIdx >= 0 ? messages.slice(cursorIdx + 1) : messages;
      messages = messages.slice(0, limit);
    } else {
      messages = await this.prisma.orm.public.ChatMessage
        .where({ conversationId, isDeletedForAll: false })
        .orderBy(m => (m as any).createdAt.desc())
        .all() as any[];
      messages = messages.slice(0, limit);
    }

    const hasMore = messages.length === limit;
    const nextCursor = hasMore ? messages[messages.length - 1]?.id : null;

    // Reverse so oldest first in the page
    messages.reverse();

    return { items: messages, nextCursor, hasMore };
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────

  async edit(messageId: string, dto: EditMessageDto, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.senderId !== actorId) throw new ForbiddenException('Cannot edit another user\'s message');
    if (msg.isDeletedForAll) throw new BadRequestException('Cannot edit a deleted message');
    if (msg.type !== 'TEXT') throw new BadRequestException('Only text messages can be edited');

    await this.prisma.orm.public.ChatMessage.where({ id: messageId }).update({
      text:      dto.text,
      isEdited:  true,
      editedAt:  now() as any,
      updatedAt: now() as any,
    } as any);

    return this.prisma.orm.public.ChatMessage.where({ id: messageId }).first();
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async deleteForMe(messageId: string, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    await this.convService.assertMember(msg.conversationId, actorId);
    // Soft-delete: mark read state with deletedAt (client hides it locally)
    // We record in metadata that this user deleted for themselves
    const meta = msg.metadata ?? {};
    meta.deletedForMe = [...(meta.deletedForMe ?? []), actorId];
    await this.prisma.orm.public.ChatMessage.where({ id: messageId }).update({
      metadata: meta, updatedAt: now() as any,
    } as any);
    return { deleted: true };
  }

  async deleteForEveryone(messageId: string, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.senderId !== actorId) {
      // Allow group admins/moderators to delete
      await this.convService.assertRole(msg.conversationId, actorId, ['OWNER', 'ADMIN', 'MODERATOR']);
    }
    await this.prisma.orm.public.ChatMessage.where({ id: messageId }).update({
      isDeletedForAll: true,
      text:            null,
      metadata:        null,
      deletedAt:       now() as any,
      updatedAt:       now() as any,
    } as any);
    return { deleted: true };
  }

  // ─── Reply ────────────────────────────────────────────────────────────────

  async reply(messageId: string, dto: SendMessageDto, actorId: string) {
    const parent = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!parent) throw new NotFoundException('Message not found');
    return this.send(parent.conversationId, { ...dto, replyToId: messageId }, actorId);
  }

  // ─── Forward ──────────────────────────────────────────────────────────────

  async forward(messageId: string, dto: ForwardMessageDto, actorId: string) {
    const source = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!source) throw new NotFoundException('Message not found');
    if (source.isDeletedForAll) throw new BadRequestException('Cannot forward a deleted message');

    await this.convService.assertMember(source.conversationId, actorId);

    const results: any[] = [];
    for (const conversationId of dto.conversationIds) {
      await this.convService.assertMember(conversationId, actorId);
      const forwarded = await this.prisma.orm.public.ChatMessage.create({
        id:              uuidv4(),
        conversationId,
        senderId:        actorId,
        type:            source.type,
        text:            source.text,
        forwardedFromId: messageId,
        classification:  source.classification,
        metadata:        source.metadata,
        isEdited:        false,
        isDeletedForAll: false,
        createdAt:       now() as any,
        updatedAt:       now() as any,
      } as any);

      await this.prisma.orm.public.ChatConversation.where({ id: conversationId }).update({
        lastMessageAt: now() as any, lastMessageId: (forwarded as any).id, updatedAt: now() as any,
      } as any);

      results.push(forwarded);
    }
    return results;
  }

  // ─── Reactions ────────────────────────────────────────────────────────────

  async addReaction(messageId: string, dto: AddReactionDto, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    await this.convService.assertMember(msg.conversationId, actorId);

    const existing = await this.prisma.orm.public.ChatMessageReaction
      .where({ messageId, userId: actorId, emoji: dto.emoji as any }).first();
    if (existing) return existing;

    return this.prisma.orm.public.ChatMessageReaction.create({
      id:        uuidv4(),
      messageId,
      userId:    actorId,
      emoji:     dto.emoji as any,
      createdAt: now() as any,
    } as any);
  }

  async removeReaction(messageId: string, emoji: string, actorId: string) {
    await this.prisma.orm.public.ChatMessageReaction
      .where({ messageId, userId: actorId, emoji: emoji as any }).delete();
    return { removed: true };
  }

  async getReactions(messageId: string, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    await this.convService.assertMember(msg.conversationId, actorId);
    return this.prisma.orm.public.ChatMessageReaction.where({ messageId }).all();
  }

  // ─── Star / Unstar ────────────────────────────────────────────────────────

  async star(messageId: string, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    await this.convService.assertMember(msg.conversationId, actorId);
    const exists = await this.prisma.orm.public.ChatMessageStar
      .where({ messageId, userId: actorId }).first();
    if (exists) return exists;
    return this.prisma.orm.public.ChatMessageStar.create({
      id: uuidv4(), messageId, userId: actorId, starredAt: now() as any,
    } as any);
  }

  async unstar(messageId: string, actorId: string) {
    await this.prisma.orm.public.ChatMessageStar.where({ messageId, userId: actorId }).delete();
    return { unstarred: true };
  }

  async getStarred(actorId: string) {
    return this.prisma.orm.public.ChatMessageStar
      .where({ userId: actorId })
      .orderBy(m => (m as any).starredAt.desc())
      .all();
  }

  // ─── Pin / Unpin ──────────────────────────────────────────────────────────

  async pin(messageId: string, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    await this.convService.assertRole(msg.conversationId, actorId, ['OWNER', 'ADMIN', 'MODERATOR']);

    const exists = await this.prisma.orm.public.ChatPinnedMessage
      .where({ conversationId: msg.conversationId, messageId }).first();
    if (exists) return exists;

    return this.prisma.orm.public.ChatPinnedMessage.create({
      id:             uuidv4(),
      conversationId: msg.conversationId,
      messageId,
      pinnedById:     actorId,
      pinnedAt:       now() as any,
    } as any);
  }

  async unpin(messageId: string, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    await this.convService.assertRole(msg.conversationId, actorId, ['OWNER', 'ADMIN', 'MODERATOR']);
    await this.prisma.orm.public.ChatPinnedMessage
      .where({ conversationId: msg.conversationId, messageId }).delete();
    return { unpinned: true };
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  async attachFile(conversationId: string, file: any, actorId: string, messageId?: string) {
    await this.convService.assertMember(conversationId, actorId);

    let msgId = messageId;
    if (!msgId) {
      const msg = await this.send(conversationId, { type: 'DOCUMENT' }, actorId) as any;
      msgId = msg.id;
    }

    return this.prisma.orm.public.ChatMessageAttachment.create({
      id:          uuidv4(),
      messageId:   msgId!,
      storageKey:  file.storageKey ?? file.path,
      filename:    file.originalname as any,
      mimeType:    file.mimetype    ?? null,
      size:        file.size        ?? null,
      uploadedById: actorId,
      createdAt:   now() as any,
    } as any);
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  async search(query: SearchMessagesDto, actorId: string) {
    // Get conversations the actor is a member of
    const memberships = await this.prisma.orm.public.ChatConversationMember
      .where({ userId: actorId, leftAt: null }).all() as any[];
    const allowedIds = new Set(memberships.map((m: any) => m.conversationId));

    let messages = await this.prisma.orm.public.ChatMessage
      .where({ isDeletedForAll: false })
      .orderBy(m => (m as any).createdAt.desc())
      .all() as any[];

    // Authorization filter — never return messages from inaccessible conversations
    messages = messages.filter((m: any) => allowedIds.has(m.conversationId));

    if (query.conversationId) {
      if (!allowedIds.has(query.conversationId)) throw new ForbiddenException('Access denied');
      messages = messages.filter((m: any) => m.conversationId === query.conversationId);
    }
    if (query.senderId)  messages = messages.filter((m: any) => m.senderId === query.senderId);
    if (query.type)      messages = messages.filter((m: any) => m.type === query.type);
    if (query.q) {
      const q = query.q.toLowerCase();
      messages = messages.filter((m: any) => m.text?.toLowerCase().includes(q));
    }

    const limit  = query.limit  ?? 20;
    return { items: messages.slice(0, limit), total: messages.length };
  }

  // ─── Report ───────────────────────────────────────────────────────────────

  async report(messageId: string, dto: any, actorId: string) {
    const msg = await this.prisma.orm.public.ChatMessage.where({ id: messageId }).first() as any;
    if (!msg) throw new NotFoundException('Message not found');
    await this.convService.assertMember(msg.conversationId, actorId);

    return this.prisma.orm.public.ChatReport.create({
      id:             uuidv4(),
      messageId,
      conversationId: msg.conversationId,
      reportedById:   actorId,
      category:       dto.category as any,
      description:    dto.description ?? null,
      status:         'OPEN' as any,
      createdAt:      now() as any,
      updatedAt:      now() as any,
    } as any);
  }
}
