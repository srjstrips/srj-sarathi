import {
  Controller, Get, Post, Patch, Delete, Put,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AccessTokenGuard }    from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard }    from '../authorization/guards/permissions.guard.js';
import { CurrentUser }         from '../common/decorators/current-user.decorator.js';
import { ChatConversationService } from './services/conversation.service.js';
import { ChatMessageService }      from './services/message.service.js';
import { ChatPresenceService }     from './services/presence.service.js';
import { ChatPollService }         from './services/poll.service.js';
import { ChatModerationService }   from './services/moderation.service.js';
import {
  CreateDirectDto, CreateGroupDto, UpdateConversationDto, UpdateGroupSettingsDto,
  AddMemberDto, UpdateMemberRoleDto, ConversationFilterDto,
  SendMessageDto, EditMessageDto, ForwardMessageDto, MarkReadDto, AddReactionDto,
  MessageCursorDto, SearchMessagesDto, SaveDraftDto, MuteConversationDto,
  ReportMessageDto, InitiateCallDto, CreatePollDto, VotePollDto,
} from './dto/chat.dto.js';
import { now } from '../common/utils/temporal.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { v4 as uuidv4 } from 'uuid';

// ─── Conversations ───────────────────────────────────────────────────────────

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('chat/conversations')
export class ChatConversationController {
  constructor(private readonly svc: ChatConversationService) {}

  @Get()
  list(@CurrentUser() actor: any, @Query() filter: ConversationFilterDto) {
    return this.svc.listMine(actor.id, filter);
  }

  @Post('direct')
  createDirect(@CurrentUser() actor: any, @Body() dto: CreateDirectDto) {
    return this.svc.createDirect(dto, actor.id);
  }

  @Post('group')
  createGroup(@CurrentUser() actor: any, @Body() dto: CreateGroupDto) {
    return this.svc.createGroup(dto, actor.id);
  }

  @Get('unread')
  unread(@CurrentUser() actor: any) {
    return this.svc.getUnreadCounts(actor.id);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.get(id, actor.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConversationDto, @CurrentUser() actor: any) {
    return this.svc.update(id, dto, actor.id);
  }

  @Patch(':id/settings')
  settings(@Param('id') id: string, @Body() dto: UpdateGroupSettingsDto, @CurrentUser() actor: any) {
    return this.svc.updateGroupSettings(id, dto, actor.id);
  }

  @Get(':id/members')
  members(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.listMembers(id, actor.id);
  }

  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @CurrentUser() actor: any) {
    return this.svc.addMember(id, dto, actor.id);
  }

  @Patch(':id/members/:userId/role')
  memberRole(
    @Param('id') id: string, @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto, @CurrentUser() actor: any,
  ) {
    return this.svc.updateMemberRole(id, userId, dto, actor.id);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() actor: any) {
    return this.svc.removeMember(id, userId, actor.id);
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  leave(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.leave(id, actor.id);
  }

  @Post(':id/transfer-ownership/:newOwnerId')
  transfer(@Param('id') id: string, @Param('newOwnerId') newOwnerId: string, @CurrentUser() actor: any) {
    return this.svc.transferOwnership(id, newOwnerId, actor.id);
  }

  @Get(':id/pinned')
  pinned(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.getPinned(id, actor.id);
  }

  @Post(':id/mute')
  mute(@Param('id') id: string, @Body() dto: MuteConversationDto, @CurrentUser() actor: any) {
    return this.svc.mute(id, actor.id, dto);
  }

  @Post(':id/unmute')
  unmute(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.unmute(id, actor.id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.archive(id, actor.id);
  }

  @Post(':id/unarchive')
  unarchive(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.unarchive(id, actor.id);
  }

  @Post(':id/mark-read')
  markRead(@Param('id') id: string, @Body() dto: MarkReadDto, @CurrentUser() actor: any) {
    return this.svc.markRead(id, dto, actor.id);
  }

  @Get(':id/media')
  media(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.getMedia(id, actor.id);
  }

  @Get(':id/files')
  files(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.svc.getFiles(id, actor.id);
  }
}

// ─── Messages ─────────────────────────────────────────────────────────────────

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('chat/conversations/:conversationId/messages')
export class ChatMessageController {
  constructor(private readonly svc: ChatMessageService) {}

  @Get()
  history(
    @Param('conversationId') conversationId: string,
    @Query() query: MessageCursorDto,
    @CurrentUser() actor: any,
  ) {
    return this.svc.getHistory(conversationId, query, actor.id);
  }

  @Post()
  send(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() actor: any,
  ) {
    return this.svc.send(conversationId, dto, actor.id);
  }

  @Patch(':messageId')
  edit(@Param('messageId') id: string, @Body() dto: EditMessageDto, @CurrentUser() actor: any) {
    return this.svc.edit(id, dto, actor.id);
  }

  @Delete(':messageId/for-me')
  deleteForMe(@Param('messageId') id: string, @CurrentUser() actor: any) {
    return this.svc.deleteForMe(id, actor.id);
  }

  @Delete(':messageId/for-everyone')
  deleteForEveryone(@Param('messageId') id: string, @CurrentUser() actor: any) {
    return this.svc.deleteForEveryone(id, actor.id);
  }

  @Post(':messageId/reply')
  reply(@Param('messageId') id: string, @Body() dto: SendMessageDto, @CurrentUser() actor: any) {
    return this.svc.reply(id, dto, actor.id);
  }

  @Post(':messageId/forward')
  forward(@Param('messageId') id: string, @Body() dto: ForwardMessageDto, @CurrentUser() actor: any) {
    return this.svc.forward(id, dto, actor.id);
  }

  @Post(':messageId/reactions')
  addReaction(@Param('messageId') id: string, @Body() dto: AddReactionDto, @CurrentUser() actor: any) {
    return this.svc.addReaction(id, dto, actor.id);
  }

  @Delete(':messageId/reactions/:emoji')
  removeReaction(@Param('messageId') id: string, @Param('emoji') emoji: string, @CurrentUser() actor: any) {
    return this.svc.removeReaction(id, emoji, actor.id);
  }

  @Get(':messageId/reactions')
  reactions(@Param('messageId') id: string, @CurrentUser() actor: any) {
    return this.svc.getReactions(id, actor.id);
  }

  @Post(':messageId/star')
  star(@Param('messageId') id: string, @CurrentUser() actor: any) {
    return this.svc.star(id, actor.id);
  }

  @Delete(':messageId/star')
  unstar(@Param('messageId') id: string, @CurrentUser() actor: any) {
    return this.svc.unstar(id, actor.id);
  }

  @Post(':messageId/pin')
  pin(@Param('messageId') id: string, @CurrentUser() actor: any) {
    return this.svc.pin(id, actor.id);
  }

  @Delete(':messageId/pin')
  unpin(@Param('messageId') id: string, @CurrentUser() actor: any) {
    return this.svc.unpin(id, actor.id);
  }

  @Post(':messageId/report')
  report(
    @Param('messageId') id: string,
    @Body() dto: ReportMessageDto,
    @CurrentUser() actor: any,
  ) {
    return this.svc.report(id, dto, actor.id);
  }
}

// ─── Misc: search, starred, drafts ────────────────────────────────────────────

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('chat')
export class ChatMiscController {
  constructor(
    private readonly msgSvc:      ChatMessageService,
    private readonly convSvc:     ChatConversationService,
    private readonly prisma:      PrismaService,
    private readonly moderateSvc: ChatModerationService,
  ) {}

  @Get('search')
  search(@Query() query: SearchMessagesDto, @CurrentUser() actor: any) {
    return this.msgSvc.search(query, actor.id);
  }

  @Get('starred')
  starred(@CurrentUser() actor: any) {
    return this.msgSvc.getStarred(actor.id);
  }

  // ─── Drafts ──────────────────────────────────────────────────────────────

  @Post('drafts')
  async saveDraft(@Body() dto: SaveDraftDto, @CurrentUser() actor: any) {
    await this.convSvc.assertMember(dto.conversationId, actor.id);
    const existing = await this.prisma.orm.public.ChatDraft
      .where({ conversationId: dto.conversationId, userId: actor.id }).first();
    if (existing) {
      await this.prisma.orm.public.ChatDraft
        .where({ id: (existing as any).id })
        .update({ text: dto.text ?? null, replyToId: dto.replyToId ?? null, updatedAt: now() as any } as any);
      return this.prisma.orm.public.ChatDraft.where({ id: (existing as any).id }).first();
    }
    return this.prisma.orm.public.ChatDraft.create({
      id:             uuidv4(),
      conversationId: dto.conversationId,
      userId:         actor.id,
      text:           dto.text ?? null,
      replyToId:      dto.replyToId ?? null,
      updatedAt:      now() as any,
    } as any);
  }

  @Delete('drafts/:conversationId')
  async deleteDraft(@Param('conversationId') conversationId: string, @CurrentUser() actor: any) {
    await this.prisma.orm.public.ChatDraft
      .where({ conversationId, userId: actor.id }).delete();
    return { deleted: true };
  }

  // ─── Moderation ──────────────────────────────────────────────────────────

  @Get('moderation/reports')
  listReports(@CurrentUser() actor: any, @Query('status') status?: string) {
    return this.moderateSvc.listReports(actor.id, status);
  }

  @Get('moderation/reports/:id')
  getReport(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.moderateSvc.getReport(id, actor.id);
  }

  @Post('moderation/reports/:id/resolve')
  resolveReport(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
    @CurrentUser() actor: any,
  ) {
    return this.moderateSvc.resolveReport(id, actor.id, resolution);
  }

  @Post('moderation/reports/:id/dismiss')
  dismissReport(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.moderateSvc.dismissReport(id, actor.id);
  }

  @Delete('moderation/messages/:messageId')
  moderatorDelete(
    @Param('messageId') id: string,
    @Body('reason') reason: string,
    @CurrentUser() actor: any,
  ) {
    return this.moderateSvc.moderatorDeleteMessage(id, actor.id, reason);
  }
}

// ─── Polls ────────────────────────────────────────────────────────────────────

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('chat/conversations/:conversationId/polls')
export class ChatPollController {
  constructor(private readonly svc: ChatPollService) {}

  @Post()
  create(
    @Param('conversationId') conversationId: string,
    @Body() dto: CreatePollDto,
    @CurrentUser() actor: any,
  ) {
    return this.svc.create(conversationId, dto, actor.id);
  }

  @Get(':pollId')
  get(@Param('pollId') id: string, @CurrentUser() actor: any) {
    return this.svc.get(id, actor.id);
  }

  @Post(':pollId/vote')
  vote(@Param('pollId') id: string, @Body() dto: VotePollDto, @CurrentUser() actor: any) {
    return this.svc.vote(id, dto, actor.id);
  }

  @Post(':pollId/close')
  close(@Param('pollId') id: string, @CurrentUser() actor: any) {
    return this.svc.close(id, actor.id);
  }
}

// ─── Presence ─────────────────────────────────────────────────────────────────

@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('chat/presence')
export class ChatPresenceController {
  constructor(private readonly svc: ChatPresenceService) {}

  @Get(':userId')
  getOne(@Param('userId') userId: string) {
    return this.svc.isOnline(userId).then(online => ({ userId, online }));
  }

  @Post('bulk')
  bulk(@Body('userIds') userIds: string[]) {
    return this.svc.getBulkPresence(userIds);
  }
}
