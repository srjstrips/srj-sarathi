'use client';
import { useState } from 'react';
import {
  FolderKanban, Plus, Search, MoreHorizontal,
  Users, Calendar, CheckSquare, X, TrendingUp,
  Circle, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react';

type ProjectStatus = 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED';

interface Project {
  id: string; name: string; description: string; status: ProjectStatus;
  progress: number; manager: string; members: number; tasksTotal: number;
  tasksDone: number; startDate: string; dueDate: string; department: string;
}

const DEMO_PROJECTS: Project[] = [
  { id: '1', name: 'Maintenance Q4 2026', description: 'Quarterly maintenance schedule for all rolling mill equipment', status: 'ACTIVE', progress: 62, manager: 'Amit S.', members: 8, tasksTotal: 24, tasksDone: 15, startDate: '2026-10-01', dueDate: '2026-12-31', department: 'Maintenance' },
  { id: '2', name: 'Safety Compliance Audit', description: 'Annual safety audit and compliance documentation', status: 'AT_RISK', progress: 35, manager: 'Rahul K.', members: 5, tasksTotal: 18, tasksDone: 6, startDate: '2026-09-01', dueDate: '2026-09-30', department: 'Safety' },
  { id: '3', name: 'Quality Management System', description: 'ISO 9001 implementation and process documentation', status: 'ON_HOLD', progress: 78, manager: 'Priya M.', members: 12, tasksTotal: 32, tasksDone: 25, startDate: '2026-07-01', dueDate: '2026-11-30', department: 'Quality' },
  { id: '4', name: 'ERP Integration Phase 2', description: 'Integration of HRMS with SAP modules', status: 'PLANNED', progress: 0, manager: 'Suresh L.', members: 6, tasksTotal: 0, tasksDone: 0, startDate: '2026-11-01', dueDate: '2027-03-31', department: 'IT' },
  { id: '5', name: 'Production Line Upgrade', description: 'Upgrade of billets production line equipment', status: 'COMPLETED', progress: 100, manager: 'Vikram J.', members: 15, tasksTotal: 40, tasksDone: 40, startDate: '2026-04-01', dueDate: '2026-08-31', department: 'Production' },
];

const STATUS_CFG: Record<ProjectStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PLANNED:   { label: 'Planned',   icon: Circle,        color: 'text-gray-500',   bg: 'bg-gray-100' },
  ACTIVE:    { label: 'Active',    icon: TrendingUp,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  ON_HOLD:   { label: 'On Hold',   icon: Clock,         color: 'text-orange-600', bg: 'bg-orange-50' },
  AT_RISK:   { label: 'At Risk',   icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50' },
  CANCELLED: { label: 'Cancelled', icon: X,             color: 'text-gray-400',   bg: 'bg-gray-50' },
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} />{cfg.label}
    </span>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-[#E2E0DC] p-5 hover:shadow-md hover:border-orange-200 cursor-pointer transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1A1A1A] truncate">{project.name}</h3>
          <p className="text-xs text-[#757575] mt-0.5 line-clamp-1">{project.description}</p>
        </div>
        <button className="ml-2 p-1 rounded hover:bg-gray-100 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <MoreHorizontal size={16} className="text-[#ABABAB]" />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={project.status} />
        <span className="text-xs text-[#ABABAB]">{project.department}</span>
      </div>
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#757575]">Progress</span>
          <span className="font-semibold text-[#1A1A1A]">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${project.status === 'AT_RISK' ? 'bg-red-500' : project.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}`}
            style={{ width: `${project.progress}%` }} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-[#757575]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Users size={11} /> {project.members}</span>
          <span className="flex items-center gap-1"><CheckSquare size={11} /> {project.tasksDone}/{project.tasksTotal}</span>
        </div>
        <span className="flex items-center gap-1"><Calendar size={11} /> {project.dueDate}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-[#F0EEE9] flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
          {project.manager.charAt(0)}
        </div>
        <span className="text-xs text-[#757575]">{project.manager}</span>
      </div>
    </div>
  );
}

function ProjectPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const [tab, setTab] = useState('overview');
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg shadow-2xl flex flex-col">
        <div className="p-5 border-b border-[#E2E0DC]">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <StatusBadge status={project.status} />
              <h2 className="text-lg font-bold text-[#1A1A1A] mt-1">{project.name}</h2>
              <p className="text-sm text-[#757575]">{project.department}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 ml-3 flex-shrink-0"><X size={18} /></button>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[#757575]">Overall progress</span>
              <span className="font-bold text-[#1A1A1A]">{project.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>
        <div className="flex border-b border-[#E2E0DC] overflow-x-auto">
          {['Overview', 'Tasks', 'Members', 'Files', 'Activity'].map(t => (
            <button key={t} onClick={() => setTab(t.toLowerCase())}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.toLowerCase() ? 'border-orange-500 text-orange-600' : 'border-transparent text-[#757575] hover:text-[#1A1A1A]'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {tab === 'overview' && (
            <>
              <p className="text-sm text-[#757575]">{project.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[['Manager', project.manager], ['Members', `${project.members} people`], ['Start Date', project.startDate], ['Due Date', project.dueDate], ['Tasks', `${project.tasksDone} / ${project.tasksTotal} done`]].map(([l, v]) => (
                  <div key={l}><p className="text-xs text-[#ABABAB] font-medium uppercase tracking-wide mb-0.5">{l}</p><p className="text-sm font-medium text-[#1A1A1A]">{v}</p></div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['Completed', project.tasksDone, 'bg-green-50 text-green-700'], ['Remaining', project.tasksTotal - project.tasksDone, 'bg-blue-50 text-blue-700'], ['Total', project.tasksTotal, 'bg-gray-50 text-gray-700']].map(([l, c, cls]) => (
                  <div key={String(l)} className={`rounded-lg p-3 text-center ${cls}`}>
                    <p className="text-xl font-bold">{c}</p><p className="text-xs font-medium">{l}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab !== 'overview' && <div className="text-center py-8 text-[#757575] text-sm"><FolderKanban size={32} className="mx-auto mb-2 text-[#E2E0DC]" />No {tab} yet</div>}
        </div>
        <div className="p-4 border-t border-[#E2E0DC] flex gap-3">
          <button className="flex-1 py-2 border border-[#E2E0DC] rounded-lg text-sm font-medium text-[#757575] hover:border-gray-300 transition-colors">Edit</button>
          <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">View Full</button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = DEMO_PROJECTS.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.department.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'ALL' || p.status === statusFilter)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Projects</h1><p className="text-sm text-[#757575] mt-0.5">Manage organizational projects</p></div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Active', DEMO_PROJECTS.filter(p=>p.status==='ACTIVE').length,'bg-blue-50 text-blue-700'],['At Risk',DEMO_PROJECTS.filter(p=>p.status==='AT_RISK').length,'bg-red-50 text-red-700'],['Completed',DEMO_PROJECTS.filter(p=>p.status==='COMPLETED').length,'bg-green-50 text-green-700'],['On Hold',DEMO_PROJECTS.filter(p=>p.status==='ON_HOLD').length,'bg-orange-50 text-orange-700']].map(([l,c,cls])=>(
          <div key={String(l)} className={`rounded-xl p-4 ${cls}`}><p className="text-2xl font-bold">{c}</p><p className="text-sm font-medium">{l}</p></div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 bg-white" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL','ACTIVE','AT_RISK','ON_HOLD','PLANNED','COMPLETED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter===s?'bg-orange-500 text-white':'bg-white border border-[#E2E0DC] text-[#757575] hover:border-gray-300'}`}>
              {s === 'ALL' ? 'All' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
          <FolderKanban size={40} className="text-[#E2E0DC] mx-auto mb-3" />
          <p className="text-[#1A1A1A] font-medium">No projects found</p>
          <p className="text-sm text-[#757575] mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelected(p)} />)}
        </div>
      )}

      {selected && <ProjectPanel project={selected} onClose={() => setSelected(null)} />}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">New Project</h2>
              <button onClick={() => setShowNew(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Project Name <span className="text-red-500">*</span></label><input autoFocus className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Project name" /></div>
              <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Description</label><textarea rows={2} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="Brief project description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Start Date</label><input type="date" className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" /></div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Due Date</label><input type="date" className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" /></div>
              </div>
              <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Project Manager</label><input className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="Search employee..." /></div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
              <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

