'use client';
import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Search, Pin, Bell, ChevronRight, X, Check, AlertCircle, Info, Shield, Loader2 } from 'lucide-react';
import { noticesApi } from '../../../lib/api-client';
import { getErrorMessage } from '../../../lib/api';

type Priority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

const PRIORITY_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  URGENT: { label: 'Urgent', color: 'text-red-700',    bg: 'bg-red-50 border-red-200',    icon: AlertCircle },
  HIGH:   { label: 'High',   color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: Bell },
  NORMAL: { label: 'Normal', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',  icon: Info },
  LOW:    { label: 'Low',    color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200',  icon: Megaphone },
};

const CAT_COLORS: Record<string, string> = {
  GENERAL:    'text-gray-600 bg-gray-100',
  HR:         'text-purple-600 bg-purple-50',
  SAFETY:     'text-red-600 bg-red-50',
  OPERATIONS: 'text-blue-600 bg-blue-50',
  SECURITY:   'text-orange-600 bg-orange-50',
};

function getPriorityConfig(priority: string) {
  return PRIORITY_CFG[priority] ?? PRIORITY_CFG.NORMAL;
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function AnnouncementCard({ notice, onClick, ackedIds }: { notice: any; onClick: () => void; ackedIds: Set<string> }) {
  const pcfg = getPriorityConfig(notice.priority);
  const Icon = pcfg.icon;
  const catColor = CAT_COLORS[notice.category] ?? 'text-gray-600 bg-gray-100';
  const acked = ackedIds.has(notice.id);

  return (
    <div onClick={onClick}
      className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${notice.priority === 'URGENT' ? 'border-red-200' : 'border-[#E2E0DC] hover:border-orange-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${pcfg.bg} border`}>
          <Icon size={16} className={pcfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {notice.isPinned && <Pin size={12} className="text-orange-500 flex-shrink-0" />}
              <h3 className="font-semibold text-[#1A1A1A] text-sm">{notice.title}</h3>
            </div>
            <ChevronRight size={16} className="text-[#ABABAB] flex-shrink-0 mt-0.5" />
          </div>
          <p className="text-xs text-[#757575] mt-1 line-clamp-2">{notice.content}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {notice.category && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}>{notice.category}</span>
            )}
            <span className={`text-xs font-medium ${pcfg.color}`}>{pcfg.label}</span>
            {notice.publishedAt && (
              <><span className="text-xs text-[#ABABAB]">·</span><span className="text-xs text-[#ABABAB]">{formatDate(notice.publishedAt)}</span></>
            )}
            {acked && <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium"><Check size={11} />Acknowledged</span>}
            {notice.requiresAck && !acked && <span className="ml-auto text-xs text-orange-600 font-medium">Acknowledgement needed</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnnouncementModal({ notice, onClose, onAcknowledge, ackedIds }: {
  notice: any; onClose: () => void;
  onAcknowledge: (id: string) => Promise<void>;
  ackedIds: Set<string>;
}) {
  const [acking, setAcking] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<any[]>(notice.comments ?? []);
  const pcfg = getPriorityConfig(notice.priority);
  const catColor = CAT_COLORS[notice.category] ?? 'text-gray-600 bg-gray-100';
  const Icon = pcfg.icon;
  const acked = ackedIds.has(notice.id);

  const handleAck = async () => {
    setAcking(true);
    try { await onAcknowledge(notice.id); } finally { setAcking(false); }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const c = await noticesApi.addComment(notice.id, comment.trim());
      setComments(prev => [c, ...prev]);
      setComment('');
    } catch { /* silently fail */ }
    finally { setSubmittingComment(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pcfg.bg} border`}><Icon size={16} className={pcfg.color} /></div>
            <div className="flex items-center gap-2 flex-wrap">
              {notice.category && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor}`}>{notice.category}</span>}
              <span className={`text-xs font-semibold ${pcfg.color}`}>{pcfg.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-start gap-2">
            {notice.isPinned && <Pin size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />}
            <h2 className="text-xl font-bold text-[#1A1A1A]">{notice.title}</h2>
          </div>
          <p className="text-sm text-[#757575] leading-relaxed whitespace-pre-line">{notice.content}</p>
          {notice.publishedAt && (
            <div className="flex items-center gap-3 text-sm text-[#757575] pt-2 border-t border-[#E2E0DC]">
              <span>{formatDate(notice.publishedAt)}</span>
            </div>
          )}

          {notice.requiresAck && !acked && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">Acknowledgement Required</p>
                  <p className="text-xs text-orange-600 mt-0.5">Please read and acknowledge this announcement.</p>
                  <button onClick={handleAck} disabled={acking}
                    className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
                    {acking ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    I have read and understood this
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

          {/* Comments */}
          <div className="pt-2 border-t border-[#E2E0DC]">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Comments</h3>
            <div className="flex gap-2 mb-4">
              <input value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                onKeyDown={e => e.key === 'Enter' && handleComment()} />
              <button onClick={handleComment} disabled={submittingComment || !comment.trim()}
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-40 transition-colors">
                {submittingComment ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
            </div>
            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-[#1A1A1A]">{c.content}</p>
                    <p className="text-xs text-[#ABABAB] mt-1">{formatDate(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#ABABAB]">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewNoticeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL', isPinned: false, requiresAck: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required'); return; }
    setSaving(true);
    setError('');
    try {
      await noticesApi.create({ ...form, publishedAt: new Date().toISOString() });
      onCreated();
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
          <h2 className="text-lg font-semibold text-[#1A1A1A]">New Announcement</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Title *</label>
            <input autoFocus value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
              placeholder="Announcement title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Content *</label>
            <textarea rows={4} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
              placeholder="Announcement content..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                {['GENERAL', 'HR', 'SAFETY', 'OPERATIONS', 'SECURITY'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                {['NORMAL', 'LOW', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} className="rounded" />
              <span className="text-sm text-[#1A1A1A]">Pin</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.requiresAck} onChange={e => setForm(p => ({ ...p, requiresAck: e.target.checked }))} className="rounded" />
              <span className="text-sm text-[#1A1A1A]">Require acknowledgement</span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}Publish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [selected, setSelected] = useState<any | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [ackedIds, setAckedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await noticesApi.list({ status: 'PUBLISHED', limit: 50 });
      const items = resp.items ?? resp ?? [];
      setNotices(items);
    } catch {
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAcknowledge = async (noticeId: string) => {
    await noticesApi.acknowledge(noticeId);
    setAckedIds(prev => new Set([...prev, noticeId]));
  };

  const categories = ['ALL', 'GENERAL', 'HR', 'SAFETY', 'OPERATIONS', 'SECURITY'];

  const filtered = notices.filter(n =>
    (catFilter === 'ALL' || n.category === catFilter) &&
    n.title.toLowerCase().includes(search.toLowerCase()),
  );
  const pinned = filtered.filter((n: any) => n.isPinned);
  const rest   = filtered.filter((n: any) => !n.isPinned);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Announcements</h1>
          <p className="text-sm text-[#757575] mt-0.5">{notices.length} notice{notices.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">New</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${catFilter === cat ? 'bg-orange-500 text-white' : 'bg-white border border-[#E2E0DC] text-[#757575] hover:border-gray-300'}`}>
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 flex items-center justify-center">
          <Loader2 size={32} className="text-orange-400 animate-spin" />
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#ABABAB] uppercase tracking-wide flex items-center gap-1.5"><Pin size={12} />Pinned</p>
              {pinned.map((n: any) => <AnnouncementCard key={n.id} notice={n} ackedIds={ackedIds} onClick={() => setSelected(n)} />)}
            </div>
          )}
          {rest.length > 0 && (
            <div className="space-y-2">
              {pinned.length > 0 && <p className="text-xs font-semibold text-[#ABABAB] uppercase tracking-wide">Recent</p>}
              {rest.map((n: any) => <AnnouncementCard key={n.id} notice={n} ackedIds={ackedIds} onClick={() => setSelected(n)} />)}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
              <Megaphone size={40} className="text-[#E2E0DC] mx-auto mb-3" />
              <p className="text-[#1A1A1A] font-medium">No announcements</p>
              <p className="text-sm text-[#757575] mt-1">Announcements will appear here once published.</p>
            </div>
          )}
        </>
      )}

      {selected && (
        <AnnouncementModal
          notice={selected}
          ackedIds={ackedIds}
          onClose={() => setSelected(null)}
          onAcknowledge={handleAcknowledge}
        />
      )}
      {showNew && (
        <NewNoticeModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load(); }}
        />
      )}
    </div>
  );
}
