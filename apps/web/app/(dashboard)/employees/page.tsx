'use client';
import { useState } from 'react';
import { Users, Plus, Search, Filter, MoreHorizontal, X, Mail, Phone, Building2, ChevronDown, Download } from 'lucide-react';

type EmpStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

interface Employee {
  id: string; code: string; firstName: string; lastName: string;
  designation: string; department: string; manager: string;
  email: string; phone: string; status: EmpStatus; joinDate: string;
}

const DEMO_EMPLOYEES: Employee[] = [
  { id: '1', code: 'SRJ0001', firstName: 'Rahul', lastName: 'Kumar',    designation: 'Supervisor',        department: 'Production',  manager: 'Amit S.',   email: 'rahul.kumar@srjsteel.com',   phone: '9876543210', status: 'ACTIVE',   joinDate: '2020-04-01' },
  { id: '2', code: 'SRJ0002', firstName: 'Priya', lastName: 'Mehta',    designation: 'HR Executive',       department: 'HR',          manager: 'Suresh L.', email: 'priya.mehta@srjsteel.com',   phone: '9876543211', status: 'ACTIVE',   joinDate: '2021-06-15' },
  { id: '3', code: 'SRJ0003', firstName: 'Amit',  lastName: 'Sharma',   designation: 'HOD – Maintenance',  department: 'Maintenance', manager: 'Director',  email: 'amit.sharma@srjsteel.com',   phone: '9876543212', status: 'ACTIVE',   joinDate: '2018-01-10' },
  { id: '4', code: 'SRJ0004', firstName: 'Suresh', lastName: 'Lal',     designation: 'IT Manager',         department: 'IT',          manager: 'Director',  email: 'suresh.lal@srjsteel.com',    phone: '9876543213', status: 'ACTIVE',   joinDate: '2019-03-20' },
  { id: '5', code: 'SRJ0005', firstName: 'Kavita', lastName: 'Singh',   designation: 'Quality Inspector',  department: 'Quality',     manager: 'Priya M.',  email: 'kavita.singh@srjsteel.com',  phone: '9876543214', status: 'ON_LEAVE', joinDate: '2022-08-01' },
  { id: '6', code: 'SRJ0006', firstName: 'Vikram', lastName: 'Joshi',   designation: 'Production Operator', department: 'Production',  manager: 'Rahul K.',  email: 'vikram.joshi@srjsteel.com',  phone: '9876543215', status: 'ACTIVE',   joinDate: '2023-02-14' },
  { id: '7', code: 'SRJ0007', firstName: 'Deepak', lastName: 'Yadav',   designation: 'Electrician',        department: 'Electrical',  manager: 'Amit S.',   email: 'deepak.yadav@srjsteel.com',  phone: '9876543216', status: 'INACTIVE', joinDate: '2021-11-05' },
  { id: '8', code: 'SRJ0008', firstName: 'Anjali', lastName: 'Pandey',  designation: 'Accounts Officer',   department: 'Finance',     manager: 'Suresh L.', email: 'anjali.pandey@srjsteel.com', phone: '9876543217', status: 'ACTIVE',   joinDate: '2020-09-15' },
];

const STATUS_CFG: Record<EmpStatus, { label: string; dot: string; text: string; bg: string }> = {
  ACTIVE:   { label: 'Active',   dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  INACTIVE: { label: 'Inactive', dot: 'bg-gray-400',  text: 'text-gray-600',  bg: 'bg-gray-100' },
  ON_LEAVE: { label: 'On Leave', dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
};

function StatusBadge({ status }: { status: EmpStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
    </span>
  );
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-14 h-14 text-lg' };
  return (
    <div className={`${sizes[size]} rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 flex-shrink-0`}>
      {initials}
    </div>
  );
}

function EmployeeDetailPanel({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const [tab, setTab] = useState('overview');
  const fullName = `${emp.firstName} ${emp.lastName}`;
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E0DC] bg-gradient-to-r from-orange-50 to-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={fullName} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">{fullName}</h2>
                <p className="text-sm text-[#757575]">{emp.designation}</p>
                <div className="mt-1"><StatusBadge status={emp.status} /></div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-mono bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{emp.code}</span>
            <span className="text-xs text-[#757575]">{emp.department}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E2E0DC] overflow-x-auto">
          {['Overview', 'Employment', 'Documents', 'Activity'].map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.toLowerCase() ? 'border-orange-500 text-orange-600' : 'border-transparent text-[#757575] hover:text-[#1A1A1A]'}`}>{t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <a href={`mailto:${emp.email}`} className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E0DC] hover:border-orange-200 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Mail size={15} className="text-blue-500" /></div>
                  <div className="flex-1 min-w-0"><p className="text-xs text-[#ABABAB]">Email</p><p className="text-sm text-[#1A1A1A] truncate">{emp.email}</p></div>
                </a>
                <a href={`tel:${emp.phone}`} className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E0DC] hover:border-orange-200 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0"><Phone size={15} className="text-green-500" /></div>
                  <div><p className="text-xs text-[#ABABAB]">Phone</p><p className="text-sm text-[#1A1A1A]">{emp.phone}</p></div>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E0DC]">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0"><Building2 size={15} className="text-purple-500" /></div>
                  <div><p className="text-xs text-[#ABABAB]">Department</p><p className="text-sm text-[#1A1A1A]">{emp.department}</p></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[['Manager', emp.manager], ['Join Date', emp.joinDate], ['Designation', emp.designation], ['Employee Code', emp.code]].map(([l, v]) => (
                  <div key={l} className="p-3 bg-[#F8F7F4] rounded-lg"><p className="text-xs text-[#ABABAB] mb-0.5">{l}</p><p className="text-sm font-medium text-[#1A1A1A]">{v}</p></div>
                ))}
              </div>
            </div>
          )}
          {tab !== 'overview' && (
            <div className="text-center py-8 text-[#757575] text-sm"><Users size={32} className="mx-auto mb-2 text-[#E2E0DC]" />No {tab} data yet</div>
          )}
        </div>

        <div className="p-4 border-t border-[#E2E0DC] flex gap-3">
          <button className="flex-1 py-2 border border-[#E2E0DC] rounded-lg text-sm font-medium text-[#757575] hover:border-gray-300 transition-colors">Edit</button>
          <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Message</button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<EmpStatus | 'All'>('All');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const depts = ['All', ...Array.from(new Set(DEMO_EMPLOYEES.map(e => e.department)))];

  const filtered = DEMO_EMPLOYEES.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = `${e.firstName} ${e.lastName} ${e.code} ${e.designation}`.toLowerCase().includes(q);
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Employees</h1><p className="text-sm text-[#757575] mt-0.5">{DEMO_EMPLOYEES.length} total employees</p></div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm text-[#757575] hover:text-[#1A1A1A] bg-white transition-all">
            <Download size={14} /><span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /><span className="hidden sm:inline">Add Employee</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[['Active', DEMO_EMPLOYEES.filter(e=>e.status==='ACTIVE').length,'bg-green-50 text-green-700'],['On Leave',DEMO_EMPLOYEES.filter(e=>e.status==='ON_LEAVE').length,'bg-orange-50 text-orange-700'],['Inactive',DEMO_EMPLOYEES.filter(e=>e.status==='INACTIVE').length,'bg-gray-100 text-gray-600']].map(([l,c,cls])=>(
          <div key={String(l)} className={`rounded-xl p-4 ${cls}`}><p className="text-2xl font-bold">{c}</p><p className="text-sm font-medium">{l}</p></div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, designation..." className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 bg-white" />
        </div>
        <div className="relative">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer">
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ABABAB] pointer-events-none" />
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="appearance-none pl-3 pr-8 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer">
            <option value="All">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#ABABAB] pointer-events-none" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm text-[#757575] bg-white hover:border-gray-300 transition-all">
          <Filter size={14} /><span>More Filters</span>
        </button>
      </div>

      {/* Bulk actions bar */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <span className="text-sm font-medium text-orange-700">{selectedRows.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            {['Activate', 'Deactivate', 'Export'].map(a => (
              <button key={a} className="px-3 py-1.5 text-xs font-medium border border-orange-200 rounded-lg text-orange-700 hover:bg-orange-100 transition-colors">{a}</button>
            ))}
            <button onClick={() => setSelectedRows(new Set())} className="p-1.5 rounded-lg hover:bg-orange-100"><X size={14} className="text-orange-600" /></button>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E0DC] bg-[#F8F7F4]">
              <th className="p-3 w-10"><input type="checkbox" className="rounded" onChange={e => setSelectedRows(e.target.checked ? new Set(filtered.map(f=>f.id)) : new Set())} /></th>
              {['Employee', 'Department', 'Designation', 'Manager', 'Status', ''].map(h => (
                <th key={h} className="p-3 text-left text-xs font-semibold text-[#757575] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EEE9]">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center"><Users size={40} className="text-[#E2E0DC] mx-auto mb-3" /><p className="text-[#1A1A1A] font-medium">No employees found</p></td></tr>
            ) : filtered.map(emp => {
              const fullName = `${emp.firstName} ${emp.lastName}`;
              return (
                <tr key={emp.id} className="hover:bg-[#F8F7F4] cursor-pointer group transition-colors" onClick={() => setSelected(emp)}>
                  <td className="p-3" onClick={e => { e.stopPropagation(); toggleRow(emp.id); }}>
                    <input type="checkbox" checked={selectedRows.has(emp.id)} readOnly className="rounded" />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={fullName} size="sm" />
                      <div><p className="text-sm font-medium text-[#1A1A1A]">{fullName}</p><p className="text-xs text-[#ABABAB]">{emp.code}</p></div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-[#757575]">{emp.department}</td>
                  <td className="p-3 text-sm text-[#757575]">{emp.designation}</td>
                  <td className="p-3 text-sm text-[#757575]">{emp.manager}</td>
                  <td className="p-3"><StatusBadge status={emp.status} /></td>
                  <td className="p-3">
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-gray-200 transition-all" onClick={e => e.stopPropagation()}>
                      <MoreHorizontal size={15} className="text-[#757575]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
            <Users size={40} className="text-[#E2E0DC] mx-auto mb-3" />
            <p className="text-[#1A1A1A] font-medium">No employees found</p>
          </div>
        ) : filtered.map(emp => {
          const fullName = `${emp.firstName} ${emp.lastName}`;
          return (
            <div key={emp.id} onClick={() => setSelected(emp)} className="bg-white rounded-xl border border-[#E2E0DC] p-4 cursor-pointer hover:border-orange-200 transition-all">
              <div className="flex items-start gap-3">
                <Avatar name={fullName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#1A1A1A]">{fullName}</p>
                    <StatusBadge status={emp.status} />
                  </div>
                  <p className="text-sm text-[#757575] mt-0.5">{emp.code}</p>
                  <p className="text-sm text-[#757575]">{emp.designation} · {emp.department}</p>
                  <p className="text-xs text-[#ABABAB] mt-1">Manager: {emp.manager}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#757575]">
        <span>Showing {filtered.length} of {DEMO_EMPLOYEES.length} employees</span>
        <div className="flex items-center gap-1">
          {[1].map(n => (
            <button key={n} className="w-8 h-8 rounded-lg bg-orange-500 text-white text-sm font-medium">{n}</button>
          ))}
        </div>
      </div>

      {selected && <EmployeeDetailPanel emp={selected} onClose={() => setSelected(null)} />}

      {/* New Employee Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC] sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Add Employee</h2>
              <button onClick={() => setShowNew(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">First Name <span className="text-red-500">*</span></label><input autoFocus className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="First name" /></div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Last Name <span className="text-red-500">*</span></label><input className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Last name" /></div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Email <span className="text-red-500">*</span></label><input type="email" className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Work email" /></div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Phone</label><input type="tel" className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Mobile number" /></div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Department <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"><option>Select department</option>{depts.filter(d=>d!=='All').map(d=><option key={d}>{d}</option>)}</select>
                </div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Designation <span className="text-red-500">*</span></label><input className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Job title" /></div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Manager</label><input className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Search manager..." /></div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Joining Date</label><input type="date" className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" /></div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC] sticky bottom-0 bg-white">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
              <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Create Employee</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

