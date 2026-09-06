'use client';
import { useAuthStore } from '@/store/auth.store';
import { CheckSquare, FolderKanban, Megaphone, Lightbulb, Users, TrendingUp, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, sub, icon: Icon, href, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; href: string; color: string;
}) {
  return (
    <Link href={href} className="block bg-white rounded-xl border border-[#E2E0DC] p-5 hover:shadow-md hover:border-orange-200 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#757575] font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#1A1A1A] mt-1">{value}</p>
          {sub && <p className="text-xs text-[#ABABAB] mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">{greeting}, {firstName} 👋</h1>
        <p className="text-[#757575] text-sm mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="My Tasks"       value="—" sub="pending"        icon={CheckSquare}  href="/tasks"         color="bg-orange-500" />
        <StatCard label="Projects"       value="—" sub="active"         icon={FolderKanban} href="/projects"      color="bg-blue-500" />
        <StatCard label="Announcements"  value="—" sub="unread"         icon={Megaphone}    href="/announcements" color="bg-purple-500" />
        <StatCard label="Kaizen"         value="—" sub="under review"   icon={Lightbulb}    href="/kaizen"        color="bg-green-500" />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
        <h2 className="font-semibold text-[#1A1A1A] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'New Task',         href: '/tasks?new=1',         icon: CheckSquare,  color: 'text-orange-500 bg-orange-50' },
            { label: 'New Project',      href: '/projects?new=1',      icon: FolderKanban, color: 'text-blue-500 bg-blue-50' },
            { label: 'Submit Kaizen',    href: '/kaizen?new=1',        icon: Lightbulb,    color: 'text-green-500 bg-green-50' },
            { label: 'View Team',        href: '/employees',           icon: Users,        color: 'text-purple-500 bg-purple-50' },
          ].map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E0DC] hover:border-orange-200 hover:shadow-sm transition-all"
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${action.color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium text-[#1A1A1A]">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Attention items */}
      <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
        <h2 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-500" />Needs Attention
        </h2>
        <div className="space-y-3">
          {[
            { label: '1 task overdue — Safety audit documentation', href: '/tasks', icon: Clock, color: 'text-red-500 bg-red-50' },
            { label: 'KRA self-assessment due by 30 Sep 2026', href: '/kra', icon: TrendingUp, color: 'text-orange-500 bg-orange-50' },
            { label: '2 announcements require acknowledgement', href: '/announcements', icon: Megaphone, color: 'text-purple-500 bg-purple-50' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E0DC] hover:border-orange-200 transition-all group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}><Icon size={15} /></div>
                <p className="text-sm text-[#1A1A1A] flex-1">{item.label}</p>
                <ArrowRight size={14} className="text-[#ABABAB] group-hover:text-orange-500 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
