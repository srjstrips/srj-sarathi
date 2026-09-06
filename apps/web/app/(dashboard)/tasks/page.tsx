'use client';
import { useState } from 'react';
import {
  CheckSquare, Plus, Search, Filter, ChevronDown,
  Circle, AlertCircle, Clock, CheckCircle2, MoreHorizontal,
  User, Calendar, Flag, Tag, X
} from 'lucide-react';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Status = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
type Tab = 'my' | 'assigned' | 'team' | 'overdue' | 'completed';

interface Task {
  id: string;
  title: string;
  project?: string;
  priority: Priority;
  status: Status;
  assignee: string;
  dueDate: string;
  progress: number;
  overdue?: boolean;
}

const DEMO_TASKS: Task[] = [
  { id: '1', title: 'Rolling Mill Bearing Inspection Report', project: 'Maintenance Q4', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'Rahul K.', dueDate: '2026-09-10', progress: 65 },
  { id: '2', title: 'Safety audit documentation', project: 'Safety Compliance', priority: 'CRITICAL', status: 'TODO', assignee: 'Me', dueDate: '2026-09-08', progress: 0, overdue: true },
  { id: '3', title: 'Monthly production report', project: '', priority: 'MEDIUM', status: 'IN_REVIEW', assignee: 'Me', dueDate: '2026-09-12', progress: 90 },
  { id: '4', title: 'Update SOPs for furnace operation', project: 'Quality Improvement', priority: 'MEDIUM', status: 'TODO', assignee: 'Me', dueDate: '2026-09-20', progress: 0 },
  { id: '5', title: 'Electrical panel maintenance checklist', project: 'Maintenance Q4', priority: 'LOW', status: 'DONE', assignee: 'Amit S.', dueDate: '2026-09-05', progress: 100 },
  { id: '6', title: 'Vendor evaluation — raw material supplier', project: '', priority: 'HIGH', status: 'IN_PROGRESS', assignee: 'Me', dueDate: '2026-09-15', progress: 40 },
];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  LOW:      { label: 'Low',      color: 'text-gray-500 bg-gray-100',   dot: 'bg-gray-400' },
  MEDIUM:   { label: 'Medium',   color: 'text-blue-600 bg-blue-50',    dot: 'bg-blue-500' },
  HIGH:     { label: 'High',     color: 'text-orange-600 bg-orange-50', dot: 'bg-orange-500' },
  CRITICAL: { label: 'Critical', color: 'text-red-600 bg-red-50',      dot: 'bg-red-500' },
};

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string }> = {
  TODO:        { label: 'To Do',      icon: Circle,        color: 'text-gray-400' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock,        color: 'text-blue-500' },
  IN_REVIEW:   { label: 'In Review',   icon: AlertCircle,  color: 'text-orange-500' },
  DONE:        { label: 'Done',        icon: CheckCircle2, color: 'text-green-500' },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusIcon({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return <Icon size={16} className={cfg.color} />;
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F7F4] cursor-pointer group border border-transparent hover:border-[#E2E0DC] transition-all"
    >
      <StatusIcon status={task.status} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'line-through text-[#ABABAB]' : 'text-[#1A1A1A]'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          {task.project && (
            <span className="text-xs text-[#757575] flex items-center gap-1">
              <Tag size={10} /> {task.project}
            </span>
          )}
          <span className={`text-xs flex items-center gap-1 ${task.overdue ? 'text-red-500 font-medium' : 'text-[#ABABAB]'}`}>
            <Calendar size={10} /> {task.dueDate}
            {task.overdue && ' · Overdue'}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-1.5 text-xs text-[#757575]">
          <User size={12} />
          <span className="hidden md:inline">{task.assignee}</span>
        </div>
        {task.status !== 'TODO' && task.status !== 'DONE' && (
          <div className="hidden lg:flex items-center gap-1.5 w-20">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${task.progress}%` }} />
            </div>
            <span className="text-xs text-[#ABABAB] w-8 text-right">{task.progress}%</span>
          </div>
        )}
      </div>

      <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all" onClick={e => e.stopPropagation()}>
        <MoreHorizontal size={16} className="text-[#757575]" />
      </button>
    </div>
  );
}

function NewTaskModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Title <span className="text-red-500">*</span></label>
            <input
              autoFocus
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              placeholder="What needs to be done?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
              placeholder="Add details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Priority</label>
              <select className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                <option>Medium</option>
                <option>Low</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Due Date</label>
              <input type="date" className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Assignee</label>
            <input
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              placeholder="Search employee..."
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A] transition-colors">Cancel</button>
          <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<Tab>('my');
  const [search, setSearch] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'my',        label: 'My Tasks',   count: 4 },
    { id: 'assigned',  label: 'Assigned',   count: 6 },
    { id: 'team',      label: 'Team Tasks' },
    { id: 'overdue',   label: 'Overdue',    count: 1 },
    { id: 'completed', label: 'Completed' },
  ];

  const filtered = DEMO_TASKS.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Tasks</h1>
          <p className="text-sm text-[#757575] mt-0.5">Manage and track your work</p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white'
                : 'text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F8F7F4]'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#757575]'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm text-[#757575] hover:text-[#1A1A1A] hover:border-gray-300 bg-white transition-all">
          <Filter size={14} />
          <span className="hidden sm:inline">Filter</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-xl border border-[#E2E0DC] divide-y divide-[#F0EEE9]">
        {/* Column headers (desktop) */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#ABABAB] uppercase tracking-wide">
          <div className="w-4" />
          <div className="flex-1">Task</div>
          <div className="w-20">Priority</div>
          <div className="w-20 hidden md:block">Assignee</div>
          <div className="w-28 hidden lg:block">Progress</div>
          <div className="w-6" />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckSquare size={40} className="text-[#E2E0DC] mx-auto mb-3" />
            <p className="text-[#1A1A1A] font-medium">No tasks yet</p>
            <p className="text-sm text-[#757575] mt-1">Your assigned tasks will appear here.</p>
            <button
              onClick={() => setShowNewTask(true)}
              className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="p-2">
            {filtered.map(task => (
              <TaskRow key={task.id} task={task} onClick={() => setSelectedTask(task)} />
            ))}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'To Do',       count: filtered.filter(t => t.status === 'TODO').length,        color: 'bg-gray-100 text-gray-600' },
          { label: 'In Progress', count: filtered.filter(t => t.status === 'IN_PROGRESS').length, color: 'bg-blue-50 text-blue-600' },
          { label: 'In Review',   count: filtered.filter(t => t.status === 'IN_REVIEW').length,   color: 'bg-orange-50 text-orange-600' },
          { label: 'Completed',   count: filtered.filter(t => t.status === 'DONE').length,        color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-sm font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Task detail side panel */}
      {selectedTask && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
              <div className="flex items-center gap-2">
                <StatusIcon status={selectedTask.status} />
                <span className="text-sm font-medium text-[#757575]">{STATUS_CONFIG[selectedTask.status].label}</span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">{selectedTask.title}</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Priority</p>
                  <PriorityBadge priority={selectedTask.priority} />
                </div>
                <div>
                  <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Due Date</p>
                  <p className={`font-medium ${selectedTask.overdue ? 'text-red-500' : 'text-[#1A1A1A]'}`}>
                    {selectedTask.dueDate}
                  </p>
                </div>
                <div>
                  <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Assignee</p>
                  <p className="font-medium text-[#1A1A1A]">{selectedTask.assignee}</p>
                </div>
                {selectedTask.project && (
                  <div>
                    <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Project</p>
                    <p className="font-medium text-[#1A1A1A]">{selectedTask.project}</p>
                  </div>
                )}
              </div>
              {selectedTask.status !== 'TODO' && (
                <div>
                  <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-2">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${selectedTask.progress}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-[#1A1A1A] w-10 text-right">{selectedTask.progress}%</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm text-[#757575]">No description provided.</p>
              </div>
              <div>
                <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-2">Comments</p>
                <div className="bg-[#F8F7F4] rounded-lg p-3">
                  <input className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder-[#ABABAB] focus:outline-none" placeholder="Add a comment..." />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#E2E0DC] flex gap-3">
              <button className="flex-1 py-2 border border-[#E2E0DC] rounded-lg text-sm font-medium text-[#757575] hover:border-gray-300 transition-colors">
                Edit
              </button>
              <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}
    </div>
  );
}
