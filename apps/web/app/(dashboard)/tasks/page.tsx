'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { CheckSquare, Plus, Search, Filter, ChevronDown, X, Tag, Calendar, User, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { Circle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { tasksApi } from '../../../lib/api-client';
import { useAuthStore } from '../../../store/auth.store';
import { getErrorMessage } from '../../../lib/api';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Status = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
type Tab = 'my' | 'assigned' | 'team' | 'overdue' | 'completed';

interface Task {
  id: string;
  title: string;
  description?: string;
  project?: string;
  priority: Priority;
  status: Status;
  assignee?: string;
  dueDate?: string;
  progress?: number;
  overdue?: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  LOW:      { label: 'Low',      color: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
  MEDIUM:   { label: 'Medium',   color: 'bg-blue-50 text-blue-600',     dot: 'bg-blue-400' },
  HIGH:     { label: 'High',     color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-400' },
  CRITICAL: { label: 'Critical', color: 'bg-red-50 text-red-600',       dot: 'bg-red-500' },
};

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string }> = {
  TODO:        { label: 'To Do',       icon: Circle,       color: 'text-gray-400' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock,        color: 'text-blue-500' },
  IN_REVIEW:   { label: 'In Review',   icon: Eye,          color: 'text-orange-500' },
  DONE:        { label: 'Done',        icon: CheckCircle2, color: 'text-green-500' },
};

function normalizeTask(raw: any): Task {
  const dueDate = raw.dueDate ?? raw.due_date;
  const isOverdue = dueDate ? new Date(dueDate) < new Date() && raw.status !== 'DONE' : false;
  return {
    id:          raw.id,
    title:       raw.title,
    description: raw.description,
    project:     raw.project?.name ?? raw.projectName ?? (typeof raw.project === 'string' ? raw.project : undefined),
    priority:    raw.priority ?? 'MEDIUM',
    status:      raw.status ?? 'TODO',
    assignee:    raw.assignee?.name ?? raw.assigneeName ?? (typeof raw.assignee === 'string' ? raw.assignee : undefined),
    dueDate:     dueDate ? new Date(dueDate).toLocaleDateString('en-IN') : undefined,
    progress:    raw.progress ?? 0,
    overdue:     isOverdue,
  };
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusIcon({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.TODO;
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
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${task.overdue ? 'text-red-500 font-medium' : 'text-[#ABABAB]'}`}>
              <Calendar size={10} /> {task.dueDate}
              {task.overdue && ' · Overdue'}
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <PriorityBadge priority={task.priority} />
        {task.assignee && (
          <div className="flex items-center gap-1.5 text-xs text-[#757575]">
            <User size={12} />
            <span className="hidden md:inline">{task.assignee}</span>
          </div>
        )}
        {task.status !== 'TODO' && task.status !== 'DONE' && (task.progress ?? 0) > 0 && (
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

function NewTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      await tasksApi.create({ title: title.trim(), description: description.trim() || undefined, priority, dueDate: dueDate || undefined });
      onCreated();
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Title <span className="text-red-500">*</span></label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              placeholder="What needs to be done?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Description</label>
            <textarea rows={3} value={description} onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
              placeholder="Add details..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A] transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const user                              = useAuthStore(s => s.user);
  const [activeTab, setActiveTab]         = useState<Tab>('my');
  const [search, setSearch]               = useState('');
  const [showNewTask, setShowNewTask]     = useState(false);
  const [selectedTask, setSelectedTask]   = useState<Task | null>(null);
  const [tasks, setTasks]                 = useState<Task[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { limit: 100 };
      if (activeTab === 'my' || activeTab === 'overdue') params['assigneeId'] = user?.id;
      if (activeTab === 'completed') params['status'] = 'DONE';
      const res  = await tasksApi.list(params as any);
      const raw: any[] = res?.items ?? res ?? [];
      let normalized = raw.map(normalizeTask);
      if (activeTab === 'overdue')   normalized = normalized.filter(t => t.overdue && t.status !== 'DONE');
      if (activeTab === 'completed') normalized = normalized.filter(t => t.status === 'DONE');
      setTasks(normalized);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [activeTab, user?.id]);

  useEffect(() => { load(); }, [load]);

  const filtered     = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  const overdueCount = tasks.filter(t => t.overdue && t.status !== 'DONE').length;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'my',        label: 'My Tasks' },
    { id: 'assigned',  label: 'Assigned' },
    { id: 'team',      label: 'Team Tasks' },
    { id: 'overdue',   label: 'Overdue' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Tasks</h1>
          <p className="text-sm text-[#757575] mt-0.5">Manage and track your work</p>
        </div>
        <button onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F8F7F4]'
            }`}>
            {tab.label}
            {tab.id === 'overdue' && overdueCount > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 bg-white" />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm text-[#757575] hover:text-[#1A1A1A] hover:border-gray-300 bg-white transition-all">
          <Filter size={14} />
          <span className="hidden sm:inline">Filter</span>
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E0DC] divide-y divide-[#F0EEE9]">
        <div className="hidden sm:flex items-center gap-3 px-3 py-2 text-xs font-medium text-[#ABABAB] uppercase tracking-wide">
          <div className="w-4" /><div className="flex-1">Task</div>
          <div className="w-20">Priority</div><div className="w-20 hidden md:block">Assignee</div>
          <div className="w-28 hidden lg:block">Progress</div><div className="w-6" />
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 size={32} className="animate-spin text-orange-500 mx-auto mb-3" />
            <p className="text-sm text-[#757575]">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-[#1A1A1A] font-medium">Failed to load tasks</p>
            <p className="text-sm text-[#757575] mt-1">{error}</p>
            <button onClick={load} className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CheckSquare size={40} className="text-[#E2E0DC] mx-auto mb-3" />
            <p className="text-[#1A1A1A] font-medium">No tasks yet</p>
            <p className="text-sm text-[#757575] mt-1">Your assigned tasks will appear here.</p>
            <button onClick={() => setShowNewTask(true)}
              className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'To Do',       count: tasks.filter(t => t.status === 'TODO').length,        color: 'bg-gray-100 text-gray-600' },
          { label: 'In Progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'bg-blue-50 text-blue-600' },
          { label: 'In Review',   count: tasks.filter(t => t.status === 'IN_REVIEW').length,   color: 'bg-orange-50 text-orange-600' },
          { label: 'Completed',   count: tasks.filter(t => t.status === 'DONE').length,        color: 'bg-green-50 text-green-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-sm font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSelectedTask(null)} />
          <div className="relative bg-white w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
              <div className="flex items-center gap-2">
                <StatusIcon status={selectedTask.status} />
                <span className="text-sm font-medium text-[#757575]">{STATUS_CONFIG[selectedTask.status]?.label}</span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">{selectedTask.title}</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Priority</p>
                  <PriorityBadge priority={selectedTask.priority} />
                </div>
                {selectedTask.dueDate && (
                  <div>
                    <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Due Date</p>
                    <p className={`font-medium ${selectedTask.overdue ? 'text-red-500' : 'text-[#1A1A1A]'}`}>{selectedTask.dueDate}</p>
                  </div>
                )}
                {selectedTask.assignee && (
                  <div>
                    <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Assignee</p>
                    <p className="font-medium text-[#1A1A1A]">{selectedTask.assignee}</p>
                  </div>
                )}
                {selectedTask.project && (
                  <div>
                    <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-1">Project</p>
                    <p className="font-medium text-[#1A1A1A]">{selectedTask.project}</p>
                  </div>
                )}
              </div>
              {selectedTask.status !== 'TODO' && (selectedTask.progress ?? 0) > 0 && (
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
              {selectedTask.description && (
                <div>
                  <p className="text-[#ABABAB] text-xs font-medium uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-[#757575]">{selectedTask.description}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#E2E0DC]">
              <Link href={`/tasks/${selectedTask.id}`}
                className="block w-full py-2 text-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
                Full Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} onCreated={load} />}
    </div>
  );
}
