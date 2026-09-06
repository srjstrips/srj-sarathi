import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';

export const IMPORT_QUEUE = 'employee-import';
export const JOB_VALIDATE  = 'validate';
export const JOB_APPLY     = 'apply';

const REQUIRED_FIELDS = ['employeeCode', 'firstName', 'lastName', 'companyId', 'joiningDate'];

@Processor(IMPORT_QUEUE)
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process(JOB_VALIDATE)
  async handleValidate(job: Job<{ importJobId: string }>) {
    const { importJobId } = job.data;
    this.logger.log(`Validating import job ${importJobId}`);

    await this.prisma.orm.public.EmployeeImportJob.where({ id: importJobId }).update({
      status: 'VALIDATING',
      updatedAt: now(),
    } as any);

    const rows = await this.prisma.orm.public.EmployeeImportRow
      .where({ jobId: importJobId })
      .all() as any[];

    let validCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      const mapped: Record<string, unknown> = row.mappedData ?? {};
      const errors: string[] = [];

      for (const field of REQUIRED_FIELDS) {
        if (!mapped[field]) errors.push(`${field} is required`);
      }

      if (mapped['employeeCode']) {
        const existing = await this.prisma.orm.public.Employee
          .where({ employeeCode: mapped['employeeCode'] as any })
          .first();
        if (existing) errors.push(`Employee code "${mapped['employeeCode']}" already exists`);
      }

      if (mapped['officialEmail']) {
        const dup = await this.prisma.orm.public.Employee
          .where({ officialEmail: mapped['officialEmail'] as any })
          .first();
        if (dup) errors.push(`Email "${mapped['officialEmail']}" already in use`);
      }

      const status = errors.length === 0 ? 'VALID' : 'INVALID';
      if (status === 'VALID') validCount++; else errorCount++;

      await this.prisma.orm.public.EmployeeImportRow.where({ id: row.id }).update({
        status,
        validationErrors: errors.length ? errors : null,
      } as any);
    }

    const jobStatus = errorCount === 0 ? 'VALIDATED' : 'VALIDATION_FAILED';
    await this.prisma.orm.public.EmployeeImportJob.where({ id: importJobId }).update({
      status: jobStatus,
      validRows: validCount,
      errorRows: errorCount,
      updatedAt: now(),
    } as any);

    this.logger.log(`Validation done: ${validCount} valid, ${errorCount} errors`);
  }

  @Process(JOB_APPLY)
  async handleApply(job: Job<{ importJobId: string; confirmedById: string; dryRun?: boolean }>) {
    const { importJobId, confirmedById, dryRun } = job.data;
    this.logger.log(`Applying import job ${importJobId} (dryRun=${dryRun})`);

    await this.prisma.orm.public.EmployeeImportJob.where({ id: importJobId }).update({
      status: 'PROCESSING',
      confirmedById,
      confirmedAt: now(),
      updatedAt: now(),
    } as any);

    const rows = await this.prisma.orm.public.EmployeeImportRow
      .where({ jobId: importJobId, status: 'VALID' as any })
      .all() as any[];

    let created = 0;
    let skipped = 0;
    let errors  = 0;

    for (const row of rows) {
      const mapped: Record<string, unknown> = row.mappedData ?? {};
      try {
        if (!dryRun) {
          await this.prisma.orm.public.Employee.create({
            employeeCode: (mapped['employeeCode'] as any),
            companyId:    mapped['companyId'] as string,
            userId:       null,
            locationId:   (mapped['locationId'] as string) ?? null,
            divisionId:   (mapped['divisionId'] as string) ?? null,
            departmentId: (mapped['departmentId'] as string) ?? null,
            sectionId:    (mapped['sectionId'] as string) ?? null,
            designationId:(mapped['designationId'] as string) ?? null,
            jobGradeId:   (mapped['jobGradeId'] as string) ?? null,
            employmentTypeId:     (mapped['employmentTypeId'] as string) ?? null,
            employmentCategoryId: (mapped['employmentCategoryId'] as string) ?? null,
            managerId:    (mapped['managerId'] as string) ?? null,
            hodId:        null,
            subHodId:     null,
            firstName:    (mapped['firstName'] as any),
            lastName:     (mapped['lastName'] as any),
            displayName:  (mapped['displayName'] as string) ?? null,
            gender:       (mapped['gender'] as string) ?? null,
            maritalStatus:(mapped['maritalStatus'] as string) ?? null,
            dateOfBirth:  mapped['dateOfBirth'] ? new Date(mapped['dateOfBirth'] as string) : null,
            joiningDate:  new Date(mapped['joiningDate'] as string),
            exitDate:     null,
            officialEmail:(mapped['officialEmail'] as string) ?? null,
            personalEmail:(mapped['personalEmail'] as string) ?? null,
            mobile:       (mapped['mobile'] as string) ?? null,
            profilePicUrl:null,
            status:       'ACTIVE' as any,
            deletedAt:    null,
          } as any);
        }
        await this.prisma.orm.public.EmployeeImportRow.where({ id: row.id }).update({
          status: dryRun ? 'VALID' : 'APPLIED',
          action: 'CREATE',
        } as any);
        created++;
      } catch (e: any) {
        await this.prisma.orm.public.EmployeeImportRow.where({ id: row.id }).update({
          status: 'ERROR',
          validationErrors: [e.message],
        } as any);
        errors++;
      }
    }

    const finalStatus = dryRun ? 'VALIDATED' : (errors === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS');
    await this.prisma.orm.public.EmployeeImportJob.where({ id: importJobId }).update({
      status: finalStatus,
      createdRows: created,
      skippedRows: skipped,
      completedAt: dryRun ? null : now(),
      updatedAt: now(),
    } as any);

    this.logger.log(`Apply done: ${created} created, ${errors} errors`);
  }
}
