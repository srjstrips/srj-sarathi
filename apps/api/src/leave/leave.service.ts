import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateLeaveTypeDto, UpdateLeaveTypeDto, ApplyLeaveDto,
  ReviewLeaveDto, LeaveQueryDto, AllocateLeaveDto,
} from './dto/leave.dto.js';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Leave Types ──────────────────────────────────────────────────────────

  async listLeaveTypes(includeInactive = false) {
    const where: Record<string, unknown> = {};
    if (!includeInactive) where['isActive'] = true;
    return this.prisma.orm.public.LeaveType.where(where as any).orderBy(m => (m as any).name.asc()).all();
  }

  async createLeaveType(dto: CreateLeaveTypeDto) {
    const exists = await this.prisma.orm.public.LeaveType.where({ code: dto.code } as any).first();
    if (exists) throw new BadRequestException(`Leave type code '${dto.code}' already exists`);
    return this.prisma.orm.public.LeaveType.create({
      id:                 uuidv4(),
      code:               dto.code as any,
      name:               dto.name as any,
      description:        dto.description ?? null,
      isPaid:             dto.isPaid ?? true,
      defaultDaysPerYear: dto.defaultDaysPerYear ?? 0,
      maxCarryForward:    dto.maxCarryForward ?? 0,
      allowHalfDay:       dto.allowHalfDay ?? false,
      requiresApproval:   dto.requiresApproval ?? true,
      isActive:           true,
      createdAt:          now() as any,
      updatedAt:          now() as any,
    } as any);
  }

  async updateLeaveType(id: string, dto: UpdateLeaveTypeDto) {
    const lt = await this.prisma.orm.public.LeaveType.where({ id } as any).first();
    if (!lt) throw new NotFoundException('Leave type not found');
    const changes: Record<string, unknown> = { updatedAt: now() as any };
    if (dto.name !== undefined)               changes['name']               = dto.name as any;
    if (dto.description !== undefined)        changes['description']        = dto.description;
    if (dto.isPaid !== undefined)             changes['isPaid']             = dto.isPaid;
    if (dto.defaultDaysPerYear !== undefined) changes['defaultDaysPerYear'] = dto.defaultDaysPerYear;
    if (dto.maxCarryForward !== undefined)    changes['maxCarryForward']    = dto.maxCarryForward;
    if (dto.allowHalfDay !== undefined)       changes['allowHalfDay']       = dto.allowHalfDay;
    if (dto.requiresApproval !== undefined)   changes['requiresApproval']   = dto.requiresApproval;
    if (dto.isActive !== undefined)           changes['isActive']           = dto.isActive;
    await this.prisma.orm.public.LeaveType.where({ id } as any).update(changes as any);
    return this.prisma.orm.public.LeaveType.where({ id } as any).first();
  }

  // ─── Leave Balances ───────────────────────────────────────────────────────

  async getEmployeeBalances(employeeId: string, year?: number) {
    const currentYear = year ?? new Date().getFullYear();
    return this.prisma.orm.public.LeaveBalance
      .where({ employeeId, year: currentYear } as any)
      .all();
  }

  async allocateLeave(dto: AllocateLeaveDto) {
    const existing = await this.prisma.orm.public.LeaveBalance
      .where({ employeeId: dto.employeeId, leaveTypeId: dto.leaveTypeId, year: dto.year } as any)
      .first();

    if (existing) {
      await this.prisma.orm.public.LeaveBalance
        .where({ employeeId: dto.employeeId, leaveTypeId: dto.leaveTypeId, year: dto.year } as any)
        .update({
          allocated:    dto.allocated as any,
          carryForward: dto.carryForward ?? 0,
          updatedAt:    now() as any,
        } as any);
      return this.prisma.orm.public.LeaveBalance
        .where({ employeeId: dto.employeeId, leaveTypeId: dto.leaveTypeId, year: dto.year } as any)
        .first();
    }

    return this.prisma.orm.public.LeaveBalance.create({
      id:          uuidv4(),
      employeeId:  dto.employeeId,
      leaveTypeId: dto.leaveTypeId,
      year:        dto.year as any,
      allocated:   dto.allocated as any,
      used:        0,
      pending:     0,
      carryForward: dto.carryForward ?? 0,
      createdAt:   now() as any,
      updatedAt:   now() as any,
    } as any);
  }

  // ─── Leave Applications ───────────────────────────────────────────────────

  async listApplications(query: LeaveQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.employeeId)  where['employeeId']  = query.employeeId;
    if (query.leaveTypeId) where['leaveTypeId'] = query.leaveTypeId;
    if (query.status)      where['status']      = query.status;

    const page  = parseInt(query.page  ?? '1',  10);
    const limit = parseInt(query.limit ?? '20', 10);
    const skip  = (page - 1) * limit;

    const items = await this.prisma.orm.public.LeaveApplication
      .where(where as any)
      .orderBy(m => (m as any).appliedAt.desc())
      .skip(skip)
      .take(limit)
      .all();

    const total = Number(
      await this.prisma.orm.public.LeaveApplication.where(where as any).count(),
    );
    return { items, total, page, limit };
  }

  async applyLeave(employeeId: string, dto: ApplyLeaveDto) {
    const leaveType = await this.prisma.orm.public.LeaveType.where({ id: dto.leaveTypeId, isActive: true } as any).first();
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const from = new Date(dto.fromDate);
    const to   = new Date(dto.toDate);
    if (to < from) throw new BadRequestException('To date must be after from date');

    const msPerDay = 86400000;
    const days = dto.isHalfDay ? 0.5 : Math.round((to.getTime() - from.getTime()) / msPerDay) + 1;

    const currentYear = from.getFullYear();
    const balance = await this.prisma.orm.public.LeaveBalance
      .where({ employeeId, leaveTypeId: dto.leaveTypeId, year: currentYear } as any)
      .first();

    if (balance) {
      const available = (balance as any).allocated + (balance as any).carryForward - (balance as any).used - (balance as any).pending;
      if (available < days) {
        throw new BadRequestException(`Insufficient leave balance. Available: ${available}, Requested: ${days}`);
      }
      await this.prisma.orm.public.LeaveBalance
        .where({ employeeId, leaveTypeId: dto.leaveTypeId, year: currentYear } as any)
        .update({ pending: (balance as any).pending + days } as any);
    }

    return this.prisma.orm.public.LeaveApplication.create({
      id:          uuidv4(),
      employeeId,
      leaveTypeId: dto.leaveTypeId,
      fromDate:    from as any,
      toDate:      to as any,
      days:        days as any,
      isHalfDay:   dto.isHalfDay ?? false,
      reason:      dto.reason ?? null,
      status:      (leaveType as any).requiresApproval ? 'SUBMITTED' : 'APPROVED',
      appliedAt:   now() as any,
      createdAt:   now() as any,
      updatedAt:   now() as any,
    } as any);
  }

  async reviewLeave(id: string, reviewedById: string, dto: ReviewLeaveDto) {
    const app = await this.prisma.orm.public.LeaveApplication.where({ id } as any).first();
    if (!app) throw new NotFoundException('Leave application not found');
    if ((app as any).status !== 'SUBMITTED') {
      throw new BadRequestException('Only submitted applications can be reviewed');
    }

    await this.prisma.orm.public.LeaveApplication
      .where({ id } as any)
      .update({
        status:       dto.status as any,
        reviewedById,
        reviewedAt:   now() as any,
        reviewNote:   dto.reviewNote ?? null,
        updatedAt:    now() as any,
      } as any);

    const balance = await this.prisma.orm.public.LeaveBalance
      .where({ employeeId: (app as any).employeeId, leaveTypeId: (app as any).leaveTypeId, year: new Date((app as any).fromDate).getFullYear() } as any)
      .first();

    if (balance) {
      const days = (app as any).days;
      if (dto.status === 'APPROVED') {
        await this.prisma.orm.public.LeaveBalance
          .where({ id: (balance as any).id } as any)
          .update({ used: (balance as any).used + days, pending: Math.max(0, (balance as any).pending - days) } as any);
      } else {
        await this.prisma.orm.public.LeaveBalance
          .where({ id: (balance as any).id } as any)
          .update({ pending: Math.max(0, (balance as any).pending - days) } as any);
      }
    }

    return this.prisma.orm.public.LeaveApplication.where({ id } as any).first();
  }

  async cancelLeave(id: string, employeeId: string) {
    const app = await this.prisma.orm.public.LeaveApplication.where({ id } as any).first();
    if (!app) throw new NotFoundException('Leave application not found');
    if ((app as any).employeeId !== employeeId) throw new BadRequestException('Cannot cancel another employee\'s leave');
    if (!['SUBMITTED', 'APPROVED'].includes((app as any).status)) {
      throw new BadRequestException('Cannot cancel this leave application');
    }

    await this.prisma.orm.public.LeaveApplication
      .where({ id } as any)
      .update({ status: 'CANCELLED' as any, cancelledAt: now() as any, updatedAt: now() as any } as any);

    if ((app as any).status === 'SUBMITTED') {
      const balance = await this.prisma.orm.public.LeaveBalance
        .where({ employeeId, leaveTypeId: (app as any).leaveTypeId, year: new Date((app as any).fromDate).getFullYear() } as any)
        .first();
      if (balance) {
        await this.prisma.orm.public.LeaveBalance
          .where({ id: (balance as any).id } as any)
          .update({ pending: Math.max(0, (balance as any).pending - (app as any).days) } as any);
      }
    }

    return this.prisma.orm.public.LeaveApplication.where({ id } as any).first();
  }
}
