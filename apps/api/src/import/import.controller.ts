import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe,
  UploadedFile, UseInterceptors, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  CreateImportTemplateDto, UpdateImportTemplateDto,
  AddTemplateMappingDto, ConfirmImportJobDto,
} from './dto/import.dto.js';

@Controller('import')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  // ─── Templates ────────────────────────────────────────────────────────────

  @Get('templates')
  @RequirePermissions('import:read')
  listTemplates() { return this.importService.listTemplates(); }

  @Get('templates/:id')
  @RequirePermissions('import:read')
  getTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.importService.getTemplateWithMappings(id);
  }

  @Post('templates')
  @RequirePermissions('import:write')
  createTemplate(@Body() dto: CreateImportTemplateDto) {
    return this.importService.createTemplate(dto);
  }

  @Patch('templates/:id')
  @RequirePermissions('import:write')
  updateTemplate(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateImportTemplateDto) {
    return this.importService.updateTemplate(id, dto);
  }

  @Post('templates/:id/mappings')
  @RequirePermissions('import:write')
  addMapping(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddTemplateMappingDto) {
    return this.importService.addTemplateMapping(id, dto);
  }

  @Delete('templates/:id/mappings/:mappingId')
  @RequirePermissions('import:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMapping(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mappingId', ParseUUIDPipe) mappingId: string,
  ) {
    return this.importService.deleteTemplateMapping(id, mappingId);
  }

  // ─── Import Jobs ──────────────────────────────────────────────────────────

  @Get('jobs')
  @RequirePermissions('import:read')
  listJobs(
    @CurrentUser() actor: any,
    @Query('all') all: string,
    @Query('limit',  new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset: number,
  ) {
    // Non-admins see only their own jobs
    const initiatedById = all === 'true' ? undefined : actor.id;
    return this.importService.listJobs(initiatedById, limit, offset);
  }

  @Get('jobs/:id')
  @RequirePermissions('import:read')
  getJob(@Param('id', ParseUUIDPipe) id: string) {
    return this.importService.getJob(id);
  }

  @Get('jobs/:id/rows')
  @RequirePermissions('import:read')
  getJobRows(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('status') status?: string,
    @Query('limit',  new DefaultValuePipe(100), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0),   ParseIntPipe) offset?: number,
  ) {
    return this.importService.getJobRows(id, status, limit, offset);
  }

  // Upload + parse Excel, create job with preview — does NOT persist employees yet
  @Post('jobs/upload')
  @RequirePermissions('import:write')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: any,
    @Body('templateId') templateId: string | undefined,
    @Body('duplicateStrategy') duplicateStrategy: string | undefined,
    @Body('columnMappings') columnMappingsRaw: string,
    @CurrentUser() actor: any,
  ) {
    if (!file) throw new Error('No file uploaded');

    let columnMappings: Array<{ sourceColumn: string; targetField: string }>;
    try {
      columnMappings = JSON.parse(columnMappingsRaw);
    } catch {
      throw new Error('columnMappings must be a JSON array');
    }

    const rawRows = this.importService.parseExcel(file.buffer);

    return this.importService.createJob({
      initiatedById:    actor.id,
      templateId,
      duplicateStrategy: duplicateStrategy ?? 'SKIP',
      columnMappings,
      rawRows,
    });
  }

  // Enqueue validation (async — poll job status)
  @Post('jobs/:id/validate')
  @RequirePermissions('import:write')
  validate(@Param('id', ParseUUIDPipe) id: string) {
    return this.importService.enqueueValidation(id);
  }

  // Confirm + apply (async — requires VALIDATED status)
  @Post('jobs/:id/confirm')
  @RequirePermissions('import:write')
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfirmImportJobDto,
    @CurrentUser() actor: any,
  ) {
    return this.importService.confirmAndApply(id, actor.id, dto);
  }

  @Post('jobs/:id/cancel')
  @RequirePermissions('import:write')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.importService.cancelJob(id);
  }
}
