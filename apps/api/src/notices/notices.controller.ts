import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { NoticesService } from './notices.service.js';
import { CreateNoticeDto, UpdateNoticeDto, NoticeQueryDto, AddCommentDto } from './dto/notices.dto.js';

@ApiTags('Notices')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @RequirePermissions('notices.view')
  list(@Query() query: NoticeQueryDto) {
    return this.noticesService.list(query);
  }

  @Get(':id')
  @RequirePermissions('notices.view')
  getOne(@Param('id') id: string) {
    return this.noticesService.getOne(id);
  }

  @Post()
  @RequirePermissions('notices.create')
  create(@Body() dto: CreateNoticeDto, @CurrentUser() user: any) {
    return this.noticesService.create(dto, user.sub);
  }

  @Patch(':id')
  @RequirePermissions('notices.create')
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Patch(':id/publish')
  @RequirePermissions('notices.create')
  publish(@Param('id') id: string) {
    return this.noticesService.publish(id);
  }

  @Patch(':id/archive')
  @RequirePermissions('notices.create')
  archive(@Param('id') id: string) {
    return this.noticesService.archive(id);
  }

  @Post(':id/acknowledge')
  @RequirePermissions('notices.view')
  acknowledge(@Param('id') noticeId: string, @CurrentUser() user: any) {
    return this.noticesService.acknowledge(noticeId, user.sub);
  }

  @Post(':id/comments')
  @RequirePermissions('notices.view')
  addComment(
    @Param('id') noticeId: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.noticesService.addComment(noticeId, user.sub, dto);
  }

  @Delete('comments/:commentId')
  @RequirePermissions('notices.view')
  deleteComment(@Param('commentId') commentId: string, @CurrentUser() user: any) {
    return this.noticesService.deleteComment(commentId, user.sub, false);
  }
}
