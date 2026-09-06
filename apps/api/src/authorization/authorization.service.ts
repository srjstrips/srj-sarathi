import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface OrgScope {
  companyId?: string;
  locationId?: string;
  divisionId?: string;
  departmentId?: string;
  sectionId?: string;
}

@Injectable()
export class AuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.orm.public.UserRole
      .where({ userId })
      .include('role' as any)
      .all();
    return (userRoles as any[]).map((ur: any) => ur.role.name as string);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.orm.public.UserRole
      .where({ userId })
      .all();

    const permissions = new Set<string>();
    for (const ur of userRoles as any[]) {
      const rolePerms = await this.prisma.orm.public.RolePermission
        .where({ roleId: ur.roleId })
        .include('permission' as any)
        .all();
      for (const rp of rolePerms as any[]) {
        permissions.add(`${rp.permission.resource}.${rp.permission.action}`);
      }
    }
    return Array.from(permissions);
  }

  async can(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes(role);
  }

  async hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return roles.some((r) => userRoles.includes(r));
  }

  async getEmployeeOrgScope(userId: string): Promise<OrgScope> {
    const employee = await this.prisma.orm.public.Employee
      .where({ userId })
      .first();

    if (!employee) return {};

    return {
      companyId: employee.companyId ?? undefined,
      locationId: employee.locationId ?? undefined,
      divisionId: employee.divisionId ?? undefined,
      departmentId: employee.departmentId ?? undefined,
      sectionId: employee.sectionId ?? undefined,
    };
  }

  async isInScope(actorUserId: string, targetDepartmentId: string | null): Promise<boolean> {
    if (!targetDepartmentId) return false;
    const scope = await this.getEmployeeOrgScope(actorUserId);
    return scope.departmentId === targetDepartmentId;
  }
}
