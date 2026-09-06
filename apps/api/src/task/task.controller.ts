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
  @RequirePermissions('tasks.view')
  list(@Query() filter: TaskFilterDto, @CurrentUser() actor: any) {
    return this.taskService.list(filter, actor.id);
  }

  @Get('my')
  @RequirePermissions('tasks.view')
  myTasks(@Query() filter: TaskFilterDto, @CurrentUser() actor: any) {
    return this.taskService.myTasks(actor.id, filter);
  }

  @Get('analytics')
  @RequirePermissions('tasks.view')
  analytics(@Query('companyId') companyId?: string) {
    return this.taskService.getAnalytics(companyId);
  }

  // ─── Task CRUD ────────────────────────────────────────────────────────────

  @Get(':id')
  @RequirePermissions('tasks.view')
  get(@Param('id') id: string) {
    return this.taskService.get(id);
  }

  @Post()
  @RequirePermissions('tasks.create')
  create(@Body() dto: CreateTaskDto, @CurrentUser() actor: any) {
    return this.taskService.create(dto, actor.id);
  }

  @Patch(':id')
  @RequirePermissions('tasks.create')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() actor: any) {
    return this.taskService.update(id, dto, actor.id);
  }

  @Patch(':id/status')
  @RequirePermissions('tasks.complete')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto, @CurrentUser() actor: any) {
    return this.taskService.updateStatus(id, dto, actor.id);
  }

  @Patch(':id/progress')
  @RequirePermissions('tasks.complete')
  updateProgress(@Param('id') id: string, @Body() dto: UpdateTaskProgressDto, @CurrentUser() actor: any) {
    return this.taskService.updateProgress(id, dto, actor.id);
  }

  @Post(':id/duplicate')
  @RequirePermissions('tasks.create')
  duplicate(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.duplicate(id, actor.id);
  }

  @Post(':id/archive')
  @RequirePermissions('tasks.create')
  archive(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.archive(id, actor.id);
  }

  @Post(':id/restore')
  @RequirePermissions('tasks.create')
  restore(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.restore(id, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('tasks.create')
  remove(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.softDelete(id, actor.id);
  }

  // ─── Assignees ────────────────────────────────────────────────────────────

  @Post(':id/assign')
  @RequirePermissions('tasks.assign')
  assign(@Param('id') id: string, @Body() dto: AssignTaskDto, @CurrentUser() actor: any) {
    return this.taskService.assign(id, dto, actor.id);
  }

  @Delete(':id/assignees/:userId')
  @RequirePermissions('tasks.assign')
  unassign(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() actor: any) {
    return this.taskService.unassign(id, userId, actor.id);
  }

  @Post(':id/acknowledge')
  @RequirePermissions('tasks.view')
  acknowledge(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.acknowledge(id, actor.id);
  }

  // ─── Checklists ───────────────────────────────────────────────────────────

  @Get(':id/checklists')
  @RequirePermissions('tasks.view')
  getChecklists(@Param('id') id: string) {
    return this.taskService.getChecklists(id);
  }

  @Post(':id/checklists')
  @RequirePermissions('tasks.complete')
  addChecklistItem(@Param('id') id: string, @Body() dto: AddChecklistItemDto, @CurrentUser() actor: any) {
    return this.taskService.addChecklistItem(id, dto, actor.id);
  }

  @Patch(':id/checklists/:itemId')
  @RequirePermissions('tasks.complete')
  updateChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateChecklistItemDto,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.updateChecklistItem(id, itemId, dto, actor.id);
  }

  @Delete(':id/checklists/:itemId')
  @RequirePermissions('tasks.complete')
  deleteChecklistItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteChecklistItem(id, itemId, actor.id);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @Get(':id/comments')
  @RequirePermissions('tasks.view')
  listComments(@Param('id') id: string) {
    return this.taskService.listComments(id);
  }

  @Post(':id/comments')
  @RequirePermissions('tasks.view')
  addComment(@Param('id') id: string, @Body() dto: AddCommentDto, @CurrentUser() actor: any) {
    return this.taskService.addComment(id, dto, actor.id);
  }

  @Patch(':id/comments/:commentId')
  @RequirePermissions('tasks.view')
  updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.updateComment(id, commentId, dto, actor.id);
  }

  @Delete(':id/comments/:commentId')
  @RequirePermissions('tasks.view')
  deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteComment(id, commentId, actor.id);
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  @Get(':id/attachments')
  @RequirePermissions('tasks.view')
  listAttachments(@Param('id') id: string) {
    return this.taskService.listAttachments(id);
  }

  @Post(':id/attachments')
  @RequirePermissions('tasks.create')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  addAttachment(@Param('id') id: string, @UploadedFile() file: any, @CurrentUser() actor: any) {
    return this.taskService.addAttachment(id, file, actor.id);
  }

  @Delete(':id/attachments/:attachmentId')
  @RequirePermissions('tasks.create')
  deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteAttachment(id, attachmentId, actor.id);
  }

  // ─── Dependencies ─────────────────────────────────────────────────────────

  @Get(':id/dependencies')
  @RequirePermissions('tasks.view')
  listDependencies(@Param('id') id: string) {
    return this.taskService.listDependencies(id);
  }

  @Post(':id/dependencies')
  @RequirePermissions('tasks.create')
  addDependency(@Param('id') id: string, @Body() dto: AddDependencyDto, @CurrentUser() actor: any) {
    return this.taskService.addDependency(id, dto, actor.id);
  }

  @Delete(':id/dependencies/:depId')
  @RequirePermissions('tasks.create')
  removeDependency(@Param('id') id: string, @Param('depId') depId: string, @CurrentUser() actor: any) {
    return this.taskService.removeDependency(id, depId, actor.id);
  }

  // ─── Watchers ─────────────────────────────────────────────────────────────

  @Post(':id/watch')
  @RequirePermissions('tasks.view')
  watch(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.watch(id, actor.id);
  }

  @Delete(':id/watch')
  @RequirePermissions('tasks.view')
  unwatch(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.taskService.unwatch(id, actor.id);
  }

  // ─── Reminders ────────────────────────────────────────────────────────────

  @Post(':id/reminders')
  @RequirePermissions('tasks.view')
  addReminder(@Param('id') id: string, @Body() dto: AddReminderDto, @CurrentUser() actor: any) {
    return this.taskService.addReminder(id, dto, actor.id);
  }

  @Delete(':id/reminders/:reminderId')
  @RequirePermissions('tasks.view')
  deleteReminder(
    @Param('id') id: string,
    @Param('reminderId') reminderId: string,
    @CurrentUser() actor: any,
  ) {
    return this.taskService.deleteReminder(id, reminderId, actor.id);
  }

  // ─── Activity ─────────────────────────────────────────────────────────────

  @Get(':id/activity')
  @RequirePermissions('tasks.view')
  getActivity(@Param('id') id: string) {
    return this.taskService.getActivity(id);
  }
}
