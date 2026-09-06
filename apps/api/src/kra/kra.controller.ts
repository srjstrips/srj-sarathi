import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { KraService } from './kra.service.js';
import {
  CreateKraCycleDto, CreateKraObjectiveDto, SubmitKraRatingDto, KraQueryDto,
} from './dto/kra.dto.js';

@ApiTags('KRA')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('kra')
export class KraController {
  constructor(private readonly kraService: KraService) {}

  // ─── Cycles ───────────────────────────────────────────────────────────────

  @Get('cycles')
  @RequirePermissions('kra.view')
  listCycles(@Query('status') status?: string) {
    return this.kraService.listCycles(status);
  }

  @Post('cycles')
  @RequirePermissions('kra.manage')
  createCycle(@Body() dto: CreateKraCycleDto, @CurrentUser() user: any) {
    return this.kraService.createCycle(dto, user.sub);
  }

  @Patch('cycles/:id/status')
  @RequirePermissions('kra.manage')
  updateCycleStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.kraService.updateCycleStatus(id, status);
  }

  // ─── Objectives ───────────────────────────────────────────────────────────

  @Get('objectives')
  @RequirePermissions('kra.view')
  listObjectives(@Query() query: KraQueryDto) {
    return this.kraService.listObjectives(query);
  }

  @Post('objectives')
  @RequirePermissions('kra.manage')
  createObjective(@Body() dto: CreateKraObjectiveDto) {
    return this.kraService.createObjective(dto);
  }

  @Patch('objectives/:id/submit')
  @RequirePermissions('kra.view')
  submitObjective(@Param('id') id: string) {
    return this.kraService.submitObjective(id);
  }

  // ─── Ratings ──────────────────────────────────────────────────────────────

  @Get('objectives/:id/ratings')
  @RequirePermissions('kra.view')
  getRatings(@Param('id') objectiveId: string) {
    return this.kraService.getObjectiveRatings(objectiveId);
  }

  @Post('objectives/:id/ratings')
  @RequirePermissions('kra.view')
  submitRating(
    @Param('id') objectiveId: string,
    @Body('raterType') raterType: string,
    @Body() dto: SubmitKraRatingDto,
    @CurrentUser() user: any,
  ) {
    return this.kraService.submitRating(objectiveId, raterType, user.sub, dto);
  }
}
