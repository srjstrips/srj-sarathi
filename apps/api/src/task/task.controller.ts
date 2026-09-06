import {
  Controller, Get, Post, Patch, Delete, Put,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { TaskService } from './task.service.js';
import {
  CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, UpdateTaskProgressDto,
  AssignTaskDto, AddChecklistItemDto, UpdateChecklistItemDto,
  AddCommentDto, UpdateCommentDto, AddDependencyDto, AddReminderDto, TaskFilterDto,
} from './dto/task.dto.js';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // ─── List / Search ────────────────────────────────────────────────────────

  @Get()
  @RequirePermissions('task:view:all')
  list(@Query() filter: TaskFilterDto, @CurrentUser() actor: any) {
    return this.taskService.list(filter, actor.id);
  }

  @Get('my')
  @RequirePermissions('task:view')
  myTasks(@Query() filter: TaskFilterDto, @CurrentUser() actor: any) {
    return this.taskService.myTasks(actor.id, filter);
  }

  @Get('analytics')
  @RequirePermissions('task:view:all')
  analytics(@Query('companyId') companyId?: string) {
    return this.taskService.getAnalytics(companyId);
  }

  // ─── Task CRUD ────────────────────────────────────────────────────────────

  @Get(':id')
  @RequirePermissions('task:view')
  get(@Param('id') id: string) {
    return this.taskService.get(id);
  }

  @Post()
  @RequirePermissions('task:create')
  create(@Body() dto: CreateTaskDto, @CurrentUser() actor: any) {
    return this.taskService.create(dto, actor.id);
  }

  @Patch(':id')
  @RequirePermissions('task:edit')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() actor: any) {
    return this.taskService.update(id, dto, actor.id);
  }

  @Patch(':id/status')
  @RequirePermissions('task:edit')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto, @CurrentUser() actor: any) {
    return this.taskService.updateStatus(id, dto, actor.id);
  }

  @Patch(':id/progress')
  @RequirePermissions('task:edit')
  updateProgress(@Param('id') id: string, @Body() dto: UpdateTaskProgressDto, @CurrentUser() actor: any) {
    return this.taskService.updateProgress(id, dto, actor.id);
  }

  @Post(':id/duplicate')
  @RequirePermissions('task:create')
  duplicate(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.duplicate(id, actor.id);
  }

  @Post(':id/archive')
  @RequirePermissions('task:archive')
  archive(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.archive(id, actor.id);
  }

  @Post(':id/restore')
  @RequirePermissions('task:archive')
  restore(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.restore(id, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('task:delete')
  remove(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.softDelete(id, actor.id);
  }

  // ─── Assignees ────────────────────────────────────────────────────────────

  @Post(':id/assign')
  @RequirePermissions('task:assign')
  assign(@Param('id') id: string, @Body() dto: AssignTaskDto, @CurrentUser() actor: any) {
    return this.taskService.assign(id, dto, actor.id);
  }

  @Delete(':id/assignees/:userId')
  @RequirePermissions('task:assign')
  unassign(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() actor: any) {
    return this.taskService.unassign(id, userId, actor.id);
  }

  @Post(':id/acknowledge')
  @RequirePermissions('task:view')
  acknowledge(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.acknowledge(id, actor.id);
  }

  // ─── Checklists ───────────────────────────────────────────────────────────

  @Get(':id/checklists')
  @RequirePermissions('task:view')
  getChecklists(@Param('id') id: string) {
    return this.taskService.getChecklists(id);
  }

  @Post(':id/checklists')
  @RequirePermissions('task:edit')
  addChecklistItem(@Param('id') id: string, @Body() dto: AddChecklistItemDto, @CurrentUser() actor: any) {
    return this.taskService.addChecklistItem(id, dto, actor.id);
  }

  @Patch(':id/checklists/:itemId')
  @RequirePermissions('task:edit')
  updateChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.updateChecklistItem(id, itemId, dto, actor.id);
  }

  @Delete(':id/checklists/:itemId')
  @RequirePermissions('task:edit')
  deleteChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteChecklistItem(id, itemId, actor.id);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @Get(':id/comments')
  @RequirePermissions('task:view')
  listComments(@Param('id') id: string) {
    return this.taskService.listComments(id);
  }

  @Post(':id/comments')
  @RequirePermissions('task:comment')
  addComment(@Param('id') id: string, @Body() dto: AddCommentDto, @CurrentUser() actor: any) {
    return this.taskService.addComment(id, dto, actor.id);
  }

  @Patch(':id/comments/:commentId')
  @RequirePermissions('task:comment')
  updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.updateComment(id, commentId, dto, actor.id);
  }

  @Delete(':id/comments/:commentId')
  @RequirePermissions('task:comment')
  deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteComment(id, commentId, actor.id);
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  @Get(':id/attachments')
  @RequirePermissions('task:view')
  listAttachments(@Param('id') id: string) {
    return this.taskService.listAttachments(id);
  }

  @Post(':id/attachments')
  @RequirePermissions('task:attach')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  addAttachment(@Param('id') id: string, @UploadedFile() file: any, @CurrentUser() actor: any) {
    return this.taskService.addAttachment(id, file, actor.id);
  }

  @Delete(':id/attachments/:attachmentId')
  @RequirePermissions('task:attach')
  deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteAttachment(id, attachmentId, actor.id);
  }

  // ─── Dependencies ─────────────────────────────────────────────────────────

  @Get(':id/dependencies')
  @RequirePermissions('task:view')
  listDependencies(@Param('id') id: string) {
    return this.taskService.listDependencies(id);
  }

  @Post(':id/dependencies')
  @RequirePermissions('task:edit')
  addDependency(@Param('id') id: string, @Body() dto: AddDependencyDto, @CurrentUser() actor: any) {
    return this.taskService.addDependency(id, dto, actor.id);
  }

  @Delete(':id/dependencies/:depId')
  @RequirePermissions('task:edit')
  removeDependency(@Param('id') id: string, @Param('depId') depId: string, @CurrentUser() actor: any) {
    return this.taskService.removeDependency(id, depId, actor.id);
  }

  // ─── Watchers ─────────────────────────────────────────────────────────────

  @Post(':id/watch')
  @RequirePermissions('task:view')
  watch(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.watch(id, actor.id);
  }

  @Delete(':id/watch')
  @RequirePermissions('task:view')
  unwatch(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.unwatch(id, actor.id);
  }

  // ─── Reminders ────────────────────────────────────────────────────────────

  @Post(':id/reminders')
  @RequirePermissions('task:view')
  addReminder(@Param('id') id: string, @Body() dto: AddReminderDto, @CurrentUser() actor: any) {
    return this.taskService.addReminder(id, dto, actor.id);
  }

  @Delete(':id/reminders/:reminderId')
  @RequirePermissions('task:view')
  deleteReminder(
    @Param('id') id: string,
    @Param('reminderId') reminderId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteReminder(id, reminderId, actor.id);
  }

  // ─── Activity ─────────────────────────────────────────────────────────────

  @Get(':id/activity')
  @RequirePermissions('task:view')
  getActivity(@Param('id') id: string) {
    return this.taskService.getActivity(id);
  }
}
