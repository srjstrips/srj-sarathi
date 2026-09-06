import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFile, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ProjectService } from './project.service.js';
import {
  CreateProjectDto, UpdateProjectDto, UpdateProjectStatusDto,
  UpdateProjectProgressDto, AddProjectMemberDto, UpdateProjectMemberDto,
  ProjectFilterDto,
} from './dto/project.dto.js';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // ─── List / Analytics ─────────────────────────────────────────────────────

  @Get()
  @RequirePermissions('project:view')
  list(@Query() filter: ProjectFilterDto) {
    return this.projectService.list(filter);
  }

  @Get('analytics')
  @RequirePermissions('project:view:all')
  analytics(@Query('companyId') companyId?: string) {
    return this.projectService.getAnalytics(companyId);
  }

  // ─── Project CRUD ─────────────────────────────────────────────────────────

  @Get(':id')
  @RequirePermissions('project:view')
  get(@Param('id') id: string) {
    return this.projectService.get(id);
  }

  @Post()
  @RequirePermissions('project:create')
  create(@Body() dto: CreateProjectDto, @CurrentUser() actor: any) {
    return this.projectService.create(dto, actor.id);
  }

  @Patch(':id')
  @RequirePermissions('project:edit')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @CurrentUser() actor: any) {
    return this.projectService.update(id, dto, actor.id);
  }

  @Patch(':id/status')
  @RequirePermissions('project:edit')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto, @CurrentUser() actor: any) {
    return this.projectService.updateStatus(id, dto, actor.id);
  }

  @Patch(':id/progress')
  @RequirePermissions('project:edit')
  updateProgress(@Param('id') id: string, @Body() dto: UpdateProjectProgressDto, @CurrentUser() actor: any) {
    return this.projectService.updateProgress(id, dto, actor.id);
  }

  @Post(':id/recalculate-progress')
  @RequirePermissions('project:edit')
  recalculateProgress(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.projectService.recalculateProgress(id, actor.id);
  }

  @Post(':id/duplicate')
  @RequirePermissions('project:create')
  duplicate(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.projectService.duplicate(id, actor.id);
  }

  @Post(':id/archive')
  @RequirePermissions('project:archive')
  archive(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.projectService.archive(id, actor.id);
  }

  @Post(':id/restore')
  @RequirePermissions('project:archive')
  restore(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.projectService.restore(id, actor.id);
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  @Get(':id/members')
  @RequirePermissions('project:view')
  listMembers(@Param('id') id: string) {
    return this.projectService.listMembers(id);
  }

  @Post(':id/members')
  @RequirePermissions('project:manage:team')
  addMember(@Param('id') id: string, @Body() dto: AddProjectMemberDto, @CurrentUser() actor: any) {
    return this.projectService.addMember(id, dto, actor.id);
  }

  @Patch(':id/members/:memberId')
  @RequirePermissions('project:manage:team')
  updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateProjectMemberDto,
    @CurrentUser() actor: any,
  ) {
    return this.projectService.updateMemberRole(id, memberId, dto, actor.id);
  }

  @Delete(':id/members/:memberId')
  @RequirePermissions('project:manage:team')
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() actor: any,
  ) {
    return this.projectService.removeMember(id, memberId, actor.id);
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────

  @Get(':id/tasks')
  @RequirePermissions('project:view')
  getProjectTasks(@Param('id') id: string) {
    return this.projectService.getProjectTasks(id);
  }

  @Get(':id/task-stats')
  @RequirePermissions('project:view')
  getTaskStats(@Param('id') id: string) {
    return this.projectService.getProjectTaskStats(id);
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  @Get(':id/attachments')
  @RequirePermissions('project:view')
  listAttachments(@Param('id') id: string) {
    return this.projectService.listAttachments(id);
  }

  @Post(':id/attachments')
  @RequirePermissions('project:edit')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  addAttachment(@Param('id') id: string, @UploadedFile() file: any, @CurrentUser() actor: any) {
    return this.projectService.addAttachment(id, file, actor.id);
  }

  @Delete(':id/attachments/:attachmentId')
  @RequirePermissions('project:edit')
  deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() actor: any,
  ) {
    return this.projectService.deleteAttachment(id, attachmentId, actor.id);
  }

  // ─── Activity ─────────────────────────────────────────────────────────────

  @Get(':id/activity')
  @RequirePermissions('project:view')
  getActivity(@Param('id') id: string) {
    return this.projectService.getActivity(id);
  }
}
