import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { OrgService } from './org.service.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto.js';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto.js';
import { CreateDivisionDto, UpdateDivisionDto } from './dto/division.dto.js';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto.js';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto.js';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/designation.dto.js';
import { CreateLookupDto, UpdateLookupDto, CreateEmployeeStatusConfigDto, UpdateEmployeeStatusConfigDto } from './dto/lookup.dto.js';

@Controller('org')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class OrgController {
  constructor(private readonly org: OrgService) {}

  // ─── Company ──────────────────────────────────────────────────────────────

  @Get('companies')
  @RequirePermissions('org:read')
  listCompanies() { return this.org.listCompanies(); }

  @Get('companies/:id')
  @RequirePermissions('org:read')
  getCompany(@Param('id', ParseUUIDPipe) id: string) { return this.org.getCompany(id); }

  @Post('companies')
  @RequirePermissions('org:write')
  createCompany(@Body() dto: CreateCompanyDto) { return this.org.createCompany(dto); }

  @Patch('companies/:id')
  @RequirePermissions('org:write')
  updateCompany(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyDto) {
    return this.org.updateCompany(id, dto);
  }

  @Get('companies/:id/tree')
  @RequirePermissions('org:read')
  getOrgTree(@Param('id', ParseUUIDPipe) id: string) { return this.org.getOrgTree(id); }

  // ─── Location ─────────────────────────────────────────────────────────────

  @Get('locations')
  @RequirePermissions('org:read')
  listLocations(@Query('companyId') companyId?: string) { return this.org.listLocations(companyId); }

  @Get('locations/:id')
  @RequirePermissions('org:read')
  getLocation(@Param('id', ParseUUIDPipe) id: string) { return this.org.getLocation(id); }

  @Post('locations')
  @RequirePermissions('org:write')
  createLocation(@Body() dto: CreateLocationDto) { return this.org.createLocation(dto); }

  @Patch('locations/:id')
  @RequirePermissions('org:write')
  updateLocation(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLocationDto) {
    return this.org.updateLocation(id, dto);
  }

  // ─── Division ─────────────────────────────────────────────────────────────

  @Get('divisions')
  @RequirePermissions('org:read')
  listDivisions(@Query('locationId') locationId?: string) { return this.org.listDivisions(locationId); }

  @Get('divisions/:id')
  @RequirePermissions('org:read')
  getDivision(@Param('id', ParseUUIDPipe) id: string) { return this.org.getDivision(id); }

  @Post('divisions')
  @RequirePermissions('org:write')
  createDivision(@Body() dto: CreateDivisionDto) { return this.org.createDivision(dto); }

  @Patch('divisions/:id')
  @RequirePermissions('org:write')
  updateDivision(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDivisionDto) {
    return this.org.updateDivision(id, dto);
  }

  // ─── Department ───────────────────────────────────────────────────────────

  @Get('departments')
  @RequirePermissions('org:read')
  listDepartments(@Query('divisionId') divisionId?: string) { return this.org.listDepartments(divisionId); }

  @Get('departments/:id')
  @RequirePermissions('org:read')
  getDepartment(@Param('id', ParseUUIDPipe) id: string) { return this.org.getDepartment(id); }

  @Post('departments')
  @RequirePermissions('org:write')
  createDepartment(@Body() dto: CreateDepartmentDto) { return this.org.createDepartment(dto); }

  @Patch('departments/:id')
  @RequirePermissions('org:write')
  updateDepartment(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDepartmentDto) {
    return this.org.updateDepartment(id, dto);
  }

  // ─── Section ──────────────────────────────────────────────────────────────

  @Get('sections')
  @RequirePermissions('org:read')
  listSections(@Query('departmentId') departmentId?: string) { return this.org.listSections(departmentId); }

  @Get('sections/:id')
  @RequirePermissions('org:read')
  getSection(@Param('id', ParseUUIDPipe) id: string) { return this.org.getSection(id); }

  @Post('sections')
  @RequirePermissions('org:write')
  createSection(@Body() dto: CreateSectionDto) { return this.org.createSection(dto); }

  @Patch('sections/:id')
  @RequirePermissions('org:write')
  updateSection(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSectionDto) {
    return this.org.updateSection(id, dto);
  }

  // ─── Designation ──────────────────────────────────────────────────────────

  @Get('designations')
  @RequirePermissions('org:read')
  listDesignations(@Query('sectionId') sectionId?: string) { return this.org.listDesignations(sectionId); }

  @Get('designations/:id')
  @RequirePermissions('org:read')
  getDesignation(@Param('id', ParseUUIDPipe) id: string) { return this.org.getDesignation(id); }

  @Post('designations')
  @RequirePermissions('org:write')
  createDesignation(@Body() dto: CreateDesignationDto) { return this.org.createDesignation(dto); }

  @Patch('designations/:id')
  @RequirePermissions('org:write')
  updateDesignation(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDesignationDto) {
    return this.org.updateDesignation(id, dto);
  }

  // ─── Job Grade ────────────────────────────────────────────────────────────

  @Get('job-grades')
  @RequirePermissions('org:read')
  listJobGrades() { return this.org.listJobGrades(); }

  @Get('job-grades/:id')
  @RequirePermissions('org:read')
  getJobGrade(@Param('id', ParseUUIDPipe) id: string) { return this.org.getJobGrade(id); }

  @Post('job-grades')
  @RequirePermissions('org:write')
  createJobGrade(@Body() dto: CreateLookupDto) { return this.org.createJobGrade(dto); }

  @Patch('job-grades/:id')
  @RequirePermissions('org:write')
  updateJobGrade(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLookupDto) {
    return this.org.updateJobGrade(id, dto);
  }

  // ─── Employment Type ──────────────────────────────────────────────────────

  @Get('employment-types')
  @RequirePermissions('org:read')
  listEmploymentTypes() { return this.org.listEmploymentTypes(); }

  @Get('employment-types/:id')
  @RequirePermissions('org:read')
  getEmploymentType(@Param('id', ParseUUIDPipe) id: string) { return this.org.getEmploymentType(id); }

  @Post('employment-types')
  @RequirePermissions('org:write')
  createEmploymentType(@Body() dto: CreateLookupDto) { return this.org.createEmploymentType(dto); }

  @Patch('employment-types/:id')
  @RequirePermissions('org:write')
  updateEmploymentType(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLookupDto) {
    return this.org.updateEmploymentType(id, dto);
  }

  // ─── Employment Category ──────────────────────────────────────────────────

  @Get('employment-categories')
  @RequirePermissions('org:read')
  listEmploymentCategories() { return this.org.listEmploymentCategories(); }

  @Get('employment-categories/:id')
  @RequirePermissions('org:read')
  getEmploymentCategory(@Param('id', ParseUUIDPipe) id: string) { return this.org.getEmploymentCategory(id); }

  @Post('employment-categories')
  @RequirePermissions('org:write')
  createEmploymentCategory(@Body() dto: CreateLookupDto) { return this.org.createEmploymentCategory(dto); }

  @Patch('employment-categories/:id')
  @RequirePermissions('org:write')
  updateEmploymentCategory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLookupDto) {
    return this.org.updateEmploymentCategory(id, dto);
  }

  // ─── Employee Status Config ───────────────────────────────────────────────

  @Get('employee-statuses')
  @RequirePermissions('org:read')
  listEmployeeStatusConfigs() { return this.org.listEmployeeStatusConfigs(); }

  @Get('employee-statuses/:id')
  @RequirePermissions('org:read')
  getEmployeeStatusConfig(@Param('id', ParseUUIDPipe) id: string) { return this.org.getEmployeeStatusConfig(id); }

  @Post('employee-statuses')
  @RequirePermissions('org:write')
  createEmployeeStatusConfig(@Body() dto: CreateEmployeeStatusConfigDto) {
    return this.org.createEmployeeStatusConfig(dto);
  }

  @Patch('employee-statuses/:id')
  @RequirePermissions('org:write')
  updateEmployeeStatusConfig(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEmployeeStatusConfigDto) {
    return this.org.updateEmployeeStatusConfig(id, dto);
  }
}
