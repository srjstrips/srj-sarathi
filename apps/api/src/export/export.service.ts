import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { CreateExportJobDto, EXPORTABLE_FIELDS } from './dto/export.dto.js';
import { EXPORT_QUEUE, JOB_EXPORT } from './export.processor.js';

@Injectable()
export class ExportService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(EXPORT_QUEUE) private readonly exportQueue: Queue,
  ) {}

  async createJob(dto: CreateExportJobDto, requestedById: string) {
    const fields = dto.fields?.length
      ? dto.fields.filter(f => (EXPORTABLE_FIELDS as readonly string[]).includes(f))
      : [...EXPORTABLE_FIELDS];

    if (!fields.length) throw new BadRequestException('No valid export fields specified');

    const filters: Record<string, unknown> = {};
    if (dto.companyId)    filters['companyId']    = dto.companyId;
    if (dto.locationId)   filters['locationId']   = dto.locationId;
    if (dto.divisionId)   filters['divisionId']   = dto.divisionId;
    if (dto.departmentId) filters['departmentId'] = dto.departmentId;
    if (dto.sectionId)    filters['sectionId']    = dto.sectionId;
    if (dto.status)       filters['status']       = dto.status;
    if (dto.includeDeleted) filters['includeDeleted'] = true;

    const job = await this.prisma.orm.public.EmployeeExportJob.create({
      requestedById,
      status:      'PENDING' as any,
      filters,
      fields,
      totalRows:   null,
      storageKey:  null,
      expiresAt:   null,
      completedAt: null,
      failedAt:    null,
      errorMsg:    null,
    } as any) as any;

    await this.exportQueue.add(JOB_EXPORT, { exportJobId: job.id }, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 3000 },
    });

    return { jobId: job.id, status: 'PENDING', message: 'Export queued — poll /export/jobs/:id for status' };
  }

  async getJob(id: string, requestedById: string) {
    const job = await this.prisma.orm.public.EmployeeExportJob
      .where({ id, requestedById })
      .first();
    if (!job) throw new NotFoundException('Export job not found');
    return job;
  }

  async listJobs(requestedById: string, limit = 20, offset = 0) {
    return this.prisma.orm.public.EmployeeExportJob
      .where({ requestedById })
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async downloadJob(id: string, requestedById: string) {
    const job = await this.getJob(id, requestedById) as any;
    if (job.status !== 'COMPLETED') throw new BadRequestException('Export is not ready yet');
    if (!job.storageKey || !fs.existsSync(job.storageKey)) {
      throw new NotFoundException('Export file not found — it may have expired');
    }
    if (job.expiresAt && new Date() > new Date(job.expiresAt)) {
      throw new BadRequestException('Export file has expired');
    }
    return { filepath: job.storageKey as string, filename: `employees_export_${id}.xlsx` };
  }
}
