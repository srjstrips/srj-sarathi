import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto.js';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto.js';
import { CreateDivisionDto, UpdateDivisionDto } from './dto/division.dto.js';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto.js';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto.js';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/designation.dto.js';
import { CreateLookupDto, UpdateLookupDto, CreateEmployeeStatusConfigDto, UpdateEmployeeStatusConfigDto } from './dto/lookup.dto.js';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Company ──────────────────────────────────────────────────────────────

  async listCompanies() {
    return this.prisma.orm.public.Company
      .orderBy(m => (m as any).name.asc())
      .all();
  }

  async getCompany(id: string) {
    const company = await this.prisma.orm.public.Company.where({ id }).first();
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async createCompany(dto: CreateCompanyDto) {
    const existing = await this.prisma.orm.public.Company.where({ code: dto.code as any }).first();
    if (existing) throw new ConflictException('Company code already exists');
    return this.prisma.orm.public.Company.create({
      name: dto.name as any,
      code: dto.code as any,
      legalName: dto.legalName ?? null,
      description: dto.description ?? null,
      logoUrl: dto.logoUrl ?? null,
      isActive: true,
    } as any);
  }

  async updateCompany(id: string, dto: UpdateCompanyDto) {
    await this.getCompany(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.Company
        .where({ code: dto.code as any })
        .first();
      if (dup && dup.id !== id) throw new ConflictException('Company code already exists');
    }
    return this.prisma.orm.public.Company.where({ id }).update({
      ...(dto.name        !== undefined && { name: dto.name }),
      ...(dto.code        !== undefined && { code: dto.code }),
      ...(dto.legalName   !== undefined && { legalName: dto.legalName }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.logoUrl     !== undefined && { logoUrl: dto.logoUrl }),
      ...(dto.isActive    !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Location ─────────────────────────────────────────────────────────────

  async listLocations(companyId?: string) {
    const filters: Record<string, unknown> = {};
    if (companyId) filters['companyId'] = companyId;
    return this.prisma.orm.public.Location
      .where(filters)
      .orderBy(m => (m as any).name.asc())
      .all();
  }

  async getLocation(id: string) {
    const loc = await this.prisma.orm.public.Location.where({ id }).first();
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }

  async createLocation(dto: CreateLocationDto) {
    await this.getCompany(dto.companyId);
    const dup = await this.prisma.orm.public.Location
      .where({ companyId: dto.companyId, code: dto.code as any })
      .first();
    if (dup) throw new ConflictException('Location code already exists in this company');
    return this.prisma.orm.public.Location.create({
      companyId: dto.companyId,
      name: dto.name as any,
      code: dto.code as any,
      address: dto.address ?? null,
      city: dto.city ?? null,
      state: dto.state ?? null,
      country: dto.country ?? null,
      description: dto.description ?? null,
      isActive: true,
    } as any);
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    const loc = await this.getLocation(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.Location
        .where({ companyId: loc.companyId, code: dto.code as any })
        .first();
      if (dup && dup.id !== id) throw new ConflictException('Location code already exists in this company');
    }
    return this.prisma.orm.public.Location.where({ id }).update({
      ...(dto.name        !== undefined && { name: dto.name }),
      ...(dto.code        !== undefined && { code: dto.code }),
      ...(dto.address     !== undefined && { address: dto.address }),
      ...(dto.city        !== undefined && { city: dto.city }),
      ...(dto.state       !== undefined && { state: dto.state }),
      ...(dto.country     !== undefined && { country: dto.country }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.isActive    !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Division ─────────────────────────────────────────────────────────────

  async listDivisions(locationId?: string) {
    const filters: Record<string, unknown> = {};
    if (locationId) filters['locationId'] = locationId;
    return this.prisma.orm.public.Division
      .where(filters)
      .orderBy(m => (m as any).name.asc())
      .all();
  }

  async getDivision(id: string) {
    const div = await this.prisma.orm.public.Division.where({ id }).first();
    if (!div) throw new NotFoundException('Division not found');
    return div;
  }

  async createDivision(dto: CreateDivisionDto) {
    await this.getLocation(dto.locationId);
    const dup = await this.prisma.orm.public.Division
      .where({ locationId: dto.locationId, code: dto.code as any })
      .first();
    if (dup) throw new ConflictException('Division code already exists in this location');
    return this.prisma.orm.public.Division.create({
      locationId: dto.locationId,
      name: dto.name as any,
      code: dto.code as any,
      description: dto.description ?? null,
      isActive: true,
    } as any);
  }

  async updateDivision(id: string, dto: UpdateDivisionDto) {
    const div = await this.getDivision(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.Division
        .where({ locationId: div.locationId, code: dto.code as any })
        .first();
      if (dup && dup.id !== id) throw new ConflictException('Division code already exists in this location');
    }
    return this.prisma.orm.public.Division.where({ id }).update({
      ...(dto.name        !== undefined && { name: dto.name }),
      ...(dto.code        !== undefined && { code: dto.code }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.isActive    !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Department ───────────────────────────────────────────────────────────

  async listDepartments(divisionId?: string) {
    const filters: Record<string, unknown> = {};
    if (divisionId) filters['divisionId'] = divisionId;
    return this.prisma.orm.public.Department
      .where(filters)
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async getDepartment(id: string) {
    const dept = await this.prisma.orm.public.Department.where({ id }).first();
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async createDepartment(dto: CreateDepartmentDto) {
    await this.getDivision(dto.divisionId);
    const dup = await this.prisma.orm.public.Department
      .where({ divisionId: dto.divisionId, code: dto.code as any })
      .first();
    if (dup) throw new ConflictException('Department code already exists in this division');
    if (dto.parentId) {
      const parent = await this.prisma.orm.public.Department.where({ id: dto.parentId }).first();
      if (!parent) throw new BadRequestException('Parent department not found');
    }
    return this.prisma.orm.public.Department.create({
      divisionId: dto.divisionId,
      name: dto.name as any,
      code: dto.code as any,
      description: dto.description ?? null,
      hodId: dto.hodId ?? null,
      parentId: dto.parentId ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    } as any);
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    const dept = await this.getDepartment(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.Department
        .where({ divisionId: dept.divisionId, code: dto.code as any })
        .first();
      if (dup && dup.id !== id) throw new ConflictException('Department code already exists in this division');
    }
    if (dto.parentId) {
      if (dto.parentId === id) throw new BadRequestException('Department cannot be its own parent');
      const parent = await this.prisma.orm.public.Department.where({ id: dto.parentId }).first();
      if (!parent) throw new BadRequestException('Parent department not found');
    }
    return this.prisma.orm.public.Department.where({ id }).update({
      ...(dto.name         !== undefined && { name: dto.name }),
      ...(dto.code         !== undefined && { code: dto.code }),
      ...(dto.description  !== undefined && { description: dto.description }),
      ...(dto.hodId        !== undefined && { hodId: dto.hodId }),
      ...(dto.parentId     !== undefined && { parentId: dto.parentId }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.isActive     !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Section ──────────────────────────────────────────────────────────────

  async listSections(departmentId?: string) {
    const filters: Record<string, unknown> = {};
    if (departmentId) filters['departmentId'] = departmentId;
    return this.prisma.orm.public.Section
      .where(filters)
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async getSection(id: string) {
    const sec = await this.prisma.orm.public.Section.where({ id }).first();
    if (!sec) throw new NotFoundException('Section not found');
    return sec;
  }

  async createSection(dto: CreateSectionDto) {
    await this.getDepartment(dto.departmentId);
    return this.prisma.orm.public.Section.create({
      departmentId: dto.departmentId,
      name: dto.name as any,
      code: dto.code ?? null,
      description: dto.description ?? null,
      subHodId: dto.subHodId ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    } as any);
  }

  async updateSection(id: string, dto: UpdateSectionDto) {
    await this.getSection(id);
    return this.prisma.orm.public.Section.where({ id }).update({
      ...(dto.name         !== undefined && { name: dto.name }),
      ...(dto.code         !== undefined && { code: dto.code }),
      ...(dto.description  !== undefined && { description: dto.description }),
      ...(dto.subHodId     !== undefined && { subHodId: dto.subHodId }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.isActive     !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Designation ──────────────────────────────────────────────────────────

  async listDesignations(sectionId?: string) {
    const filters: Record<string, unknown> = {};
    if (sectionId) filters['sectionId'] = sectionId;
    return this.prisma.orm.public.Designation
      .where(filters)
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async getDesignation(id: string) {
    const des = await this.prisma.orm.public.Designation.where({ id }).first();
    if (!des) throw new NotFoundException('Designation not found');
    return des;
  }

  async createDesignation(dto: CreateDesignationDto) {
    if (dto.code) {
      const dup = await this.prisma.orm.public.Designation.where({ code: dto.code as any }).first();
      if (dup) throw new ConflictException('Designation code already exists');
    }
    return this.prisma.orm.public.Designation.create({
      name: dto.name as any,
      code: dto.code ?? null,
      description: dto.description ?? null,
      level: dto.level ?? 0,
      jobGradeId: dto.jobGradeId ?? null,
      sectionId: dto.sectionId ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    } as any);
  }

  async updateDesignation(id: string, dto: UpdateDesignationDto) {
    await this.getDesignation(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.Designation.where({ code: dto.code as any }).first();
      if (dup && dup.id !== id) throw new ConflictException('Designation code already exists');
    }
    return this.prisma.orm.public.Designation.where({ id }).update({
      ...(dto.name         !== undefined && { name: dto.name }),
      ...(dto.code         !== undefined && { code: dto.code }),
      ...(dto.description  !== undefined && { description: dto.description }),
      ...(dto.level        !== undefined && { level: dto.level }),
      ...(dto.jobGradeId   !== undefined && { jobGradeId: dto.jobGradeId }),
      ...(dto.sectionId    !== undefined && { sectionId: dto.sectionId }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.isActive     !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Job Grade ────────────────────────────────────────────────────────────

  async listJobGrades() {
    return this.prisma.orm.public.JobGrade
      .where({ isActive: true })
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async getJobGrade(id: string) {
    const jg = await this.prisma.orm.public.JobGrade.where({ id }).first();
    if (!jg) throw new NotFoundException('Job grade not found');
    return jg;
  }

  async createJobGrade(dto: CreateLookupDto) {
    const dup = await this.prisma.orm.public.JobGrade.where({ code: dto.code as any }).first();
    if (dup) throw new ConflictException('Job grade code already exists');
    return this.prisma.orm.public.JobGrade.create({
      code: dto.code as any,
      name: dto.name as any,
      description: dto.description ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    } as any);
  }

  async updateJobGrade(id: string, dto: UpdateLookupDto) {
    await this.getJobGrade(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.JobGrade.where({ code: dto.code as any }).first();
      if (dup && dup.id !== id) throw new ConflictException('Job grade code already exists');
    }
    return this.prisma.orm.public.JobGrade.where({ id }).update({
      ...(dto.name         !== undefined && { name: dto.name }),
      ...(dto.code         !== undefined && { code: dto.code }),
      ...(dto.description  !== undefined && { description: dto.description }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.isActive     !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Employment Type ──────────────────────────────────────────────────────

  async listEmploymentTypes() {
    return this.prisma.orm.public.EmploymentType
      .where({ isActive: true })
      .orderBy(m => (m as any).name.asc())
      .all();
  }

  async getEmploymentType(id: string) {
    const et = await this.prisma.orm.public.EmploymentType.where({ id }).first();
    if (!et) throw new NotFoundException('Employment type not found');
    return et;
  }

  async createEmploymentType(dto: CreateLookupDto) {
    const dup = await this.prisma.orm.public.EmploymentType.where({ code: dto.code as any }).first();
    if (dup) throw new ConflictException('Employment type code already exists');
    return this.prisma.orm.public.EmploymentType.create({
      code: dto.code as any,
      name: dto.name as any,
      description: dto.description ?? null,
      isActive: true,
    } as any);
  }

  async updateEmploymentType(id: string, dto: UpdateLookupDto) {
    await this.getEmploymentType(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.EmploymentType.where({ code: dto.code as any }).first();
      if (dup && dup.id !== id) throw new ConflictException('Employment type code already exists');
    }
    return this.prisma.orm.public.EmploymentType.where({ id }).update({
      ...(dto.name        !== undefined && { name: dto.name }),
      ...(dto.code        !== undefined && { code: dto.code }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.isActive    !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Employment Category ──────────────────────────────────────────────────

  async listEmploymentCategories() {
    return this.prisma.orm.public.EmploymentCategory
      .where({ isActive: true })
      .orderBy(m => (m as any).name.asc())
      .all();
  }

  async getEmploymentCategory(id: string) {
    const ec = await this.prisma.orm.public.EmploymentCategory.where({ id }).first();
    if (!ec) throw new NotFoundException('Employment category not found');
    return ec;
  }

  async createEmploymentCategory(dto: CreateLookupDto) {
    const dup = await this.prisma.orm.public.EmploymentCategory.where({ code: dto.code as any }).first();
    if (dup) throw new ConflictException('Employment category code already exists');
    return this.prisma.orm.public.EmploymentCategory.create({
      code: dto.code as any,
      name: dto.name as any,
      description: dto.description ?? null,
      isActive: true,
    } as any);
  }

  async updateEmploymentCategory(id: string, dto: UpdateLookupDto) {
    await this.getEmploymentCategory(id);
    if (dto.code) {
      const dup = await this.prisma.orm.public.EmploymentCategory.where({ code: dto.code as any }).first();
      if (dup && dup.id !== id) throw new ConflictException('Employment category code already exists');
    }
    return this.prisma.orm.public.EmploymentCategory.where({ id }).update({
      ...(dto.name        !== undefined && { name: dto.name }),
      ...(dto.code        !== undefined && { code: dto.code }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.isActive    !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Employee Status Config ───────────────────────────────────────────────

  async listEmployeeStatusConfigs() {
    return this.prisma.orm.public.EmployeeStatusConfig
      .orderBy(m => (m as any).displayOrder.asc())
      .all();
  }

  async getEmployeeStatusConfig(id: string) {
    const esc = await this.prisma.orm.public.EmployeeStatusConfig.where({ id }).first();
    if (!esc) throw new NotFoundException('Employee status config not found');
    return esc;
  }

  async createEmployeeStatusConfig(dto: CreateEmployeeStatusConfigDto) {
    const dup = await this.prisma.orm.public.EmployeeStatusConfig.where({ code: dto.code as any }).first();
    if (dup) throw new ConflictException('Employee status code already exists');
    return this.prisma.orm.public.EmployeeStatusConfig.create({
      code: dto.code as any,
      name: dto.name as any,
      description: dto.description ?? null,
      isSystem: false,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    } as any);
  }

  async updateEmployeeStatusConfig(id: string, dto: UpdateEmployeeStatusConfigDto) {
    const esc = await this.getEmployeeStatusConfig(id);
    if (esc.isSystem) throw new BadRequestException('System statuses cannot be modified');
    if (dto.code) {
      const dup = await this.prisma.orm.public.EmployeeStatusConfig.where({ code: dto.code as any }).first();
      if (dup && dup.id !== id) throw new ConflictException('Employee status code already exists');
    }
    return this.prisma.orm.public.EmployeeStatusConfig.where({ id }).update({
      ...(dto.name         !== undefined && { name: dto.name }),
      ...(dto.code         !== undefined && { code: dto.code }),
      ...(dto.description  !== undefined && { description: dto.description }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.isActive     !== undefined && { isActive: dto.isActive }),
      updatedAt: now(),
    } as any);
  }

  // ─── Tree helpers ─────────────────────────────────────────────────────────

  async getOrgTree(companyId: string) {
    await this.getCompany(companyId);
    const [locations, divisions, departments, sections] = await Promise.all([
      this.prisma.orm.public.Location.where({ companyId }).all(),
      this.prisma.orm.public.Division.all(),
      this.prisma.orm.public.Department.all(),
      this.prisma.orm.public.Section.all(),
    ]);
    return { locations, divisions, departments, sections };
  }
}
