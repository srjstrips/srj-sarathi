import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { now } from '../../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import { CreatePollDto, VotePollDto } from '../dto/chat.dto.js';
import { ChatConversationService } from './conversation.service.js';

@Injectable()
export class ChatPollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly convService: ChatConversationService,
  ) {}

  async create(conversationId: string, dto: CreatePollDto, actorId: string) {
    await this.convService.assertMember(conversationId, actorId);
    if (!dto.options || dto.options.length < 2) {
      throw new BadRequestException('Poll must have at least 2 options');
    }

    // Create system message for poll
    const msg = await this.prisma.orm.public.ChatMessage.create({
      id:              uuidv4(),
      conversationId,
      senderId:        actorId,
      type:            'POLL' as any,
      text:            dto.question,
      isEdited:        false,
      isDeletedForAll: false,
      createdAt:       now() as any,
      updatedAt:       now() as any,
    } as any);

    const poll = await this.prisma.orm.public.ChatPoll.create({
      id:           uuidv4(),
      messageId:    (msg as any).id,
      question:     dto.question,
      isMultiChoice: dto.isMultiChoice ?? false,
      isAnonymous:  dto.isAnonymous   ?? false,
      isClosed:     false,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);

    const options: any[] = [];
    for (const text of dto.options) {
      const opt = await this.prisma.orm.public.ChatPollOption.create({
        id:       uuidv4(),
        pollId:   (poll as any).id,
        text:     text as any,
        position: dto.options.indexOf(text),
      } as any);
      options.push(opt);
    }

    await this.prisma.orm.public.ChatConversation.where({ id: conversationId }).update({
      lastMessageAt: now() as any, lastMessageId: (msg as any).id, updatedAt: now() as any,
    } as any);

    return { poll, options, message: msg };
  }

  async get(pollId: string, actorId: string) {
    const poll = await this.prisma.orm.public.ChatPoll.where({ id: pollId }).first() as any;
    if (!poll) throw new NotFoundException('Poll not found');

    const msg = await this.prisma.orm.public.ChatMessage.where({ id: poll.messageId }).first() as any;
    await this.convService.assertMember(msg.conversationId, actorId);

    const options = await this.prisma.orm.public.ChatPollOption.where({ pollId }).all() as any[];
    const allVotes = await this.prisma.orm.public.ChatPollVote.where({ pollId }).all() as any[];

    return {
      poll,
      options: options.map(opt => ({
        ...opt,
        voteCount: allVotes.filter((v: any) => v.optionId === opt.id).length,
        // If anonymous: never expose who voted; if not anonymous: expose
        voters: poll.isAnonymous
          ? undefined
          : allVotes.filter((v: any) => v.optionId === opt.id).map((v: any) => v.userId),
      })),
      myVotes: allVotes.filter((v: any) => v.userId === actorId).map((v: any) => v.optionId),
    };
  }

  async vote(pollId: string, dto: VotePollDto, actorId: string) {
    const poll = await this.prisma.orm.public.ChatPoll.where({ id: pollId }).first() as any;
    if (!poll) throw new NotFoundException('Poll not found');
    if (poll.isClosed) throw new BadRequestException('Poll is closed');

    const msg = await this.prisma.orm.public.ChatMessage.where({ id: poll.messageId }).first() as any;
    await this.convService.assertMember(msg.conversationId, actorId);

    if (!poll.isMultiChoice && dto.optionIds.length > 1) {
      throw new BadRequestException('This poll only allows one choice');
    }

    // Validate option IDs belong to this poll
    const validOptions = await this.prisma.orm.public.ChatPollOption.where({ pollId }).all() as any[];
    const validIds = new Set(validOptions.map((o: any) => o.id));
    for (const id of dto.optionIds) {
      if (!validIds.has(id)) throw new BadRequestException(`Invalid option: ${id}`);
    }

    // Remove existing votes by this user
    const existing = await this.prisma.orm.public.ChatPollVote
      .where({ pollId, userId: actorId }).all() as any[];
    for (const v of existing) {
      await this.prisma.orm.public.ChatPollVote.where({ id: (v as any).id }).delete();
    }

    // Create new votes
    for (const optionId of dto.optionIds) {
      await this.prisma.orm.public.ChatPollVote.create({
        id:       uuidv4(),
        pollId,
        optionId,
        userId:   actorId,
        votedAt:  now() as any,
      } as any);
    }

    return this.get(pollId, actorId);
  }

  async close(pollId: string, actorId: string) {
    const poll = await this.prisma.orm.public.ChatPoll.where({ id: pollId }).first() as any;
    if (!poll) throw new NotFoundException('Poll not found');

    const msg = await this.prisma.orm.public.ChatMessage.where({ id: poll.messageId }).first() as any;
    // Only sender or group admin can close
    if (msg.senderId !== actorId) {
      await this.convService.assertRole(msg.conversationId, actorId, ['OWNER', 'ADMIN']);
    }

    await this.prisma.orm.public.ChatPoll.where({ id: pollId }).update({
      isClosed: true, updatedAt: now() as any,
    } as any);
    return { closed: true };
  }
}
