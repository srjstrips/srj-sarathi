'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, CheckSquare, User, Flag, Calendar, MessageSquare,
  Paperclip, Plus, Check, X, ChevronDown, Tag, AlertCircle, Edit2,
} from 'lucide-react';

type ChecklistItem = { id: string; text: string; done: boolean };
type Comment = { id: string; author: string; initials: string; color: string; text: string; time: string };

const TASK = {
  id: 'TASK-001',
  title: 'Safety audit documentation for Q3 2026',
  description: 'Compile and review all safety audit checklists, incident reports, and compliance documentation for Q3 2026. Ensure all forms are signed and submitted to the safety department before the deadline.',
  status: 'IN_PROGRESS' as const,
  priority: 'HIGH' as const,
  assignee: { name: 'Rajesh Kumar', initials: 'RK', color: 'bg-orange-100 text-orange-600' },
  reporter: { name: 'Suresh Patel', initials: 'SP', color: 'bg-blue-100 text-blue-600' },
  project: 'Safety & Compliance 2026',
  department: 'Production',
  dueDate: '2026-09-15',
  createdAt: '2026-08-28',
  updatedAt: '2026-09-05',
  tags: ['safety', 'compliance', 'Q3'],
  estimatedHours: 8,
  loggedHours: 3.5,
};

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', text: 'Collect incident reports from all departments', done: true },
  { id: 'c2', text: 'Review PPE compliance records', done: true },
  { id: 'c3', text: 'Compile fire drill attendance sheets', done: false },
  { id: 'c4', text: 'Get sign-off from HOD', done: false },
  { id: 'c5', text: 'Submit to safety officer', done: false },
];

const INITIAL_COMMENTS: Comment[] = [
  { id: 'cm1', author: 'Suresh Patel', initials: 'SP', color: 'bg-blue-100 text-blue-600', text: 'Please make sure to include the crane operator safety certifications this quarter.', time: '2026-09-03 14:22' },
  { id: 'cm2', author: 'Rajesh Kumar', initials: 'RK', color: 'bg-orange-100 text-orange-600', text: 'Noted. I have already collected those from the maintenance team.', time: '2026-09-03 16:45' },
  { id: 'cm3', author: 'Priya Sharma', initials: 'PS', color: 'bg-green-100 text-green-600', text: 'Can you share the draft before final submission for a quick review?', time: '2026-09-05 10:10' },
];

const STATUS_CFG = {
  TODO:        { label: 'To Do',       cls: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  REVIEW:      { label: 'In Review',   cls: 'bg-purple-100 text-purple-700' },
  DONE:        { label: 'Done',        cls: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-700' },
} as const;

const PRIORITY_CFG = {
  LOW:    { label: 'Low',      cls: 'text-green-600',  dot: 'bg-green-400' },
  MEDIUM: { label: 'Medium',   cls: 'text-yellow-600', dot: 'bg-yellow-400' },
  HIGH:   { label: 'High',     cls: 'text-red-600',    dot: 'bg-red-500' },
  URGENT: { label: 'Urgent',   cls: 'text-red-800',    dot: 'bg-red-700' },
} as const;

export default function TaskDetailPage() {
  const router = useRouter();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [newItem, setNewItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  const done = checklist.filter(c => c.done).length;
  const total = checklist.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const toggleItem = (id: string) =>
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const addItem = () => {
    if (!newItem.trim()) return;
    setChecklist(prev => [...prev, { id: `c${Date.now()}`, text: newItem.trim(), done: false }]);
    setNewItem('');
    setAddingItem(false);
  };

  const postComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: `cm${Date.now()}`,
      author: 'You',
      initials: 'ME',
      color: 'bg-orange-100 text-orange-600',
      text: newComment.trim(),
      time: new Date().toLocaleString('en-IN'),
    }]);
    setNewComment('');
  };

  const status = STATUS_CFG[TASK.status];
  const priority = PRIORITY_CFG[TASK.priority];

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#757575] hover:text-[#1A1A1A] transition-colors">
        <ArrowLeft size={16} /> Back to Tasks
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-[#ABABAB] font-mono mb-1">{TASK.id}</p>
                <h1 className="text-xl font-bold text-[#1A1A1A]">{TASK.title}</h1>
              </div>
              <button className="p-2 rounded-lg border border-[#E2E0DC] hover:bg-gray-50 flex-shrink-0">
                <Edit2 size={14} className="text-[#757575]" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>{status.label}</span>
              <span className={`flex items-center gap-1.5 text-xs font-medium ${priority.cls}`}>
                <span className={`w-2 h-2 rounded-full ${priority.dot}`} />{priority.label} Priority
              </span>
              {TASK.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
            <h2 className="font-semibold text-[#1A1A1A] mb-3">Description</h2>
            <p className="text-sm text-[#757575] leading-relaxed">{TASK.description}</p>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1A1A]">Checklist</h2>
              <span className="text-xs text-[#757575]">{done}/{total} · {pct}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
              <div className="bg-orange-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-2">
              {checklist.map(item => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      item.done ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-300'
                    }`}
                  >
                    {item.done && <Check size={11} className="text-white" />}
                  </button>
                  <span className={`text-sm transition-colors ${item.done ? 'line-through text-[#ABABAB]' : 'text-[#1A1A1A]'}`}>{item.text}</span>
                </label>
              ))}
            </div>
            {addingItem ? (
              <div className="mt-3 flex items-center gap-2">
                <input
                  autoFocus
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') setAddingItem(false); }}
                  placeholder="New checklist item…"
                  className="flex-1 px-3 py-1.5 text-sm border border-[#E2E0DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <button onClick={addItem} className="p-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"><Check size={14} /></button>
                <button onClick={() => setAddingItem(false)} className="p-1.5 border border-[#E2E0DC] rounded-lg hover:bg-gray-50"><X size={14} className="text-[#757575]" /></button>
              </div>
            ) : (
              <button onClick={() => setAddingItem(true)} className="mt-3 flex items-center gap-2 text-sm text-[#757575] hover:text-orange-600 transition-colors">
                <Plus size={14} /> Add item
              </button>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
            <h2 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-[#757575]" />Comments <span className="text-xs text-[#ABABAB] font-normal">({comments.length})</span>
            </h2>
            <div className="space-y-4 mb-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.color}`}>{c.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-[#1A1A1A]">{c.author}</span>
                      <span className="text-xs text-[#ABABAB]">{c.time}</span>
                    </div>
                    <p className="text-sm text-[#757575] leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">ME</div>
              <div className="flex-1 flex gap-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                  placeholder="Add a comment… (Enter to post)"
                  className="flex-1 px-3 py-2 text-sm border border-[#E2E0DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                />
                <button onClick={postComment} disabled={!newComment.trim()} className="px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-40 transition-all">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Details */}
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-4 space-y-4">
            <h3 className="font-semibold text-[#1A1A1A] text-sm">Details</h3>

            <div>
              <p className="text-xs text-[#ABABAB] mb-1.5">Assignee</p>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${TASK.assignee.color}`}>{TASK.assignee.initials}</div>
                <span className="text-sm text-[#1A1A1A]">{TASK.assignee.name}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#ABABAB] mb-1.5">Reporter</p>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${TASK.reporter.color}`}>{TASK.reporter.initials}</div>
                <span className="text-sm text-[#1A1A1A]">{TASK.reporter.name}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#ABABAB] mb-1">Status</p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                {status.label}
              </div>
            </div>

            <div>
              <p className="text-xs text-[#ABABAB] mb-1">Priority</p>
              <span className={`flex items-center gap-1.5 text-sm font-medium ${priority.cls}`}>
                <span className={`w-2 h-2 rounded-full ${priority.dot}`} />{priority.label}
              </span>
            </div>

            <div>
              <p className="text-xs text-[#ABABAB] mb-1">Due Date</p>
              <span className="text-sm text-[#1A1A1A] flex items-center gap-1.5">
                <Calendar size={13} className="text-[#ABABAB]" />{TASK.dueDate}
              </span>
            </div>

            <div>
              <p className="text-xs text-[#ABABAB] mb-1">Project</p>
              <span className="text-sm text-[#1A1A1A]">{TASK.project}</span>
            </div>

            <div>
              <p className="text-xs text-[#ABABAB] mb-1">Department</p>
              <span className="text-sm text-[#1A1A1A]">{TASK.department}</span>
            </div>
          </div>

          {/* Time tracking */}
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-4">
            <h3 className="font-semibold text-[#1A1A1A] text-sm mb-3">Time Tracking</h3>
            <div className="flex justify-between text-xs text-[#757575] mb-1.5">
              <span>{TASK.loggedHours}h logged</span>
              <span>{TASK.estimatedHours}h estimated</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, (TASK.loggedHours / TASK.estimatedHours) * 100)}%` }} />
            </div>
            <p className="text-xs text-[#ABABAB] mt-1.5">{TASK.estimatedHours - TASK.loggedHours}h remaining</p>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-4 space-y-2">
            <h3 className="font-semibold text-[#1A1A1A] text-sm mb-2">Activity</h3>
            <p className="text-xs text-[#757575]">Created: <span className="text-[#1A1A1A]">{TASK.createdAt}</span></p>
            <p className="text-xs text-[#757575]">Updated: <span className="text-[#1A1A1A]">{TASK.updatedAt}</span></p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
              Mark as Done
            </button>
            <button className="w-full py-2 border border-[#E2E0DC] text-[#757575] text-sm rounded-lg hover:bg-gray-50 transition-colors">
              Reassign Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
