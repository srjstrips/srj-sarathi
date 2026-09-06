'use client';
import { useState } from 'react';
import { Shield, Users, AlertTriangle, LogIn, Monitor, X, Lock, Globe, Activity } from 'lucide-react';

const RECENT_LOGINS = [
  { id: '1', user: 'admin@srjsteel.com',   name: 'Admin User',    time: '2026-09-06 09:12',  ip: '192.168.1.10', device: 'Chrome / Windows', status: 'success' },
  { id: '2', user: 'rahul.k@srjsteel.com', name: 'Rahul Kumar',   time: '2026-09-06 08:55',  ip: '192.168.1.44', device: 'Safari / iPhone',  status: 'success' },
  { id: '3', user: 'priya.m@srjsteel.com', name: 'Priya Mehta',   time: '2026-09-06 08:40',  ip: '192.168.1.23', device: 'Chrome / Android', status: 'success' },
  { id: '4', user: 'unknown@gmail.com',    name: '—',             time: '2026-09-06 07:30',  ip: '203.0.113.42', device: 'Unknown',          status: 'failed' },
  { id: '5', user: 'amit.s@srjsteel.com',  name: 'Amit Sharma',   time: '2026-09-05 18:22',  ip: '192.168.1.12', device: 'Chrome / Windows', status: 'success' },
  { id: '6', user: 'deepak.y@srjsteel.com', name: 'Deepak Yadav', time: '2026-09-05 17:45',  ip: '203.0.113.99', device: 'Firefox / Linux',  status: 'blocked' },
];

const ACTIVE_SESSIONS = [
  { id: 's1', user: 'Admin User',  device: 'Chrome / Windows', ip: '192.168.1.10', loginTime: '09:12 AM', lastActivity: '2 min ago' },
  { id: 's2', user: 'Rahul Kumar', device: 'Safari / iPhone',  ip: '192.168.1.44', loginTime: '08:55 AM', lastActivity: '5 min ago' },
  { id: 's3', user: 'Priya Mehta', device: 'Chrome / Android', ip: '192.168.1.23', loginTime: '08:40 AM', lastActivity: '12 min ago' },
];

const STATUS_CFG: Record<string, { label: string; color: string; dot: string }> = {
  success: { label: 'Success', color: 'text-green-700 bg-green-50',  dot: 'bg-green-500' },
  failed:  { label: 'Failed',  color: 'text-red-700 bg-red-50',     dot: 'bg-red-500' },
  blocked: { label: 'Blocked', color: 'text-orange-700 bg-orange-50', dot: 'bg-orange-500' },
};

type Tab = 'overview' | 'logins' | 'sessions' | 'events';

export default function SecurityPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const failedToday = RECENT_LOGINS.filter(l => l.status === 'failed' || l.status === 'blocked').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Security</h1><p className="text-sm text-[#757575] mt-0.5">System security overview and audit</p></div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Sessions', value: ACTIVE_SESSIONS.length, icon: Monitor,       color: 'bg-blue-50 text-blue-700',   iconColor: 'text-blue-500' },
          { label: "Today's Logins",  value: RECENT_LOGINS.length,   icon: LogIn,         color: 'bg-green-50 text-green-700', iconColor: 'text-green-500' },
          { label: 'Failed/Blocked',  value: failedToday,            icon: AlertTriangle,  color: failedToday > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600', iconColor: 'text-red-500' },
          { label: 'Active Users',    value: 284,                    icon: Users,          color: 'bg-orange-50 text-orange-700', iconColor: 'text-orange-500' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <div className="flex items-start justify-between"><p className="text-2xl font-bold">{s.value}</p><Icon size={20} className={s.iconColor} /></div>
              <p className="text-sm font-medium mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {([['overview', 'Overview'], ['logins', 'Login History'], ['sessions', 'Active Sessions'], ['events', 'Security Events']] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === id ? 'bg-orange-500 text-white' : 'text-[#757575] hover:text-[#1A1A1A] hover:bg-[#F8F7F4]'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {failedToday > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Security Alert</p>
                <p className="text-sm text-red-600 mt-0.5">{failedToday} failed or blocked login attempt(s) detected today. Review the login history for details.</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'IP Security', desc: '0 blocked IPs', icon: Globe,    color: 'bg-green-50' },
              { title: 'Audit Log',   desc: '284 events today', icon: Activity, color: 'bg-blue-50' },
              { title: 'Permissions', desc: '12 roles active', icon: Lock,    color: 'bg-purple-50' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.title} className={`rounded-xl p-4 ${s.color} flex items-start gap-3`}>
                  <Icon size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <div><p className="font-semibold text-[#1A1A1A]">{s.title}</p><p className="text-sm text-[#757575] mt-0.5">{s.desc}</p></div>
                </div>
              );
            })}
          </div>
          <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
            <div className="p-4 border-b border-[#E2E0DC] flex items-center justify-between">
              <p className="font-semibold text-[#1A1A1A]">Recent Login Activity</p>
              <button onClick={() => setTab('logins')} className="text-sm text-orange-500 hover:text-orange-600">View all</button>
            </div>
            <div className="divide-y divide-[#F0EEE9]">
              {RECENT_LOGINS.slice(0, 4).map(l => {
                const cfg = STATUS_CFG[l.status];
                return (
                  <div key={l.id} className="flex items-center gap-3 p-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{l.name || l.user}</p>
                      <p className="text-xs text-[#ABABAB]">{l.device} · {l.ip}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      <p className="text-xs text-[#ABABAB] mt-0.5">{l.time.split(' ')[1]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'logins' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
          <div className="hidden sm:grid grid-cols-5 gap-3 p-3 border-b border-[#E2E0DC] bg-[#F8F7F4] text-xs font-semibold text-[#757575] uppercase tracking-wide">
            <span>User</span><span>Device / IP</span><span className="hidden lg:block">Time</span><span>Status</span><span></span>
          </div>
          <div className="divide-y divide-[#F0EEE9]">
            {RECENT_LOGINS.map(l => {
              const cfg = STATUS_CFG[l.status];
              return (
                <div key={l.id} className="p-3 grid sm:grid-cols-5 gap-2 sm:gap-3 items-center hover:bg-[#F8F7F4] transition-colors">
                  <div className="sm:col-span-1">
                    <p className="text-sm font-medium text-[#1A1A1A]">{l.name || '—'}</p>
                    <p className="text-xs text-[#ABABAB] truncate">{l.user}</p>
                  </div>
                  <div className="sm:col-span-1">
                    <p className="text-xs text-[#757575]">{l.device}</p>
                    <p className="text-xs text-[#ABABAB] font-mono">{l.ip}</p>
                  </div>
                  <p className="text-xs text-[#757575] hidden lg:block">{l.time}</p>
                  <div><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span></div>
                  {l.status === 'blocked' && (
                    <button className="text-xs text-red-500 hover:text-red-700 text-left sm:text-center">Block IP</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="space-y-3">
          {ACTIVE_SESSIONS.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-[#E2E0DC] p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Monitor size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1A1A1A]">{s.user}</p>
                <p className="text-xs text-[#757575] mt-0.5">{s.device} · {s.ip}</p>
                <p className="text-xs text-[#ABABAB]">Login: {s.loginTime} · Active: {s.lastActivity}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <button className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'events' && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] p-5 text-center py-16">
          <Activity size={40} className="text-[#E2E0DC] mx-auto mb-3" />
          <p className="text-[#1A1A1A] font-medium">Security events log</p>
          <p className="text-sm text-[#757575] mt-1">All authentication and permission events will appear here</p>
        </div>
      )}
    </div>
  );
}

