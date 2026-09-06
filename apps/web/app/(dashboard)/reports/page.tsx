'use client';
import { useState } from 'react';
import { BarChart3, Download, FileText, Users, CheckSquare, Lightbulb, Target, Calendar, ArrowRight } from 'lucide-react';

interface ReportCard {
  id: string; title: string; description: string; category: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
  lastGenerated?: string; format: string[];
}

const REPORTS: ReportCard[] = [
  { id: 'r1', title: 'Employee Master Report', description: 'Complete employee list with all details, department, designation, and status', category: 'HR', icon: Users, iconColor: 'text-blue-500', iconBg: 'bg-blue-50', lastGenerated: '2026-09-05', format: ['XLSX', 'PDF'] },
  { id: 'r2', title: 'Attendance Summary', description: 'Monthly attendance summary by department and individual employee', category: 'HR', icon: Calendar, iconColor: 'text-green-500', iconBg: 'bg-green-50', lastGenerated: '2026-09-01', format: ['XLSX', 'PDF'] },
  { id: 'r3', title: 'Task Completion Report', description: 'Task status, completion rates, and overdue analysis by team', category: 'Work', icon: CheckSquare, iconColor: 'text-orange-500', iconBg: 'bg-orange-50', lastGenerated: '2026-09-04', format: ['XLSX', 'PDF'] },
  { id: 'r4', title: 'Project Status Report', description: 'All active projects with progress, milestones, and risk status', category: 'Work', icon: BarChart3, iconColor: 'text-purple-500', iconBg: 'bg-purple-50', format: ['XLSX', 'PDF', 'PPT'] },
  { id: 'r5', title: 'Kaizen Impact Report', description: 'Submitted, approved, implemented kaizen with savings analysis', category: 'Performance', icon: Lightbulb, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50', lastGenerated: '2026-09-01', format: ['XLSX', 'PDF'] },
  { id: 'r6', title: 'KRA Performance Summary', description: 'Individual and department KRA scores by review cycle', category: 'Performance', icon: Target, iconColor: 'text-red-500', iconBg: 'bg-red-50', format: ['XLSX', 'PDF'] },
  { id: 'r7', title: 'Leave Balance Report', description: 'Current leave balances for all employees by type', category: 'HR', icon: Calendar, iconColor: 'text-teal-500', iconBg: 'bg-teal-50', lastGenerated: '2026-09-03', format: ['XLSX'] },
  { id: 'r8', title: 'Headcount Movement', description: 'Joiners, leavers, and transfers in a given period', category: 'HR', icon: Users, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50', format: ['XLSX', 'PDF'] },
];

const CATEGORIES = ['All', 'HR', 'Work', 'Performance'];

export default function ReportsPage() {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [generating, setGenerating] = useState<string | null>(null);

  const filtered = REPORTS.filter(r => categoryFilter === 'All' || r.category === categoryFilter);

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Reports</h1><p className="text-sm text-[#757575] mt-0.5">Generate and download organizational reports</p></div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[['Total Reports', REPORTS.length, 'bg-blue-50 text-blue-700'], ['Generated Today', 3, 'bg-green-50 text-green-700'], ['Scheduled', 2, 'bg-orange-50 text-orange-700']].map(([l, v, cls]) => (
          <div key={String(l)} className={`rounded-xl p-4 ${cls}`}><p className="text-2xl font-bold">{v}</p><p className="text-sm font-medium">{l}</p></div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${categoryFilter === cat ? 'bg-orange-500 text-white' : 'text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F8F7F4]'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(report => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-xl border border-[#E2E0DC] p-5 hover:shadow-md hover:border-orange-200 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${report.iconBg}`}>
                  <Icon size={20} className={report.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm">{report.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mt-0.5 inline-block">{report.category}</span>
                </div>
              </div>
              <p className="text-xs text-[#757575] mb-4 leading-relaxed">{report.description}</p>
              {report.lastGenerated && (
                <p className="text-xs text-[#ABABAB] mb-3">Last generated: {report.lastGenerated}</p>
              )}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {report.format.map(f => (
                    <span key={f} className="text-xs font-mono bg-[#F8F7F4] text-[#757575] px-1.5 py-0.5 rounded border border-[#E2E0DC]">{f}</span>
                  ))}
                </div>
                <button
                  onClick={() => handleGenerate(report.id)}
                  disabled={generating === report.id}
                  className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${generating === report.id ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                  {generating === report.id ? (
                    <>Generating...</>
                  ) : (
                    <><Download size={12} />Generate</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom report builder */}
      <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-200 rounded-xl p-5 flex items-center gap-4">
        <FileText size={32} className="text-orange-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-[#1A1A1A]">Custom Report Builder</p>
          <p className="text-sm text-[#757575] mt-0.5">Create custom reports by selecting fields, filters, and format.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0">
          Build Report <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

