'use client';
import { useState } from 'react';
import { Camera, Check, Eye, EyeOff, Lock, LogOut, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

type Section = 'profile' | 'password' | 'notifications' | 'sessions';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function PasswordInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-3 pr-10 py-2.5 text-sm border border-[#E2E0DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
        />
        <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#757575]">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

const SESSIONS = [
  { id: 's1', device: 'Chrome · Windows', ip: '10.0.1.42', location: 'Bhilai, IN', time: '2026-09-06 09:12', current: true },
  { id: 's2', device: 'Mobile · Android', ip: '192.168.1.10', location: 'Bhilai, IN', time: '2026-09-04 09:01', current: false },
];

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();

  const [section, setSection] = useState<Section>('profile');
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState('Rajesh');
  const [lastName, setLastName]   = useState('Kumar');
  const [phone, setPhone]         = useState('+91 98765 43210');

  // Password fields
  const [current, setCurrent]     = useState('');
  const [newPass, setNewPass]     = useState('');
  const [confirm, setConfirm]     = useState('');
  const [pwSaved, setPwSaved]     = useState(false);
  const [pwError, setPwError]     = useState('');

  // Notification prefs
  const [emailN, setEmailN]       = useState(true);
  const [pushN, setPushN]         = useState(true);
  const [taskN, setTaskN]         = useState(true);
  const [kaizenN, setKaizenN]     = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handlePwSave = () => {
    setPwError('');
    if (!current) return setPwError('Current password is required.');
    if (newPass.length < 8) return setPwError('New password must be at least 8 characters.');
    if (newPass !== confirm) return setPwError('Passwords do not match.');
    setPwSaved(true);
    setCurrent(''); setNewPass(''); setConfirm('');
    setTimeout(() => setPwSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'ME';

  const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'profile',       label: 'Profile',       icon: Camera },
    { id: 'password',      label: 'Password',      icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'sessions',      label: 'Sessions',      icon: Shield },
  ];

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-[#1A1A1A]">My Profile</h1><p className="text-sm text-[#757575] mt-0.5">Manage your account and preferences</p></div>

      <div className="flex flex-col sm:flex-row gap-5">
        {/* Sidebar nav */}
        <div className="sm:w-56 flex-shrink-0 space-y-1">
          {NAV.map(n => {
            const Icon = n.icon;
            return (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  section === n.id ? 'bg-orange-50 text-orange-600' : 'text-[#757575] hover:bg-gray-50 hover:text-[#1A1A1A]'
                }`}
              >
                <Icon size={15} />{n.label}
              </button>
            );
          })}
          <hr className="border-[#E2E0DC] my-2" />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left">
            <LogOut size={15} />Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === 'profile' && (
            <div className="bg-white rounded-xl border border-[#E2E0DC] p-5 space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600">
                    {initials}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow">
                    <Camera size={12} className="text-white" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{user?.name ?? 'User'}</p>
                  <p className="text-sm text-[#757575]">{user?.email}</p>
                  <p className="text-xs text-[#ABABAB] font-mono mt-0.5">{user?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E2E0DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E2E0DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Email</label>
                  <input value={user?.email ?? ''} disabled className="w-full px-3 py-2.5 text-sm border border-[#E2E0DC] rounded-lg bg-gray-50 text-[#ABABAB] cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-[#E2E0DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
                </div>
              </div>

              <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                {saved ? <><Check size={15} />Saved!</> : 'Save Changes'}
              </button>
            </div>
          )}

          {section === 'password' && (
            <div className="bg-white rounded-xl border border-[#E2E0DC] p-5 space-y-4">
              <h2 className="font-semibold text-[#1A1A1A]">Change Password</h2>
              <PasswordInput label="Current Password" value={current} onChange={setCurrent} placeholder="Enter current password" />
              <PasswordInput label="New Password" value={newPass} onChange={setNewPass} placeholder="At least 8 characters" />
              <PasswordInput label="Confirm New Password" value={confirm} onChange={setConfirm} placeholder="Repeat new password" />
              {pwError && <p className="text-sm text-red-600">{pwError}</p>}
              <button onClick={handlePwSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${pwSaved ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                {pwSaved ? <><Check size={15} />Password Updated!</> : 'Update Password'}
              </button>
            </div>
          )}

          {section === 'notifications' && (
            <div className="bg-white rounded-xl border border-[#E2E0DC] divide-y divide-[#F0EEE9]">
              {[
                { label: 'Email Notifications', desc: 'Receive updates via email',             value: emailN,  set: setEmailN },
                { label: 'Push Notifications',  desc: 'Browser and mobile push alerts',        value: pushN,   set: setPushN },
                { label: 'Task Assignments',    desc: 'Notify when a task is assigned to you', value: taskN,   set: setTaskN },
                { label: 'Kaizen Updates',      desc: 'Notify on kaizen status changes',       value: kaizenN, set: setKaizenN },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4">
                  <div><p className="text-sm font-medium text-[#1A1A1A]">{item.label}</p><p className="text-xs text-[#757575] mt-0.5">{item.desc}</p></div>
                  <Toggle value={item.value} onChange={item.set} />
                </div>
              ))}
            </div>
          )}

          {section === 'sessions' && (
            <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
              <div className="p-4 border-b border-[#F0EEE9] flex items-center justify-between">
                <h2 className="font-semibold text-[#1A1A1A]">Active Sessions</h2>
                <button className="text-xs text-red-600 hover:text-red-700 font-medium">Revoke All Others</button>
              </div>
              <div className="divide-y divide-[#F0EEE9]">
                {SESSIONS.map(sess => (
                  <div key={sess.id} className="flex items-center gap-4 p-4">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Shield size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#1A1A1A]">{sess.device}</p>
                        {sess.current && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Current</span>}
                      </div>
                      <p className="text-xs text-[#757575] mt-0.5">{sess.ip} · {sess.location}</p>
                      <p className="text-xs text-[#ABABAB]">{sess.time}</p>
                    </div>
                    {!sess.current && (
                      <button className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
