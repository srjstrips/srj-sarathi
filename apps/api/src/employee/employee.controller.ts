import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, ParseUUIDPipe, ParseIntPipe, DefaultValuePipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { EmployeeService } from './employee.service.js';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from '../authorization/guards/permissions.guard.js';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  CreateEmployeeDto, UpdateEmployeeDto, EmployeeListQueryDto,
  TransferEmployeeDto, ExitEmployeeDto, AssignManagerDto,
} from './dto/employee.dto.js';
import { BindUserDto } from './dto/bind-user.dto.js';
import { EmployeeSearchDto, BulkUpdateStatusDto, BulkTransferDto, BulkAssignManagerDto } from './dto/search.dto.js';
import { UploadDocumentDto, VerifyDocumentDto } from './dto/document.dto.js';
import { CreateCustomFieldDto, UpdateCustomFieldDto, SetCustomFieldValueDto } from './dto/custom-field.dto.js';
import { CreateEmergencyContactDto, UpdateEmergencyContactDto } from './dto/emergency-contact.dto.js';
import { UpsertBankDetailDto } from './dto/bank-detail.dto.js';

@Controller('employees')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @RequirePermissions('employee:read')
  list(
    @Query() query: EmployeeListQueryDto,
    @Query('limit',  new DefaultValuePipe(50),  ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0),   ParseIntPipe) offset: number,
  ) {
    return this.employeeService.list(query, limit, offset);
  }

  @Get(':id')
  @RequirePermissions('employee:read')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.get(id);
  }

  @Get('code/:code')
  @RequirePermissions('employee:read')
  getByCode(@Param('code') code: string) {
    return this.employeeService.getByCode(code);
  }

  @Post()
  @RequirePermissions('employee:write')
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() actor: any) {
    return this.employeeService.create(dto, actor.id);
  }

  @Patch(':id')
  @RequirePermissions('employee:write')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() actor: any,
  ) {
    return this.employeeService.update(id, dto, actor.id);
  }

  @Post(':id/transfer')
  @RequirePermissions('employee:write')
  transfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferEmployeeDto,
    @CurrentUser() actor: any,
  ) {
    return this.employeeService.transfer(id, dto, actor.id);
  }

  @Post(':id/exit')
  @RequirePermissions('employee:write')
  exit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ExitEmployeeDto,
    @CurrentUser() actor: any,
  ) {
    return this.employeeService.exitEmployee(id, dto, actor.id);
  }

  @Post(':id/rehire')
  @RequirePermissions('employee:write')
  rehire(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('joiningDate') joiningDate: string,
    @CurrentUser() actor: any,
  ) {
    return this.employeeService.rehireEmployee(id, joiningDate, actor.id);
  }

  @Patch(':id/manager')
  @RequirePermissions('employee:write')
  assignManager(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignManagerDto,
    @CurrentUser() actor: any,
  ) {
    return this.employeeService.assignManager(id, dto, actor.id);
  }

  @Delete(':id')
  @RequirePermissions('employee:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: any) {
    return this.employeeService.softDelete(id, actor.id);
  }

  @Get(':id/direct-reports')
  @RequirePermissions('employee:read')
  directReports(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getDirectReports(id);
  }

  @Get(':id/reporting-chain')
  @RequirePermissions('employee:read')
  reportingChain(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getReportingChain(id);
  }

  @Get(':id/org-history')
  @RequirePermissions('employee:read')
  orgHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getOrgHistory(id);
  }

  // ─── User binding ──────────────────────────────────────────────────────────

  @Post(':id/bind-user')
  @RequirePermissions('employee:write')
  bindUser(@Param('id', ParseUUIDPipe) id: string, @Body() dto: BindUserDto) {
    return this.employeeService.bindUser(id, dto);
  }

  @Post(':id/unbind-user')
  @RequirePermissions('employee:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  unbindUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.unbindUser(id);
  }

  // ─── Emergency contacts ────────────────────────────────────────────────────

  @Get(':id/emergency-contacts')
  @RequirePermissions('employee:read')
  listEmergencyContacts(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.listEmergencyContacts(id);
  }

  @Post(':id/emergency-contacts')
  @RequirePermissions('employee:write')
  addEmergencyContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateEmergencyContactDto,
  ) {
    return this.employeeService.addEmergencyContact(id, dto);
  }

  @Patch(':id/emergency-contacts/:contactId')
  @RequirePermissions('employee:write')
  updateEmergencyContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body() dto: UpdateEmergencyContactDto,
  ) {
    return this.employeeService.updateEmergencyContact(id, contactId, dto);
  }

  @Delete(':id/emergency-contacts/:contactId')
  @RequirePermissions('employee:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEmergencyContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    return this.employeeService.deleteEmergencyContact(id, contactId);
  }

  // ─── Bank detail ───────────────────────────────────────────────────────────

  @Get(':id/bank-detail')
  @RequirePermissions('employee:read:sensitive')
  getBankDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getBankDetail(id);
  }

  @Post(':id/bank-detail')
  @RequirePermissions('employee:write')
  upsertBankDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertBankDetailDto,
  ) {
    return this.employeeService.upsertBankDetail(id, dto);
  }

  @Post(':id/bank-detail/verify')
  @RequirePermissions('employee:verify')
  verifyBankDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.verifyBankDetail(id);
  }

  // ─── Documents ─────────────────────────────────────────────────────────────

  @Get(':id/documents')
  @RequirePermissions('employee:read')
  listDocuments(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.listDocuments(id);
  }

  @Post(':id/documents')
  @RequirePermissions('employee:write')
  uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadDocumentDto,
    @CurrentUser() actor: any,
  ) {
    return this.employeeService.uploadDocument(id, dto, actor.id);
  }

  @Post(':id/documents/:docId/verify')
  @RequirePermissions('employee:verify')
  verifyDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Body() dto: VerifyDocumentDto,
    @CurrentUser() actor: any,
  ) {
    return this.employeeService.verifyDocument(id, docId, dto, actor.id);
  }

  @Delete(':id/documents/:docId')
  @RequirePermissions('employee:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.employeeService.deleteDocument(id, docId);
  }

  // ─── Custom field values ───────────────────────────────────────────────────

  @Get(':id/custom-fields')
  @RequirePermissions('employee:read')
  getCustomFieldValues(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getEmployeeCustomFieldValues(id);
  }

  @Post(':id/custom-fields')
  @RequirePermissions('employee:write')
  setCustomFieldValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetCustomFieldValueDto,
  ) {
    return this.employeeService.setCustomFieldValue(id, dto);
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  @Get('search')
  @RequirePermissions('employee:read')
  search(@Query() dto: EmployeeSearchDto) {
    return this.employeeService.search(dto);
  }

  // ─── Bulk operations ───────────────────────────────────────────────────────

  @Post('bulk/status')
  @RequirePermissions('employee:write')
  bulkUpdateStatus(@Body() dto: BulkUpdateStatusDto, @CurrentUser() actor: any) {
    return this.employeeService.bulkUpdateStatus(dto, actor.id);
  }

  @Post('bulk/transfer')
  @RequirePermissions('employee:write')
  bulkTransfer(@Body() dto: BulkTransferDto, @CurrentUser() actor: any) {
    return this.employeeService.bulkTransfer(dto, actor.id);
  }

  @Post('bulk/assign-manager')
  @RequirePermissions('employee:write')
  bulkAssignManager(@Body() dto: BulkAssignManagerDto, @CurrentUser() actor: any) {
    return this.employeeService.bulkAssignManager(dto, actor.id);
  }

  // ─── Effective access viewer ───────────────────────────────────────────────

  @Get(':id/effective-access')
  @RequirePermissions('employee:read')
  effectiveAccess(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getEffectiveAccess(id);
  }
}

// ─── Document category routes (admin) ────────────────────────────────────────

import { Controller as Ctrl } from '@nestjs/common';

@Ctrl('document-categories')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class DocumentCategoryController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @RequirePermissions('org:read')
  list() { return this.employeeService.listDocumentCategories(); }

  @Get(':id')
  @RequirePermissions('org:read')
  get(@Param('id', ParseUUIDPipe) id: string) { return this.employeeService.getDocumentCategory(id); }

  @Post()
  @RequirePermissions('org:write')
  create(@Body() dto: any) { return this.employeeService.createDocumentCategory(dto); }

  @Patch(':id')
  @RequirePermissions('org:write')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.employeeService.updateDocumentCategory(id, dto);
  }
}

// ─── Custom field definition routes (admin) ──────────────────────────────────


@Ctrl('employee-custom-fields')
@UseGuards(AccessTokenGuard, PermissionsGuard)
export class CustomFieldController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @RequirePermissions('org:read')
  list() { return this.employeeService.listCustomFields(); }

  @Post()
  @RequirePermissions('org:write')
  create(@Body() dto: CreateCustomFieldDto) {
    return this.employeeService.createCustomField(dto);
  }

  @Patch(':id')
  @RequirePermissions('org:write')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCustomFieldDto) {
    return this.employeeService.updateCustomField(id, dto);
  }
}
