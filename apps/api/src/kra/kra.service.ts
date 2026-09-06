import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateKraCycleDto, CreateKraObjectiveDto, SubmitKraRatingDto, KraQueryDto,
} from './dto/kra.dto.js';

@Injectable()
export class KraService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Cycles ───────────────────────────────────────────────────────────────

  async listCycles(status?: string) {
    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;
    return this.prisma.orm.public.KraCycle
      .where(where as any)
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  async createCycle(dto: CreateKraCycleDto, createdById: string) {
    return this.prisma.orm.public.KraCycle.create({
      id:          uuidv4(),
      name:        dto.name as any,
      description: dto.description ?? null,
      periodFrom:  new Date(dto.periodFrom) as any,
      periodTo:    new Date(dto.periodTo) as any,
      status:      'DRAFT' as any,
      createdById,
      createdAt:   now() as any,
      updatedAt:   now() as any,
    } as any);
  }

  async updateCycleStatus(id: string, status: string) {
    const cycle = await this.prisma.orm.public.KraCycle.where({ id } as any).first();
    if (!cycle) throw new NotFoundException('KRA cycle not found');
    await this.prisma.orm.public.KraCycle
      .where({ id } as any)
      .update({ status: status as any, updatedAt: now() as any } as any);
    return this.prisma.orm.public.KraCycle.where({ id } as any).first();
  }

  // ─── Objectives ───────────────────────────────────────────────────────────

  async listObjectives(query: KraQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.cycleId)    where['cycleId']    = query.cycleId;
    if (query.employeeId) where['employeeId'] = query.employeeId;
    if (query.status)     where['status']     = query.status;

    const page  = parseInt(query.page  ?? '1',  10);
    const limit = parseInt(query.limit ?? '20', 10);
    const skip  = (page - 1) * limit;

    const items = await this.prisma.orm.public.KraObjective
      .where(where as any)
      .orderBy(m => (m as any).createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const total = Number(
      await this.prisma.orm.public.KraObjective.where(where as any).count(),
    );
    return { items, total, page, limit };
  }

  async createObjective(dto: CreateKraObjectiveDto) {
    const cycle = await this.prisma.orm.public.KraCycle.where({ id: dto.cycleId } as any).first();
    if (!cycle) throw new NotFoundException('KRA cycle not found');

    const existing = await this.prisma.orm.public.KraObjective
      .where({ cycleId: dto.cycleId, employeeId: dto.employeeId } as any)
      .all();
    const totalWeight = existing.reduce((s: number, o: any) => s + (o.weightage ?? 0), 0);
    if (totalWeight + (dto.weightage ?? 0) > 100) {
      throw new BadRequestException('Total weightage cannot exceed 100%');
    }

    return this.prisma.orm.public.KraObjective.create({
      id:          uuidv4(),
      cycleId:     dto.cycleId,
      employeeId:  dto.employeeId,
      title:       dto.title as any,
      description: dto.description ?? null,
      weightage:   dto.weightage ?? 0,
      target:      dto.target ?? null,
      unit:        dto.unit ?? null,
      status:      'DRAFT' as any,
      createdAt:   now() as any,
      updatedAt:   now() as any,
    } as any);
  }

  async submitObjective(id: string) {
    const obj = await this.prisma.orm.public.KraObjective.where({ id } as any).first();
    if (!obj) throw new NotFoundException('KRA objective not found');
    await this.prisma.orm.public.KraObjective
      .where({ id } as any)
      .update({ status: 'SUBMITTED' as any, updatedAt: now() as any } as any);
    return this.prisma.orm.public.KraObjective.where({ id } as any).first();
  }

  // ─── Ratings ──────────────────────────────────────────────────────────────

  async submitRating(objectiveId: string, raterType: string, raterId: string, dto: SubmitKraRatingDto) {
    const obj = await this.prisma.orm.public.KraObjective.where({ id: objectiveId } as any).first();
    if (!obj) throw new NotFoundException('KRA objective not found');

    const existing = await this.prisma.orm.public.KraRating
      .where({ objectiveId, raterType } as any)
      .first();

    if (existing) {
      await this.prisma.orm.public.KraRating
        .where({ objectiveId, raterType } as any)
        .update({ rating: dto.rating as any, remarks: dto.remarks ?? null, ratedAt: now() as any } as any);
      return this.prisma.orm.public.KraRating.where({ objectiveId, raterType } as any).first();
    }

    return this.prisma.orm.public.KraRating.create({
      id:          uuidv4(),
      objectiveId,
      raterType:   raterType as any,
      raterId,
      rating:      dto.rating as any,
      remarks:     dto.remarks ?? null,
      ratedAt:     now() as any,
    } as any);
  }

  async getObjectiveRatings(objectiveId: string) {
    return this.prisma.orm.public.KraRating
      .where({ objectiveId } as any)
      .all();
  }
}
