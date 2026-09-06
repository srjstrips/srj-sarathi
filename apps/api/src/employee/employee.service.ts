import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import {
  CreateEmployeeDto, UpdateEmployeeDto, EmployeeListQueryDto,
  TransferEmployeeDto, ExitEmployeeDto, AssignManagerDto,
} from './dto/employee.dto.js';
import { BindUserDto } from './dto/bind-user.dto.js';
import { UploadDocumentDto, VerifyDocumentDto } from './dto/document.dto.js';
import { CreateCustomFieldDto, UpdateCustomFieldDto, SetCustomFieldValueDto } from './dto/custom-field.dto.js';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/emergency-contact.dto.js';
import { UpsertBankDetailDto } from './dto/bank-detail.dto.js';
import { EmployeeSearchDto, BulkUpdateStatusDto, BulkTransferDto, BulkAssignManagerDto } from './dto/search.dto.js';
import { AuthorizationService } from '../authorization/authorization.service.js';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthorizationService,
  ) {}

  // ─── List / Get ───────────────────────────────────────────────────────────

  async list(query: EmployeeListQueryDto, limit = 50, offset = 0) {
    const filters: Record<string, unknown> = {};
    if (query.companyId)     filters['companyId'] = query.companyId;
    if (query.locationId)    filters['locationId'] = query.locationId;
    if (query.divisionId)    filters['divisionId'] = query.divisionId;
    if (query.departmentId)  filters['departmentId'] = query.departmentId;
    if (query.sectionId)     filters['sectionId'] = query.sectionId;
    if (query.designationId) filters['designationId'] = query.designationId;
    if (query.managerId)     filters['managerId'] = query.managerId;
    if (query.status)        filters['status'] = query.status;
    if (!query.includeDeleted) filters['deletedAt'] = null;

    return this.prisma.orm.public.Employee
      .where(filters)
      .orderBy(m => (m as any).firstName.asc())
      .limit(limit)
      .offset(offset)
      .all();
  }

  async get(id: string) {
    const emp = await this.prisma.orm.public.Employee.where({ id }).first();
    if (!emp || emp.deletedAt) throw new NotFoundException('Employee not found');
    return emp;
  }

  async getByCode(code: string) {
    const emp = await this.prisma.orm.public.Employee
      .where({ employeeCode: code as any })
      .first();
    if (!emp || emp.deletedAt) throw new NotFoundException('Employee not found');
    return emp;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(dto: CreateEmployeeDto, actorId: string) {
    const codeDup = await this.prisma.orm.public.Employee
      .where({ employeeCode: dto.employeeCode as any })
      .first();
    if (codeDup) throw new ConflictException('Employee code already exists');

    if (dto.userId) {
      const userDup = await this.prisma.orm.public.Employee
        .where({ userId: dto.userId })
        .first();
      if (userDup) throw new ConflictException('User already bound to an employee');
    }

    if (dto.managerId) {
      await this.get(dto.managerId);
    }

    const employee = await this.prisma.orm.public.Employee.create({
      employeeCode: dto.employeeCode as any,
      companyId: dto.companyId,
      userId: dto.userId ?? null,
      locationId: dto.locationId ?? null,
      divisionId: dto.divisionId ?? null,
      departmentId: dto.departmentId ?? null,
      sectionId: dto.sectionId ?? null,
      designationId: dto.designationId ?? null,
      jobGradeId: dto.jobGradeId ?? null,
      employmentTypeId: dto.employmentTypeId ?? null,
      employmentCategoryId: dto.employmentCategoryId ?? null,
      managerId: dto.managerId ?? null,
      hodId: dto.hodId ?? null,
      subHodId: dto.subHodId ?? null,
      firstName: dto.firstName as any,
      lastName: dto.lastName as any,
      displayName: dto.displayName ?? null,
      gender: dto.gender ?? null,
      maritalStatus: dto.maritalStatus ?? null,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      joiningDate: new Date(dto.joiningDate),
      exitDate: null,
      officialEmail: dto.officialEmail ?? null,
      personalEmail: dto.personalEmail ?? null,
      mobile: dto.mobile ?? null,
      profilePicUrl: dto.profilePicUrl ?? null,
      status: 'ACTIVE',
      deletedAt: null,
    } as any);

    await this.logOrgHistory(employee.id, 'CREATED', null, dto.companyId, actorId, new Date(dto.joiningDate));

    return employee;
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateEmployeeDto, actorId: string) {
    const emp = await this.get(id);

    if (dto.managerId !== undefined && dto.managerId !== null) {
      if (dto.managerId === id) throw new BadRequestException('Employee cannot be their own manager');
      await this.get(dto.managerId);
      await this.checkManagerCycle(id, dto.managerId);
    }

    const patch: Record<string, unknown> = { updatedAt: now() };
    if (dto.locationId    !== undefined) patch['locationId']    = dto.locationId;
    if (dto.divisionId    !== undefined) patch['divisionId']    = dto.divisionId;
    if (dto.departmentId  !== undefined) patch['departmentId']  = dto.departmentId;
    if (dto.sectionId     !== undefined) patch['sectionId']     = dto.sectionId;
    if (dto.designationId !== undefined) patch['designationId'] = dto.designationId;
    if (dto.jobGradeId    !== undefined) patch['jobGradeId']    = dto.jobGradeId;
    if (dto.employmentTypeId     !== undefined) patch['employmentTypeId']     = dto.employmentTypeId;
    if (dto.employmentCategoryId !== undefined) patch['employmentCategoryId'] = dto.employmentCategoryId;
    if (dto.managerId  !== undefined) patch['managerId']  = dto.managerId;
    if (dto.hodId      !== undefined) patch['hodId']      = dto.hodId;
    if (dto.subHodId   !== undefined) patch['subHodId']   = dto.subHodId;
    if (dto.firstName  !== undefined) patch['firstName']  = dto.firstName;
    if (dto.lastName   !== undefined) patch['lastName']   = dto.lastName;
    if (dto.displayName !== undefined) patch['displayName'] = dto.displayName;
    if (dto.gender     !== undefined) patch['gender']     = dto.gender;
    if (dto.maritalStatus !== undefined) patch['maritalStatus'] = dto.maritalStatus;
    if (dto.dateOfBirth !== undefined) patch['dateOfBirth'] = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    if (dto.joiningDate !== undefined) patch['joiningDate'] = new Date(dto.joiningDate!);
    if (dto.officialEmail !== undefined) patch['officialEmail'] = dto.officialEmail;
    if (dto.personalEmail !== undefined) patch['personalEmail'] = dto.personalEmail;
    if (dto.mobile     !== undefined) patch['mobile']     = dto.mobile;
    if (dto.profilePicUrl !== undefined) patch['profilePicUrl'] = dto.profilePicUrl;

    const updated = await this.prisma.orm.public.Employee.where({ id }).update(patch as any);

    if (dto.departmentId !== undefined && dto.departmentId !== emp.departmentId) {
      await this.logOrgHistory(id, 'DEPARTMENT_CHANGED', emp.departmentId, dto.departmentId ?? null, actorId, new Date());
    }
    if (dto.managerId !== undefined && dto.managerId !== emp.managerId) {
      await this.logOrgHistory(id, 'MANAGER_CHANGED', emp.managerId, dto.managerId ?? null, actorId, new Date());
    }
    if (dto.designationId !== undefined && dto.designationId !== emp.designationId) {
      await this.logOrgHistory(id, 'DESIGNATION_CHANGED', emp.designationId, dto.designationId ?? null, actorId, new Date());
    }

    return updated;
  }

  // ─── Transfer ─────────────────────────────────────────────────────────────

  async transfer(id: string, dto: TransferEmployeeDto, actorId: string) {
    const emp = await this.get(id);
    const effective = dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date();

    const patch: Record<string, unknown> = { updatedAt: now() };
    const changes: Array<{ type: string; old: unknown; new: unknown }> = [];

    if (dto.companyId    !== undefined && dto.companyId    !== emp.companyId)    { patch['companyId']    = dto.companyId;    changes.push({ type: 'COMPANY_CHANGED',    old: emp.companyId,    new: dto.companyId }); }
    if (dto.locationId   !== undefined && dto.locationId   !== emp.locationId)   { patch['locationId']   = dto.locationId;   changes.push({ type: 'LOCATION_CHANGED',   old: emp.locationId,   new: dto.locationId }); }
    if (dto.divisionId   !== undefined && dto.divisionId   !== emp.divisionId)   { patch['divisionId']   = dto.divisionId;   changes.push({ type: 'DIVISION_CHANGED',   old: emp.divisionId,   new: dto.divisionId }); }
    if (dto.departmentId !== undefined && dto.departmentId !== emp.departmentId) { patch['departmentId'] = dto.departmentId; changes.push({ type: 'DEPARTMENT_CHANGED', old: emp.departmentId, new: dto.departmentId }); }
    if (dto.sectionId    !== undefined && dto.sectionId    !== emp.sectionId)    { patch['sectionId']    = dto.sectionId;    changes.push({ type: 'SECTION_CHANGED',    old: emp.sectionId,    new: dto.sectionId }); }
    if (dto.designationId !== undefined && dto.designationId !== emp.designationId) { patch['designationId'] = dto.designationId; changes.push({ type: 'DESIGNATION_CHANGED', old: emp.designationId, new: dto.designationId }); }
    if (dto.managerId    !== undefined && dto.managerId    !== emp.managerId) {
      if (dto.managerId) {
        if (dto.managerId === id) throw new BadRequestException('Employee cannot be their own manager');
        await this.checkManagerCycle(id, dto.managerId);
      }
      patch['managerId'] = dto.managerId;
      changes.push({ type: 'MANAGER_CHANGED', old: emp.managerId, new: dto.managerId });
    }

    if (Object.keys(patch).length === 1) throw new BadRequestException('No changes provided for transfer');

    await this.prisma.orm.public.Employee.where({ id }).update(patch as any);

    for (const c of changes) {
      await this.logOrgHistory(id, c.type, c.old as string | null, c.new as string | null, actorId, effective);
    }

    return this.get(id);
  }

  // ─── Lifecycle actions ────────────────────────────────────────────────────

  async exitEmployee(id: string, dto: ExitEmployeeDto, actorId: string) {
    const emp = await this.get(id);
    if (['RESIGNED', 'TERMINATED', 'EXITED'].includes(emp.status)) {
      throw new BadRequestException('Employee has already exited');
    }

    const exitStatus = dto.exitStatus ?? 'EXITED';
    await this.prisma.orm.public.Employee.where({ id }).update({
      status: exitStatus,
      exitDate: new Date(dto.exitDate),
      updatedAt: now(),
    } as any);

    await this.logOrgHistory(id, 'EXITED', emp.status, exitStatus, actorId, new Date(dto.exitDate));

    return this.get(id);
  }

  async rehireEmployee(id: string, joiningDate: string, actorId: string) {
    const emp = await this.get(id);
    if (!['RESIGNED', 'TERMINATED', 'EXITED'].includes(emp.status)) {
      throw new BadRequestException('Only exited employees can be rehired');
    }

    await this.prisma.orm.public.Employee.where({ id }).update({
      status: 'ACTIVE',
      exitDate: null,
      joiningDate: new Date(joiningDate),
      updatedAt: now(),
    } as any);

    await this.logOrgHistory(id, 'REHIRED', emp.status, 'ACTIVE', actorId, new Date(joiningDate));

    return this.get(id);
  }

  async assignManager(id: string, dto: AssignManagerDto, actorId: string) {
    const emp = await this.get(id);

    if (dto.managerId) {
      if (dto.managerId === id) throw new BadRequestException('Employee cannot be their own manager');
      await this.get(dto.managerId);
      await this.checkManagerCycle(id, dto.managerId);
    }

    await this.prisma.orm.public.Employee.where({ id }).update({
      managerId: dto.managerId ?? null,
      updatedAt: now(),
    } as any);

    await this.logOrgHistory(id, 'MANAGER_CHANGED', emp.managerId, dto.managerId ?? null, actorId, new Date());

    return this.get(id);
  }

  async softDelete(id: string, actorId: string) {
    const emp = await this.get(id);
    if (!['RESIGNED', 'TERMINATED', 'EXITED'].includes(emp.status)) {
      throw new BadRequestException('Employee must be exited before deletion');
    }

    await this.prisma.orm.public.Employee.where({ id }).update({
      deletedAt: now(),
      updatedAt: now(),
    } as any);

    await this.logOrgHistory(id, 'DELETED', null, null, actorId, new Date());
  }

  // ─── Reporting tree ───────────────────────────────────────────────────────

  async getDirectReports(id: string) {
    await this.get(id);
    return this.prisma.orm.public.Employee
      .where({ managerId: id, deletedAt: null })
      .orderBy(m => (m as any).firstName.asc())
      .all();
  }

  async getReportingChain(id: string): Promise<any[]> {
    const emp = await this.get(id);
    if (!emp.managerId) return [];

    const chain: any[] = [];
    let currentId: string | null = emp.managerId;
    const visited = new Set<string>();

    while (currentId) {
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const manager = await this.prisma.orm.public.Employee
        .where({ id: currentId })
        .first();
      if (!manager) break;

      chain.push({
        id: manager.id,
        employeeCode: manager.employeeCode,
        firstName: manager.firstName,
        lastName: manager.lastName,
        displayName: manager.displayName,
        designationId: manager.designationId,
      });
      currentId = manager.managerId as string | null;
    }

    return chain;
  }

  // ─── Org history ──────────────────────────────────────────────────────────

  async getOrgHistory(employeeId: string) {
    await this.get(employeeId);
    return this.prisma.orm.public.EmployeeOrgHistory
      .where({ employeeId })
      .orderBy(m => (m as any).effectiveFrom.desc())
      .all();
  }

  // ─── Cycle detection ─────────────────────────────────────────────────────

  private async checkManagerCycle(employeeId: string, proposedManagerId: string): Promise<void> {
    const visited = new Set<string>();
    let currentId: string | null = proposedManagerId;

    while (currentId) {
      if (currentId === employeeId) {
        throw new BadRequestException('Assigning this manager would create a reporting cycle');
      }
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const mgr: any = await this.prisma.orm.public.Employee
        .where({ id: currentId })
        .first();
      currentId = (mgr?.managerId as string | null) ?? null;
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async logOrgHistory(
    employeeId: string,
    changeType: string,
    oldValue: string | null | undefined,
    newValue: string | null | undefined,
    changedById: string,
    effectiveFrom: Date,
  ) {
    await this.prisma.orm.public.EmployeeOrgHistory.create({
      employeeId,
      changeType: changeType as any,
      oldValue: oldValue ?? null,
      newValue: newValue ?? null,
      changedById,
      effectiveFrom,
      effectiveTo: null,
    } as any);
  }

  // ─── User binding ─────────────────────────────────────────────────────────

  async bindUser(employeeId: string, dto: BindUserDto) {
    await this.get(employeeId);

    const user = await this.prisma.orm.public.User.where({ id: dto.userId }).first();
    if (!user) throw new NotFoundException('User not found');

    const alreadyBound = await this.prisma.orm.public.Employee
      .where({ userId: dto.userId })
      .first();
    if (alreadyBound && alreadyBound.id !== employeeId) {
      throw new ConflictException('User is already bound to another employee');
    }

    return this.prisma.orm.public.Employee.where({ id: employeeId }).update({
      userId: dto.userId,
      updatedAt: now(),
    } as any);
  }

  async unbindUser(employeeId: string) {
    await this.get(employeeId);
    return this.prisma.orm.public.Employee.where({ id: employeeId }).update({
      userId: null,
      updatedAt: now(),
    } as any);
  }

  // ─── Emergency contacts ───────────────────────────────────────────────────

  async listEmergencyContacts(employeeId: string) {
    await this.get(employeeId);
    return this.prisma.orm.public.EmergencyContact
      .where({ employeeId })
      .orderBy(m => (m as any).priority.asc())
      .all();
  }

  async addEmergencyContact(employeeId: string, dto: CreateEmergencyContactDto) {
    await this.get(employeeId);
    return this.prisma.orm.public.EmergencyContact.create({
      employeeId,
      name: dto.name as any,
      relationship: dto.relationship ?? null,
      phone: dto.phone as any,
      alternatePhone: dto.alternatePhone ?? null,
      address: dto.address ?? null,
      priority: dto.priority ?? 1,
    } as any);
  }

  async updateEmergencyContact(employeeId: string, contactId: string, dto: UpdateEmergencyContactDto) {
    await this.get(employeeId);
    const contact = await this.prisma.orm.public.EmergencyContact
      .where({ id: contactId, employeeId })
      .first();
    if (!contact) throw new NotFoundException('Emergency contact not found');

    return this.prisma.orm.public.EmergencyContact.where({ id: contactId }).update({
      ...(dto.name          !== undefined && { name: dto.name }),
      ...(dto.relationship  !== undefined && { relationship: dto.relationship }),
      ...(dto.phone         !== undefined && { phone: dto.phone }),
      ...(dto.alternatePhone !== undefined && { alternatePhone: dto.alternatePhone }),
      ...(dto.address       !== undefined && { address: dto.address }),
      ...(dto.priority      !== undefined && { priority: dto.priority }),
      updatedAt: now(),
    } as any);
  }

  async deleteEmergencyContact(employeeId: string, contactId: string) {
    await this.get(employeeId);
    const contact = await this.prisma.orm.public.EmergencyContact
      .where({ id: contactId, employeeId })
      .first();
    if (!contact) throw new NotFoundException('Emergency contact not found');
    await this.prisma.orm.public.EmergencyContact.where({ id: contactId }).delete();
  }

  // ─── Bank detail ──────────────────────────────────────────────────────────

  async getBankDetail(employeeId: string) {
    await this.get(employeeId);
    return this.prisma.orm.public.EmployeeBankDetail
      .where({ employeeId })
      .first();
  }

  async upsertBankDetail(employeeId: string, dto: UpsertBankDetailDto) {
    await this.get(employeeId);
    const existing = await this.prisma.orm.public.EmployeeBankDetail
      .where({ employeeId })
      .first();

    if (existing) {
      return this.prisma.orm.public.EmployeeBankDetail.where({ id: existing.id }).update({
        accountName: dto.accountName as any,
        accountNumber: dto.accountNumber as any,
        ifsc: dto.ifsc as any,
        bankName: dto.bankName ?? null,
        branch: dto.branch ?? null,
        isVerified: false,
        updatedAt: now(),
      } as any);
    }

    return this.prisma.orm.public.EmployeeBankDetail.create({
      employeeId,
      accountName: dto.accountName as any,
      accountNumber: dto.accountNumber as any,
      ifsc: dto.ifsc as any,
      bankName: dto.bankName ?? null,
      branch: dto.branch ?? null,
      isVerified: false,
    } as any);
  }

  async verifyBankDetail(employeeId: string) {
    await this.get(employeeId);
    const detail = await this.prisma.orm.public.EmployeeBankDetail
      .where({ employeeId })
      .first();
    if (!detail) throw new NotFoundException('Bank detail not found');
    return this.prisma.orm.public.EmployeeBankDetail.where({ id: detail.id }).update({
      isVerified: true,
      updatedAt: now(),
    } as any);
  }

  // ─── Documents ────────────────────────────────────────────────────────────

  async listDocuments(employeeId: string) {
    await this.get(employeeId);
    return this.prisma.orm.public.EmployeeDocument
      .where({ employeeId, deletedAt: null })
      .orderBy(m => (m as any).createdAt.desc())
      .all();
  }

  async uploadDocument(employeeId: string, dto: UploadDocumentDto, uploadedById: string) {
    await this.get(employeeId);
    const category = await this.prisma.orm.public.DocumentCategory
      .where({ id: dto.categoryId })
      .first();
    if (!category) throw new NotFoundException('Document category not found');
    if (!category.isActive) throw new BadRequestException('Document category is inactive');

    return this.prisma.orm.public.EmployeeDocument.create({
      employeeId,
      categoryId: dto.categoryId,
      filename: dto.filename as any,
      mimeType: dto.mimeType as any,
      sizeBytes: null,
      storageKey: dto.storageKey,
      documentNumber: dto.documentNumber ?? null,
      issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      verificationStatus: 'PENDING',
      verifiedById: null,
      verifiedAt: null,
      verificationNote: null,
      uploadedById,
      deletedAt: null,
    } as any);
  }

  async verifyDocument(employeeId: string, documentId: string, dto: VerifyDocumentDto, verifiedById: string) {
    await this.get(employeeId);
    const doc = await this.prisma.orm.public.EmployeeDocument
      .where({ id: documentId, employeeId, deletedAt: null })
      .first();
    if (!doc) throw new NotFoundException('Document not found');

    return this.prisma.orm.public.EmployeeDocument.where({ id: documentId }).update({
      verificationStatus: dto.verificationStatus,
      verifiedById,
      verifiedAt: now(),
      verificationNote: dto.verificationNote ?? null,
      updatedAt: now(),
    } as any);
  }

  async deleteDocument(employeeId: string, documentId: string) {
    await this.get(employeeId);
    const doc = await this.prisma.orm.public.EmployeeDocument
      .where({ id: documentId, employeeId, deletedAt: null })
      .first();
    if (!doc) throw new NotFoundException('Document not found');
    await this.prisma.orm.public.EmployeeDocument.where({ id: documentId }).update({
      deletedAt: now(),
      updatedAt: now(),
    } as any);
  }

  // ─── Custom fields ────────────────────────────────────────────────────────

  async listCustomFields() {
    return this.prisma.orm.public.EmployeeCustomField
      .where({ isActive: true })
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async createCustomField(dto: CreateCustomFieldDto) {
    const dup = await this.prisma.orm.public.EmployeeCustomField
      .where({ code: dto.code as any })
      .first();
    if (dup) throw new ConflictException('Custom field code already exists');

    return this.prisma.orm.public.EmployeeCustomField.create({
      code: dto.code as any,
      name: dto.name as any,
      fieldType: dto.fieldType as any,
      isRequired: dto.isRequired ?? false,
      defaultValue: dto.defaultValue ?? null,
      options: dto.options ?? null,
      validationRule: dto.validationRule ?? null,
      visibleTo: dto.visibleTo ?? null,
      editableBy: dto.editableBy ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    } as any);
  }

  async updateCustomField(fieldId: string, dto: UpdateCustomFieldDto) {
    const field = await this.prisma.orm.public.EmployeeCustomField
      .where({ id: fieldId })
      .first();
    if (!field) throw new NotFoundException('Custom field not found');

    return this.prisma.orm.public.EmployeeCustomField.where({ id: fieldId }).update({
      ...(dto.name         !== undefined && { name: dto.name }),
      ...(dto.isRequired   !== undefined && { isRequired: dto.isRequired }),
      ...(dto.defaultValue !== undefined && { defaultValue: dto.defaultValue }),
      ...(dto.options      !== undefined && { options: dto.options }),
      ...(dto.validationRule !== undefined && { validationRule: dto.validationRule }),
      ...(dto.visibleTo    !== undefined && { visibleTo: dto.visibleTo }),
      ...(dto.editableBy   !== undefined && { editableBy: dto.editableBy }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.isActive     !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  async getEmployeeCustomFieldValues(employeeId: string) {
    await this.get(employeeId);
    return this.prisma.orm.public.EmployeeCustomFieldValue
      .where({ employeeId })
      .all();
  }

  async setCustomFieldValue(employeeId: string, dto: SetCustomFieldValueDto) {
    await this.get(employeeId);
    const field = await this.prisma.orm.public.EmployeeCustomField
      .where({ id: dto.fieldId })
      .first();
    if (!field) throw new NotFoundException('Custom field not found');
    if (!field.isActive) throw new BadRequestException('Custom field is inactive');

    const existing = await this.prisma.orm.public.EmployeeCustomFieldValue
      .where({ employeeId, fieldId: dto.fieldId })
      .first();

    if (existing) {
      return this.prisma.orm.public.EmployeeCustomFieldValue
        .where({ id: existing.id })
        .update({ value: dto.value ?? null, updatedAt: now() } as any);
    }

    return this.prisma.orm.public.EmployeeCustomFieldValue.create({
      employeeId,
      fieldId: dto.fieldId,
      value: dto.value ?? null,
    } as any);
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  async search(dto: EmployeeSearchDto) {
    const limit  = dto.limit  ?? 50;
    const offset = dto.offset ?? 0;
    const filters: Record<string, unknown> = {};

    if (dto.companyId)           filters['companyId']           = dto.companyId;
    if (dto.locationId)          filters['locationId']          = dto.locationId;
    if (dto.divisionId)          filters['divisionId']          = dto.divisionId;
    if (dto.departmentId)        filters['departmentId']        = dto.departmentId;
    if (dto.sectionId)           filters['sectionId']           = dto.sectionId;
    if (dto.designationId)       filters['designationId']       = dto.designationId;
    if (dto.jobGradeId)          filters['jobGradeId']          = dto.jobGradeId;
    if (dto.employmentTypeId)    filters['employmentTypeId']    = dto.employmentTypeId;
    if (dto.employmentCategoryId) filters['employmentCategoryId'] = dto.employmentCategoryId;
    if (dto.managerId)           filters['managerId']           = dto.managerId;
    if (dto.status)              filters['status']              = dto.status;
    if (dto.gender)              filters['gender']              = dto.gender;
    if (!dto.includeDeleted)     filters['deletedAt']           = null;

    // Free-text search: filter by firstName, lastName, employeeCode client-side
    // (Prisma ORM 7 doesn't expose raw LIKE — fetch with filters then filter)
    const sortField = dto.sortBy ?? 'firstName';
    const rows = await this.prisma.orm.public.Employee
      .where(filters)
      .orderBy(m => dto.sortDir === 'desc'
        ? (m as any)[sortField].desc()
        : (m as any)[sortField].asc())
      .all() as any[];

    const filtered = dto.q
      ? rows.filter((e: any) => {
          const q = dto.q!.toLowerCase();
          return (
            e.firstName?.toLowerCase().includes(q) ||
            e.lastName?.toLowerCase().includes(q) ||
            e.displayName?.toLowerCase().includes(q) ||
            e.employeeCode?.toLowerCase().includes(q) ||
            e.officialEmail?.toLowerCase().includes(q) ||
            e.mobile?.includes(q)
          );
        })
      : rows;

    const total = filtered.length;
    const data  = filtered.slice(offset, offset + limit);
    return { total, limit, offset, data };
  }

  // ─── Bulk operations ──────────────────────────────────────────────────────

  async bulkUpdateStatus(dto: BulkUpdateStatusDto, actorId: string) {
    const results: Array<{ id: string; ok: boolean; error?: string }> = [];
    for (const id of dto.ids) {
      try {
        const emp = await this.prisma.orm.public.Employee.where({ id }).first();
        if (!emp || emp.deletedAt) { results.push({ id, ok: false, error: 'Not found' }); continue; }
        await this.prisma.orm.public.Employee.where({ id }).update({
          status: dto.status,
          updatedAt: now(),
        } as any);
        await this.logOrgHistory(id, 'STATUS_CHANGED', emp.status, dto.status, actorId, new Date());
        results.push({ id, ok: true });
      } catch (e: any) {
        results.push({ id, ok: false, error: e.message });
      }
    }
    return results;
  }

  async bulkTransfer(dto: BulkTransferDto, actorId: string) {
    const patch: Record<string, unknown> = { updatedAt: now() };
    if (dto.locationId   !== undefined) patch['locationId']   = dto.locationId;
    if (dto.divisionId   !== undefined) patch['divisionId']   = dto.divisionId;
    if (dto.departmentId !== undefined) patch['departmentId'] = dto.departmentId;
    if (dto.sectionId    !== undefined) patch['sectionId']    = dto.sectionId;
    if (dto.designationId !== undefined) patch['designationId'] = dto.designationId;

    if (dto.managerId !== undefined) {
      for (const id of dto.ids) {
        if (dto.managerId === id) throw new BadRequestException(`Employee ${id} cannot be their own manager`);
        if (dto.managerId) await this.checkManagerCycle(id, dto.managerId);
      }
      patch['managerId'] = dto.managerId;
    }

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];
    for (const id of dto.ids) {
      try {
        const emp = await this.prisma.orm.public.Employee.where({ id }).first();
        if (!emp || emp.deletedAt) { results.push({ id, ok: false, error: 'Not found' }); continue; }
        await this.prisma.orm.public.Employee.where({ id }).update(patch as any);
        if (dto.departmentId !== undefined && dto.departmentId !== emp.departmentId) {
          await this.logOrgHistory(id, 'DEPARTMENT_CHANGED', emp.departmentId, dto.departmentId ?? null, actorId, new Date());
        }
        if (dto.managerId !== undefined && dto.managerId !== emp.managerId) {
          await this.logOrgHistory(id, 'MANAGER_CHANGED', emp.managerId, dto.managerId ?? null, actorId, new Date());
        }
        results.push({ id, ok: true });
      } catch (e: any) {
        results.push({ id, ok: false, error: e.message });
      }
    }
    return results;
  }

  async bulkAssignManager(dto: BulkAssignManagerDto, actorId: string) {
    if (dto.managerId) {
      for (const id of dto.ids) {
        if (dto.managerId === id) throw new BadRequestException(`Employee ${id} cannot be their own manager`);
        await this.checkManagerCycle(id, dto.managerId);
      }
    }

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];
    for (const id of dto.ids) {
      try {
        const emp = await this.prisma.orm.public.Employee.where({ id }).first();
        if (!emp || emp.deletedAt) { results.push({ id, ok: false, error: 'Not found' }); continue; }
        await this.prisma.orm.public.Employee.where({ id }).update({
          managerId: dto.managerId ?? null,
          updatedAt: now(),
        } as any);
        await this.logOrgHistory(id, 'MANAGER_CHANGED', emp.managerId, dto.managerId ?? null, actorId, new Date());
        results.push({ id, ok: true });
      } catch (e: any) {
        results.push({ id, ok: false, error: e.message });
      }
    }
    return results;
  }

  // ─── Effective access viewer ──────────────────────────────────────────────

  async getEffectiveAccess(employeeId: string) {
    const emp = await this.get(employeeId);
    if (!emp.userId) return { employeeId, userId: null, roles: [], permissions: [], message: 'No user account bound' };

    const roles       = await this.authz.getUserRoles(emp.userId);
    const permissions = await this.authz.getUserPermissions(emp.userId);

    return {
      employeeId,
      userId: emp.userId,
      roles,
      permissions,
    };
  }

  // ─── Document categories (admin) ──────────────────────────────────────────

  async listDocumentCategories() {
    return this.prisma.orm.public.DocumentCategory
      .where({ isActive: true })
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async getDocumentCategory(id: string) {
    const cat = await this.prisma.orm.public.DocumentCategory.where({ id }).first();
    if (!cat) throw new NotFoundException('Document category not found');
    return cat;
  }

  async createDocumentCategory(dto: {
    code: string; name: string; description?: string;
    isRequired?: boolean; allowedMimeTypes?: string; maxFileSizeMb?: number;
    issueDateRequired?: boolean; expiryDateRequired?: boolean;
    verificationRequired?: boolean; displayOrder?: number;
  }) {
    const dup = await this.prisma.orm.public.DocumentCategory.where({ code: dto.code as any }).first();
    if (dup) throw new ConflictException('Document category code already exists');
    return this.prisma.orm.public.DocumentCategory.create({
      code: dto.code as any,
      name: dto.name as any,
      description: dto.description ?? null,
      isRequired: dto.isRequired ?? false,
      allowedMimeTypes: dto.allowedMimeTypes ?? null,
      maxFileSizeMb: dto.maxFileSizeMb ?? 10,
      issueDateRequired: dto.issueDateRequired ?? false,
      expiryDateRequired: dto.expiryDateRequired ?? false,
      verificationRequired: dto.verificationRequired ?? false,
      isActive: true,
      displayOrder: dto.displayOrder ?? 0,
    } as any);
  }

  async updateDocumentCategory(id: string, dto: Partial<{
    name: string; description: string; isRequired: boolean;
    allowedMimeTypes: string; maxFileSizeMb: number;
    issueDateRequired: boolean; expiryDateRequired: boolean;
    verificationRequired: boolean; displayOrder: number; isActive: boolean;
  }>) {
    await this.getDocumentCategory(id);
    return this.prisma.orm.public.DocumentCategory.where({ id }).update({
      ...dto,
      updatedAt: now(),
    } as any);
  }
}
