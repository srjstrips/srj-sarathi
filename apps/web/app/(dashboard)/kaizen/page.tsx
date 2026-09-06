'use client';
import { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Plus, Search, ChevronRight, X, Check, Clock, AlertCircle, TrendingUp, IndianRupee, Loader2 } from 'lucide-react';
import { kaizenApi } from '../../../lib/api-client';
import { getErrorMessage } from '../../../lib/api';

type KStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'IMPLEMENTED' | 'REJECTED';

interface Kaizen {
  id: string; title: string; problem: string; improvement?: string; benefit?: string;
  status: KStatus; category?: string; department?: string; submittedBy?: string;
  submittedAt?: string; expectedSaving?: number; actualSaving?: number;
}

const STATUS_CFG: Record<KStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  SUBMITTED:    { label: 'Submitted',    icon: Clock,       color: 'text-blue-600',   bg: 'bg-blue-50' },
  UNDER_REVIEW: { label: 'Under Review', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  APPROVED:     { label: 'Approved',     icon: Check,       color: 'text-green-600',  bg: 'bg-green-50' },
  IMPLEMENTED:  { label: 'Implemented',  icon: TrendingUp,  color: 'text-purple-600', bg: 'bg-purple-50' },
  REJECTED:     { label: 'Rejected',     icon: X,           color: 'text-red-600',    bg: 'bg-red-50' },
};

const STATUS_FLOW: KStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED'];

function normalizeKaizen(raw: any): Kaizen {
  return {
    id:             raw.id,
    title:          raw.title,
    problem:        raw.problem ?? raw.problemStatement ?? '',
    improvement:    raw.improvement ?? raw.proposedImprovement,
    benefit:        raw.benefit ?? raw.expectedBenefit,
    status:         raw.status ?? 'SUBMITTED',
    category:       raw.category?.name ?? raw.categoryName ?? raw.category,
    department:     raw.department?.name ?? raw.departmentName ?? raw.department,
    submittedBy:    raw.submittedBy?.name ?? raw.submittedByName ?? raw.submittedBy,
    submittedAt:    raw.submittedAt ?? raw.createdAt ? new Date(raw.submittedAt ?? raw.createdAt).toLocaleDateString('en-IN') : undefined,
    expectedSaving: raw.expectedSaving ?? raw.expectedSavings,
    actualSaving:   raw.actualSaving   ?? raw.actualSavings,
  };
}

function StatusBadge({ status }: { status: KStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.SUBMITTED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon size={11} />{cfg.label}
    </span>
  );
}

function KaizenCard({ kaizen, onClick }: { kaizen: Kaizen; onClick: () => void }) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-[#E2E0DC] p-4 hover:shadow-md hover:border-orange-200 cursor-pointer transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[#1A1A1A] text-sm leading-snug flex-1">{kaizen.title}</h3>
        <ChevronRight size={16} className="text-[#ABABAB] flex-shrink-0 mt-0.5" />
      </div>
      <p className="text-xs text-[#757575] line-clamp-2 mb-3">{kaizen.problem}</p>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatusBadge status={kaizen.status} />
        {kaizen.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kaizen.category}</span>}
        {kaizen.department && <span className="text-xs text-[#ABABAB]">{kaizen.department}</span>}
      </div>
      <div className="flex items-center justify-between text-xs text-[#ABABAB]">
        <span>{[kaizen.submittedBy, kaizen.submittedAt].filter(Boolean).join(' · ')}</span>
        {kaizen.actualSaving ? (
          <span className="flex items-center gap-0.5 text-green-600 font-medium">
            <IndianRupee size={10} />{(kaizen.actualSaving / 1000).toFixed(0)}K saved
          </span>
        ) : kaizen.expectedSaving ? (
          <span className="flex items-center gap-0.5 text-[#ABABAB]">
            <IndianRupee size={10} />{(kaizen.expectedSaving / 1000).toFixed(0)}K expected
          </span>
        ) : null}
      </div>
    </div>
  );
}

function KaizenDetailPanel({ kaizen, onClose }: { kaizen: Kaizen; onClose: () => void }) {
  const stepIdx = STATUS_FLOW.indexOf(kaizen.status);
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <div>
            <StatusBadge status={kaizen.status} />
            <h2 className="text-lg font-bold text-[#1A1A1A] mt-1">{kaizen.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"><X size={18} /></button>
        </div>

        <div className="px-5 pt-4 pb-3 border-b border-[#E2E0DC]">
          <div className="flex items-center justify-between">
            {STATUS_FLOW.map((s, i) => {
              const active = i <= stepIdx;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                  <div className="text-xs text-[#ABABAB] ml-1 hidden sm:block">{STATUS_CFG[s].label.split(' ')[0]}</div>
                  {i < STATUS_FLOW.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < stepIdx ? 'bg-orange-500' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-3">
            {([
              ['Problem / Current Condition', kaizen.problem, 'bg-red-50 border-red-100'],
              ['Proposed Improvement', kaizen.improvement ?? 'Not specified', 'bg-blue-50 border-blue-100'],
              ['Expected Benefit', kaizen.benefit ?? 'Not specified', 'bg-green-50 border-green-100'],
            ] as [string, string, string][]).map(([label, value, cls]) => (
              <div key={label} className={`p-4 rounded-xl border ${cls}`}>
                <p className="text-xs font-semibold text-[#757575] uppercase tracking-wide mb-1.5">{label}</p>
                <p className="text-sm text-[#1A1A1A]">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['Department', kaizen.department], ['Category', kaizen.category], ['Submitted By', kaizen.submittedBy], ['Date', kaizen.submittedAt]].map(([l, v]) => v ? (
              <div key={l} className="p-3 bg-[#F8F7F4] rounded-lg"><p className="text-xs text-[#ABABAB] mb-0.5">{l}</p><p className="text-sm font-medium text-[#1A1A1A]">{v}</p></div>
            ) : null)}
          </div>

          {(kaizen.expectedSaving || kaizen.actualSaving) && (
            <div className="grid grid-cols-2 gap-3">
              {kaizen.expectedSaving && (
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-xs text-blue-600 font-medium">Expected Saving</p>
                  <p className="text-xl font-bold text-blue-700 mt-0.5">₹{kaizen.expectedSaving.toLocaleString('en-IN')}</p>
                </div>
              )}
              {kaizen.actualSaving && (
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-xs text-green-600 font-medium">Actual Saving</p>
                  <p className="text-xl font-bold text-green-700 mt-0.5">₹{kaizen.actualSaving.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewKaizenModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle]           = useState('');
  const [problem, setProblem]       = useState('');
  const [improvement, setImprove]   = useState('');
  const [benefit, setBenefit]       = useState('');
  const [category, setCategory]     = useState('Efficiency');
  const [expectedSaving, setSaving] = useState('');
  const [saving, setSavingState]    = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !problem.trim()) { setError('Title and Problem are required'); return; }
    setSavingState(true);
    setError('');
    try {
      await kaizenApi.create({
        title:          title.trim(),
        problem:        problem.trim(),
        improvement:    improvement.trim() || undefined,
        benefit:        benefit.trim() || undefined,
        category,
        expectedSaving: expectedSaving ? Number(expectedSaving) : undefined,
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSavingState(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC] sticky top-0 bg-white">
          <div><h2 className="text-lg font-semibold text-[#1A1A1A]">Submit Kaizen</h2><p className="text-xs text-[#757575] mt-0.5">Share your improvement idea</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Title <span className="text-red-500">*</span></label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Brief title of your improvement idea" /></div>
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Problem / Current Condition <span className="text-red-500">*</span></label>
            <textarea rows={3} value={problem} onChange={e => setProblem(e.target.value)} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="Describe the current problem or inefficiency..." /></div>
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Proposed Improvement</label>
            <textarea rows={3} value={improvement} onChange={e => setImprove(e.target.value)} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="What improvement do you suggest?" /></div>
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Expected Benefit</label>
            <textarea rows={2} value={benefit} onChange={e => setBenefit(e.target.value)} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="What benefit do you expect? (time, cost, quality, safety...)" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
                {['Efficiency','Quality','Safety','Environment','Automation','People'].map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Expected Saving (₹)</label>
              <input type="number" value={expectedSaving} onChange={e => setSaving(e.target.value)} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="e.g. 50000" /></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC] sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Submit Kaizen
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KaizenPage() {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<KStatus | 'ALL'>('ALL');
  const [selected, setSelected]   = useState<Kaizen | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [items, setItems]         = useState<Kaizen[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await kaizenApi.list({ limit: 100 });
      const raw: any[] = res?.items ?? res ?? [];
      setItems(raw.map(normalizeKaizen));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered   = items.filter(k =>
    k.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'ALL' || k.status === filter)
  );
  const totalSaved = items.filter(k => k.actualSaving).reduce((s, k) => s + (k.actualSaving ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Kaizen</h1><p className="text-sm text-[#757575] mt-0.5">Continuous improvement suggestions</p></div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">Submit Kaizen</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Submitted',    count: items.filter(k=>k.status==='SUBMITTED').length,    cls: 'bg-blue-50 text-blue-700' },
          { label: 'Under Review', count: items.filter(k=>k.status==='UNDER_REVIEW').length, cls: 'bg-orange-50 text-orange-700' },
          { label: 'Approved',     count: items.filter(k=>k.status==='APPROVED').length,     cls: 'bg-green-50 text-green-700' },
          { label: 'Implemented',  count: items.filter(k=>k.status==='IMPLEMENTED').length,  cls: 'bg-purple-50 text-purple-700' },
          { label: 'Total Savings', count: `₹${(totalSaved/1000).toFixed(0)}K`,             cls: 'bg-gray-50 text-gray-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search kaizen..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-orange-500 text-white' : 'bg-white border border-[#E2E0DC] text-[#757575] hover:border-gray-300'}`}>
              {s === 'ALL' ? 'All' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
          <Loader2 size={32} className="animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-[#757575]">Loading kaizen submissions...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
          <p className="text-[#1A1A1A] font-medium">Failed to load</p>
          <p className="text-sm text-[#757575] mt-1">{error}</p>
          <button onClick={load} className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
          <Lightbulb size={40} className="text-[#E2E0DC] mx-auto mb-3" />
          <p className="text-[#1A1A1A] font-medium">No kaizen submissions</p>
          <p className="text-sm text-[#757575] mt-1">Submit your first improvement idea.</p>
          <button onClick={() => setShowNew(true)} className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Submit Kaizen</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(k => <KaizenCard key={k.id} kaizen={k} onClick={() => setSelected(k)} />)}
        </div>
      )}

      {selected && <KaizenDetailPanel kaizen={selected} onClose={() => setSelected(null)} />}
      {showNew   && <NewKaizenModal onClose={() => setShowNew(false)} onCreated={load} />}
    </div>
  );
}
