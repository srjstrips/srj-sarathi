-- Phase 3: Employee Management Migration
-- SRJ Steel Sarthi HRMS
-- Alters existing tables and creates new tables for employee management features.

-- ============================================================
-- SECTION 1: ALTER EXISTING TABLES
-- ============================================================

-- 1.1 Employee: add missing fields, make userId nullable
ALTER TABLE "employee"
  ADD COLUMN IF NOT EXISTS "maritalStatus"    varchar(20),
  ADD COLUMN IF NOT EXISTS "officialEmail"    varchar(200),
  ADD COLUMN IF NOT EXISTS "personalEmail"    varchar(200),
  ADD COLUMN IF NOT EXISTS "mobile"           varchar(20),
  ADD COLUMN IF NOT EXISTS "exitDate"         date,
  ADD COLUMN IF NOT EXISTS "managerId"        text,
  ADD COLUMN IF NOT EXISTS "hodId"            text,
  ADD COLUMN IF NOT EXISTS "subHodId"         text,
  ADD COLUMN IF NOT EXISTS "employmentTypeId" text,
  ADD COLUMN IF NOT EXISTS "employmentCategoryId" text,
  ADD COLUMN IF NOT EXISTS "employeeStatusId" text,
  ADD COLUMN IF NOT EXISTS "jobGradeId"       text;

-- Make userId nullable
ALTER TABLE "employee" ALTER COLUMN "userId" DROP NOT NULL;

-- FK: employee self-references (managerId, hodId, subHodId)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_managerId_fkey'
      AND table_name = 'employee'
  ) THEN
    ALTER TABLE "employee"
      ADD CONSTRAINT "employee_managerId_fkey"
      FOREIGN KEY ("managerId") REFERENCES "employee"("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_hodId_fkey'
      AND table_name = 'employee'
  ) THEN
    ALTER TABLE "employee"
      ADD CONSTRAINT "employee_hodId_fkey"
      FOREIGN KEY ("hodId") REFERENCES "employee"("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_subHodId_fkey'
      AND table_name = 'employee'
  ) THEN
    ALTER TABLE "employee"
      ADD CONSTRAINT "employee_subHodId_fkey"
      FOREIGN KEY ("subHodId") REFERENCES "employee"("id");
  END IF;
END $$;

-- 1.2 Designation: make sectionId nullable, add new columns
ALTER TABLE "designation"
  ALTER COLUMN "sectionId" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "code"         varchar(20),
  ADD COLUMN IF NOT EXISTS "description"  text,
  ADD COLUMN IF NOT EXISTS "displayOrder" int4 NOT NULL DEFAULT 0;

-- 1.3 Department: add hodId, parentId, displayOrder, description
ALTER TABLE "department"
  ADD COLUMN IF NOT EXISTS "hodId"        text,
  ADD COLUMN IF NOT EXISTS "parentId"     text,
  ADD COLUMN IF NOT EXISTS "displayOrder" int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "description"  text;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'department_hodId_fkey'
      AND table_name = 'department'
  ) THEN
    ALTER TABLE "department"
      ADD CONSTRAINT "department_hodId_fkey"
      FOREIGN KEY ("hodId") REFERENCES "employee"("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'department_parentId_fkey'
      AND table_name = 'department'
  ) THEN
    ALTER TABLE "department"
      ADD CONSTRAINT "department_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "department"("id");
  END IF;
END $$;

-- 1.4 Company: add legalName, description
ALTER TABLE "company"
  ADD COLUMN IF NOT EXISTS "legalName"   varchar(200),
  ADD COLUMN IF NOT EXISTS "description" text;

-- 1.5 Location: add city, state, country, description
ALTER TABLE "location"
  ADD COLUMN IF NOT EXISTS "city"        varchar(100),
  ADD COLUMN IF NOT EXISTS "state"       varchar(100),
  ADD COLUMN IF NOT EXISTS "country"     varchar(100),
  ADD COLUMN IF NOT EXISTS "description" text;

-- 1.6 Division: add description
ALTER TABLE "division"
  ADD COLUMN IF NOT EXISTS "description" text;

-- 1.7 Section: add code, subHodId, displayOrder, description, isActive
ALTER TABLE "section"
  ADD COLUMN IF NOT EXISTS "code"         varchar(20),
  ADD COLUMN IF NOT EXISTS "subHodId"     text,
  ADD COLUMN IF NOT EXISTS "displayOrder" int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "description"  text,
  ADD COLUMN IF NOT EXISTS "isActive"     bool NOT NULL DEFAULT true;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'section_subHodId_fkey'
      AND table_name = 'section'
  ) THEN
    ALTER TABLE "section"
      ADD CONSTRAINT "section_subHodId_fkey"
      FOREIGN KEY ("subHodId") REFERENCES "employee"("id");
  END IF;
END $$;

-- ============================================================
-- SECTION 2: CREATE NEW LOOKUP / CONFIG TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "jobGrade" (
  "id"           text         NOT NULL DEFAULT gen_random_uuid()::text,
  "code"         varchar(20)  NOT NULL,
  "name"         varchar(100) NOT NULL,
  "description"  text,
  "displayOrder" int4         NOT NULL DEFAULT 0,
  "isActive"     bool         NOT NULL DEFAULT true,
  "createdAt"    timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"    timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "jobGrade_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "jobGrade_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "employmentType" (
  "id"          text         NOT NULL DEFAULT gen_random_uuid()::text,
  "code"        varchar(20)  NOT NULL,
  "name"        varchar(100) NOT NULL,
  "description" text,
  "isActive"    bool         NOT NULL DEFAULT true,
  "createdAt"   timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "employmentType_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employmentType_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "employmentCategory" (
  "id"          text         NOT NULL DEFAULT gen_random_uuid()::text,
  "code"        varchar(20)  NOT NULL,
  "name"        varchar(100) NOT NULL,
  "description" text,
  "isActive"    bool         NOT NULL DEFAULT true,
  "createdAt"   timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "employmentCategory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employmentCategory_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "employeeStatusConfig" (
  "id"           text         NOT NULL DEFAULT gen_random_uuid()::text,
  "code"         varchar(20)  NOT NULL,
  "name"         varchar(100) NOT NULL,
  "description"  text,
  "isSystem"     bool         NOT NULL DEFAULT false,
  "isActive"     bool         NOT NULL DEFAULT true,
  "displayOrder" int4         NOT NULL DEFAULT 0,
  "createdAt"    timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"    timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "employeeStatusConfig_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeStatusConfig_code_key" UNIQUE ("code")
);

-- ============================================================
-- SECTION 3: ADD FK CONSTRAINTS FOR EMPLOYEE LOOKUP COLUMNS
-- (after lookup tables exist)
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_employmentTypeId_fkey'
      AND table_name = 'employee'
  ) THEN
    ALTER TABLE "employee"
      ADD CONSTRAINT "employee_employmentTypeId_fkey"
      FOREIGN KEY ("employmentTypeId") REFERENCES "employmentType"("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_employmentCategoryId_fkey'
      AND table_name = 'employee'
  ) THEN
    ALTER TABLE "employee"
      ADD CONSTRAINT "employee_employmentCategoryId_fkey"
      FOREIGN KEY ("employmentCategoryId") REFERENCES "employmentCategory"("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_employeeStatusId_fkey'
      AND table_name = 'employee'
  ) THEN
    ALTER TABLE "employee"
      ADD CONSTRAINT "employee_employeeStatusId_fkey"
      FOREIGN KEY ("employeeStatusId") REFERENCES "employeeStatusConfig"("id");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'employee_jobGradeId_fkey'
      AND table_name = 'employee'
  ) THEN
    ALTER TABLE "employee"
      ADD CONSTRAINT "employee_jobGradeId_fkey"
      FOREIGN KEY ("jobGradeId") REFERENCES "jobGrade"("id");
  END IF;
END $$;

-- ============================================================
-- SECTION 4: CREATE NEW EMPLOYEE DETAIL TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "emergencyContact" (
  "id"             text         NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId"     text         NOT NULL,
  "name"           varchar(200) NOT NULL,
  "relationship"   varchar(100),
  "phone"          varchar(20)  NOT NULL,
  "alternatePhone" varchar(20),
  "address"        text,
  "priority"       int4         NOT NULL DEFAULT 1,
  "createdAt"      timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"      timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "emergencyContact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "emergencyContact_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "employee"("id")
);

CREATE TABLE IF NOT EXISTS "employeeBankDetail" (
  "id"            text         NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId"    text         NOT NULL,
  "accountName"   varchar(200) NOT NULL,
  "accountNumber" varchar(50)  NOT NULL,
  "ifsc"          varchar(20)  NOT NULL,
  "bankName"      varchar(200),
  "branch"        varchar(200),
  "isVerified"    bool         NOT NULL DEFAULT false,
  "createdAt"     timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "employeeBankDetail_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeBankDetail_employeeId_key" UNIQUE ("employeeId"),
  CONSTRAINT "employeeBankDetail_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "employee"("id")
);

CREATE TABLE IF NOT EXISTS "employeeOrgHistory" (
  "id"           text         NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId"   text         NOT NULL,
  "changeType"   varchar(50)  NOT NULL,
  "oldValue"     text,
  "newValue"     text,
  "changedById"  text,
  "effectiveFrom" timestamptz NOT NULL,
  "effectiveTo"  timestamptz,
  "createdAt"    timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "employeeOrgHistory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeOrgHistory_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "employee"("id"),
  CONSTRAINT "employeeOrgHistory_changedById_fkey"
    FOREIGN KEY ("changedById") REFERENCES "user"("id")
);

-- ============================================================
-- SECTION 5: DOCUMENT MANAGEMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "documentCategory" (
  "id"                   text         NOT NULL DEFAULT gen_random_uuid()::text,
  "code"                 varchar(20)  NOT NULL,
  "name"                 varchar(200) NOT NULL,
  "description"          text,
  "isRequired"           bool         NOT NULL DEFAULT false,
  "allowedMimeTypes"     text,
  "maxFileSizeMb"        int4         NOT NULL DEFAULT 10,
  "issueDateRequired"    bool         NOT NULL DEFAULT false,
  "expiryDateRequired"   bool         NOT NULL DEFAULT false,
  "verificationRequired" bool         NOT NULL DEFAULT false,
  "isActive"             bool         NOT NULL DEFAULT true,
  "displayOrder"         int4         NOT NULL DEFAULT 0,
  "createdAt"            timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"            timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "documentCategory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "documentCategory_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "documentRequirement" (
  "id"                 text        NOT NULL DEFAULT gen_random_uuid()::text,
  "documentCategoryId" text        NOT NULL,
  "scopeType"          varchar(50) NOT NULL,
  "scopeId"            text,
  "isRequired"         bool        NOT NULL DEFAULT true,
  "createdAt"          timestamptz NOT NULL DEFAULT now(),
  "updatedAt"          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "documentRequirement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "documentRequirement_documentCategoryId_fkey"
    FOREIGN KEY ("documentCategoryId") REFERENCES "documentCategory"("id")
);

CREATE TABLE IF NOT EXISTS "employeeDocument" (
  "id"                 text         NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId"         text         NOT NULL,
  "categoryId"         text         NOT NULL,
  "filename"           varchar(500) NOT NULL,
  "mimeType"           varchar(100) NOT NULL,
  "sizeBytes"          int8,
  "storageKey"         text         NOT NULL,
  "documentNumber"     varchar(100),
  "issueDate"          date,
  "expiryDate"         date,
  "verificationStatus" varchar(20)  NOT NULL DEFAULT 'PENDING',
  "verifiedById"       text,
  "verifiedAt"         timestamptz,
  "verificationNote"   text,
  "uploadedById"       text,
  "createdAt"          timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"          timestamptz  NOT NULL DEFAULT now(),
  "deletedAt"          timestamptz,
  CONSTRAINT "employeeDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeDocument_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "employee"("id"),
  CONSTRAINT "employeeDocument_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "documentCategory"("id"),
  CONSTRAINT "employeeDocument_verifiedById_fkey"
    FOREIGN KEY ("verifiedById") REFERENCES "user"("id"),
  CONSTRAINT "employeeDocument_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "user"("id")
);

-- ============================================================
-- SECTION 6: CUSTOM FIELDS
-- ============================================================

CREATE TABLE IF NOT EXISTS "employeeCustomField" (
  "id"             text        NOT NULL DEFAULT gen_random_uuid()::text,
  "code"           varchar(50) NOT NULL,
  "name"           varchar(200) NOT NULL,
  "fieldType"      varchar(20) NOT NULL,
  "isRequired"     bool        NOT NULL DEFAULT false,
  "defaultValue"   text,
  "options"        jsonb,
  "validationRule" text,
  "visibleTo"      text,
  "editableBy"     text,
  "displayOrder"   int4        NOT NULL DEFAULT 0,
  "isActive"       bool        NOT NULL DEFAULT true,
  "createdAt"      timestamptz NOT NULL DEFAULT now(),
  "updatedAt"      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "employeeCustomField_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeCustomField_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "employeeCustomFieldValue" (
  "id"         text        NOT NULL DEFAULT gen_random_uuid()::text,
  "employeeId" text        NOT NULL,
  "fieldId"    text        NOT NULL,
  "value"      text,
  "createdAt"  timestamptz NOT NULL DEFAULT now(),
  "updatedAt"  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "employeeCustomFieldValue_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeCustomFieldValue_employeeId_fieldId_key" UNIQUE ("employeeId", "fieldId"),
  CONSTRAINT "employeeCustomFieldValue_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "employee"("id"),
  CONSTRAINT "employeeCustomFieldValue_fieldId_fkey"
    FOREIGN KEY ("fieldId") REFERENCES "employeeCustomField"("id")
);

-- ============================================================
-- SECTION 7: IMPORT / EXPORT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS "importTemplate" (
  "id"                text         NOT NULL DEFAULT gen_random_uuid()::text,
  "name"              varchar(200) NOT NULL,
  "description"       text,
  "templateType"      varchar(50)  NOT NULL,
  "duplicateStrategy" varchar(20)  NOT NULL DEFAULT 'SKIP',
  "isActive"          bool         NOT NULL DEFAULT true,
  "createdAt"         timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"         timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "importTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "importTemplateMapping" (
  "id"            text         NOT NULL DEFAULT gen_random_uuid()::text,
  "templateId"    text         NOT NULL,
  "sourceColumn"  varchar(200) NOT NULL,
  "targetField"   varchar(100) NOT NULL,
  "isRequired"    bool         NOT NULL DEFAULT false,
  "defaultValue"  text,
  "transformation" text,
  "displayOrder"  int4         NOT NULL DEFAULT 0,
  CONSTRAINT "importTemplateMapping_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "importTemplateMapping_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "importTemplate"("id")
);

CREATE TABLE IF NOT EXISTS "employeeImportJob" (
  "id"                text         NOT NULL DEFAULT gen_random_uuid()::text,
  "templateId"        text,
  "initiatedById"     text         NOT NULL,
  "status"            varchar(20)  NOT NULL DEFAULT 'PENDING',
  "filename"          varchar(500),
  "storageKey"        text,
  "totalRows"         int4,
  "validRows"         int4,
  "errorRows"         int4,
  "createdRows"       int4,
  "updatedRows"       int4,
  "skippedRows"       int4,
  "duplicateStrategy" varchar(20)  NOT NULL DEFAULT 'SKIP',
  "confirmedById"     text,
  "confirmedAt"       timestamptz,
  "completedAt"       timestamptz,
  "failedAt"          timestamptz,
  "errorSummary"      text,
  "resultStorageKey"  text,
  "createdAt"         timestamptz  NOT NULL DEFAULT now(),
  "updatedAt"         timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT "employeeImportJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeImportJob_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "importTemplate"("id"),
  CONSTRAINT "employeeImportJob_initiatedById_fkey"
    FOREIGN KEY ("initiatedById") REFERENCES "user"("id"),
  CONSTRAINT "employeeImportJob_confirmedById_fkey"
    FOREIGN KEY ("confirmedById") REFERENCES "user"("id")
);

CREATE TABLE IF NOT EXISTS "employeeImportRow" (
  "id"               text        NOT NULL DEFAULT gen_random_uuid()::text,
  "jobId"            text        NOT NULL,
  "rowNumber"        int4        NOT NULL,
  "status"           varchar(20) NOT NULL DEFAULT 'PENDING',
  "rawData"          jsonb,
  "mappedData"       jsonb,
  "validationErrors" jsonb,
  "action"           varchar(20),
  "employeeId"       text,
  "createdAt"        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "employeeImportRow_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeImportRow_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "employeeImportJob"("id"),
  CONSTRAINT "employeeImportRow_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "employee"("id")
);

CREATE TABLE IF NOT EXISTS "employeeExportJob" (
  "id"            text        NOT NULL DEFAULT gen_random_uuid()::text,
  "requestedById" text        NOT NULL,
  "status"        varchar(20) NOT NULL DEFAULT 'PENDING',
  "filters"       jsonb,
  "fields"        jsonb,
  "totalRows"     int4,
  "storageKey"    text,
  "expiresAt"     timestamptz,
  "completedAt"   timestamptz,
  "failedAt"      timestamptz,
  "errorMsg"      text,
  "createdAt"     timestamptz NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "employeeExportJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "employeeExportJob_requestedById_fkey"
    FOREIGN KEY ("requestedById") REFERENCES "user"("id")
);

-- ============================================================
-- SECTION 8: INDEXES
-- ============================================================

-- employee
CREATE INDEX IF NOT EXISTS "employee_employeeCode_idx"   ON "employee" ("employeeCode");
CREATE INDEX IF NOT EXISTS "employee_departmentId_idx"   ON "employee" ("departmentId");
CREATE INDEX IF NOT EXISTS "employee_sectionId_idx"      ON "employee" ("sectionId");
CREATE INDEX IF NOT EXISTS "employee_designationId_idx"  ON "employee" ("designationId");
CREATE INDEX IF NOT EXISTS "employee_managerId_idx"      ON "employee" ("managerId");
CREATE INDEX IF NOT EXISTS "employee_status_idx"         ON "employee" ("status");
CREATE INDEX IF NOT EXISTS "employee_deletedAt_idx"      ON "employee" ("deletedAt");

-- employeeDocument
CREATE INDEX IF NOT EXISTS "employeeDocument_employeeId_idx" ON "employeeDocument" ("employeeId");
CREATE INDEX IF NOT EXISTS "employeeDocument_categoryId_idx" ON "employeeDocument" ("categoryId");

-- employeeImportRow
CREATE INDEX IF NOT EXISTS "employeeImportRow_jobId_idx"  ON "employeeImportRow" ("jobId");
CREATE INDEX IF NOT EXISTS "employeeImportRow_status_idx" ON "employeeImportRow" ("status");

-- employeeOrgHistory
CREATE INDEX IF NOT EXISTS "employeeOrgHistory_employeeId_idx"  ON "employeeOrgHistory" ("employeeId");
CREATE INDEX IF NOT EXISTS "employeeOrgHistory_changeType_idx"  ON "employeeOrgHistory" ("changeType");
