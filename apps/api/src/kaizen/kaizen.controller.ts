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
import { KaizenService } from './kaizen.service.js';
import {
  CreateKaizenDto, UpdateKaizenDto, HodReviewDto, DirectorReviewDto,
  AddCommentDto, UpdateCommentDto, CreateKaizenImplementationDto,
  UpdateKaizenImplementationDto, AddKaizenResultDto,
  CreateCategoryDto, UpdateCategoryDto, KaizenFilterDto,
} from './dto/kaizen.dto.js';

// ─── Category admin sub-controller ────────────────────────────────────────────

@ApiTags('Kaizen Categories')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('kaizen-categories')
export class KaizenCategoryController {
  constructor(private readonly kaizenService: KaizenService) {}

  @Get()
  @RequirePermissions('kaizen.view')
  list() {
    return this.kaizenService.listCategories();
  }

  @Post()
  @RequirePermissions('kaizen.approve')
  create(@Body() dto: CreateCategoryDto) {
    return this.kaizenService.createCategory(dto);
  }

  @Patch(':id')
  @RequirePermissions('kaizen.approve')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.kaizenService.updateCategory(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('kaizen.approve')
  remove(@Param('id') id: string) {
    return this.kaizenService.deleteCategory(id);
  }
}

// ─── Main Kaizen controller ───────────────────────────────────────────────────

@ApiTags('Kaizens')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('kaizen')
export class KaizenController {
  constructor(private readonly kaizenService: KaizenService) {}

  // ─── List / Dashboard ─────────────────────────────────────────────────────

  @Get()
  @RequirePermissions('kaizen.view')
  list(@Query() filter: KaizenFilterDto, @CurrentUser() actor: any) {
    return this.kaizenService.list(filter, actor.id);
  }

  @Get('my')
  @RequirePermissions('kaizen.view')
  myKaizens(@Query() filter: KaizenFilterDto, @CurrentUser() actor: any) {
    return this.kaizenService.myKaizens(actor.id, filter);
  }

  @Get('dashboard')
  @RequirePermissions('kaizen.view')
  dashboard(@CurrentUser() actor: any) {
    return this.kaizenService.getDashboard(actor.id);
  }

  @Get('analytics')
  @RequirePermissions('kaizen.view')
  analytics(@Query('companyId') companyId?: string) {
    return this.kaizenService.getAnalytics(companyId);
  }

  // ─── Kaizen CRUD ──────────────────────────────────────────────────────────

  @Get(':id')
  @RequirePermissions('kaizen.view')
  get(@Param('id') id: string) {
    return this.kaizenService.get(id);
  }

  @Post()
  @RequirePermissions('kaizen.create')
  create(@Body() dto: CreateKaizenDto, @CurrentUser() actor: any) {
    return this.kaizenService.create(dto, actor.id);
  }

  @Patch(':id')
  @RequirePermissions('kaizen.create')
  update(@Param('id') id: string, @Body() dto: UpdateKaizenDto, @CurrentUser() actor: any) {
    return this.kaizenService.update(id, dto, actor.id);
  }

  @Post(':id/submit')
  @RequirePermissions('kaizen.create')
  submit(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.kaizenService.submit(id, actor.id);
  }

  @Post(':id/cancel')
  @RequirePermissions('kaizen.create')
  cancel(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.kaizenService.cancel(id, actor.id);
  }

  @Post(':id/archive')
  @RequirePermissions('kaizen.approve')
  archive(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.kaizenService.archive(id, actor.id);
  }

  @Post(':id/restore')
  @RequirePermissions('kaizen.approve')
  restore(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.kaizenService.restore(id, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('kaizen.create')
  remove(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.kaizenService.softDelete(id, actor.id);
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────

  @Post(':id/hod-review')
  @RequirePermissions('kaizen.approve')
  hodReview(@Param('id') id: string, @Body() dto: HodReviewDto, @CurrentUser() actor: any) {
    return this.kaizenService.hodReview(id, dto, actor.id);
  }

  @Post(':id/director-review')
  @RequirePermissions('kaizen.approve')
  directorReview(@Param('id') id: string, @Body() dto: DirectorReviewDto, @CurrentUser() actor: any) {
    return this.kaizenService.directorReview(id, dto, actor.id);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  @Get(':id/comments')
  @RequirePermissions('kaizen.view')
  listComments(@Param('id') id: string) {
    return this.kaizenService.listComments(id);
  }

  @Post(':id/comments')
  @RequirePermissions('kaizen.view')
  addComment(@Param('id') id: string, @Body() dto: AddCommentDto, @CurrentUser() actor: any) {
    return this.kaizenService.addComment(id, dto, actor.id);
  }

  @Patch(':id/comments/:commentId')
  @RequirePermissions('kaizen.view')
  updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() actor: any,
  ) {
    return this.kaizenService.updateComment(id, commentId, dto, actor.id);
  }

  @Delete(':id/comments/:commentId')
  @RequirePermissions('kaizen.view')
  deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() actor: any,
  ) {
    return this.kaizenService.deleteComment(id, commentId, actor.id);
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  @Get(':id/attachments')
  @RequirePermissions('kaizen.view')
  listAttachments(@Param('id') id: string) {
    return this.kaizenService.listAttachments(id);
  }

  @Post(':id/attachments')
  @RequirePermissions('kaizen.create')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  addAttachment(@Param('id') id: string, @UploadedFile() file: any, @CurrentUser() actor: any) {
    return this.kaizenService.addAttachment(id, file, actor.id);
  }

  @Delete(':id/attachments/:attachmentId')
  @RequirePermissions('kaizen.create')
  deleteAttachment(
    @Param('id') id: string,
    @Param('attachmentId') attachmentId: string,
    @CurrentUser() actor: any,
  ) {
    return this.kaizenService.deleteAttachment(id, attachmentId, actor.id);
  }

  // ─── Implementation ───────────────────────────────────────────────────────

  @Get(':id/implementation')
  @RequirePermissions('kaizen.view')
  getImplementation(@Param('id') id: string) {
    return this.kaizenService.getImplementation(id);
  }

  @Post(':id/implementation')
  @RequirePermissions('kaizen.approve')
  createImplementation(
    @Param('id') id: string,
    @Body() dto: CreateKaizenImplementationDto,
    @CurrentUser() actor: any,
  ) {
    return this.kaizenService.createImplementation(id, dto, actor.id);
  }

  @Patch(':id/implementation')
  @RequirePermissions('kaizen.approve')
  updateImplementation(
    @Param('id') id: string,
    @Body() dto: UpdateKaizenImplementationDto,
    @CurrentUser() actor: any,
  ) {
    return this.kaizenService.updateImplementation(id, dto, actor.id);
  }

  @Post(':id/close')
  @RequirePermissions('kaizen.approve')
  closeKaizen(@Param('id') id: string, @CurrentUser() actor: any) {
    return this.kaizenService.closeKaizen(id, actor.id);
  }

  // ─── Results ──────────────────────────────────────────────────────────────

  @Get(':id/results')
  @RequirePermissions('kaizen.view')
  listResults(@Param('id') id: string) {
    return this.kaizenService.listResults(id);
  }

  @Post(':id/results')
  @RequirePermissions('kaizen.approve')
  addResult(@Param('id') id: string, @Body() dto: AddKaizenResultDto, @CurrentUser() actor: any) {
    return this.kaizenService.addResult(id, dto, actor.id);
  }

  @Delete(':id/results/:resultId')
  @RequirePermissions('kaizen.approve')
  deleteResult(
    @Param('id') id: string,
    @Param('resultId') resultId: string,
    @CurrentUser() actor: any,
  ) {
    return this.kaizenService.deleteResult(id, resultId, actor.id);
  }

  // ─── Activity ─────────────────────────────────────────────────────────────

  @Get(':id/activity')
  @RequirePermissions('kaizen.view')
  getActivity(@Param('id') id: string) {
    return this.kaizenService.getActivity(id);
  }
}
