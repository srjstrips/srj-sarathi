import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateKaizenDto, UpdateKaizenDto, HodReviewDto, DirectorReviewDto,
  AddCommentDto, UpdateCommentDto, CreateKaizenImplementationDto,
  UpdateKaizenImplementationDto, AddKaizenResultDto,
  CreateCategoryDto, UpdateCategoryDto, KaizenFilterDto,
} from './dto/kaizen.dto.js';

@Injectable()
export class KaizenService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Kaizen number ────────────────────────────────────────────────────────

  private async generateKaizenNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const { n } = await this.prisma.orm.public.Kaizen.aggregate(agg => ({ n: agg.count() }));
    return `KAIZEN-${year}-${String(Number(n) + 1).padStart(6, '0')}`;
  }

  // ─── Categories ───────────────────────────────────────────────────────────

  async listCategories() {
    return this.prisma.orm.public.KaizenCategory
      .where({ isActive: true })
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async createCategory(dto: CreateCategoryDto) {
    const exists = await this.prisma.orm.public.KaizenCategory
      .where({ code: dto.code as any }).first();
    if (exists) throw new BadRequestException(`Category code '${dto.code}' already exists`);
    return this.prisma.orm.public.KaizenCategory.create({
      id:           uuidv4(),
      code:         dto.code as any,
      name:         dto.name as any,
      description:  dto.description ?? null,
      isActive:     true,
      displayOrder: dto.displayOrder ?? 0,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.orm.public.KaizenCategory.where({ id }).first();
    if (!cat) throw new NotFoundException('Category not found');
    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.name !== undefined)         changes['name']         = dto.name as any;
    if (dto.description !== undefined)  changes['description']  = dto.description;
    if (dto.isActive !== undefined)     changes['isActive']     = dto.isActive;
    if (dto.displayOrder !== undefined) changes['displayOrder'] = dto.displayOrder;
    await this.prisma.orm.public.KaizenCategory.where({ id }).update(changes as any);
    return this.prisma.orm.public.KaizenCategory.where({ id }).first();
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.orm.public.KaizenCategory.where({ id }).first();
    if (!cat) throw new NotFoundException('Category not found');
    await this.prisma.orm.public.KaizenCategory.where({ id }).update({
      isActive: false, updatedAt: now() as any,
    } as any);
    return { deactivated: true };
  }

  // ─── Kaizen CRUD ──────────────────────────────────────────────────────────

  async list(filter: KaizenFilterDto, actorId: string) {
    const where: Record<string, unknown> = { isArchived: filter.isArchived ?? false };
    if (filter.status)       where['status']       = filter.status;
    if (filter.departmentId) where['departmentId'] = filter.departmentId;
    if (filter.submittedById) where['submittedById'] = filter.submittedById;
    if (filter.projectId)    where['projectId']    = filter.projectId;

    const limit  = filter.limit  ?? 50;
    const offset = filter.offset ?? 0;

    return this.prisma.orm.public.Kaizen
      .where(where)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async myKaizens(actorId: string, filter: KaizenFilterDto) {
    const where: Record<string, unknown> = {
      submittedById: actorId,
      isArchived:    false,
    };
    if (filter.status) where['status'] = filter.status;
    return this.prisma.orm.public.Kaizen
      .where(where)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(filter.limit ?? 50)
      .offset(filter.offset ?? 0)
      .all();
  }

  async get(id: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');

    const [categories, benefits, participants, attachments, reviews, implementation, results] =
      await Promise.all([
        this.prisma.orm.public.KaizenCategoryLink.where({ kaizenId: id }).all(),
        this.prisma.orm.public.KaizenBenefitLink.where({ kaizenId: id }).all(),
        this.prisma.orm.public.KaizenParticipant.where({ kaizenId: id }).all(),
        this.prisma.orm.public.KaizenAttachment.where({ kaizenId: id }).all(),
        this.prisma.orm.public.KaizenReview
          .where({ kaizenId: id })
          .orderBy(m => (m as any).reviewedAt.asc())
          .all(),
        this.prisma.orm.public.KaizenImplementation.where({ kaizenId: id }).first(),
        this.prisma.orm.public.KaizenResult.where({ kaizenId: id }).all(),
      ]);

    return { ...kaizen, categories, benefits, participants, attachments, reviews, implementation, results };
  }

  async create(dto: CreateKaizenDto, actorId: string) {
    if (!dto.declarationAccepted) {
      throw new BadRequestException('Declaration must be accepted');
    }

    // Snapshot employee info at time of submission
    const employee = await this.prisma.orm.public.Employee
      .where({ userId: actorId }).first() as any;

    const kaizenNumber = await this.generateKaizenNumber();

    const kaizen = await this.prisma.orm.public.Kaizen.create({
      id:                      uuidv4(),
      kaizenNumber:            kaizenNumber as any,
      title:                   dto.title as any,
      description:             dto.description,
      benefitDetails:          dto.benefitDetails,
      implementationSuggestion: dto.implementationSuggestion,
      additionalComments:      dto.additionalComments ?? null,
      signature:               dto.signature as any,
      declarationAccepted:     true,
      status:                  'DRAFT' as any,
      submittedById:           actorId,
      departmentId:            dto.departmentId ?? employee?.departmentId ?? null,
      sectionId:               dto.sectionId   ?? employee?.sectionId    ?? null,
      companyId:               dto.companyId   ?? employee?.companyId    ?? null,
      projectId:               dto.projectId   ?? null,
      snapshotName:            employee ? `${employee.firstName} ${employee.lastName}` as any : null,
      snapshotDepartment:      null,
      snapshotDesignation:     null,
      snapshotContact:         employee?.mobile ?? null,
      isArchived:              false,
      createdAt:               now() as any,
      updatedAt:               now() as any,
    } as any);

    const kaizenId = (kaizen as any).id;

    // Link categories
    if (dto.categoryIds?.length) {
      for (const categoryId of dto.categoryIds) {
        await this.prisma.orm.public.KaizenCategoryLink.create({
          id: uuidv4(), kaizenId, categoryId,
        } as any);
      }
    }

    // Link benefits
    if (dto.benefits?.length) {
      for (const benefit of dto.benefits) {
        await this.prisma.orm.public.KaizenBenefitLink.create({
          id: uuidv4(), kaizenId, benefit: benefit as any,
        } as any);
      }
    }

    // Add participants
    if (dto.participants?.length) {
      for (const p of dto.participants) {
        await this.prisma.orm.public.KaizenParticipant.create({
          id:                  uuidv4(),
          kaizenId,
          name:                p.name as any,
          departmentOrCompany: p.departmentOrCompany ?? null,
          createdAt:           now() as any,
        } as any);
      }
    }

    await this.logActivity(kaizenId, actorId, 'CREATED', {});
    return this.get(kaizenId);
  }

  async update(id: string, dto: UpdateKaizenDto, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    if (kaizen.submittedById !== actorId) throw new ForbiddenException('Not your Kaizen');
    if (kaizen.status !== 'DRAFT' && kaizen.status !== 'REWORK_REQUIRED') {
      throw new BadRequestException('Kaizen can only be edited in DRAFT or REWORK_REQUIRED status');
    }

    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.title !== undefined)                    changes['title']                    = dto.title as any;
    if (dto.description !== undefined)              changes['description']              = dto.description;
    if (dto.benefitDetails !== undefined)           changes['benefitDetails']           = dto.benefitDetails;
    if (dto.implementationSuggestion !== undefined) changes['implementationSuggestion'] = dto.implementationSuggestion;
    if (dto.additionalComments !== undefined)       changes['additionalComments']       = dto.additionalComments;
    if (dto.signature !== undefined)                changes['signature']                = dto.signature as any;
    if (dto.declarationAccepted !== undefined)      changes['declarationAccepted']      = dto.declarationAccepted;
    if (dto.projectId !== undefined)                changes['projectId']                = dto.projectId;

    await this.prisma.orm.public.Kaizen.where({ id }).update(changes as any);

    // Replace categories if provided
    if (dto.categoryIds !== undefined) {
      await this.prisma.orm.public.KaizenCategoryLink.where({ kaizenId: id }).delete();
      for (const categoryId of dto.categoryIds) {
        await this.prisma.orm.public.KaizenCategoryLink.create({
          id: uuidv4(), kaizenId: id, categoryId,
        } as any);
      }
    }

    // Replace benefits if provided
    if (dto.benefits !== undefined) {
      await this.prisma.orm.public.KaizenBenefitLink.where({ kaizenId: id }).delete();
      for (const benefit of dto.benefits) {
        await this.prisma.orm.public.KaizenBenefitLink.create({
          id: uuidv4(), kaizenId: id, benefit: benefit as any,
        } as any);
      }
    }

    // Replace participants if provided
    if (dto.participants !== undefined) {
      await this.prisma.orm.public.KaizenParticipant.where({ kaizenId: id }).delete();
      for (const p of dto.participants) {
        await this.prisma.orm.public.KaizenParticipant.create({
          id:                  uuidv4(),
          kaizenId:            id,
          name:                p.name as any,
          departmentOrCompany: p.departmentOrCompany ?? null,
          createdAt:           now() as any,
        } as any);
      }
    }

    await this.logActivity(id, actorId, 'EDITED', {});
    return this.get(id);
  }

  async submit(id: string, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    if (kaizen.submittedById !== actorId) throw new ForbiddenException('Not your Kaizen');
    if (kaizen.status !== 'DRAFT' && kaizen.status !== 'REWORK_REQUIRED') {
      throw new BadRequestException('Only DRAFT or REWORK_REQUIRED Kaizens can be submitted');
    }
    if (!kaizen.declarationAccepted) {
      throw new BadRequestException('Declaration must be accepted before submission');
    }

    await this.prisma.orm.public.Kaizen.where({ id }).update({
      status:      'SUBMITTED' as any,
      submittedAt: now() as any,
      updatedAt:   now() as any,
    } as any);

    await this.logActivity(id, actorId, 'SUBMITTED', {});
    return this.get(id);
  }

  async softDelete(id: string, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    if (kaizen.submittedById !== actorId) throw new ForbiddenException('Not your Kaizen');
    if (kaizen.status !== 'DRAFT') throw new BadRequestException('Only DRAFT Kaizens can be deleted');
    await this.prisma.orm.public.Kaizen.where({ id }).update({
      isArchived: true, archivedAt: now() as any, updatedAt: now() as any,
    } as any);
    await this.logActivity(id, actorId, 'DELETED', {});
    return { deleted: true };
  }

  async archive(id: string, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first();
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    await this.prisma.orm.public.Kaizen.where({ id }).update({
      isArchived: true, archivedAt: now() as any, updatedAt: now() as any,
    } as any);
    await this.logActivity(id, actorId, 'ARCHIVED', {});
    return { archived: true };
  }

  async restore(id: string, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first();
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    await this.prisma.orm.public.Kaizen.where({ id }).update({
      isArchived: false, archivedAt: null, updatedAt: now() as any,
    } as any);
    await this.logActivity(id, actorId, 'RESTORED', {});
    return { restored: true };
  }

  async cancel(id: string, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    const cancellable = ['DRAFT', 'SUBMITTED', 'HOD_REVIEW'];
    if (!cancellable.includes(kaizen.status)) {
      throw new BadRequestException('Cannot cancel a Kaizen in its current status');
    }
    await this.prisma.orm.public.Kaizen.where({ id }).update({
      status: 'CANCELLED' as any, updatedAt: now() as any,
    } as any);
    await this.logActivity(id, actorId, 'CANCELLED', {});
    return this.get(id);
  }

  // ─── HOD Review ───────────────────────────────────────────────────────────

  async hodReview(id: string, dto: HodReviewDto, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    if (!['SUBMITTED', 'HOD_REVIEW'].includes(kaizen.status)) {
      throw new BadRequestException('Kaizen is not ready for HOD review');
    }

    const decision = dto.decision.toUpperCase();
    let newStatus: string;
    if      (decision === 'APPROVE')              newStatus = 'DIRECTOR_REVIEW';
    else if (decision === 'REQUEST_REWORK')       newStatus = 'REWORK_REQUIRED';
    else if (decision === 'REJECT')               newStatus = 'REJECTED';
    else throw new BadRequestException('Invalid HOD review decision');

    await this.prisma.orm.public.KaizenReview.create({
      id:               uuidv4(),
      kaizenId:         id,
      reviewerId:       actorId,
      reviewerRole:     'HOD' as any,
      feasibilityScore: dto.feasibilityScore ?? null,
      impactScore:      dto.impactScore      ?? null,
      safetyScore:      dto.safetyScore      ?? null,
      estimatedSavings: dto.estimatedSavings ?? null,
      comments:         dto.comments         ?? null,
      decision:         decision as any,
      reviewedAt:       now() as any,
    } as any);

    await this.prisma.orm.public.Kaizen.where({ id }).update({
      status:     newStatus as any,
      reviewedAt: now() as any,
      updatedAt:  now() as any,
    } as any);

    await this.logActivity(id, actorId, 'HOD_REVIEWED', { decision, status: newStatus });
    return this.get(id);
  }

  // ─── Director Review ──────────────────────────────────────────────────────

  async directorReview(id: string, dto: DirectorReviewDto, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    if (kaizen.status !== 'DIRECTOR_REVIEW') {
      throw new BadRequestException('Kaizen is not in DIRECTOR_REVIEW status');
    }

    const decision = dto.decision.toUpperCase();
    let newStatus: string;
    if      (decision === 'APPROVE' || decision === 'APPROVE_FOR_IMPLEMENTATION')
                                          newStatus = 'APPROVED';
    else if (decision === 'REQUEST_REWORK') newStatus = 'REWORK_REQUIRED';
    else if (decision === 'REJECT')         newStatus = 'REJECTED';
    else throw new BadRequestException('Invalid Director review decision');

    await this.prisma.orm.public.KaizenReview.create({
      id:           uuidv4(),
      kaizenId:     id,
      reviewerId:   actorId,
      reviewerRole: 'DIRECTOR' as any,
      comments:     dto.comments ?? null,
      decision:     decision as any,
      reviewedAt:   now() as any,
    } as any);

    await this.prisma.orm.public.Kaizen.where({ id }).update({
      status:     newStatus as any,
      approvedAt: newStatus === 'APPROVED' ? now() as any : null,
      updatedAt:  now() as any,
    } as any);

    await this.logActivity(id, actorId, 'DIRECTOR_REVIEWED', { decision, status: newStatus });
    return this.get(id);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async listComments(kaizenId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).first();
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    return this.prisma.orm.public.KaizenComment
      .where({ kaizenId })
      .orderBy(m => (m as any).createdAt.asc())
      .all();
  }

  async addComment(kaizenId: string, dto: AddCommentDto, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).first();
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    const comment = await this.prisma.orm.public.KaizenComment.create({
      id:       uuidv4(),
      kaizenId,
      authorId: actorId,
      body:     dto.body,
      isEdited: false,
      createdAt: now() as any,
      updatedAt: now() as any,
    } as any);
    await this.logActivity(kaizenId, actorId, 'COMMENT_ADDED', {});
    return comment;
  }

  async updateComment(kaizenId: string, commentId: string, dto: UpdateCommentDto, actorId: string) {
    const comment = await this.prisma.orm.public.KaizenComment
      .where({ id: commentId, kaizenId }).first() as any;
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== actorId) throw new ForbiddenException('Not your comment');
    await this.prisma.orm.public.KaizenComment.where({ id: commentId }).update({
      body: dto.body, isEdited: true, editedAt: now() as any, updatedAt: now() as any,
    } as any);
    return this.prisma.orm.public.KaizenComment.where({ id: commentId }).first();
  }

  async deleteComment(kaizenId: string, commentId: string, actorId: string) {
    const comment = await this.prisma.orm.public.KaizenComment
      .where({ id: commentId, kaizenId }).first() as any;
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== actorId) throw new ForbiddenException('Not your comment');
    await this.prisma.orm.public.KaizenComment.where({ id: commentId }).update({
      deletedAt: now() as any,
    } as any);
    return { deleted: true };
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  async listAttachments(kaizenId: string) {
    return this.prisma.orm.public.KaizenAttachment.where({ kaizenId }).all();
  }

  async addAttachment(kaizenId: string, file: any, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');

    const { n: _kn } = await this.prisma.orm.public.KaizenAttachment.where({ kaizenId } as any).aggregate(agg => ({ n: agg.count() }));
    const count = Number(_kn);
    if (count >= 15) throw new BadRequestException('Maximum 15 attachments allowed per Kaizen');

    const att = await this.prisma.orm.public.KaizenAttachment.create({
      id:           uuidv4(),
      kaizenId,
      filename:     file.originalname as any,
      storageKey:   file.storageKey ?? file.path,
      mimeType:     file.mimetype   ?? null,
      size:         file.size       ?? null,
      version:      1,
      uploadedById: actorId,
      uploadedAt:   now() as any,
    } as any);

    await this.logActivity(kaizenId, actorId, 'ATTACHMENT_ADDED', { filename: file.originalname });
    return att;
  }

  async deleteAttachment(kaizenId: string, attachmentId: string, actorId: string) {
    const att = await this.prisma.orm.public.KaizenAttachment
      .where({ id: attachmentId, kaizenId }).first();
    if (!att) throw new NotFoundException('Attachment not found');
    await this.prisma.orm.public.KaizenAttachment.where({ id: attachmentId }).delete();
    await this.logActivity(kaizenId, actorId, 'ATTACHMENT_DELETED', { attachmentId });
    return { deleted: true };
  }

  // ─── Implementation ───────────────────────────────────────────────────────

  async getImplementation(kaizenId: string) {
    const impl = await this.prisma.orm.public.KaizenImplementation
      .where({ kaizenId }).first();
    if (!impl) throw new NotFoundException('Implementation record not found');
    return impl;
  }

  async createImplementation(kaizenId: string, dto: CreateKaizenImplementationDto, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    if (kaizen.status !== 'APPROVED') {
      throw new BadRequestException('Kaizen must be APPROVED before implementation can be tracked');
    }

    const existing = await this.prisma.orm.public.KaizenImplementation
      .where({ kaizenId }).first();
    if (existing) throw new BadRequestException('Implementation record already exists');

    const impl = await this.prisma.orm.public.KaizenImplementation.create({
      id:                  uuidv4(),
      kaizenId,
      ownerId:             dto.ownerId             ?? null,
      responsibleDeptId:   dto.responsibleDeptId   ?? null,
      startDate:           dto.startDate           ? new Date(dto.startDate)           as any : null,
      targetCompletionDate: dto.targetCompletionDate ? new Date(dto.targetCompletionDate) as any : null,
      requiredBudget:      dto.requiredBudget       ?? null,
      requiredResources:   dto.requiredResources    ?? null,
      status:              'IN_PROGRESS' as any,
      notes:               dto.notes               ?? null,
      createdAt:           now() as any,
      updatedAt:           now() as any,
    } as any);

    await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).update({
      status: 'IMPLEMENTATION' as any, updatedAt: now() as any,
    } as any);

    await this.logActivity(kaizenId, actorId, 'IMPLEMENTATION_STARTED', {});
    return impl;
  }

  async updateImplementation(kaizenId: string, dto: UpdateKaizenImplementationDto, actorId: string) {
    const impl = await this.prisma.orm.public.KaizenImplementation
      .where({ kaizenId }).first() as any;
    if (!impl) throw new NotFoundException('Implementation record not found');

    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.ownerId !== undefined)             changes['ownerId']             = dto.ownerId;
    if (dto.responsibleDeptId !== undefined)   changes['responsibleDeptId']   = dto.responsibleDeptId;
    if (dto.startDate !== undefined)           changes['startDate']           = new Date(dto.startDate) as any;
    if (dto.targetCompletionDate !== undefined) changes['targetCompletionDate'] = new Date(dto.targetCompletionDate) as any;
    if (dto.actualCompletionDate !== undefined) changes['actualCompletionDate'] = new Date(dto.actualCompletionDate) as any;
    if (dto.requiredBudget !== undefined)      changes['requiredBudget']      = dto.requiredBudget;
    if (dto.actualCost !== undefined)          changes['actualCost']          = dto.actualCost;
    if (dto.requiredResources !== undefined)   changes['requiredResources']   = dto.requiredResources;
    if (dto.status !== undefined)              changes['status']              = dto.status as any;
    if (dto.notes !== undefined)               changes['notes']               = dto.notes;

    await this.prisma.orm.public.KaizenImplementation.where({ id: impl.id }).update(changes as any);

    // If implementation completed, update Kaizen status
    if (dto.status === 'COMPLETED') {
      await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).update({
        status:          'IMPLEMENTED' as any,
        implementedAt:   now() as any,
        updatedAt:       now() as any,
      } as any);
      await this.logActivity(kaizenId, actorId, 'IMPLEMENTED', {});
    } else {
      await this.logActivity(kaizenId, actorId, 'IMPLEMENTATION_UPDATED', {});
    }

    return this.prisma.orm.public.KaizenImplementation.where({ id: impl.id }).first();
  }

  async closeKaizen(id: string, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id }).first() as any;
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    if (kaizen.status !== 'IMPLEMENTED') {
      throw new BadRequestException('Only IMPLEMENTED Kaizens can be closed');
    }
    await this.prisma.orm.public.Kaizen.where({ id }).update({
      status:    'CLOSED' as any,
      closedAt:  now() as any,
      updatedAt: now() as any,
    } as any);
    await this.logActivity(id, actorId, 'CLOSED', {});
    return this.get(id);
  }

  // ─── Results ──────────────────────────────────────────────────────────────

  async listResults(kaizenId: string) {
    return this.prisma.orm.public.KaizenResult.where({ kaizenId }).all();
  }

  async addResult(kaizenId: string, dto: AddKaizenResultDto, actorId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).first();
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    const result = await this.prisma.orm.public.KaizenResult.create({
      id:           uuidv4(),
      kaizenId,
      metric:       dto.metric as any,
      beforeValue:  dto.beforeValue  ?? null,
      afterValue:   dto.afterValue   ?? null,
      improvement:  dto.improvement  ?? null,
      unit:         dto.unit         ?? null,
      recordedById: actorId,
      recordedAt:   now() as any,
    } as any);
    await this.logActivity(kaizenId, actorId, 'RESULT_ADDED', { metric: dto.metric });
    return result;
  }

  async deleteResult(kaizenId: string, resultId: string, actorId: string) {
    const result = await this.prisma.orm.public.KaizenResult
      .where({ id: resultId, kaizenId }).first();
    if (!result) throw new NotFoundException('Result not found');
    await this.prisma.orm.public.KaizenResult.where({ id: resultId }).delete();
    await this.logActivity(kaizenId, actorId, 'RESULT_DELETED', { resultId });
    return { deleted: true };
  }

  // ─── Activity ─────────────────────────────────────────────────────────────

  async getActivity(kaizenId: string) {
    const kaizen = await this.prisma.orm.public.Kaizen.where({ id: kaizenId }).first();
    if (!kaizen) throw new NotFoundException('Kaizen not found');
    return this.prisma.orm.public.KaizenActivity
      .where({ kaizenId })
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  private async logActivity(kaizenId: string, actorId: string, event: string, meta: unknown) {
    await this.prisma.orm.public.KaizenActivity.create({
      id: uuidv4(), kaizenId, actorId, event: event as any, meta,
      createdAt: now() as any,
    } as any).catch(() => {});
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async getDashboard(actorId: string) {
    const [total, submitted, underReview, approved, implementation, implemented, rejected] =
      await Promise.all([
        this.prisma.orm.public.Kaizen.where({ submittedById: actorId } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
        this.prisma.orm.public.Kaizen.where({ submittedById: actorId, status: 'SUBMITTED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
        this.prisma.orm.public.Kaizen.where({ submittedById: actorId, status: 'HOD_REVIEW' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
        this.prisma.orm.public.Kaizen.where({ submittedById: actorId, status: 'APPROVED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
        this.prisma.orm.public.Kaizen.where({ submittedById: actorId, status: 'IMPLEMENTATION' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
        this.prisma.orm.public.Kaizen.where({ submittedById: actorId, status: 'IMPLEMENTED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
        this.prisma.orm.public.Kaizen.where({ submittedById: actorId, status: 'REJECTED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      ]);
    return {
      total: Number(total), submitted: Number(submitted), underReview: Number(underReview),
      approved: Number(approved), implementation: Number(implementation),
      implemented: Number(implemented), rejected: Number(rejected),
    };
  }

  async getAnalytics(companyId?: string) {
    const where: Record<string, unknown> = { isArchived: false };
    if (companyId) where['companyId'] = companyId;

    const [total, pendingHodReview, pendingDirectorReview, approved,
           implementation, implemented, rejected] = await Promise.all([
      this.prisma.orm.public.Kaizen.where(where as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Kaizen.where({ ...where, status: 'SUBMITTED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Kaizen.where({ ...where, status: 'DIRECTOR_REVIEW' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Kaizen.where({ ...where, status: 'APPROVED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Kaizen.where({ ...where, status: 'IMPLEMENTATION' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Kaizen.where({ ...where, status: 'IMPLEMENTED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Kaizen.where({ ...where, status: 'REJECTED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
    ]);

    return {
      total:                Number(total),
      pendingHodReview:     Number(pendingHodReview),
      pendingDirectorReview: Number(pendingDirectorReview),
      approved:             Number(approved),
      implementation:       Number(implementation),
      implemented:          Number(implemented),
      rejected:             Number(rejected),
      approvalRate:         Number(total) > 0
        ? Math.round((Number(approved) / Number(total)) * 100) : 0,
      implementationRate:   Number(approved) > 0
        ? Math.round((Number(implemented) / Number(approved)) * 100) : 0,
    };
  }
}
