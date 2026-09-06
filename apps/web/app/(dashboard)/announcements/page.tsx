'use client';
import { useState } from 'react';
import { Megaphone, Plus, Search, Pin, Bell, ChevronRight, X, Check, AlertCircle, Info, Shield } from 'lucide-react';

type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
type Category = 'GENERAL' | 'HR' | 'SAFETY' | 'OPERATIONS' | 'SECURITY';

interface Announcement {
  id: string; title: string; content: string; priority: Priority;
  category: Category; publishedBy: string; publishedAt: string;
  pinned: boolean; read: boolean; acknowledged: boolean; requiresAck: boolean;
  targetDept?: string;
}

const DEMO: Announcement[] = [
  { id: '1', title: 'Safety Drill – All Sections Mandatory', content: 'A mandatory safety drill will be conducted on 10th September 2026 at 2:00 PM. All employees must participate. Please report to your designated assembly area. No work will be exempted during the drill period.', priority: 'URGENT', category: 'SAFETY', publishedBy: 'Safety Officer', publishedAt: '2026-09-05', pinned: true, read: false, acknowledged: false, requiresAck: true },
  { id: '2', title: 'Holiday Notice – Ganesh Chaturthi', content: 'The plant will remain closed on 7th September 2026 (Sunday) on account of Ganesh Chaturthi. All scheduled operations for that day will resume on Monday 8th September.', priority: 'HIGH', category: 'HR', publishedBy: 'HR Department', publishedAt: '2026-09-04', pinned: true, read: true, acknowledged: true, requiresAck: false },
  { id: '3', title: 'New Leave Policy – Effective Oct 2026', content: 'The updated leave policy will be effective from 1st October 2026. Key changes include: revised casual leave balance, new sick leave verification process, and updated half-day leave rules. Please review the attached document.', priority: 'NORMAL', category: 'HR', publishedBy: 'HR Department', publishedAt: '2026-09-03', pinned: false, read: false, acknowledged: false, requiresAck: true },
  { id: '4', title: 'IT System Maintenance – 8 Sep', content: 'The HRMS server will undergo scheduled maintenance on 8th September from 12:00 AM to 4:00 AM. The system will be unavailable during this period. Please save all work before midnight.', priority: 'NORMAL', category: 'OPERATIONS', publishedBy: 'IT Department', publishedAt: '2026-09-02', pinned: false, read: true, acknowledged: false, requiresAck: false },
  { id: '5', title: 'Security Policy Update', content: 'All employees are required to update their HRMS passwords by 15th September 2026. Passwords must be at least 12 characters and include a mix of letters, numbers, and symbols.', priority: 'HIGH', category: 'SECURITY', publishedBy: 'IT Security', publishedAt: '2026-09-01', pinned: false, read: false, acknowledged: false, requiresAck: true },
  { id: '6', title: 'Q3 Performance Review Schedule', content: 'The Q3 performance review cycle begins 20th September. All managers must complete their direct report reviews by 30th September. KRA forms will be available in the system from 15th September.', priority: 'NORMAL', category: 'HR', publishedBy: 'HR Department', publishedAt: '2026-08-30', pinned: false, read: true, acknowledged: true, requiresAck: false },
];

const PRIORITY_CFG: Record<Priority, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  URGENT: { label: 'Urgent', color: 'text-red-700',    bg: 'bg-red-50 border-red-200',    icon: AlertCircle },
  HIGH:   { label: 'High',   color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: Bell },
  NORMAL: { label: 'Normal', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',  icon: Info },
  LOW:    { label: 'Low',    color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200',  icon: Megaphone },
};

const CAT_CFG: Record<Category, { label: string; color: string }> = {
  GENERAL:    { label: 'General',    color: 'text-gray-600 bg-gray-100' },
  HR:         { label: 'HR',         color: 'text-purple-600 bg-purple-50' },
  SAFETY:     { label: 'Safety',     color: 'text-red-600 bg-red-50' },
  OPERATIONS: { label: 'Operations', color: 'text-blue-600 bg-blue-50' },
  SECURITY:   { label: 'Security',   color: 'text-orange-600 bg-orange-50' },
};

function AnnouncementCard({ ann, onClick }: { ann: Announcement; onClick: () => void }) {
  const pcfg = PRIORITY_CFG[ann.priority];
  const ccfg = CAT_CFG[ann.category];
  const Icon = pcfg.icon;
  return (
    <div onClick={onClick}
      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${ann.priority === 'URGENT' ? 'border-red-200' : 'border-[#E2E0DC] hover:border-orange-200'} ${!ann.read ? 'ring-1 ring-orange-200' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${pcfg.bg} border`}>
          <Icon size={16} className={pcfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {ann.pinned && <Pin size={12} className="text-orange-500 flex-shrink-0" />}
              {!ann.read && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
              <h3 className="font-semibold text-[#1A1A1A] text-sm">{ann.title}</h3>
            </div>
            <ChevronRight size={16} className="text-[#ABABAB] flex-shrink-0 mt-0.5" />
          </div>
          <p className="text-xs text-[#757575] mt-1 line-clamp-2">{ann.content}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ccfg.color}`}>{ccfg.label}</span>
            <span className={`text-xs font-medium ${pcfg.color}`}>{pcfg.label}</span>
            <span className="text-xs text-[#ABABAB]">·</span>
            <span className="text-xs text-[#ABABAB]">{ann.publishedBy}</span>
            <span className="text-xs text-[#ABABAB]">·</span>
            <span className="text-xs text-[#ABABAB]">{ann.publishedAt}</span>
            {ann.acknowledged && <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={11} />Acknowledged</span>}
            {ann.requiresAck && !ann.acknowledged && <span className="ml-auto text-xs text-orange-600 font-medium">Acknowledgement needed</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnnouncementModal({ ann, onClose }: { ann: Announcement; onClose: () => void }) {
  const [acked, setAcked] = useState(ann.acknowledged);
  const pcfg = PRIORITY_CFG[ann.priority];
  const ccfg = CAT_CFG[ann.category];
  const Icon = pcfg.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pcfg.bg} border`}><Icon size={16} className={pcfg.color} /></div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ccfg.color}`}>{ccfg.label}</span>
              <span className={`text-xs font-semibold ${pcfg.color}`}>{pcfg.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-start gap-2">
            {ann.pinned && <Pin size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />}
            <h2 className="text-xl font-bold text-[#1A1A1A]">{ann.title}</h2>
          </div>
          <p className="text-sm text-[#757575] leading-relaxed">{ann.content}</p>
          <div className="flex items-center gap-3 text-sm text-[#757575] pt-2 border-t border-[#E2E0DC]">
            <span className="font-medium text-[#1A1A1A]">{ann.publishedBy}</span>
            <span>·</span><span>{ann.publishedAt}</span>
          </div>
          {ann.requiresAck && !acked && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">Acknowledgement Required</p>
                  <p className="text-xs text-orange-600 mt-0.5">Please read and acknowledge this announcement.</p>
                  <button onClick={() => setAcked(true)} className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                    <Check size={14} />I have read and understood this
                  </button>
                </div>
              </div>
            </div>
          )}
          {acked && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <p className="text-sm text-green-700 font-medium">You have acknowledged this announcement.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [showNew, setShowNew] = useState(false);

  const categories: { id: Category | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All' }, { id: 'GENERAL', label: 'General' }, { id: 'HR', label: 'HR' },
    { id: 'SAFETY', label: 'Safety' }, { id: 'OPERATIONS', label: 'Operations' }, { id: 'SECURITY', label: 'Security' },
  ];

  const pinned = DEMO.filter(a => a.pinned && (catFilter === 'ALL' || a.category === catFilter) && a.title.toLowerCase().includes(search.toLowerCase()));
  const rest   = DEMO.filter(a => !a.pinned && (catFilter === 'ALL' || a.category === catFilter) && a.title.toLowerCase().includes(search.toLowerCase()));
  const unread = DEMO.filter(a => !a.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Announcements</h1>
          <p className="text-sm text-[#757575] mt-0.5">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">New</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..." className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCatFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${catFilter === cat.id ? 'bg-orange-500 text-white' : 'bg-white border border-[#E2E0DC] text-[#757575] hover:border-gray-300'}`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {pinned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#ABABAB] uppercase tracking-wide flex items-center gap-1.5"><Pin size={12} />Pinned</p>
          {pinned.map(a => <AnnouncementCard key={a.id} ann={a} onClick={() => setSelected(a)} />)}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-2">
          {pinned.length > 0 && <p className="text-xs font-semibold text-[#ABABAB] uppercase tracking-wide">Recent</p>}
          {rest.map(a => <AnnouncementCard key={a.id} ann={a} onClick={() => setSelected(a)} />)}
        </div>
      )}

      {pinned.length === 0 && rest.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
          <Megaphone size={40} className="text-[#E2E0DC] mx-auto mb-3" />
          <p className="text-[#1A1A1A] font-medium">No announcements</p>
          <p className="text-sm text-[#757575] mt-1">Announcements will appear here.</p>
        </div>
      )}

      {selected && <AnnouncementModal ann={selected} onClose={() => setSelected(null)} />}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">New Announcement</h2>
              <button onClick={() => setShowNew(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Title <span className="text-red-500">*</span></label><input autoFocus className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Announcement title" /></div>
              <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Content <span className="text-red-500">*</span></label><textarea rows={4} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="Announcement content..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Category</label>
                  <select className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                    {categories.filter(c=>c.id!=='ALL').map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Priority</label>
                  <select className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                    <option>Normal</option><option>High</option><option>Urgent</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" /><span className="text-sm text-[#1A1A1A]">Pin this announcement</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded" /><span className="text-sm text-[#1A1A1A]">Require acknowledgement</span></label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
              <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

