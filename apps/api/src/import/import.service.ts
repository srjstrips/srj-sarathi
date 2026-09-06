import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import {
  CreateImportTemplateDto, UpdateImportTemplateDto,
  AddTemplateMappingDto, ConfirmImportJobDto,
} from './dto/import.dto.js';
import { IMPORT_QUEUE, JOB_VALIDATE, JOB_APPLY } from './import.processor.js';

@Injectable()
export class ImportService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(IMPORT_QUEUE) private readonly importQueue: Queue,
  ) {}

  // ─── Templates ────────────────────────────────────────────────────────────

  async listTemplates() {
    return this.prisma.orm.public.ImportTemplate
      .where({ isActive: true })
      .orderBy(m => (m as any).name.asc())
      .all();
  }

  async getTemplate(id: string) {
    const t = await this.prisma.orm.public.ImportTemplate.where({ id }).first();
    if (!t) throw new NotFoundException('Import template not found');
    return t;
  }

  async getTemplateWithMappings(id: string) {
    const t = await this.getTemplate(id);
    const mappings = await this.prisma.orm.public.ImportTemplateMapping
      .where({ templateId: id })
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
    return { ...t, mappings };
  }

  async createTemplate(dto: CreateImportTemplateDto) {
    return this.prisma.orm.public.ImportTemplate.create({
      name: dto.name as any,
      description: dto.description ?? null,
      templateType: dto.templateType as any,
      duplicateStrategy: (dto.duplicateStrategy ?? 'SKIP') as any,
      isActive: true,
    } as any);
  }

  async updateTemplate(id: string, dto: UpdateImportTemplateDto) {
    await this.getTemplate(id);
    return this.prisma.orm.public.ImportTemplate.where({ id }).update({
      ...(dto.name              !== undefined && { name: dto.name }),
      ...(dto.description       !== undefined && { description: dto.description }),
      ...(dto.duplicateStrategy !== undefined && { duplicateStrategy: dto.duplicateStrategy as any }),
      ...(dto.isActive          !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  async addTemplateMapping(templateId: string, dto: AddTemplateMappingDto) {
    await this.getTemplate(templateId);
    return this.prisma.orm.public.ImportTemplateMapping.create({
      templateId,
      sourceColumn:   dto.sourceColumn as any,
      targetField:    dto.targetField as any,
      isRequired:     dto.isRequired ?? false,
      defaultValue:   dto.defaultValue ?? null,
      transformation: dto.transformation ?? null,
      displayOrder:   dto.displayOrder ?? 0,
    } as any);
  }

  async deleteTemplateMapping(templateId: string, mappingId: string) {
    const m = await this.prisma.orm.public.ImportTemplateMapping
      .where({ id: mappingId, templateId })
      .first();
    if (!m) throw new NotFoundException('Mapping not found');
    await this.prisma.orm.public.ImportTemplateMapping.where({ id: mappingId }).delete();
  }

  // ─── Parse Excel buffer ───────────────────────────────────────────────────

  parseExcel(buffer: Buffer): Record<string, unknown>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new BadRequestException('Excel file has no sheets');
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
    if (!rows.length) throw new BadRequestException('Excel file has no data rows');
    return rows;
  }

  // Apply column mapping: raw row keys → target field names
  private applyMapping(
    rawRow: Record<string, unknown>,
    mappings: Array<{ sourceColumn: string; targetField: string; defaultValue?: string | null }>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const m of mappings) {
      const val = rawRow[m.sourceColumn] ?? m.defaultValue ?? null;
      result[m.targetField] = val;
    }
    return result;
  }

  // ─── Import Jobs ──────────────────────────────────────────────────────────

  async createJob(opts: {
    initiatedById: string;
    templateId?: string;
    duplicateStrategy: string;
    columnMappings: Array<{ sourceColumn: string; targetField: string; defaultValue?: string }>;
    rawRows: Record<string, unknown>[];
  }) {
    const job = await this.prisma.orm.public.EmployeeImportJob.create({
      templateId:        opts.templateId ?? null,
      initiatedById:     opts.initiatedById,
      status:            'PENDING',
      filename:          null,
      storageKey:        null,
      totalRows:         opts.rawRows.length,
      validRows:         null,
      errorRows:         null,
      createdRows:       null,
      updatedRows:       null,
      skippedRows:       null,
      duplicateStrategy: opts.duplicateStrategy as any,
      confirmedById:     null,
      confirmedAt:       null,
      completedAt:       null,
      failedAt:          null,
      errorSummary:      null,
      resultStorageKey:  null,
    } as any) as any;

    // Create import rows with mapped data
    for (let i = 0; i < opts.rawRows.length; i++) {
      const raw    = opts.rawRows[i];
      const mapped = this.applyMapping(raw, opts.columnMappings);
      await this.prisma.orm.public.EmployeeImportRow.create({
        jobId:      job.id,
        rowNumber:  i + 2, // row 1 = header
        status:     'PENDING',
        rawData:    raw,
        mappedData: mapped,
        validationErrors: null,
        action:     null,
        employeeId: null,
      } as any);
    }

    // Return job + preview (first 10 mapped rows)
    const preview = opts.rawRows.slice(0, 10).map((r, i) => ({
      rowNumber: i + 2,
      raw: r,
      mapped: this.applyMapping(r, opts.columnMappings),
    }));

    return { job, preview, totalRows: opts.rawRows.length };
  }

  async getJob(id: string) {
    const job = await this.prisma.orm.public.EmployeeImportJob.where({ id }).first();
    if (!job) throw new NotFoundException('Import job not found');
    return job;
  }

  async listJobs(initiatedById?: string, limit = 20, offset = 0) {
    const filters: Record<string, unknown> = {};
    if (initiatedById) filters['initiatedById'] = initiatedById;
    return this.prisma.orm.public.EmployeeImportJob
      .where(filters)
      .orderBy(m => (m as any).createdAt.desc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async getJobRows(jobId: string, status?: string, limit = 100, offset = 0) {
    await this.getJob(jobId);
    const filters: Record<string, unknown> = { jobId };
    if (status) filters['status'] = status;
    return this.prisma.orm.public.EmployeeImportRow
      .where(filters)
      .orderBy(m => (m as any).rowNumber.asc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async enqueueValidation(jobId: string) {
    const job = await this.getJob(jobId) as any;
    const notValidatable = ['VALIDATING', 'VALIDATED', 'PROCESSING', 'COMPLETED'];
    if (notValidatable.includes(job.status)) {
      throw new BadRequestException(`Job is in status ${job.status} and cannot be re-validated`);
    }

    await this.importQueue.add(JOB_VALIDATE, { importJobId: jobId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return { queued: true, jobId };
  }

  async confirmAndApply(jobId: string, confirmedById: string, dto: ConfirmImportJobDto) {
    const job = await this.getJob(jobId) as any;

    if (job.status !== 'VALIDATED') {
      throw new BadRequestException('Job must be in VALIDATED status before confirming. Run validation first.');
    }

    const errorRows = await this.prisma.orm.public.EmployeeImportRow
      .where({ jobId, status: 'INVALID' as any })
      .first();
    if (errorRows && !dto.dryRun) {
      throw new BadRequestException('Job has invalid rows. Fix errors or run a dry-run to proceed.');
    }

    await this.importQueue.add(JOB_APPLY, {
      importJobId: jobId,
      confirmedById,
      dryRun: dto.dryRun ?? false,
    }, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
    });

    return { queued: true, jobId, dryRun: dto.dryRun ?? false };
  }

  async cancelJob(jobId: string) {
    const job = await this.getJob(jobId) as any;
    const cancellable = ['PENDING', 'VALIDATED', 'VALIDATION_FAILED'];
    if (!cancellable.includes(job.status)) {
      throw new BadRequestException(`Cannot cancel job in status ${job.status}`);
    }
    await this.prisma.orm.public.EmployeeImportJob.where({ id: jobId }).update({
      status: 'CANCELLED',
      failedAt: now(),
      updatedAt: now(),
    } as any);
    return { cancelled: true };
  }
}
