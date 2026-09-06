'use client';
import { useState } from 'react';
import { Lock, Plus, Search, Check, X, Shield, Users, ChevronRight, Edit2 } from 'lucide-react';

interface Role {
  id: string; name: string; description: string; usersCount: number;
  isSystem: boolean; permissions: string[];
}

const ROLES: Role[] = [
  { id: '1', name: 'SUPER_ADMIN', description: 'Full system access — all permissions', usersCount: 1, isSystem: true, permissions: ['*'] },
  { id: '2', name: 'ADMIN', description: 'Organization administration — manage employees, roles, settings', usersCount: 3, isSystem: true, permissions: ['employees.*', 'roles.*', 'settings.*', 'reports.*', 'security.*'] },
  { id: '3', name: 'DIRECTOR', description: 'Executive oversight across all departments', usersCount: 2, isSystem: true, permissions: ['employees.view', 'reports.*', 'security.dashboard.view', 'kra.*', 'kaizen.*'] },
  { id: '4', name: 'HOD', description: 'Head of department — manage own department', usersCount: 8, isSystem: true, permissions: ['employees.view', 'tasks.*', 'projects.*', 'kra.review', 'kaizen.review'] },
  { id: '5', name: 'HR_MANAGER', description: 'HR operations — employee records and HR workflows', usersCount: 5, isSystem: false, permissions: ['employees.*', 'reports.hr', 'organization.view'] },
  { id: '6', name: 'EMPLOYEE', description: 'Standard employee access', usersCount: 268, isSystem: true, permissions: ['tasks.view', 'projects.view', 'kra.view', 'kaizen.submit'] },
];

const PERM_GROUPS: Record<string, string[]> = {
  Employees:   ['employees.view', 'employees.create', 'employees.update', 'employees.delete', 'employees.export'],
  Tasks:       ['tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete', 'tasks.assign'],
  Projects:    ['projects.view', 'projects.create', 'projects.update', 'projects.delete'],
  KRA:         ['kra.view', 'kra.submit', 'kra.review', 'kra.finalize'],
  Kaizen:      ['kaizen.view', 'kaizen.submit', 'kaizen.review', 'kaizen.approve'],
  Reports:     ['reports.view', 'reports.export', 'reports.hr', 'reports.operations'],
  Security:    ['security.dashboard.view', 'security.sessions.manage', 'security.audit.view'],
  Settings:    ['settings.view', 'settings.update'],
  Roles:       ['roles.view', 'roles.create', 'roles.update', 'roles.delete'],
};

type Tab = 'roles' | 'permissions';

function RoleCard({ role, onClick }: { role: Role; onClick: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E0DC] p-4 hover:shadow-md hover:border-orange-200 cursor-pointer transition-all" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${role.isSystem ? 'bg-orange-100' : 'bg-blue-100'}`}>
          <Shield size={18} className={role.isSystem ? 'text-orange-600' : 'text-blue-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#1A1A1A] text-sm">{role.name}</h3>
            {role.isSystem && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">System</span>}
          </div>
          <p className="text-xs text-[#757575] mt-0.5">{role.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-[#1A1A1A]">{role.usersCount}</p>
          <p className="text-xs text-[#757575]">users</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map(p => (
            <span key={p} className="text-xs font-mono bg-[#F8F7F4] text-[#757575] px-1.5 py-0.5 rounded border border-[#E2E0DC]">{p}</span>
          ))}
          {role.permissions.length > 3 && <span className="text-xs text-[#ABABAB]">+{role.permissions.length - 3} more</span>}
        </div>
        <ChevronRight size={15} className="text-[#ABABAB] flex-shrink-0" />
      </div>
    </div>
  );
}

function RoleEditor({ role, onClose }: { role: Role; onClose: () => void }) {
  const allPerms = Object.values(PERM_GROUPS).flat();
  const [granted, setGranted] = useState(new Set(role.permissions.includes('*') ? allPerms : role.permissions));

  const toggle = (p: string) => {
    const next = new Set(granted);
    next.has(p) ? next.delete(p) : next.add(p);
    setGranted(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <div>
            <h2 className="text-lg font-semibold text-[#1A1A1A]">{role.name}</h2>
            <p className="text-sm text-[#757575] mt-0.5">{role.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {Object.entries(PERM_GROUPS).map(([group, perms]) => (
            <div key={group}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[#1A1A1A]">{group}</p>
                <button className="text-xs text-orange-500" onClick={() => {
                  const next = new Set(granted);
                  perms.forEach(p => next.add(p));
                  setGranted(next);
                }}>Grant all</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {perms.map(p => (
                  <label key={p} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${granted.has(p) ? 'bg-orange-50 border-orange-200' : 'bg-white border-[#E2E0DC] hover:border-gray-300'}`}>
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${granted.has(p) ? 'bg-orange-500' : 'bg-white border border-gray-300'}`}>
                      {granted.has(p) && <Check size={11} className="text-white" />}
                    </div>
                    <input type="checkbox" checked={granted.has(p)} onChange={() => toggle(p)} className="sr-only" />
                    <span className="text-xs font-mono text-[#757575]">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
          <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Save Permissions</button>
        </div>
      </div>
    </div>
  );
}

export default function AccessPage() {
  const [tab, setTab] = useState<Tab>('roles');
  const [search, setSearch] = useState('');
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = ROLES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Access Control</h1><p className="text-sm text-[#757575] mt-0.5">Roles and permission management</p></div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">New Role</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[['Total Roles', ROLES.length, 'bg-blue-50 text-blue-700'], ['System Roles', ROLES.filter(r=>r.isSystem).length, 'bg-orange-50 text-orange-700'], ['Custom Roles', ROLES.filter(r=>!r.isSystem).length, 'bg-purple-50 text-purple-700']].map(([l,v,cls]) => (
          <div key={String(l)} className={`rounded-xl p-4 ${cls}`}><p className="text-2xl font-bold">{v}</p><p className="text-sm font-medium">{l}</p></div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles..." className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(role => <RoleCard key={role.id} role={role} onClick={() => setEditRole(role)} />)}
      </div>

      {editRole && <RoleEditor role={editRole} onClose={() => setEditRole(null)} />}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">New Role</h2>
              <button onClick={() => setShowNew(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Role Name <span className="text-red-500">*</span></label><input autoFocus className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="e.g. SHIFT_SUPERVISOR" /></div>
              <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Description</label><textarea rows={2} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="Role description" /></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
              <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Create & Configure</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

