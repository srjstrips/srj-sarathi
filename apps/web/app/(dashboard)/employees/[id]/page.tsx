'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Award, Edit2, CheckSquare,
  TrendingUp, Lightbulb, MessageSquare, Clock, Shield, ChevronRight,
} from 'lucide-react';

const EMPLOYEE = {
  id: 'EMP001',
  employeeCode: 'SRJ-001',
  firstName: 'Rajesh',
  lastName: 'Kumar',
  displayName: 'Rajesh Kumar',
  email: 'rajesh.kumar@srjsteel.com',
  phone: '+91 98765 43210',
  department: 'Production',
  designation: 'Senior Engineer',
  grade: 'E4',
  status: 'ACTIVE',
  joinDate: '2019-03-15',
  location: 'Plant A – Bhilai',
  reportingTo: 'Suresh Patel',
  profilePicUrl: null as string | null,
  bio: 'Experienced production engineer specializing in blast furnace operations and quality control.',
  skills: ['Blast Furnace Ops', 'Quality Control', 'Safety Compliance', 'Process Optimization'],
  stats: {
    tasksCompleted: 142,
    kaizenSubmitted: 8,
    kraScore: 87,
    attendanceRate: 96,
  },
  recentTasks: [
    { id: 't1', title: 'Safety audit documentation', status: 'IN_PROGRESS', due: '2026-09-15', priority: 'HIGH' },
    { id: 't2', title: 'Monthly production report', status: 'DONE', due: '2026-09-01', priority: 'MEDIUM' },
    { id: 't3', title: 'Equipment maintenance log', status: 'TODO', due: '2026-09-20', priority: 'LOW' },
  ],
  kaizenList: [
    { id: 'k1', title: 'Reduce slag handling time by 20%', status: 'APPROVED', savings: 120000 },
    { id: 'k2', title: 'Optimize cooling water circuit', status: 'UNDER_REVIEW', savings: 0 },
  ],
  loginHistory: [
    { date: '2026-09-06 09:12', ip: '10.0.1.42', device: 'Chrome / Windows' },
    { date: '2026-09-05 08:55', ip: '10.0.1.42', device: 'Chrome / Windows' },
    { date: '2026-09-04 09:01', ip: '192.168.1.10', device: 'Mobile / Android' },
  ],
};

type Tab = 'overview' | 'tasks' | 'kaizen' | 'kra' | 'security';

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
};

const TASK_STATUS: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

const PRIORITY_COLOR: Record<string, string> = {
  HIGH: 'text-red-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-green-600',
};

const KAIZEN_STATUS: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  REJECTED: 'bg-red-100 text-red-700',
};

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white border border-[#E2E0DC] rounded-xl p-4 flex flex-col items-center gap-1">
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-[#757575] text-center">{label}</span>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const emp = EMPLOYEE;
  const [tab, setTab] = useState<Tab>('overview');

  const initials = `${emp.firstName[0]}${emp.lastName[0]}`;

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Award },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'kaizen', label: 'Kaizen', icon: Lightbulb },
    { id: 'kra', label: 'KRA', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#757575] hover:text-[#1A1A1A] transition-colors">
        <ArrowLeft size={16} /> Back to Employees
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-[#E2E0DC] p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-600 flex-shrink-0">
            {emp.profilePicUrl ? <img src={emp.profilePicUrl} alt="" className="w-full h-full rounded-2xl object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-1">
              <h1 className="text-xl font-bold text-[#1A1A1A]">{emp.displayName}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[emp.status] ?? 'bg-gray-100 text-gray-600'}`}>{emp.status}</span>
            </div>
            <p className="text-sm text-[#757575]">{emp.designation} · {emp.department}</p>
            <p className="text-xs text-[#ABABAB] font-mono mt-0.5">{emp.employeeCode} · Grade {emp.grade}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#757575]">
              <span className="flex items-center gap-1.5"><Mail size={13} />{emp.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={13} />{emp.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} />{emp.location}</span>
              <span className="flex items-center gap-1.5"><Calendar size={13} />Joined {new Date(emp.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-[#E2E0DC] rounded-lg text-sm text-[#757575] hover:border-gray-300 transition-colors h-fit">
            <Edit2 size={13} />Edit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill label="Tasks Completed" value={emp.stats.tasksCompleted} color="text-orange-600" />
        <StatPill label="Kaizen Submitted" value={emp.stats.kaizenSubmitted} color="text-blue-600" />
        <StatPill label="KRA Score" value={`${emp.stats.kraScore}%`} color="text-green-600" />
        <StatPill label="Attendance" value={`${emp.stats.attendanceRate}%`} color="text-purple-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E2E0DC] overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px ${
                tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-[#757575] hover:text-[#1A1A1A]'
              }`}
            >
              <Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-5 space-y-4">
            <h3 className="font-semibold text-[#1A1A1A]">About</h3>
            <p className="text-sm text-[#757575]">{emp.bio}</p>
            <div>
              <p className="text-xs font-medium text-[#ABABAB] uppercase mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {emp.skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-[#F0EEE9]">
              <p className="text-xs font-medium text-[#ABABAB] uppercase mb-2">Reporting To</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">SP</div>
                <span className="text-sm text-[#1A1A1A]">{emp.reportingTo}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E2E0DC] p-5 space-y-3">
            <h3 className="font-semibold text-[#1A1A1A]">Recent Tasks</h3>
            {emp.recentTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 py-2 border-b border-[#F0EEE9] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1A1A1A] truncate">{task.title}</p>
                  <p className="text-xs text-[#ABABAB] mt-0.5">Due {task.due}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS[task.status]}`}>{task.status.replace('_', ' ')}</span>
                <span className={`text-xs font-medium ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
          <div className="p-4 border-b border-[#F0EEE9] flex items-center justify-between">
            <h3 className="font-semibold text-[#1A1A1A]">All Tasks</h3>
            <span className="text-xs text-[#757575]">{emp.recentTasks.length} tasks</span>
          </div>
          <div className="divide-y divide-[#F0EEE9]">
            {emp.recentTasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-[#FAFAF8] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{task.title}</p>
                  <p className="text-xs text-[#ABABAB] mt-0.5 flex items-center gap-1"><Clock size={11} />Due {task.due}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS[task.status]}`}>{task.status.replace('_', ' ')}</span>
                <span className={`text-xs font-semibold ${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                <ChevronRight size={14} className="text-[#ABABAB]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'kaizen' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
          <div className="p-4 border-b border-[#F0EEE9]">
            <h3 className="font-semibold text-[#1A1A1A]">Kaizen Submissions</h3>
          </div>
          <div className="divide-y divide-[#F0EEE9]">
            {emp.kaizenList.map(k => (
              <div key={k.id} className="flex items-center gap-4 p-4 hover:bg-[#FAFAF8]">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{k.title}</p>
                  {k.savings > 0 && <p className="text-xs text-green-600 mt-0.5">Savings: ₹{k.savings.toLocaleString('en-IN')}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${KAIZEN_STATUS[k.status] ?? 'bg-gray-100 text-gray-600'}`}>{k.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'kra' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1A1A1A]">KRA Performance</h3>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full border-4 border-green-400 flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">{emp.stats.kraScore}</span>
              </div>
              <span className="text-xs text-[#757575]">Overall</span>
            </div>
          </div>
          <p className="text-sm text-[#757575]">Detailed KRA objectives and ratings are visible on the KRA module. This employee scored <strong>{emp.stats.kraScore}%</strong> in the current cycle.</p>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
          <div className="p-4 border-b border-[#F0EEE9]">
            <h3 className="font-semibold text-[#1A1A1A]">Login History</h3>
          </div>
          <div className="divide-y divide-[#F0EEE9]">
            {emp.loginHistory.map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Shield size={15} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1A1A1A]">{log.device}</p>
                  <p className="text-xs text-[#ABABAB] mt-0.5">{log.ip}</p>
                </div>
                <span className="text-xs text-[#757575]">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
