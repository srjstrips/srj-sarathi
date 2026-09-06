#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4bc620e8db78266783a543e3c7ee27458281e0e81e3e7aad2f866b70c3244f87/contract';
import endContract from '../../snapshots/4bc620e8db78266783a543e3c7ee27458281e0e81e3e7aad2f866b70c3244f87/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f4079a53d2d6d199e1ba475d29fddf0e061a3474e5a109bada040b8e07357dfb/contract';
import startContract from '../../snapshots/f4079a53d2d6d199e1ba475d29fddf0e061a3474e5a109bada040b8e07357dfb/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'section',
        constraint: 'section_departmentId_code_key',
      }),
      this.createTable({
        schema: 'public',
        table: 'documentCategory',
        columns: [
          col('allowedMimeTypes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('code', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('expiryDateRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('issueDateRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('maxFileSizeMb', 'int4', {
            notNull: true,
            default: lit(10),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('name', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('verificationRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'documentRequirement',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('documentCategoryId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isRequired', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('scopeId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('scopeType', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'emergencyContact',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('alternatePhone', 'character varying(20)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('employeeId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('phone', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('priority', 'int4', {
            notNull: true,
            default: lit(1),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('relationship', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeBankDetail',
        columns: [
          col('accountName', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('accountNumber', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('bankName', 'character varying(200)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('branch', 'character varying(200)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('employeeId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ifsc', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('isVerified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeCustomField',
        columns: [
          col('code', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('defaultValue', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('editableBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('fieldType', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('options', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('validationRule', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('visibleTo', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeCustomFieldValue',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('employeeId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fieldId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('value', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeDocument',
        columns: [
          col('categoryId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('deletedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('documentNumber', 'character varying(100)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('employeeId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('expiryDate', 'date', { codecRef: { codecId: 'pg/date-temporal@1' } }),
          col('filename', 'character varying(500)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 500 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('issueDate', 'date', { codecRef: { codecId: 'pg/date-temporal@1' } }),
          col('mimeType', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('sizeBytes', 'int8', { codecRef: { codecId: 'pg/int8@1' } }),
          col('storageKey', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('uploadedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('verificationNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('verificationStatus', 'character varying(20)', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('verifiedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('verifiedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeExportJob',
        columns: [
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('errorMsg', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('expiresAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('failedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('fields', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('filters', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('requestedById', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'character varying(20)', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('storageKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('totalRows', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeImportJob',
        columns: [
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('confirmedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('confirmedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('createdRows', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('duplicateStrategy', 'character varying(20)', {
            notNull: true,
            default: lit('SKIP'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('errorRows', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('errorSummary', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('failedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('filename', 'character varying(500)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 500 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('initiatedById', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('resultStorageKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('skippedRows', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'character varying(20)', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('storageKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('templateId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('totalRows', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('updatedRows', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('validRows', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeImportRow',
        columns: [
          col('action', 'character varying(20)', {
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('employeeId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('jobId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('mappedData', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('rawData', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('rowNumber', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'character varying(20)', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('validationErrors', 'json', { codecRef: { codecId: 'pg/json@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeOrgHistory',
        columns: [
          col('changeType', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('changedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('effectiveFrom', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('effectiveTo', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('employeeId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('newValue', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('oldValue', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employeeStatusConfig',
        columns: [
          col('code', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isSystem', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employmentCategory',
        columns: [
          col('code', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'employmentType',
        columns: [
          col('code', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'importTemplate',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('duplicateStrategy', 'character varying(20)', {
            notNull: true,
            default: lit('SKIP'),
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('templateType', 'character varying(50)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 50 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'importTemplateMapping',
        columns: [
          col('defaultValue', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isRequired', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('sourceColumn', 'character varying(200)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
          }),
          col('targetField', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('templateId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('transformation', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'jobGrade',
        columns: [
          col('code', 'character varying(20)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('displayOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'character varying(100)', {
            notNull: true,
            codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'company',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'company',
        column: col('legalName', 'character varying(200)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'department',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'department',
        column: col('displayOrder', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'department',
        column: col('hodId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'department',
        column: col('parentId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'designation',
        column: col('code', 'character varying(20)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'designation',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'designation',
        column: col('displayOrder', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'designation',
        column: col('jobGradeId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'division',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('employeeStatusId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('employmentCategoryId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('employmentTypeId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('exitDate', 'date', { codecRef: { codecId: 'pg/date-temporal@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('hodId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('jobGradeId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('managerId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('maritalStatus', 'character varying(20)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('mobile', 'character varying(20)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 20 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('officialEmail', 'character varying(200)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('personalEmail', 'character varying(200)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 200 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'employee',
        column: col('subHodId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'location',
        column: col('city', 'character varying(100)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'location',
        column: col('country', 'character varying(100)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'location',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'location',
        column: col('state', 'character varying(100)', {
          codecRef: { codecId: 'sql/varchar@1', typeParams: { length: 100 } },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'section',
        column: col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'section',
        column: col('displayOrder', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'section',
        column: col('subHodId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dropNotNull({ schema: 'public', table: 'designation', column: 'sectionId' }),
      this.dropNotNull({ schema: 'public', table: 'employee', column: 'userId' }),
      this.dropNotNull({ schema: 'public', table: 'section', column: 'code' }),
      this.addUnique({
        schema: 'public',
        table: 'designation',
        constraint: 'designation_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'documentCategory',
        constraint: 'documentCategory_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'employeeBankDetail',
        constraint: 'employeeBankDetail_employeeId_key',
        columns: ['employeeId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'employeeCustomField',
        constraint: 'employeeCustomField_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'employeeCustomFieldValue',
        constraint: 'employeeCustomFieldValue_employeeId_fieldId_key',
        columns: ['employeeId', 'fieldId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'employeeStatusConfig',
        constraint: 'employeeStatusConfig_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'employmentCategory',
        constraint: 'employmentCategory_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'employmentType',
        constraint: 'employmentType_code_key',
        columns: ['code'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'jobGrade',
        constraint: 'jobGrade_code_key',
        columns: ['code'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'department',
        index: 'department_hodId_idx_2d3c7cef',
        columns: ['hodId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'department',
        index: 'department_parentId_idx_6a68f597',
        columns: ['parentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'designation',
        index: 'designation_jobGradeId_idx_cc648f6d',
        columns: ['jobGradeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'documentRequirement',
        index: 'documentRequirement_documentCategoryId_idx_d7317071',
        columns: ['documentCategoryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'documentRequirement',
        index: 'documentRequirement_scopeType_scopeId_idx_4b234c68',
        columns: ['scopeType', 'scopeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'emergencyContact',
        index: 'emergencyContact_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee',
        index: 'employee_deletedAt_idx_a39f721c',
        columns: ['deletedAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee',
        index: 'employee_employeeCode_idx_80ae4477',
        columns: ['employeeCode'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee',
        index: 'employee_employmentCategoryId_idx_36dbd791',
        columns: ['employmentCategoryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee',
        index: 'employee_employmentTypeId_idx_45f4711d',
        columns: ['employmentTypeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee',
        index: 'employee_jobGradeId_idx_cc648f6d',
        columns: ['jobGradeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employee',
        index: 'employee_managerId_idx_f8369ba6',
        columns: ['managerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeCustomFieldValue',
        index: 'employeeCustomFieldValue_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeCustomFieldValue',
        index: 'employeeCustomFieldValue_fieldId_idx_44d815d7',
        columns: ['fieldId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeDocument',
        index: 'employeeDocument_categoryId_idx_15c304f2',
        columns: ['categoryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeDocument',
        index: 'employeeDocument_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeDocument',
        index: 'employeeDocument_uploadedById_idx_b92fad21',
        columns: ['uploadedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeDocument',
        index: 'employeeDocument_verifiedById_idx_dfd74b37',
        columns: ['verifiedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeExportJob',
        index: 'employeeExportJob_requestedById_idx_f9a56c66',
        columns: ['requestedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeExportJob',
        index: 'employeeExportJob_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeImportJob',
        index: 'employeeImportJob_confirmedById_idx_bf02ea5f',
        columns: ['confirmedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeImportJob',
        index: 'employeeImportJob_initiatedById_idx_49d2866e',
        columns: ['initiatedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeImportJob',
        index: 'employeeImportJob_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeImportJob',
        index: 'employeeImportJob_templateId_idx_19e0d972',
        columns: ['templateId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeImportRow',
        index: 'employeeImportRow_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeImportRow',
        index: 'employeeImportRow_jobId_idx_623c8f77',
        columns: ['jobId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeImportRow',
        index: 'employeeImportRow_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeOrgHistory',
        index: 'employeeOrgHistory_changeType_idx_de42dc88',
        columns: ['changeType'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeOrgHistory',
        index: 'employeeOrgHistory_changedById_idx_d6e6aadb',
        columns: ['changedById'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'employeeOrgHistory',
        index: 'employeeOrgHistory_employeeId_idx_087dd4a6',
        columns: ['employeeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'importTemplateMapping',
        index: 'importTemplateMapping_templateId_idx_19e0d972',
        columns: ['templateId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'department',
        foreignKey: {
          name: 'department_parentId_fkey',
          columns: ['parentId'],
          references: { schema: 'public', table: 'department', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'documentRequirement',
        foreignKey: {
          name: 'documentRequirement_documentCategoryId_fkey',
          columns: ['documentCategoryId'],
          references: { schema: 'public', table: 'documentCategory', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'emergencyContact',
        foreignKey: {
          name: 'emergencyContact_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employee', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee',
        foreignKey: {
          name: 'employee_managerId_fkey',
          columns: ['managerId'],
          references: { schema: 'public', table: 'employee', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeBankDetail',
        foreignKey: {
          name: 'employeeBankDetail_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employee', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeCustomFieldValue',
        foreignKey: {
          name: 'employeeCustomFieldValue_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employee', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeCustomFieldValue',
        foreignKey: {
          name: 'employeeCustomFieldValue_fieldId_fkey',
          columns: ['fieldId'],
          references: { schema: 'public', table: 'employeeCustomField', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeDocument',
        foreignKey: {
          name: 'employeeDocument_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employee', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeDocument',
        foreignKey: {
          name: 'employeeDocument_categoryId_fkey',
          columns: ['categoryId'],
          references: { schema: 'public', table: 'documentCategory', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeDocument',
        foreignKey: {
          name: 'employeeDocument_verifiedById_fkey',
          columns: ['verifiedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeDocument',
        foreignKey: {
          name: 'employeeDocument_uploadedById_fkey',
          columns: ['uploadedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeExportJob',
        foreignKey: {
          name: 'employeeExportJob_requestedById_fkey',
          columns: ['requestedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeImportJob',
        foreignKey: {
          name: 'employeeImportJob_templateId_fkey',
          columns: ['templateId'],
          references: { schema: 'public', table: 'importTemplate', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeImportJob',
        foreignKey: {
          name: 'employeeImportJob_initiatedById_fkey',
          columns: ['initiatedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeImportJob',
        foreignKey: {
          name: 'employeeImportJob_confirmedById_fkey',
          columns: ['confirmedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeImportRow',
        foreignKey: {
          name: 'employeeImportRow_jobId_fkey',
          columns: ['jobId'],
          references: { schema: 'public', table: 'employeeImportJob', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeImportRow',
        foreignKey: {
          name: 'employeeImportRow_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employee', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeOrgHistory',
        foreignKey: {
          name: 'employeeOrgHistory_employeeId_fkey',
          columns: ['employeeId'],
          references: { schema: 'public', table: 'employee', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employeeOrgHistory',
        foreignKey: {
          name: 'employeeOrgHistory_changedById_fkey',
          columns: ['changedById'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee',
        foreignKey: {
          name: 'employee_employmentCategoryId_fkey',
          columns: ['employmentCategoryId'],
          references: { schema: 'public', table: 'employmentCategory', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee',
        foreignKey: {
          name: 'employee_employmentTypeId_fkey',
          columns: ['employmentTypeId'],
          references: { schema: 'public', table: 'employmentType', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'importTemplateMapping',
        foreignKey: {
          name: 'importTemplateMapping_templateId_fkey',
          columns: ['templateId'],
          references: { schema: 'public', table: 'importTemplate', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'designation',
        foreignKey: {
          name: 'designation_jobGradeId_fkey',
          columns: ['jobGradeId'],
          references: { schema: 'public', table: 'jobGrade', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'employee',
        foreignKey: {
          name: 'employee_jobGradeId_fkey',
          columns: ['jobGradeId'],
          references: { schema: 'public', table: 'jobGrade', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
