import * as temporalPolyfill from '@js-temporal/polyfill';
(globalThis as any).Temporal = temporalPolyfill.Temporal;
import 'dotenv/config';
import { db } from '../../prisma/db.js';
import * as argon2 from 'argon2';

const now = () => temporalPolyfill.Temporal.Instant.fromEpochMilliseconds(Date.now());

const ROLES = ['DIRECTOR', 'ADMIN', 'HR', 'HOD', 'SUB_HOD', 'EMPLOYEE'] as const;

const PERMISSIONS: Array<{ resource: string; action: string; description: string }> = [
  { resource: 'employees', action: 'view', description: 'View employees' },
  { resource: 'employees', action: 'create', description: 'Create employee' },
  { resource: 'employees', action: 'update', description: 'Update employee' },
  { resource: 'employees', action: 'delete', description: 'Delete employee' },
  { resource: 'roles', action: 'view', description: 'View roles' },
  { resource: 'roles', action: 'manage', description: 'Manage roles' },
  { resource: 'permissions', action: 'view', description: 'View permissions' },
  { resource: 'permissions', action: 'manage', description: 'Manage permissions' },
  { resource: 'users.roles', action: 'view', description: 'View user roles' },
  { resource: 'users.roles', action: 'manage', description: 'Manage user roles' },
  { resource: 'leave', action: 'view', description: 'View leave' },
  { resource: 'leave', action: 'apply', description: 'Apply for leave' },
  { resource: 'leave', action: 'approve', description: 'Approve leave' },
  { resource: 'leave', action: 'reject', description: 'Reject leave' },
  { resource: 'leave', action: 'manage', description: 'Manage leave types and balances' },
  { resource: 'attendance', action: 'view', description: 'View attendance' },
  { resource: 'attendance', action: 'manage', description: 'Manage attendance' },
  { resource: 'attendance', action: 'regularize', description: 'Regularize attendance' },
  { resource: 'tasks', action: 'view', description: 'View tasks' },
  { resource: 'tasks', action: 'create', description: 'Create tasks' },
  { resource: 'tasks', action: 'assign', description: 'Assign tasks' },
  { resource: 'tasks', action: 'complete', description: 'Complete tasks' },
  { resource: 'kra', action: 'view', description: 'View KRA' },
  { resource: 'kra', action: 'rate', description: 'Rate KRA' },
  { resource: 'kra', action: 'approve', description: 'Approve KRA' },
  { resource: 'kra', action: 'manage', description: 'Manage KRA cycles' },
  { resource: 'kaizen', action: 'view', description: 'View kaizen' },
  { resource: 'kaizen', action: 'create', description: 'Create kaizen' },
  { resource: 'kaizen', action: 'approve', description: 'Approve kaizen' },
  { resource: 'sop', action: 'view', description: 'View SOP' },
  { resource: 'sop', action: 'create', description: 'Create SOP' },
  { resource: 'sop', action: 'approve', description: 'Approve SOP' },
  { resource: 'notices', action: 'view', description: 'View notices' },
  { resource: 'notices', action: 'create', description: 'Create notices' },
  { resource: 'notices', action: 'publish', description: 'Publish notices' },
  { resource: 'complaints', action: 'view', description: 'View complaints' },
  { resource: 'complaints', action: 'resolve', description: 'Resolve complaints' },
  { resource: 'training', action: 'view', description: 'View training' },
  { resource: 'training', action: 'manage', description: 'Manage training' },
  { resource: 'security', action: 'dashboard.view', description: 'View security dashboard' },
  { resource: 'security', action: 'sessions.view', description: 'View sessions' },
  { resource: 'security', action: 'sessions.revoke', description: 'Revoke sessions' },
  { resource: 'security', action: 'ip.view', description: 'View IPs' },
  { resource: 'security', action: 'ip.block', description: 'Block IPs' },
  { resource: 'security', action: 'users.block', description: 'Block users' },
  { resource: 'security', action: 'devices.view', description: 'View devices' },
  { resource: 'security', action: 'events.view', description: 'View security events' },
  { resource: 'security', action: 'audit.view', description: 'View audit logs' },
  { resource: 'reports', action: 'view', description: 'View reports' },
  { resource: 'analytics', action: 'view', description: 'View analytics' },
  { resource: 'settings', action: 'view', description: 'View settings' },
  { resource: 'settings', action: 'manage', description: 'Manage settings' },
  { resource: 'feature-flags', action: 'manage', description: 'Manage feature flags' },
  { resource: 'imports', action: 'manage', description: 'Manage imports' },
  { resource: 'exports', action: 'manage', description: 'Manage exports' },
  { resource: 'privacy', action: 'data.view_self', description: 'View own data' },
  { resource: 'privacy', action: 'data.export_self', description: 'Export own data' },
  { resource: 'privacy', action: 'deletion.request', description: 'Request account deletion' },
  { resource: 'privacy', action: 'policy.view', description: 'View privacy policy' },
  { resource: 'privacy', action: 'policy.manage', description: 'Manage privacy policies' },
  { resource: 'privacy', action: 'dashboard.view', description: 'View privacy dashboard' },
  { resource: 'organization', action: 'view', description: 'View org structure' },
  { resource: 'organization', action: 'manage', description: 'Manage org structure' },
  { resource: 'dashboard', action: 'view', description: 'View dashboard' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  DIRECTOR: [
    'employees.view', 'leave.view', 'leave.approve', 'attendance.view',
    'tasks.view', 'kra.view', 'kra.approve', 'kaizen.view', 'sop.view',
    'notices.view', 'complaints.view', 'training.view',
    'security.dashboard.view', 'security.sessions.view', 'security.events.view',
    'security.audit.view', 'reports.view', 'analytics.view',
    'organization.view', 'privacy.policy.view', 'dashboard.view',
  ],
  ADMIN: [
    'employees.view', 'employees.create', 'employees.update', 'employees.delete',
    'roles.view', 'roles.manage', 'permissions.view', 'permissions.manage',
    'users.roles.view', 'users.roles.manage',
    'leave.view', 'leave.manage', 'leave.approve', 'leave.reject',
    'attendance.view', 'attendance.manage',
    'tasks.view', 'tasks.create', 'tasks.assign',
    'kra.view', 'kra.manage', 'notices.view', 'notices.create',
    'security.dashboard.view', 'security.sessions.view', 'security.sessions.revoke',
    'security.ip.view', 'security.ip.block', 'security.users.block',
    'security.devices.view', 'security.events.view', 'security.audit.view',
    'reports.view', 'analytics.view', 'settings.view', 'settings.manage',
    'feature-flags.manage', 'imports.manage', 'exports.manage',
    'organization.view', 'organization.manage',
    'privacy.policy.view', 'privacy.policy.manage', 'privacy.dashboard.view',
    'dashboard.view',
  ],
  HR: [
    'employees.view', 'employees.create', 'employees.update',
    'leave.view', 'leave.approve', 'leave.reject',
    'attendance.view', 'attendance.manage', 'attendance.regularize',
    'tasks.view', 'training.view', 'training.manage',
    'kra.view', 'reports.view', 'organization.view',
    'privacy.policy.view', 'dashboard.view',
  ],
  HOD: [
    'employees.view', 'leave.view', 'leave.approve', 'leave.reject',
    'attendance.view', 'attendance.regularize',
    'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.complete',
    'kra.view', 'kra.rate', 'kra.approve',
    'kaizen.view', 'kaizen.approve', 'sop.view', 'sop.approve',
    'notices.view', 'notices.publish', 'complaints.view', 'complaints.resolve',
    'training.view', 'reports.view', 'organization.view',
    'privacy.policy.view', 'dashboard.view',
  ],
  SUB_HOD: [
    'employees.view', 'leave.view', 'leave.approve',
    'attendance.view', 'attendance.regularize',
    'tasks.view', 'tasks.create', 'tasks.assign', 'tasks.complete',
    'kra.view', 'kra.rate', 'kaizen.view', 'notices.view', 'reports.view',
    'privacy.policy.view', 'dashboard.view',
  ],
  EMPLOYEE: [
    'leave.view', 'leave.apply', 'attendance.view', 'attendance.regularize',
    'tasks.view', 'tasks.complete', 'kra.view', 'kra.rate',
    'kaizen.view', 'kaizen.create', 'sop.view', 'notices.view', 'training.view',
    'privacy.policy.view', 'privacy.data.view_self',
    'privacy.data.export_self', 'privacy.deletion.request',
    'dashboard.view',
  ],
};

async function seed() {
  console.log('Seeding roles...');
  const roleMap = new Map<string, string>();

  for (const roleName of ROLES) {
    const existing = await db.orm.public.Role.where({ name: roleName as any }).first() as any;
    if (existing) {
      roleMap.set(roleName, existing.id);
      console.log(`  Role ${roleName} already exists`);
      continue;
    }
    const role = await db.orm.public.Role.create({
      name: roleName,
      description: `${roleName} role`,
      isSystem: true,
    } as any) as any;
    roleMap.set(roleName, role.id);
    console.log(`  Created role ${roleName}`);
  }

  console.log('\nSeeding permissions...');
  const permMap = new Map<string, string>();

  for (const perm of PERMISSIONS) {
    const key = `${perm.resource}.${perm.action}`;
    const existing = await db.orm.public.Permission
      .where({ resource: perm.resource as any, action: perm.action as any })
      .first() as any;
    if (existing) {
      permMap.set(key, existing.id);
      continue;
    }
    const created = await db.orm.public.Permission.create({
      resource: perm.resource,
      action: perm.action,
      description: perm.description,
    } as any) as any;
    permMap.set(key, created.id);
    console.log(`  Created permission ${key}`);
  }

  console.log('\nMapping role permissions...');
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;
    for (const permKey of perms) {
      const permId = permMap.get(permKey);
      if (!permId) { console.warn(`  Permission ${permKey} not found`); continue; }
      const existing = await db.orm.public.RolePermission
        .where({ roleId, permissionId: permId })
        .first();
      if (existing) continue;
      await db.orm.public.RolePermission.create({ roleId, permissionId: permId } as any);
    }
    console.log(`  Mapped ${perms.length} permissions for ${roleName}`);
  }

  console.log('\nCreating default ADMIN user...');
  const existing = await db.orm.public.User.where({ username: 'admin' as any }).first() as any;
  if (!existing) {
    const hash = await argon2.hash('Admin@123456');
    const user = await db.orm.public.User.create({
      username: 'admin',
      email: 'admin@srjsteel.in',
      phone: null,
      passwordHash: hash,
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: false,
      lastLoginAt: null,
      passwordChangedAt: now(),
      deletedAt: null,
    } as any) as any;

    const adminRoleId = roleMap.get('ADMIN')!;
    await db.orm.public.UserRole.create({ userId: user.id, roleId: adminRoleId } as any);
    console.log('  Created admin user (username: admin, password: Admin@123456)');
    console.log('  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION');
  } else {
    console.log('  Admin user already exists');
  }

  console.log('\nSeed complete.');
  await db.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
