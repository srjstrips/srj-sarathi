import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../authentication/guards/access-token.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';
import { RequirePermissions } from './decorators/permissions.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto.js';
import { CreatePermissionDto } from './dto/permission.dto.js';

@ApiTags('Authorization')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, PermissionsGuard)
@Controller()
export class AuthorizationController {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Roles ────────────────────────────────────────────────────────────────

  @Get('roles')
  @RequirePermissions('roles.view')
  getRoles() {
    return this.prisma.orm.public.Role.all();
  }

  @Get('roles/:id')
  @RequirePermissions('roles.view')
  getRole(@Param('id') id: string) {
    return this.prisma.orm.public.Role.where({ id }).first();
  }

  @Post('roles')
  @RequirePermissions('roles.manage')
  createRole(@Body() dto: CreateRoleDto) {
    return this.prisma.orm.public.Role.create({
      name: dto.name as any,
      description: dto.description ?? null,
      isSystem: false,
    } as any);
  }

  @Patch('roles/:id')
  @RequirePermissions('roles.manage')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.prisma.orm.public.Role.where({ id }).update({
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      updatedAt: new Date(),
    } as any);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('roles.manage')
  async deleteRole(@Param('id') id: string) {
    const role = await this.prisma.orm.public.Role.where({ id }).first();
    if ((role as any)?.isSystem) throw new Error('Cannot delete system role');
    await this.prisma.orm.public.Role.where({ id }).delete();
  }

  // ─── Role-Permission mapping ───────────────────────────────────────────────

  @Get('roles/:roleId/permissions')
  @RequirePermissions('roles.view')
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.prisma.orm.public.RolePermission
      .where({ roleId })
      .include('permission' as any)
      .all();
  }

  @Post('roles/:roleId/permissions/:permissionId')
  @RequirePermissions('roles.manage')
  addRolePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.prisma.orm.public.RolePermission.create({
      roleId,
      permissionId,
    } as any);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('roles.manage')
  async removeRolePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.prisma.orm.public.RolePermission
      .where({ roleId, permissionId })
      .delete();
  }

  // ─── Permissions ──────────────────────────────────────────────────────────

  @Get('permissions')
  @RequirePermissions('permissions.view')
  getPermissions() {
    return this.prisma.orm.public.Permission.all();
  }

  @Post('permissions')
  @RequirePermissions('permissions.manage')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.prisma.orm.public.Permission.create({
      resource: dto.resource as any,
      action: dto.action as any,
      description: dto.description ?? null,
    } as any);
  }

  @Delete('permissions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('permissions.manage')
  async deletePermission(@Param('id') id: string) {
    await this.prisma.orm.public.Permission.where({ id }).delete();
  }

  // ─── User-Role mapping ────────────────────────────────────────────────────

  @Get('users/:userId/roles')
  @RequirePermissions('users.roles.view')
  getUserRoles(@Param('userId') userId: string) {
    return this.prisma.orm.public.UserRole
      .where({ userId })
      .include('role' as any)
      .all();
  }

  @Post('users/:userId/roles/:roleId')
  @RequirePermissions('users.roles.manage')
  assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.prisma.orm.public.UserRole.create({ userId, roleId } as any);
  }

  @Delete('users/:userId/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('users.roles.manage')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.prisma.orm.public.UserRole.where({ userId, roleId }).delete();
  }

  @Get('users/:userId/permissions')
  @RequirePermissions('users.roles.view')
  async getUserPermissions(@Param('userId') userId: string) {
    const userRoles = await this.prisma.orm.public.UserRole
      .where({ userId })
      .all() as any[];

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      const rolePerms = await this.prisma.orm.public.RolePermission
        .where({ roleId: ur.roleId })
        .include('permission' as any)
        .all() as any[];
      for (const rp of rolePerms) {
        permissions.add(`${rp.permission.resource}.${rp.permission.action}`);
      }
    }
    return Array.from(permissions);
  }
}
