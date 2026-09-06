'use client';
import { useState } from 'react';
import { Settings, Building2, Bell, Shield, Moon, Globe, Database, ChevronRight, Check, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

interface SettingSection {
  id: string; title: string; description: string; icon: React.ElementType; iconColor: string; iconBg: string;
}

const SECTIONS: SettingSection[] = [
  { id: 'company',       title: 'Company Profile',       description: 'Organization name, logo, address, and contact', icon: Building2, iconColor: 'text-blue-600',   iconBg: 'bg-blue-50' },
  { id: 'notifications', title: 'Notifications',         description: 'Email, push, and in-app notification preferences', icon: Bell,      iconColor: 'text-orange-600', iconBg: 'bg-orange-50' },
  { id: 'security',      title: 'Security Settings',     description: 'Password policy, session timeout, 2FA requirements', icon: Shield,   iconColor: 'text-red-600',    iconBg: 'bg-red-50' },
  { id: 'appearance',    title: 'Appearance',            description: 'Theme, language, and display preferences', icon: Moon,      iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
  { id: 'localization',  title: 'Localization',          description: 'Date format, currency, timezone settings', icon: Globe,     iconColor: 'text-green-600',  iconBg: 'bg-green-50' },
  { id: 'data',          title: 'Data & Privacy',        description: 'Data retention, export, and privacy controls', icon: Database, iconColor: 'text-gray-600',   iconBg: 'bg-gray-100' },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const [active, setActive] = useState<string | null>(null);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [taskNotifs, setTaskNotifs] = useState(true);
  const [kaizenNotifs, setKaizenNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  if (active) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setActive(null)} className="p-2 rounded-lg hover:bg-gray-100 border border-[#E2E0DC]">
            <ChevronRight size={16} className="text-[#757575] rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{SECTIONS.find(s => s.id === active)?.title}</h1>
            <p className="text-sm text-[#757575]">{SECTIONS.find(s => s.id === active)?.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E0DC] divide-y divide-[#F0EEE9]">
          {active === 'notifications' && (
            <>
              {[
                { label: 'Email Notifications', desc: 'Receive notifications via email', value: emailNotifs, set: setEmailNotifs },
                { label: 'Push Notifications', desc: 'Browser push notifications', value: pushNotifs, set: setPushNotifs },
                { label: 'Task Assignments', desc: 'Notify when a task is assigned to you', value: taskNotifs, set: setTaskNotifs },
                { label: 'Kaizen Updates', desc: 'Notify on kaizen status changes', value: kaizenNotifs, set: setKaizenNotifs },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4">
                  <div><p className="text-sm font-medium text-[#1A1A1A]">{item.label}</p><p className="text-xs text-[#757575] mt-0.5">{item.desc}</p></div>
                  <Toggle value={item.value} onChange={item.set} />
                </div>
              ))}
            </>
          )}
          {active === 'appearance' && (
            <>
              <div className="flex items-center justify-between p-4">
                <div><p className="text-sm font-medium text-[#1A1A1A]">Dark Mode</p><p className="text-xs text-[#757575] mt-0.5">Switch to dark theme</p></div>
                <Toggle value={darkMode} onChange={setDarkMode} />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-[#1A1A1A] mb-3">Theme Color</p>
                <div className="flex gap-2">
                  {['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500'].map(c => (
                    <button key={c} className={`w-8 h-8 rounded-full ${c} flex items-center justify-center`}>
                      {c === 'bg-orange-500' && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {active === 'security' && (
            <>
              <div className="p-4">
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">Session Timeout</p>
                <p className="text-xs text-[#757575] mb-3">Auto-logout after inactivity</p>
                <select className="px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                  <option>30 minutes</option><option>1 hour</option><option>4 hours</option><option>8 hours</option>
                </select>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">Password Policy</p>
                <p className="text-xs text-[#757575] mb-3">Minimum password requirements</p>
                <select className="px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                  <option>Standard (8 chars)</option><option>Strong (12 chars + symbols)</option><option>Enterprise (16 chars + complexity)</option>
                </select>
              </div>
            </>
          )}
          {active === 'localization' && (
            <>
              <div className="p-4">
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">Timezone</p>
                <select className="mt-2 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 w-full max-w-xs">
                  <option>Asia/Kolkata (IST +5:30)</option>
                </select>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">Date Format</p>
                <select className="mt-2 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 w-full max-w-xs">
                  <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>DD MMM YYYY</option>
                </select>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-[#1A1A1A] mb-1">Currency</p>
                <select className="mt-2 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 w-full max-w-xs">
                  <option>INR (₹)</option>
                </select>
              </div>
            </>
          )}
          {(active === 'company' || active === 'data') && (
            <div className="p-8 text-center text-[#757575]">
              <Settings size={32} className="mx-auto mb-2 text-[#E2E0DC]" />
              <p className="text-sm">Configuration options for {SECTIONS.find(s => s.id === active)?.title} will appear here.</p>
            </div>
          )}
        </div>

        <button onClick={handleSave} className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
          {saved ? <><Check size={16} />Saved!</> : 'Save Changes'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Settings</h1><p className="text-sm text-[#757575] mt-0.5">System and organization configuration</p></div>

      {/* User profile card */}
      <div className="bg-white rounded-xl border border-[#E2E0DC] p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600 flex-shrink-0">
          {user?.name?.charAt(0) ?? 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1A1A1A]">{user?.name ?? 'User'}</p>
          <p className="text-sm text-[#757575]">{user?.email}</p>
          <p className="text-xs text-[#ABABAB] mt-0.5 font-mono">{user?.role}</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-[#E2E0DC] rounded-lg text-sm text-[#757575] hover:border-gray-300 transition-colors">
          <User size={14} />Edit Profile
        </button>
      </div>

      {/* Setting sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <button key={section.id} onClick={() => setActive(section.id)}
              className="bg-white rounded-xl border border-[#E2E0DC] p-4 hover:shadow-md hover:border-orange-200 cursor-pointer transition-all text-left flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${section.iconBg}`}>
                <Icon size={18} className={section.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1A1A1A] text-sm">{section.title}</p>
                <p className="text-xs text-[#757575] mt-0.5">{section.description}</p>
              </div>
              <ChevronRight size={16} className="text-[#ABABAB] flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 className="font-semibold text-red-800 mb-1">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-3">These actions are irreversible. Please be certain.</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors">Clear All Sessions</button>
          <button className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors">Export All Data</button>
        </div>
      </div>
    </div>
  );
}

