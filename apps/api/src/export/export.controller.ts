import {
  Controller, Get, Post, Param, Body, Query, Res,
  UseGuards, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { CreateExportJobDto } from './dto/export.dto.js';

@Controller('export')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('jobs')
  @RequirePermissions('export:write')
  createJob(@Body() dto: CreateExportJobDto, @CurrentUser() actor: any) {
    return this.exportService.createJob(dto, actor.id);
  }

  @Get('jobs')
  @RequirePermissions('export:read')
  listJobs(
    @CurrentUser() actor: any,
    @Query('limit',  new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset: number,
  ) {
    return this.exportService.listJobs(actor.id, limit, offset);
  }

  @Get('jobs/:id')
  @RequirePermissions('export:read')
  getJob(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: any) {
    return this.exportService.getJob(id, actor.id);
  }

  @Get('jobs/:id/download')
  @RequirePermissions('export:read')
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: any,
    @Res() res: Response,
  ) {
    const { filepath, filename } = await this.exportService.downloadJob(id, actor.id);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.sendFile(filepath, { root: '/' });
  }
}
