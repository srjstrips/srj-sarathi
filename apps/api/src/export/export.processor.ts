import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { EXPORTABLE_FIELDS } from './dto/export.dto.js';

export const EXPORT_QUEUE = 'employee-export';
export const JOB_EXPORT   = 'export';

@Processor(EXPORT_QUEUE)
export class ExportProcessor {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process(JOB_EXPORT)
  async handleExport(job: Job<{ exportJobId: string }>) {
    const { exportJobId } = job.data;
    this.logger.log(`Processing export job ${exportJobId}`);

    const exportJob = await this.prisma.orm.public.EmployeeExportJob
      .where({ id: exportJobId })
      .first() as any;

    if (!exportJob) {
      this.logger.error(`Export job ${exportJobId} not found`);
      return;
    }

    await this.prisma.orm.public.EmployeeExportJob.where({ id: exportJobId }).update({
      status: 'PROCESSING' as any,
      updatedAt: now(),
    } as any);

    try {
      const filters  = (exportJob.filters  as Record<string, unknown>) ?? {};
      const fields   = (exportJob.fields   as string[]) ?? [...EXPORTABLE_FIELDS];

      // Build ORM filter
      const where: Record<string, unknown> = {};
      if (filters['companyId'])    where['companyId']    = filters['companyId'];
      if (filters['locationId'])   where['locationId']   = filters['locationId'];
      if (filters['divisionId'])   where['divisionId']   = filters['divisionId'];
      if (filters['departmentId']) where['departmentId'] = filters['departmentId'];
      if (filters['sectionId'])    where['sectionId']    = filters['sectionId'];
      if (filters['status'])       where['status']       = filters['status'];
      if (!filters['includeDeleted']) where['deletedAt'] = null;

      const employees = await this.prisma.orm.public.Employee
        .where(where)
        .orderBy(m => (m as any).employeeCode.asc())
        .all() as any[];

      // Project only requested fields
      const allowed = new Set(fields);
      const rows = employees.map((e: any) => {
        const row: Record<string, unknown> = {};
        for (const f of EXPORTABLE_FIELDS) {
          if (allowed.has(f)) row[f] = e[f] ?? null;
        }
        return row;
      });

      // Write to temp XLSX file
      const wb   = XLSX.utils.book_new();
      const ws   = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Employees');

      const tmpDir  = path.join(process.cwd(), 'tmp', 'exports');
      fs.mkdirSync(tmpDir, { recursive: true });
      const filename  = `export_${exportJobId}.xlsx`;
      const filepath  = path.join(tmpDir, filename);
      XLSX.writeFile(wb, filepath);

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await this.prisma.orm.public.EmployeeExportJob.where({ id: exportJobId }).update({
        status:     'COMPLETED' as any,
        totalRows:  employees.length,
        storageKey: filepath,
        expiresAt,
        completedAt: now(),
        updatedAt:  now(),
      } as any);

      this.logger.log(`Export job ${exportJobId} completed — ${employees.length} rows`);
    } catch (e: any) {
      this.logger.error(`Export job ${exportJobId} failed: ${e.message}`);
      await this.prisma.orm.public.EmployeeExportJob.where({ id: exportJobId }).update({
        status:   'FAILED' as any,
        errorMsg: e.message,
        failedAt: now(),
        updatedAt: now(),
      } as any);
    }
  }
}
