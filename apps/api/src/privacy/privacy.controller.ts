import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, HttpCode, HttpStatus, Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PrivacyService } from './privacy.service.js';
import { CreatePolicyDto, UpdatePolicyDto, PublishPolicyDto } from './dto/create-policy.dto.js';
import { RecordConsentDto } from './dto/record-consent.dto.js';
import { CorrectionRequestDto, ReviewCorrectionDto } from './dto/correction-request.dto.js';
import { DeletionRequestDto, ReviewDeletionDto } from './dto/deletion-request.dto.js';
import { CreateRetentionPolicyDto, UpdateRetentionPolicyDto } from './dto/retention-policy.dto.js';

@ApiTags('Privacy')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  // ─── Privacy Dashboard (Admin) ────────────────────────────────────────────

  @Get('dashboard')
  @RequirePermissions('privacy.dashboard.view')
  getDashboard(): Promise<any> {
    return this.privacyService.getDashboard();
  }

  // ─── My Data ──────────────────────────────────────────────────────────────

  @Get('my-data')
  @RequirePermissions('privacy.data.view_self')
  getMyData(@CurrentUser() user: { id: string }) {
    return this.privacyService.getMyData(user.id);
  }

  // ─── Privacy Policies ─────────────────────────────────────────────────────

  @Get('policies')
  @RequirePermissions('privacy.policy.view')
  getPolicies(@Query('policyType') policyType?: string) {
    return this.privacyService.getPolicies(policyType);
  }

  @Get('policies/active/:policyType')
  @RequirePermissions('privacy.policy.view')
  getActivePolicy(@Param('policyType') policyType: string) {
    return this.privacyService.getActivePolicy(policyType);
  }

  @Get('policies/:id')
  @RequirePermissions('privacy.policy.view')
  getPolicy(@Param('id') id: string) {
    return this.privacyService.getPolicy(id);
  }

  @Post('policies')
  @RequirePermissions('privacy.policy.manage')
  createPolicy(
    @Body() dto: CreatePolicyDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.privacyService.createPolicy(dto, user.id);
  }

  @Patch('policies/:id')
  @RequirePermissions('privacy.policy.manage')
  updatePolicy(@Param('id') id: string, @Body() dto: UpdatePolicyDto) {
    return this.privacyService.updatePolicy(id, dto);
  }

  @Post('policies/:id/publish')
  @RequirePermissions('privacy.policy.manage')
  publishPolicy(@Param('id') id: string, @Body() dto: PublishPolicyDto) {
    return this.privacyService.publishPolicy(id, dto.effectiveAt);
  }

  @Post('policies/:id/archive')
  @RequirePermissions('privacy.policy.manage')
  archivePolicy(@Param('id') id: string) {
    return this.privacyService.archivePolicy(id);
  }

  // ─── Consent ──────────────────────────────────────────────────────────────

  @Get('consents')
  @RequirePermissions('privacy.data.view_self')
  getMyConsents(@CurrentUser() user: { id: string }) {
    return this.privacyService.getUserConsents(user.id);
  }

  @Post('consents')
  @RequirePermissions('privacy.data.view_self')
  recordConsent(
    @CurrentUser() user: { id: string },
    @Body() dto: RecordConsentDto,
    @Req() req: any,
  ) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    return this.privacyService.recordConsent(user.id, dto, ip, ua);
  }

  @Delete('consents/:policyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('privacy.data.view_self')
  revokeConsent(
    @CurrentUser() user: { id: string },
    @Param('policyId') policyId: string,
  ) {
    return this.privacyService.revokeConsent(user.id, policyId);
  }

  // ─── Data Export ──────────────────────────────────────────────────────────

  @Post('export')
  @RequirePermissions('privacy.data.export_self')
  requestExport(@CurrentUser() user: { id: string }) {
    return this.privacyService.requestDataExport(user.id);
  }

  @Get('export')
  @RequirePermissions('privacy.data.export_self')
  getMyExports(@CurrentUser() user: { id: string }) {
    return this.privacyService.getExportJobs(user.id);
  }

  @Get('export/:jobId')
  @RequirePermissions('privacy.data.export_self')
  getExportJob(
    @CurrentUser() user: { id: string },
    @Param('jobId') jobId: string,
  ) {
    return this.privacyService.getExportJob(jobId, user.id);
  }

  @Get('admin/exports')
  @RequirePermissions('privacy.dashboard.view')
  getAllExports(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.privacyService.getAllExportJobs(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  // ─── Correction Requests ──────────────────────────────────────────────────

  @Post('corrections')
  @RequirePermissions('privacy.data.view_self')
  submitCorrection(
    @CurrentUser() user: { id: string },
    @Body() dto: CorrectionRequestDto,
  ) {
    return this.privacyService.submitCorrectionRequest(user.id, dto);
  }

  @Get('corrections')
  @RequirePermissions('privacy.data.view_self')
  getMyCorrectionRequests(@CurrentUser() user: { id: string }) {
    return this.privacyService.getMyCorrectionRequests(user.id);
  }

  @Get('admin/corrections')
  @RequirePermissions('privacy.dashboard.view')
  getAllCorrectionRequests(@Query('status') status?: string) {
    return this.privacyService.getAllCorrectionRequests(status);
  }

  @Patch('admin/corrections/:id/review')
  @RequirePermissions('privacy.dashboard.view')
  reviewCorrection(
    @Param('id') id: string,
    @Query('approved') approved: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ReviewCorrectionDto,
  ) {
    return this.privacyService.reviewCorrectionRequest(id, user.id, approved === 'true', dto);
  }

  // ─── Account Deletion ─────────────────────────────────────────────────────

  @Post('deletion-request')
  @RequirePermissions('privacy.deletion.request')
  requestDeletion(
    @CurrentUser() user: { id: string },
    @Body() dto: DeletionRequestDto,
  ) {
    return this.privacyService.requestAccountDeletion(user.id, dto);
  }

  @Get('deletion-request')
  @RequirePermissions('privacy.deletion.request')
  getMyDeletionRequest(@CurrentUser() user: { id: string }) {
    return this.privacyService.getMyDeletionRequest(user.id);
  }

  @Delete('deletion-request')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('privacy.deletion.request')
  cancelDeletionRequest(@CurrentUser() user: { id: string }) {
    return this.privacyService.cancelDeletionRequest(user.id);
  }

  @Get('admin/deletions')
  @RequirePermissions('privacy.dashboard.view')
  getAllDeletionRequests(@Query('status') status?: string) {
    return this.privacyService.getAllDeletionRequests(status);
  }

  @Patch('admin/deletions/:id/review')
  @RequirePermissions('privacy.dashboard.view')
  reviewDeletion(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: ReviewDeletionDto,
  ) {
    return this.privacyService.reviewDeletionRequest(id, user.id, dto);
  }

  // ─── Retention Policies ───────────────────────────────────────────────────

  @Get('retention-policies')
  @RequirePermissions('privacy.policy.view')
  getRetentionPolicies() {
    return this.privacyService.getRetentionPolicies();
  }

  @Post('retention-policies')
  @RequirePermissions('privacy.policy.manage')
  createRetentionPolicy(@Body() dto: CreateRetentionPolicyDto) {
    return this.privacyService.createRetentionPolicy(dto);
  }

  @Patch('retention-policies/:id')
  @RequirePermissions('privacy.policy.manage')
  updateRetentionPolicy(
    @Param('id') id: string,
    @Body() dto: UpdateRetentionPolicyDto,
  ) {
    return this.privacyService.updateRetentionPolicy(id, dto);
  }
}
