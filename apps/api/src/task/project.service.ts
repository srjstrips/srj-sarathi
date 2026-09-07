import {
  Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateProjectDto, UpdateProjectDto, UpdateProjectStatusDto,
  UpdateProjectProgressDto, AddProjectMemberDto, UpdateProjectMemberDto,
  ProjectFilterDto,
} from './dto/project.dto.js';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Project CRUD ─────────────────────────────────────────────────────────

  async list(filter: ProjectFilterDto) {
    const where: Record<string, unknown> = { isArchived: filter.isArchived ?? false };
    if (filter.status)       where['status']       = filter.status;
    if (filter.priority)     where['priority']     = filter.priority;
    if (filter.companyId)    where['companyId']    = filter.companyId;
    if (filter.departmentId) where['departmentId'] = filter.departmentId;
    if (filter.managerId)    where['managerId']    = filter.managerId;

    const limit  = filter.limit  ?? 50;
    const offset = filter.offset ?? 0;

    return this.prisma.orm.public.Project
      .where(where)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async get(id: string) {
    const project = await this.prisma.orm.public.Project.where({ id }).first() as any;
    if (!project) throw new NotFoundException('Project not found');

    const [members, attachments, taskStats] = await Promise.all([
      this.prisma.orm.public.ProjectMember.where({ projectId: id }).all(),
      this.prisma.orm.public.ProjectAttachment.where({ projectId: id }).all(),
      this.getProjectTaskStats(id),
    ]);

    return { ...project, members, attachments, taskStats };
  }

  async create(dto: CreateProjectDto, actorId: string) {
    const exists = await this.prisma.orm.public.Project.where({ code: dto.code as any }).first();
    if (exists) throw new ConflictException(`Project code '${dto.code}' already exists`);

    const project = await this.prisma.orm.public.Project.create({
      id:           uuidv4(),
      name:         dto.name as any,
      code:         dto.code as any,
      description:  dto.description ?? null,
      companyId:    dto.companyId,
      departmentId: dto.departmentId ?? null,
      managerId:    dto.managerId,
      status:       'PLANNING' as any,
      priority:     (dto.priority ?? 'MEDIUM') as any,
      startDate:    dto.startDate ? new Date(dto.startDate) as any : null,
      endDate:      dto.endDate   ? new Date(dto.endDate)   as any : null,
      progress:     0,
      isArchived:   false,
      createdById:  actorId,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);

    // Add creator as manager member
    await this.prisma.orm.public.ProjectMember.create({
      id:        uuidv4(),
      projectId: (project as any).id,
      userId:    actorId,
      role:      'PROJECT_MANAGER' as any,
      addedById: actorId,
      addedAt:   now() as any,
    } as any);

    // Add additional members
    if (dto.memberIds?.length) {
      for (const userId of dto.memberIds) {
        if (userId === actorId) continue;
        await this.prisma.orm.public.ProjectMember.create({
          id:        uuidv4(),
          projectId: (project as any).id,
          userId,
          role:      'CONTRIBUTOR' as any,
          addedById: actorId,
          addedAt:   now() as any,
        } as any);
      }
    }

    await this.logProjectActivity((project as any).id, actorId, 'CREATED', {});
    return project;
  }

  async update(id: string, dto: UpdateProjectDto, actorId: string) {
    const project = await this.prisma.orm.public.Project.where({ id }).first();
    if (!project) throw new NotFoundException('Project not found');

    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.name !== undefined)         changes['name']         = dto.name as any;
    if (dto.description !== undefined)  changes['description']  = dto.description;
    if (dto.departmentId !== undefined) changes['departmentId'] = dto.departmentId;
    if (dto.managerId !== undefined)    changes['managerId']    = dto.managerId;
    if (dto.priority !== undefined)     changes['priority']     = dto.priority as any;
    if (dto.status !== undefined)       changes['status']       = dto.status as any;
    if (dto.startDate !== undefined)    changes['startDate']    = new Date(dto.startDate) as any;
    if (dto.endDate !== undefined)      changes['endDate']      = new Date(dto.endDate) as any;

    await this.prisma.orm.public.Project.where({ id }).update(changes as any);
    await this.logProjectActivity(id, actorId, 'EDITED', {});
    return this.get(id);
  }

  async updateStatus(id: string, dto: UpdateProjectStatusDto, actorId: string) {
    const project = await this.prisma.orm.public.Project.where({ id }).first() as any;
    if (!project) throw new NotFoundException('Project not found');

    const changes: Record<string, unknown> = {
      status:    dto.status as any,
      updatedAt: now() as any,
    };
    if (dto.status === 'COMPLETED') changes['completedAt'] = now() as any;

    await this.prisma.orm.public.Project.where({ id }).update(changes as any);
    await this.logProjectActivity(id, actorId, 'STATUS_CHANGED', {
      from: project.status, to: dto.status,
    });
    return this.get(id);
  }

  async updateProgress(id: string, dto: UpdateProjectProgressDto, actorId: string) {
    const project = await this.prisma.orm.public.Project.where({ id }).first();
    if (!project) throw new NotFoundException('Project not found');
    await this.prisma.orm.public.Project.where({ id }).update({
      progress:  dto.progress,
      updatedAt: now() as any,
    } as any);
    await this.logProjectActivity(id, actorId, 'PROGRESS_UPDATED', { progress: dto.progress });
    return this.get(id);
  }

  async recalculateProgress(id: string, actorId: string) {
    const stats = await this.getProjectTaskStats(id);
    if (stats.total === 0) return this.get(id);

    const progress = Math.round((Number(stats.completed) / Number(stats.total)) * 100);
    await this.prisma.orm.public.Project.where({ id }).update({
      progress, updatedAt: now() as any,
    } as any);
    await this.logProjectActivity(id, actorId, 'PROGRESS_RECALCULATED', { progress });
    return this.get(id);
  }

  async archive(id: string, actorId: string) {
    const project = await this.prisma.orm.public.Project.where({ id }).first();
    if (!project) throw new NotFoundException('Project not found');
    await this.prisma.orm.public.Project.where({ id }).update({
      isArchived:   true,
      archivedAt:   now() as any,
      archivedById: actorId,
      updatedAt:    now() as any,
    } as any);
    await this.logProjectActivity(id, actorId, 'ARCHIVED', {});
    return { archived: true };
  }

  async restore(id: string, actorId: string) {
    const project = await this.prisma.orm.public.Project.where({ id }).first();
    if (!project) throw new NotFoundException('Project not found');
    await this.prisma.orm.public.Project.where({ id }).update({
      isArchived:   false,
      archivedAt:   null,
      archivedById: null,
      updatedAt:    now() as any,
    } as any);
    await this.logProjectActivity(id, actorId, 'RESTORED', {});
    return { restored: true };
  }

  async duplicate(id: string, actorId: string) {
    const project = await this.get(id) as any;

    const newCode = `${project.code}-COPY-${Date.now().toString().slice(-4)}`;
    const newProject = await this.create({
      name:         `${project.name} (Copy)`,
      code:         newCode,
      description:  project.description,
      companyId:    project.companyId,
      departmentId: project.departmentId,
      managerId:    actorId,
      priority:     project.priority,
      startDate:    project.startDate,
      endDate:      project.endDate,
    }, actorId);

    return newProject;
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  async listMembers(projectId: string) {
    const project = await this.prisma.orm.public.Project.where({ id: projectId }).first();
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.orm.public.ProjectMember.where({ projectId }).all();
  }

  async addMember(projectId: string, dto: AddProjectMemberDto, actorId: string) {
    const project = await this.prisma.orm.public.Project.where({ id: projectId }).first();
    if (!project) throw new NotFoundException('Project not found');

    const exists = await this.prisma.orm.public.ProjectMember
      .where({ projectId, userId: dto.userId }).first();
    if (exists) throw new ConflictException('User is already a member');

    const member = await this.prisma.orm.public.ProjectMember.create({
      id:        uuidv4(),
      projectId,
      userId:    dto.userId,
      role:      (dto.role ?? 'CONTRIBUTOR') as any,
      addedById: actorId,
      addedAt:   now() as any,
    } as any);

    await this.logProjectActivity(projectId, actorId, 'MEMBER_ADDED', { userId: dto.userId });
    return member;
  }

  async updateMemberRole(projectId: string, memberId: string, dto: UpdateProjectMemberDto, actorId: string) {
    const member = await this.prisma.orm.public.ProjectMember
      .where({ id: memberId, projectId }).first();
    if (!member) throw new NotFoundException('Member not found');
    await this.prisma.orm.public.ProjectMember.where({ id: memberId }).update({
      role: dto.role as any,
    } as any);
    await this.logProjectActivity(projectId, actorId, 'MEMBER_ROLE_UPDATED', {
      memberId, role: dto.role,
    });
    return this.prisma.orm.public.ProjectMember.where({ id: memberId }).first();
  }

  async removeMember(projectId: string, memberId: string, actorId: string) {
    const member = await this.prisma.orm.public.ProjectMember
      .where({ id: memberId, projectId }).first();
    if (!member) throw new NotFoundException('Member not found');
    await this.prisma.orm.public.ProjectMember.where({ id: memberId }).delete();
    await this.logProjectActivity(projectId, actorId, 'MEMBER_REMOVED', { memberId });
    return { removed: true };
  }

  // ─── Tasks within project ─────────────────────────────────────────────────

  async getProjectTasks(projectId: string) {
    const project = await this.prisma.orm.public.Project.where({ id: projectId }).first();
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.orm.public.Task
      .where({ projectId })
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  async listAttachments(projectId: string) {
    return this.prisma.orm.public.ProjectAttachment.where({ projectId }).all();
  }

  async addAttachment(projectId: string, file: any, actorId: string) {
    const project = await this.prisma.orm.public.Project.where({ id: projectId }).first();
    if (!project) throw new NotFoundException('Project not found');

    const att = await this.prisma.orm.public.ProjectAttachment.create({
      id:           uuidv4(),
      projectId,
      filename:     file.originalname as any,
      storageKey:   file.storageKey ?? file.path,
      mimeType:     file.mimetype ?? null,
      size:         file.size ?? null,
      uploadedById: actorId,
      uploadedAt:   now() as any,
    } as any);

    await this.logProjectActivity(projectId, actorId, 'ATTACHMENT_ADDED', {
      filename: file.originalname,
    });
    return att;
  }

  async deleteAttachment(projectId: string, attachmentId: string, actorId: string) {
    const att = await this.prisma.orm.public.ProjectAttachment
      .where({ id: attachmentId, projectId }).first();
    if (!att) throw new NotFoundException('Attachment not found');
    await this.prisma.orm.public.ProjectAttachment.where({ id: attachmentId }).delete();
    await this.logProjectActivity(projectId, actorId, 'ATTACHMENT_DELETED', { attachmentId });
    return { deleted: true };
  }

  // ─── Activity ─────────────────────────────────────────────────────────────

  async getActivity(projectId: string) {
    const project = await this.prisma.orm.public.Project.where({ id: projectId }).first();
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.orm.public.ProjectActivity
      .where({ projectId })
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  private async logProjectActivity(projectId: string, actorId: string, event: string, meta: unknown) {
    await this.prisma.orm.public.ProjectActivity.create({
      id:        uuidv4(),
      projectId,
      actorId,
      event:     event as any,
      meta,
      createdAt: now() as any,
    } as any).catch(() => {});
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async getProjectTaskStats(projectId: string) {
    const [total, completed, inProgress, pending, overdue] = await Promise.all([
      this.prisma.orm.public.Task.where({ projectId } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Task.where({ projectId, status: 'COMPLETED' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Task.where({ projectId, status: 'IN_PROGRESS' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Task.where({ projectId, status: 'PENDING' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
      this.prisma.orm.public.Task.where({ projectId, status: 'OVERDUE' as any } as any).aggregate(agg => ({ n: agg.count() })).then(r => Number(r.n)),
    ]);
    return {
      total:      Number(total),
      completed:  Number(completed),
      inProgress: Number(inProgress),
      pending:    Number(pending),
      overdue:    Number(overdue),
    };
  }

  async getAnalytics(companyId?: string) {
    const where: Record<string, unknown> = { isArchived: false };
    if (companyId) where['companyId'] = companyId;

    const projects = await this.prisma.orm.public.Project
      .where(where)
      .orderBy(m => (m as any).createdAt.desc())
      .all() as any[];

    const results = await Promise.all(
      projects.map(async (p: any) => {
        const stats = await this.getProjectTaskStats(p.id);
        return {
          id:       p.id,
          name:     p.name,
          status:   p.status,
          progress: p.progress,
          ...stats,
        };
      }),
    );

    return results;
  }
}
