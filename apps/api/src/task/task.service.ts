import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, UpdateTaskProgressDto,
  AssignTaskDto, AddChecklistItemDto, UpdateChecklistItemDto,
  AddCommentDto, UpdateCommentDto, AddDependencyDto, AddReminderDto, TaskFilterDto,
} from './dto/task.dto.js';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Task number generation ───────────────────────────────────────────────

  private async generateTaskNumber(): Promise<string> {
    const count = Number(await this.prisma.orm.public.Task.count());
    return `TASK-${String(count + 1).padStart(6, '0')}`;
  }

  // ─── Task CRUD ────────────────────────────────────────────────────────────

  async list(filter: TaskFilterDto, actorId: string) {
    const where: Record<string, unknown> = { isArchived: filter.isArchived ?? false };
    if (filter.status)       where['status']       = filter.status;
    if (filter.priority)     where['priority']     = filter.priority;
    if (filter.taskType)     where['taskType']     = filter.taskType;
    if (filter.projectId)    where['projectId']    = filter.projectId;
    if (filter.departmentId) where['departmentId'] = filter.departmentId;
    if (filter.parentId)     where['parentId']     = filter.parentId;
    if (filter.isPersonal !== undefined) where['isPersonal'] = filter.isPersonal;
    if (filter.createdById)  where['createdById']  = filter.createdById;

    const limit  = filter.limit  ?? 50;
    const offset = filter.offset ?? 0;

    return this.prisma.orm.public.Task
      .where(where)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async myTasks(actorId: string, filter: TaskFilterDto) {
    // Tasks assigned to the actor
    const assignments = await this.prisma.orm.public.TaskAssignee
      .where({ userId: actorId })
      .all() as any[];

    const taskIds = assignments.map((a: any) => a.taskId);
    if (taskIds.length === 0) return [];

    const where: Record<string, unknown> = { isArchived: false };
    if (filter.status) where['status'] = filter.status;

    const tasks = await this.prisma.orm.public.Task
      .where(where)
      .orderBy(m => (m as any).createdAt.desc())
      .all() as any[];

    return tasks.filter((t: any) => taskIds.includes(t.id));
  }

  async get(id: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first() as any;
    if (!task) throw new NotFoundException('Task not found');

    const [assignees, checklists, attachments, watchers, dependencies] = await Promise.all([
      this.prisma.orm.public.TaskAssignee.where({ taskId: id }).all(),
      this.prisma.orm.public.TaskChecklist.where({ taskId: id })
        .orderBy(m => (m as any).displayOrder.asc()).all(),
      this.prisma.orm.public.TaskAttachment.where({ taskId: id }).all(),
      this.prisma.orm.public.TaskWatcher.where({ taskId: id }).all(),
      this.prisma.orm.public.TaskDependency.where({ taskId: id }).all(),
    ]);

    return { ...task, assignees, checklists, attachments, watchers, dependencies };
  }

  async create(dto: CreateTaskDto, actorId: string) {
    if (dto.parentId) {
      const parent = await this.prisma.orm.public.Task.where({ id: dto.parentId }).first();
      if (!parent) throw new BadRequestException('Parent task not found');
    }
    if (dto.projectId) {
      const project = await this.prisma.orm.public.Project.where({ id: dto.projectId }).first();
      if (!project) throw new BadRequestException('Project not found');
    }

    const taskNumber = await this.generateTaskNumber();

    const task = await this.prisma.orm.public.Task.create({
      id:              uuidv4(),
      taskNumber,
      title:           dto.title as any,
      description:     dto.description ?? null,
      taskType:        (dto.taskType ?? 'ASSIGNED') as any,
      status:          'DRAFT' as any,
      priority:        (dto.priority ?? 'MEDIUM') as any,
      progress:        0,
      projectId:       dto.projectId ?? null,
      parentId:        dto.parentId ?? null,
      departmentId:    dto.departmentId ?? null,
      companyId:       dto.companyId ?? null,
      startDate:       dto.startDate ? new Date(dto.startDate) as any : null,
      dueDate:         dto.dueDate ? new Date(dto.dueDate) as any : null,
      requiresApproval: dto.requiresApproval ?? false,
      isPersonal:      dto.isPersonal ?? false,
      isRecurring:     dto.isRecurring ?? false,
      recurringRule:   dto.recurringRule ?? null,
      isArchived:      false,
      createdById:     actorId,
      createdAt:       now() as any,
      updatedAt:       now() as any,
    } as any);

    // Create assignees
    if (dto.assigneeIds?.length) {
      for (const userId of dto.assigneeIds) {
        await this.prisma.orm.public.TaskAssignee.create({
          id:          uuidv4(),
          taskId:      (task as any).id,
          userId,
          assignedById: actorId,
          assignedAt:  now() as any,
        } as any);
      }
      await this.logTaskActivity((task as any).id, actorId, 'CREATED_AND_ASSIGNED', {
        assignees: dto.assigneeIds,
      });
    } else {
      await this.logTaskActivity((task as any).id, actorId, 'CREATED', {});
    }

    // Create checklist items
    if (dto.checklistItems?.length) {
      for (let i = 0; i < dto.checklistItems.length; i++) {
        const item = dto.checklistItems[i];
        await this.prisma.orm.public.TaskChecklist.create({
          id:           uuidv4(),
          taskId:       (task as any).id,
          title:        item.title as any,
          isCompleted:  false,
          assignedToId: item.assignedToId ?? null,
          dueDate:      item.dueDate ? new Date(item.dueDate) as any : null,
          displayOrder: i,
          createdAt:    now() as any,
          updatedAt:    now() as any,
        } as any);
      }
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first() as any;
    if (!task) throw new NotFoundException('Task not found');

    const changes: Record<string, unknown> = { updatedAt: now() as any };
    const meta: Record<string, unknown> = {};

    if (dto.title !== undefined)       { changes['title'] = dto.title as any; meta['title'] = [task.title, dto.title]; }
    if (dto.description !== undefined) { changes['description'] = dto.description; }
    if (dto.taskType !== undefined)    { changes['taskType'] = dto.taskType as any; }
    if (dto.priority !== undefined)    { changes['priority'] = dto.priority as any; meta['priority'] = [task.priority, dto.priority]; }
    if (dto.projectId !== undefined)   { changes['projectId'] = dto.projectId; }
    if (dto.parentId !== undefined)    { changes['parentId'] = dto.parentId; }
    if (dto.departmentId !== undefined){ changes['departmentId'] = dto.departmentId; }
    if (dto.companyId !== undefined)   { changes['companyId'] = dto.companyId; }
    if (dto.startDate !== undefined)   { changes['startDate'] = new Date(dto.startDate) as any; }
    if (dto.dueDate !== undefined)     { changes['dueDate'] = new Date(dto.dueDate) as any; meta['dueDate'] = [task.dueDate, dto.dueDate]; }
    if (dto.requiresApproval !== undefined) { changes['requiresApproval'] = dto.requiresApproval; }
    if (dto.isRecurring !== undefined) { changes['isRecurring'] = dto.isRecurring; }
    if (dto.recurringRule !== undefined){ changes['recurringRule'] = dto.recurringRule; }

    await this.prisma.orm.public.Task.where({ id }).update(changes as any);
    await this.logTaskActivity(id, actorId, 'EDITED', meta);

    return this.get(id);
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first() as any;
    if (!task) throw new NotFoundException('Task not found');

    const updates: Record<string, unknown> = {
      status:    dto.status as any,
      updatedAt: now() as any,
    };
    if (dto.status === 'COMPLETED') updates['completedAt'] = now() as any;

    await this.prisma.orm.public.Task.where({ id }).update(updates as any);
    await this.logTaskActivity(id, actorId, 'STATUS_CHANGED', {
      from: task.status, to: dto.status, note: dto.note,
    });

    return this.get(id);
  }

  async updateProgress(id: string, dto: UpdateTaskProgressDto, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first() as any;
    if (!task) throw new NotFoundException('Task not found');

    await this.prisma.orm.public.Task.where({ id }).update({
      progress:  dto.progress,
      updatedAt: now() as any,
    } as any);
    await this.logTaskActivity(id, actorId, 'PROGRESS_UPDATED', {
      from: task.progress, to: dto.progress,
    });
    return this.get(id);
  }

  async duplicate(id: string, actorId: string) {
    const task = await this.get(id) as any;
    const taskNumber = await this.generateTaskNumber();

    const newTask = await this.prisma.orm.public.Task.create({
      id:              uuidv4(),
      taskNumber,
      title:           `${task.title} (Copy)` as any,
      description:     task.description,
      taskType:        task.taskType,
      status:          'DRAFT' as any,
      priority:        task.priority,
      progress:        0,
      projectId:       task.projectId,
      parentId:        task.parentId,
      departmentId:    task.departmentId,
      companyId:       task.companyId,
      startDate:       task.startDate,
      dueDate:         task.dueDate,
      requiresApproval: task.requiresApproval,
      isPersonal:      task.isPersonal,
      isRecurring:     task.isRecurring,
      recurringRule:   task.recurringRule,
      isArchived:      false,
      createdById:     actorId,
      createdAt:       now() as any,
      updatedAt:       now() as any,
    } as any);

    await this.logTaskActivity((newTask as any).id, actorId, 'CREATED', { duplicatedFrom: id });
    return newTask;
  }

  async archive(id: string, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first();
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.orm.public.Task.where({ id }).update({
      isArchived:   true,
      archivedAt:   now() as any,
      archivedById: actorId,
      updatedAt:    now() as any,
    } as any);
    await this.logTaskActivity(id, actorId, 'ARCHIVED', {});
    return { archived: true };
  }

  async restore(id: string, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first();
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.orm.public.Task.where({ id }).update({
      isArchived:   false,
      archivedAt:   null,
      archivedById: null,
      updatedAt:    now() as any,
    } as any);
    await this.logTaskActivity(id, actorId, 'RESTORED', {});
    return { restored: true };
  }

  async softDelete(id: string, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first();
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.orm.public.Task.where({ id }).update({
      isArchived: true,
      archivedAt: now() as any,
      archivedById: actorId,
      status:     'CANCELLED' as any,
      updatedAt:  now() as any,
    } as any);
    await this.logTaskActivity(id, actorId, 'DELETED', {});
    return { deleted: true };
  }

  // ─── Assignees ────────────────────────────────────────────────────────────

  async assign(id: string, dto: AssignTaskDto, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id }).first();
    if (!task) throw new NotFoundException('Task not found');

    const results: any[] = [];
    for (const userId of dto.userIds) {
      const exists = await this.prisma.orm.public.TaskAssignee
        .where({ taskId: id, userId }).first();
      if (exists) { results.push({ userId, ok: false, error: 'Already assigned' }); continue; }

      await this.prisma.orm.public.TaskAssignee.create({
        id:          uuidv4(),
        taskId:      id,
        userId,
        assignedById: actorId,
        assignedAt:  now() as any,
      } as any);
      results.push({ userId, ok: true });
    }

    await this.logTaskActivity(id, actorId, 'ASSIGNED', { userIds: dto.userIds });

    // Move to ASSIGNED status if in DRAFT
    const currentTask = await this.prisma.orm.public.Task.where({ id }).first() as any;
    if (currentTask?.status === 'DRAFT') {
      await this.prisma.orm.public.Task.where({ id }).update({
        status: 'ASSIGNED' as any, updatedAt: now() as any,
      } as any);
    }

    return results;
  }

  async unassign(id: string, userId: string, actorId: string) {
    const record = await this.prisma.orm.public.TaskAssignee
      .where({ taskId: id, userId }).first();
    if (!record) throw new NotFoundException('Assignee not found');
    await this.prisma.orm.public.TaskAssignee.where({ taskId: id, userId }).delete();
    await this.logTaskActivity(id, actorId, 'UNASSIGNED', { userId });
    return { unassigned: true };
  }

  async acknowledge(id: string, actorId: string) {
    const assignee = await this.prisma.orm.public.TaskAssignee
      .where({ taskId: id, userId: actorId }).first();
    if (!assignee) throw new ForbiddenException('You are not assigned to this task');
    await this.prisma.orm.public.TaskAssignee
      .where({ taskId: id, userId: actorId })
      .update({ acknowledgedAt: now() as any } as any);
    await this.prisma.orm.public.Task.where({ id }).update({
      status: 'ACKNOWLEDGED' as any, updatedAt: now() as any,
    } as any);
    await this.logTaskActivity(id, actorId, 'ACKNOWLEDGED', {});
    return { acknowledged: true };
  }

  // ─── Checklist ────────────────────────────────────────────────────────────

  async getChecklists(taskId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orm.public.TaskChecklist
      .where({ taskId })
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async addChecklistItem(taskId: string, dto: AddChecklistItemDto, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');

    const count = await this.prisma.orm.public.TaskChecklist.where({ taskId }).count();

    const item = await this.prisma.orm.public.TaskChecklist.create({
      id:           uuidv4(),
      taskId,
      title:        dto.title as any,
      isCompleted:  false,
      assignedToId: dto.assignedToId ?? null,
      dueDate:      dto.dueDate ? new Date(dto.dueDate) as any : null,
      displayOrder: count,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);

    await this.logTaskActivity(taskId, actorId, 'CHECKLIST_ITEM_ADDED', { title: dto.title });
    return item;
  }

  async updateChecklistItem(taskId: string, itemId: string, dto: UpdateChecklistItemDto, actorId: string) {
    const item = await this.prisma.orm.public.TaskChecklist
      .where({ id: itemId, taskId }).first() as any;
    if (!item) throw new NotFoundException('Checklist item not found');

    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.title !== undefined)       changes['title']       = dto.title as any;
    if (dto.assignedToId !== undefined) changes['assignedToId'] = dto.assignedToId;
    if (dto.dueDate !== undefined)     changes['dueDate']     = new Date(dto.dueDate) as any;
    if (dto.displayOrder !== undefined) changes['displayOrder'] = dto.displayOrder;

    if (dto.isCompleted !== undefined) {
      changes['isCompleted']   = dto.isCompleted;
      changes['completedAt']   = dto.isCompleted ? now() as any : null;
      changes['completedById'] = dto.isCompleted ? actorId : null;
    }

    await this.prisma.orm.public.TaskChecklist.where({ id: itemId }).update(changes as any);

    if (dto.isCompleted !== undefined) {
      await this.logTaskActivity(taskId, actorId,
        dto.isCompleted ? 'CHECKLIST_ITEM_COMPLETED' : 'CHECKLIST_ITEM_REOPENED',
        { itemId, title: item.title });

      // Recalculate task progress from checklist
      await this.recalculateProgressFromChecklist(taskId, actorId);
    }

    return this.prisma.orm.public.TaskChecklist.where({ id: itemId }).first();
  }

  async deleteChecklistItem(taskId: string, itemId: string, actorId: string) {
    const item = await this.prisma.orm.public.TaskChecklist
      .where({ id: itemId, taskId }).first();
    if (!item) throw new NotFoundException('Checklist item not found');
    await this.prisma.orm.public.TaskChecklist.where({ id: itemId }).delete();
    await this.logTaskActivity(taskId, actorId, 'CHECKLIST_ITEM_DELETED', { itemId });
    return { deleted: true };
  }

  private async recalculateProgressFromChecklist(taskId: string, actorId: string) {
    const all = await this.prisma.orm.public.TaskChecklist.where({ taskId }).all() as any[];
    if (!all.length) return;
    const completed = all.filter((i: any) => i.isCompleted).length;
    const progress = Math.round((completed / all.length) * 100);
    await this.prisma.orm.public.Task.where({ id: taskId }).update({
      progress, updatedAt: now() as any,
    } as any);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  async listComments(taskId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orm.public.TaskComment
      .where({ taskId })
      .orderBy(m => (m as any).createdAt.asc())
      .all();
  }

  async addComment(taskId: string, dto: AddCommentDto, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');

    const comment = await this.prisma.orm.public.TaskComment.create({
      id:       uuidv4(),
      taskId,
      authorId: actorId,
      body:     dto.body,
      isEdited: false,
      createdAt: now() as any,
      updatedAt: now() as any,
    } as any);

    await this.logTaskActivity(taskId, actorId, 'COMMENT_ADDED', {
      commentId: (comment as any).id,
    });
    return comment;
  }

  async updateComment(taskId: string, commentId: string, dto: UpdateCommentDto, actorId: string) {
    const comment = await this.prisma.orm.public.TaskComment
      .where({ id: commentId, taskId }).first() as any;
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== actorId) throw new ForbiddenException('Not your comment');

    await this.prisma.orm.public.TaskComment.where({ id: commentId }).update({
      body:     dto.body,
      isEdited: true,
      editedAt: now() as any,
      updatedAt: now() as any,
    } as any);
    return this.prisma.orm.public.TaskComment.where({ id: commentId }).first();
  }

  async deleteComment(taskId: string, commentId: string, actorId: string) {
    const comment = await this.prisma.orm.public.TaskComment
      .where({ id: commentId, taskId }).first() as any;
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== actorId) throw new ForbiddenException('Not your comment');
    await this.prisma.orm.public.TaskComment.where({ id: commentId }).update({
      deletedAt: now() as any,
    } as any);
    return { deleted: true };
  }

  // ─── Attachments ──────────────────────────────────────────────────────────

  async listAttachments(taskId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orm.public.TaskAttachment.where({ taskId }).all();
  }

  async addAttachment(taskId: string, file: any, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');

    // Files stored in object storage; file.storageKey supplied by upload middleware
    const attachment = await this.prisma.orm.public.TaskAttachment.create({
      id:           uuidv4(),
      taskId,
      filename:     file.originalname as any,
      storageKey:   file.storageKey ?? file.path,
      mimeType:     file.mimetype ?? null,
      size:         file.size ?? null,
      version:      1,
      uploadedById: actorId,
      uploadedAt:   now() as any,
    } as any);

    await this.logTaskActivity(taskId, actorId, 'ATTACHMENT_ADDED', {
      filename: file.originalname,
    });
    return attachment;
  }

  async deleteAttachment(taskId: string, attachmentId: string, actorId: string) {
    const att = await this.prisma.orm.public.TaskAttachment
      .where({ id: attachmentId, taskId }).first();
    if (!att) throw new NotFoundException('Attachment not found');
    await this.prisma.orm.public.TaskAttachment.where({ id: attachmentId }).delete();
    await this.logTaskActivity(taskId, actorId, 'ATTACHMENT_DELETED', { attachmentId });
    return { deleted: true };
  }

  // ─── Dependencies ─────────────────────────────────────────────────────────

  async listDependencies(taskId: string) {
    return this.prisma.orm.public.TaskDependency.where({ taskId }).all();
  }

  async addDependency(taskId: string, dto: AddDependencyDto, actorId: string) {
    if (taskId === dto.dependsOnTaskId) {
      throw new BadRequestException('A task cannot depend on itself');
    }
    const exists = await this.prisma.orm.public.TaskDependency
      .where({ taskId, dependsOnTaskId: dto.dependsOnTaskId }).first();
    if (exists) throw new BadRequestException('Dependency already exists');

    const dep = await this.prisma.orm.public.TaskDependency.create({
      id:              uuidv4(),
      taskId,
      dependsOnTaskId: dto.dependsOnTaskId,
      dependencyType:  (dto.dependencyType ?? 'BLOCKED_BY') as any,
      createdById:     actorId,
      createdAt:       now() as any,
    } as any);

    await this.logTaskActivity(taskId, actorId, 'DEPENDENCY_ADDED', {
      dependsOn: dto.dependsOnTaskId, type: dto.dependencyType,
    });
    return dep;
  }

  async removeDependency(taskId: string, depId: string, actorId: string) {
    const dep = await this.prisma.orm.public.TaskDependency
      .where({ id: depId, taskId }).first();
    if (!dep) throw new NotFoundException('Dependency not found');
    await this.prisma.orm.public.TaskDependency.where({ id: depId }).delete();
    await this.logTaskActivity(taskId, actorId, 'DEPENDENCY_REMOVED', { depId });
    return { removed: true };
  }

  // ─── Watchers ─────────────────────────────────────────────────────────────

  async watch(taskId: string, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');
    const exists = await this.prisma.orm.public.TaskWatcher
      .where({ taskId, userId: actorId }).first();
    if (exists) return { watching: true };
    await this.prisma.orm.public.TaskWatcher.create({
      id: uuidv4(), taskId, userId: actorId, addedAt: now() as any,
    } as any);
    return { watching: true };
  }

  async unwatch(taskId: string, actorId: string) {
    await this.prisma.orm.public.TaskWatcher
      .where({ taskId, userId: actorId }).delete();
    return { watching: false };
  }

  // ─── Reminders ────────────────────────────────────────────────────────────

  async addReminder(taskId: string, dto: AddReminderDto, actorId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orm.public.TaskReminder.create({
      id:       uuidv4(),
      taskId,
      userId:   actorId,
      remindAt: new Date(dto.remindAt) as any,
      isSent:   false,
      createdAt: now() as any,
    } as any);
  }

  async deleteReminder(taskId: string, reminderId: string, actorId: string) {
    const reminder = await this.prisma.orm.public.TaskReminder
      .where({ id: reminderId, taskId, userId: actorId }).first();
    if (!reminder) throw new NotFoundException('Reminder not found');
    await this.prisma.orm.public.TaskReminder.where({ id: reminderId }).delete();
    return { deleted: true };
  }

  // ─── Activity ─────────────────────────────────────────────────────────────

  async getActivity(taskId: string) {
    const task = await this.prisma.orm.public.Task.where({ id: taskId }).first();
    if (!task) throw new NotFoundException('Task not found');
    return this.prisma.orm.public.TaskActivity
      .where({ taskId })
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  private async logTaskActivity(taskId: string, actorId: string, event: string, meta: unknown) {
    await this.prisma.orm.public.TaskActivity.create({
      id:       uuidv4(),
      taskId,
      actorId,
      event:    event as any,
      meta,
      createdAt: now() as any,
    } as any).catch(() => {});
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async getAnalytics(companyId?: string) {
    const baseFilter: Record<string, unknown> = {};
    if (companyId) baseFilter['companyId'] = companyId;

    const [total, completed, inProgress, pending, cancelled] = await Promise.all([
      this.prisma.orm.public.Task.where({ ...baseFilter, isArchived: false }).count(),
      this.prisma.orm.public.Task.where({ ...baseFilter, status: 'COMPLETED' as any }).count(),
      this.prisma.orm.public.Task.where({ ...baseFilter, status: 'IN_PROGRESS' as any }).count(),
      this.prisma.orm.public.Task.where({ ...baseFilter, status: 'PENDING' as any }).count(),
      this.prisma.orm.public.Task.where({ ...baseFilter, status: 'CANCELLED' as any }).count(),
    ]);

    const t = Number(total);
    const c = Number(completed);
    const completionRate = t > 0 ? Math.round((c / t) * 100) : 0;

    return { total: t, completed: c, inProgress: Number(inProgress), pending: Number(pending), cancelled: Number(cancelled), completionRate };
  }
}
