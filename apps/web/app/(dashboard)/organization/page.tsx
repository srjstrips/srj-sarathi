'use client';
import { useState } from 'react';
import { Building2, Users, ChevronRight, Plus, Search, Edit2, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface Department {
  id: string; name: string; code: string; hod: string;
  headcount: number; sections: string[];
}

const DEPARTMENTS: Department[] = [
  { id: '1', name: 'Production',   code: 'PROD',  hod: 'Suresh L.',     headcount: 145, sections: ['Billet Mill', 'Rolling Mill', 'Finishing'] },
  { id: '2', name: 'Maintenance',  code: 'MAINT', hod: 'Amit S.',       headcount: 38,  sections: ['Mechanical', 'Electrical', 'Instrumentation'] },
  { id: '3', name: 'Quality',      code: 'QA',    hod: 'Priya M.',      headcount: 22,  sections: ['QC Lab', 'Inspection', 'Compliance'] },
  { id: '4', name: 'HR',           code: 'HR',    hod: 'Anjali P.',     headcount: 12,  sections: ['Recruitment', 'Payroll', 'Administration'] },
  { id: '5', name: 'Safety',       code: 'SAFE',  hod: 'Deepak Y.',     headcount: 15,  sections: ['Fire & Safety', 'HSE'] },
  { id: '6', name: 'Finance',      code: 'FIN',   hod: 'Vikram J.',     headcount: 18,  sections: ['Accounts', 'Taxation', 'Audit'] },
  { id: '7', name: 'IT',           code: 'IT',    hod: 'Suresh L.',     headcount: 8,   sections: ['Infrastructure', 'Applications'] },
  { id: '8', name: 'Sales',        code: 'SALES', hod: 'Kavita S.',     headcount: 24,  sections: ['Domestic', 'Export'] },
];

const DESIGNATIONS = [
  { title: 'Director',          grade: 'E10', count: 1 },
  { title: 'General Manager',   grade: 'E9',  count: 3 },
  { title: 'HOD',               grade: 'E8',  count: 8 },
  { title: 'Manager',           grade: 'E7',  count: 22 },
  { title: 'Assistant Manager', grade: 'E6',  count: 35 },
  { title: 'Supervisor',        grade: 'E5',  count: 48 },
  { title: 'Senior Operator',   grade: 'E4',  count: 92 },
  { title: 'Operator',          grade: 'E3',  count: 140 },
  { title: 'Trainee',           grade: 'E2',  count: 55 },
];

function DeptCard({ dept, expanded, onToggle }: { dept: Department; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 hover:bg-[#F8F7F4] transition-colors text-left">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#1A1A1A]">{dept.name}</h3>
            <span className="text-xs text-[#ABABAB] font-mono bg-gray-100 px-1.5 py-0.5 rounded">{dept.code}</span>
          </div>
          <p className="text-xs text-[#757575] mt-0.5">HOD: {dept.hod}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-[#1A1A1A]">{dept.headcount}</p>
          <p className="text-xs text-[#757575]">employees</p>
        </div>
        <div className="ml-2">{expanded ? <ChevronUp size={16} className="text-[#ABABAB]" /> : <ChevronDown size={16} className="text-[#ABABAB]" />}</div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#F0EEE9]">
          <p className="text-xs font-semibold text-[#ABABAB] uppercase tracking-wide mt-3 mb-2">Sections</p>
          <div className="flex flex-wrap gap-2">
            {dept.sections.map(s => (
              <span key={s} className="text-xs bg-[#F8F7F4] border border-[#E2E0DC] text-[#757575] px-2.5 py-1 rounded-lg">{s}</span>
            ))}
            <button className="text-xs text-orange-500 hover:text-orange-600 px-2.5 py-1 border border-dashed border-orange-300 rounded-lg transition-colors">+ Add Section</button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#1A1A1A] px-3 py-1.5 border border-[#E2E0DC] rounded-lg transition-colors">
              <Users size={12} />View Employees
            </button>
            <button className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#1A1A1A] px-3 py-1.5 border border-[#E2E0DC] rounded-lg transition-colors">
              <Edit2 size={12} />Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type Tab = 'departments' | 'designations' | 'hierarchy';

export default function OrganizationPage() {
  const [tab, setTab] = useState<Tab>('departments');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredDepts = DEPARTMENTS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.hod.toLowerCase().includes(search.toLowerCase())
  );

  const totalHeadcount = DEPARTMENTS.reduce((s, d) => s + d.headcount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Organization</h1><p className="text-sm text-[#757575] mt-0.5">Departments, designations, and hierarchy</p></div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">Add Department</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Employees', value: totalHeadcount, color: 'bg-orange-50 text-orange-700' },
          { label: 'Departments',     value: DEPARTMENTS.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Designations',    value: DESIGNATIONS.length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Sections',        value: DEPARTMENTS.reduce((s,d) => s + d.sections.length, 0), color: 'bg-green-50 text-green-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value.toLocaleString('en-IN')}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {([['departments', 'Departments'], ['designations', 'Designations'], ['hierarchy', 'Org Chart']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-orange-500 text-white' : 'text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F8F7F4]'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'departments' && (
        <>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..." className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
          </div>
          <div className="space-y-3">
            {filteredDepts.map(dept => (
              <DeptCard key={dept.id} dept={dept} expanded={expanded === dept.id} onToggle={() => setExpanded(expanded === dept.id ? null : dept.id)} />
            ))}
          </div>
        </>
      )}

      {tab === 'designations' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
          <div className="p-4 border-b border-[#E2E0DC] bg-[#F8F7F4] grid grid-cols-3 text-xs font-semibold text-[#757575] uppercase tracking-wide">
            <span>Designation</span><span className="text-center">Grade</span><span className="text-right">Employees</span>
          </div>
          {DESIGNATIONS.map((d, i) => (
            <div key={d.title} className={`grid grid-cols-3 items-center p-4 ${i < DESIGNATIONS.length - 1 ? 'border-b border-[#F0EEE9]' : ''} hover:bg-[#F8F7F4] transition-colors`}>
              <p className="text-sm font-medium text-[#1A1A1A]">{d.title}</p>
              <p className="text-sm text-center text-[#757575] font-mono">{d.grade}</p>
              <p className="text-sm text-right font-semibold text-[#1A1A1A]">{d.count}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-40 text-center p-3 bg-orange-500 text-white rounded-xl font-semibold text-sm">
              Director
              <p className="text-xs font-normal opacity-80 mt-0.5">Rajesh Agarwal</p>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex flex-wrap justify-center gap-4">
              {['Production', 'Maintenance', 'Quality', 'HR', 'Finance', 'Sales'].map(dept => (
                <div key={dept} className="w-32 text-center p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-xs font-semibold text-orange-700">HOD</p>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">{dept}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-[#ABABAB] mt-6">Full interactive org chart — connect employee data to view</p>
        </div>
      )}
    </div>
  );
}

