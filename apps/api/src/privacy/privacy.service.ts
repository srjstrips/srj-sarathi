import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now, toInstant } from '../common/utils/temporal.js';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/create-policy.dto.js';
import { RecordConsentDto } from './dto/record-consent.dto.js';
import { CorrectionRequestDto, ReviewCorrectionDto } from './dto/correction-request.dto.js';
import { DeletionRequestDto, ReviewDeletionDto } from './dto/deletion-request.dto.js';
import { CreateRetentionPolicyDto, UpdateRetentionPolicyDto } from './dto/retention-policy.dto.js';

@Injectable()
export class PrivacyService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Privacy Policy ───────────────────────────────────────────────────────

  async getPolicies(policyType?: string) {
    const filters: Record<string, unknown> = {};
    if (policyType) filters['policyType'] = policyType;
    return this.prisma.orm.public.PrivacyPolicy
      .where(filters)
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  async getActivePolicy(policyType: string) {
    const policy = await this.prisma.orm.public.PrivacyPolicy
      .where({ policyType: policyType as any, status: 'PUBLISHED' })
      .orderBy(m => (m as any).publishedAt.desc())
      .first();
    if (!policy) throw new NotFoundException(`No published policy found for type: ${policyType}`);
    return policy;
  }

  async getPolicy(id: string) {
    const policy = await this.prisma.orm.public.PrivacyPolicy.where({ id }).first();
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async createPolicy(dto: CreatePolicyDto, createdById: string) {
    const existing = await this.prisma.orm.public.PrivacyPolicy
      .where({ policyType: dto.policyType as any, version: dto.version as any })
      .first();
    if (existing) throw new ConflictException('Policy with this type and version already exists');

    return this.prisma.orm.public.PrivacyPolicy.create({
      policyType: dto.policyType,
      version: dto.version,
      title: dto.title,
      content: dto.content,
      status: 'DRAFT',
      effectiveAt: dto.effectiveAt ? toInstant(new Date(dto.effectiveAt)) : null,
      publishedAt: null,
      createdById,
    } as any);
  }

  async updatePolicy(id: string, dto: UpdatePolicyDto) {
    const policy = await this.prisma.orm.public.PrivacyPolicy.where({ id }).first();
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.status === 'PUBLISHED') throw new BadRequestException('Cannot edit a published policy');

    return this.prisma.orm.public.PrivacyPolicy.where({ id }).update({
      ...(dto.title && { title: dto.title }),
      ...(dto.content && { content: dto.content }),
      ...(dto.effectiveAt !== undefined && { effectiveAt: dto.effectiveAt ? toInstant(new Date(dto.effectiveAt)) : null }),
      updatedAt: now(),
    } as any);
  }

  async publishPolicy(id: string, effectiveAt?: string) {
    const policy = await this.prisma.orm.public.PrivacyPolicy.where({ id }).first();
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.status === 'PUBLISHED') throw new BadRequestException('Policy is already published');

    const ts = now();
    return this.prisma.orm.public.PrivacyPolicy.where({ id }).update({
      status: 'PUBLISHED',
      publishedAt: ts,
      effectiveAt: effectiveAt ? toInstant(new Date(effectiveAt)) : ts,
      updatedAt: now,
    } as any);
  }

  async archivePolicy(id: string) {
    const policy = await this.prisma.orm.public.PrivacyPolicy.where({ id }).first();
    if (!policy) throw new NotFoundException('Policy not found');
    return this.prisma.orm.public.PrivacyPolicy.where({ id }).update({
      status: 'ARCHIVED',
      updatedAt: now(),
    } as any);
  }

  // ─── Consent ──────────────────────────────────────────────────────────────

  async getUserConsents(userId: string) {
    return this.prisma.orm.public.PrivacyConsent
      .where({ userId })
      .orderBy(m => (m as any).acceptedAt.desc())
      .all();
  }

  async recordConsent(userId: string, dto: RecordConsentDto, ipAddress?: string, userAgent?: string) {
    const policy = await this.prisma.orm.public.PrivacyPolicy.where({ id: dto.policyId }).first();
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.status !== 'PUBLISHED') throw new BadRequestException('Can only consent to published policies');

    return this.prisma.orm.public.PrivacyConsent.create({
      userId,
      policyId: dto.policyId,
      policyVersion: policy.version,
      status: dto.status,
      revokedAt: null,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      deviceId: dto.deviceId ?? null,
    } as any);
  }

  async revokeConsent(userId: string, policyId: string) {
    const consent = await this.prisma.orm.public.PrivacyConsent
      .where({ userId, policyId })
      .orderBy(m => (m as any).acceptedAt.desc())
      .first();
    if (!consent) throw new NotFoundException('Consent record not found');

    return this.prisma.orm.public.PrivacyConsent.where({ id: consent.id }).update({
      status: 'REVOKED',
      revokedAt: now(),
    } as any);
  }

  // ─── Data Export ──────────────────────────────────────────────────────────

  async requestDataExport(userId: string) {
    const pending = await this.prisma.orm.public.DataExportJob
      .where({ userId, status: 'PENDING' })
      .first();
    if (pending) throw new ConflictException('A data export is already pending');

    const processing = await this.prisma.orm.public.DataExportJob
      .where({ userId, status: 'PROCESSING' })
      .first();
    if (processing) throw new ConflictException('A data export is already being processed');

    return this.prisma.orm.public.DataExportJob.create({
      userId,
      status: 'PENDING',
      storageKey: null,
      downloadUrl: null,
      expiresAt: null,
      completedAt: null,
      failedAt: null,
      errorMsg: null,
    } as any);
  }

  async getExportJobs(userId: string) {
    return this.prisma.orm.public.DataExportJob
      .where({ userId })
      .orderBy(m => (m as any).requestedAt.desc())
      .all();
  }

  async getExportJob(jobId: string, userId: string) {
    const job = await this.prisma.orm.public.DataExportJob
      .where({ id: jobId, userId })
      .first();
    if (!job) throw new NotFoundException('Export job not found');
    return job;
  }

  async getAllExportJobs(limit = 50, offset = 0) {
    return this.prisma.orm.public.DataExportJob
      .orderBy(m => (m as any).requestedAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  // ─── Correction Requests ──────────────────────────────────────────────────

  async submitCorrectionRequest(userId: string, dto: CorrectionRequestDto) {
    return this.prisma.orm.public.DataCorrectionRequest.create({
      userId,
      field: dto.field as any,
      requestedValue: dto.requestedValue,
      reason: dto.reason ?? null,
      status: 'PENDING',
      reviewedById: null,
      reviewNote: null,
      completedAt: null,
    } as any);
  }

  async getMyCorrectionRequests(userId: string) {
    return this.prisma.orm.public.DataCorrectionRequest
      .where({ userId })
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  async getAllCorrectionRequests(status?: string) {
    const filters: Record<string, unknown> = {};
    if (status) filters['status'] = status;
    return this.prisma.orm.public.DataCorrectionRequest
      .where(filters)
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  async reviewCorrectionRequest(id: string, reviewerId: string, approved: boolean, dto: ReviewCorrectionDto) {
    const req = await this.prisma.orm.public.DataCorrectionRequest.where({ id }).first();
    if (!req) throw new NotFoundException('Correction request not found');
    if (req.status !== 'PENDING' && req.status !== 'IN_REVIEW') {
      throw new BadRequestException('Request is not in a reviewable state');
    }

    const ts = now();
    return this.prisma.orm.public.DataCorrectionRequest.where({ id }).update({
      status: approved ? 'APPROVED' : 'REJECTED',
      reviewedById: reviewerId,
      reviewNote: dto.reviewNote ?? null,
      updatedAt: ts,
      completedAt: approved ? ts : null,
    } as any);
  }

  // ─── Account Deletion ─────────────────────────────────────────────────────

  async requestAccountDeletion(userId: string, dto: DeletionRequestDto) {
    const existing = await this.prisma.orm.public.AccountDeletionRequest
      .where({ userId })
      .first();

    if (existing) {
      const active = ['DELETION_REQUESTED', 'VERIFICATION_REQUIRED', 'VERIFIED', 'SCHEDULED', 'PROCESSING'];
      if (active.includes(existing.status)) {
        throw new ConflictException('An account deletion request is already in progress');
      }
    }

    return this.prisma.orm.public.AccountDeletionRequest.create({
      userId,
      status: 'DELETION_REQUESTED',
      verifiedAt: null,
      scheduledAt: null,
      completedAt: null,
      cancelledAt: null,
      reason: dto.reason ?? null,
      reviewedById: null,
    } as any);
  }

  async getMyDeletionRequest(userId: string) {
    return this.prisma.orm.public.AccountDeletionRequest.where({ userId }).first();
  }

  async cancelDeletionRequest(userId: string) {
    const req = await this.prisma.orm.public.AccountDeletionRequest.where({ userId }).first();
    if (!req) throw new NotFoundException('No deletion request found');
    const cancellable = ['DELETION_REQUESTED', 'VERIFICATION_REQUIRED', 'VERIFIED'];
    if (!cancellable.includes(req.status)) {
      throw new BadRequestException('Request cannot be cancelled at this stage');
    }

    return this.prisma.orm.public.AccountDeletionRequest.where({ id: req.id }).update({
      status: 'CANCELLED',
      cancelledAt: now(),
    } as any);
  }

  async getAllDeletionRequests(status?: string) {
    const filters: Record<string, unknown> = {};
    if (status) filters['status'] = status;
    return this.prisma.orm.public.AccountDeletionRequest
      .where(filters)
      .orderBy(m => (m as any).requestedAt.desc())
      .all();
  }

  async reviewDeletionRequest(id: string, reviewerId: string, dto: ReviewDeletionDto) {
    const req = await this.prisma.orm.public.AccountDeletionRequest.where({ id }).first();
    if (!req) throw new NotFoundException('Deletion request not found');

    const ts = now();
    if (dto.decision === 'APPROVE') {
      const scheduledAt = toInstant(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      return this.prisma.orm.public.AccountDeletionRequest.where({ id }).update({
        status: 'SCHEDULED',
        verifiedAt: ts,
        scheduledAt,
        reviewedById: reviewerId,
      } as any);
    }
    return this.prisma.orm.public.AccountDeletionRequest.where({ id }).update({
      status: 'REJECTED',
      reviewedById: reviewerId,
    } as any);
  }

  // ─── Retention Policies ───────────────────────────────────────────────────

  async getRetentionPolicies() {
    return this.prisma.orm.public.RetentionPolicy
      .where({ isActive: true })
      .orderBy(m => (m as any).dataCategory.asc())
      .all();
  }

  async createRetentionPolicy(dto: CreateRetentionPolicyDto) {
    const existing = await this.prisma.orm.public.RetentionPolicy
      .where({ dataCategory: dto.dataCategory as any })
      .first();
    if (existing) throw new ConflictException('Retention policy for this category already exists');

    return this.prisma.orm.public.RetentionPolicy.create({
      dataCategory: dto.dataCategory as any,
      retentionDays: dto.retentionDays,
      retentionBasis: dto.retentionBasis ?? null,
      deletionBehavior: dto.deletionBehavior as any,
      anonymizationBehavior: dto.anonymizationBehavior ?? null,
      isActive: true,
    } as any);
  }

  async updateRetentionPolicy(id: string, dto: UpdateRetentionPolicyDto) {
    const policy = await this.prisma.orm.public.RetentionPolicy.where({ id }).first();
    if (!policy) throw new NotFoundException('Retention policy not found');

    return this.prisma.orm.public.RetentionPolicy.where({ id }).update({
      ...(dto.retentionDays !== undefined && { retentionDays: dto.retentionDays }),
      ...(dto.retentionBasis !== undefined && { retentionBasis: dto.retentionBasis }),
      ...(dto.deletionBehavior && { deletionBehavior: dto.deletionBehavior }),
      ...(dto.anonymizationBehavior !== undefined && { anonymizationBehavior: dto.anonymizationBehavior }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Privacy Dashboard ────────────────────────────────────────────────────

  async getDashboard(): Promise<any> {
    const [pendingDeletions, pendingCorrections, pendingExports, publishedPolicies] = await Promise.all([
      this.prisma.orm.public.AccountDeletionRequest.where({ status: 'DELETION_REQUESTED' }).count(),
      this.prisma.orm.public.DataCorrectionRequest.where({ status: 'PENDING' }).count(),
      this.prisma.orm.public.DataExportJob.where({ status: 'PENDING' }).count(),
      this.prisma.orm.public.PrivacyPolicy.where({ status: 'PUBLISHED' }).count(),
    ]);

    return { pendingDeletionRequests: pendingDeletions, pendingCorrectionRequests: pendingCorrections, pendingExportJobs: pendingExports, publishedPolicies };
  }

  // ─── User's own data summary ──────────────────────────────────────────────

  async getMyData(userId: string) {
    const [user, consents, exportJobs, correctionRequests, deletionRequest] = await Promise.all([
      this.prisma.orm.public.User.where({ id: userId }).first(),
      this.prisma.orm.public.PrivacyConsent.where({ userId }).all(),
      this.prisma.orm.public.DataExportJob.where({ userId }).all(),
      this.prisma.orm.public.DataCorrectionRequest.where({ userId }).all(),
      this.prisma.orm.public.AccountDeletionRequest.where({ userId }).first(),
    ]);

    const safeUser = user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
    } : null;

    return { profile: safeUser, consents, exportJobs, correctionRequests, deletionRequest };
  }
}
