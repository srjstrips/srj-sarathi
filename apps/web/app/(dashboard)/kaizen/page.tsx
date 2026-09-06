'use client';
import { useState } from 'react';
import { Lightbulb, Plus, Search, ChevronRight, X, Check, Clock, AlertCircle, TrendingUp, IndianRupee } from 'lucide-react';

type KStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'IMPLEMENTED' | 'REJECTED';

interface Kaizen {
  id: string; title: string; problem: string; improvement: string; benefit: string;
  status: KStatus; category: string; department: string; submittedBy: string;
  submittedAt: string; expectedSaving?: number; actualSaving?: number;
}

const DEMO_KAIZEN: Kaizen[] = [
  { id: '1', title: 'Reduce bearing replacement time by 40%', problem: 'Bearing replacement currently takes 4 hours due to manual disassembly', improvement: 'Use pneumatic tools and pre-staged spare kits for quick replacement', benefit: 'Reduce downtime by 2.5 hours per incident, improve production continuity', status: 'IMPLEMENTED', category: 'Efficiency', department: 'Maintenance', submittedBy: 'Rahul K.', submittedAt: '2026-08-01', expectedSaving: 45000, actualSaving: 52000 },
  { id: '2', title: 'Eliminate manual billet count process', problem: 'Manual counting of billets takes 30 min per shift, prone to error', improvement: 'Install barcode scanner at exit point for automatic counting', benefit: 'Save 30 min per shift, 100% accuracy, eliminate recount waste', status: 'APPROVED', category: 'Automation', department: 'Production', submittedBy: 'Vikram J.', submittedAt: '2026-08-15', expectedSaving: 30000 },
  { id: '3', title: 'Reuse cooling water for dust suppression', problem: 'Cooling water discharged to waste, dust suppression uses fresh water', improvement: 'Route cooling water discharge to dust suppression system', benefit: 'Save 20,000 litres/day, reduce water cost', status: 'UNDER_REVIEW', category: 'Environment', department: 'Operations', submittedBy: 'Deepak Y.', submittedAt: '2026-09-01', expectedSaving: 18000 },
  { id: '4', title: 'Cross-train operators for multi-machine operation', problem: 'Each operator runs only one machine, idle time during breakdowns', improvement: 'Train each operator on 2 machines, enable flexible deployment', benefit: 'Reduce idle time by 60%, improve utilisation', status: 'SUBMITTED', category: 'People', department: 'Production', submittedBy: 'Amit S.', submittedAt: '2026-09-04' },
  { id: '5', title: 'Digital checklist for quality inspection', problem: 'Paper checklists often misplaced, data entry delayed', improvement: 'Mobile app checklist with real-time submission', benefit: 'Eliminate paper, real-time data, faster reporting', status: 'SUBMITTED', category: 'Quality', department: 'Quality', submittedBy: 'Kavita S.', submittedAt: '2026-09-05' },
];

const STATUS_CFG: Record<KStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  SUBMITTED:    { label: 'Submitted',     icon: Clock,        color: 'text-blue-600',   bg: 'bg-blue-50' },
  UNDER_REVIEW: { label: 'Under Review',  icon: AlertCircle,  color: 'text-orange-600', bg: 'bg-orange-50' },
  APPROVED:     { label: 'Approved',      icon: Check,        color: 'text-green-600',  bg: 'bg-green-50' },
  IMPLEMENTED:  { label: 'Implemented',   icon: TrendingUp,   color: 'text-purple-600', bg: 'bg-purple-50' },
  REJECTED:     { label: 'Rejected',      icon: X,            color: 'text-red-600',    bg: 'bg-red-50' },
};

const STATUS_FLOW: KStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED'];

function StatusBadge({ status }: { status: KStatus }) {
  const cfg = STATUS_CFG[status];
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
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kaizen.category}</span>
        <span className="text-xs text-[#ABABAB]">{kaizen.department}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-[#ABABAB]">
        <span>{kaizen.submittedBy} · {kaizen.submittedAt}</span>
        {kaizen.actualSaving && (
          <span className="flex items-center gap-0.5 text-green-600 font-medium">
            <IndianRupee size={10} />{(kaizen.actualSaving / 1000).toFixed(0)}K saved
          </span>
        )}
        {!kaizen.actualSaving && kaizen.expectedSaving && (
          <span className="flex items-center gap-0.5 text-[#ABABAB]">
            <IndianRupee size={10} />{(kaizen.expectedSaving / 1000).toFixed(0)}K expected
          </span>
        )}
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
          <div><StatusBadge status={kaizen.status} /><h2 className="text-lg font-bold text-[#1A1A1A] mt-1">{kaizen.title}</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"><X size={18} /></button>
        </div>

        {/* Progress steps */}
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
            {[['Problem / Current Condition', kaizen.problem, 'bg-red-50 border-red-100'],
              ['Proposed Improvement', kaizen.improvement || 'Not specified', 'bg-blue-50 border-blue-100'],
              ['Expected Benefit', kaizen.benefit || 'Not specified', 'bg-green-50 border-green-100']].map(([label, value, cls]) => (
              <div key={String(label)} className={`p-4 rounded-xl border ${cls}`}>
                <p className="text-xs font-semibold text-[#757575] uppercase tracking-wide mb-1.5">{label}</p>
                <p className="text-sm text-[#1A1A1A]">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[['Department', kaizen.department], ['Category', kaizen.category], ['Submitted By', kaizen.submittedBy], ['Date', kaizen.submittedAt]].map(([l, v]) => (
              <div key={l} className="p-3 bg-[#F8F7F4] rounded-lg"><p className="text-xs text-[#ABABAB] mb-0.5">{l}</p><p className="text-sm font-medium text-[#1A1A1A]">{v}</p></div>
            ))}
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

        {(kaizen.status === 'SUBMITTED' || kaizen.status === 'UNDER_REVIEW') && (
          <div className="p-4 border-t border-[#E2E0DC] flex gap-3">
            <button className="flex-1 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">Reject</button>
            <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
              {kaizen.status === 'SUBMITTED' ? 'Start Review' : 'Approve'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewKaizenModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC] sticky top-0 bg-white">
          <div><h2 className="text-lg font-semibold text-[#1A1A1A]">Submit Kaizen</h2><p className="text-xs text-[#757575] mt-0.5">Share your improvement idea</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Title <span className="text-red-500">*</span></label><input autoFocus className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400" placeholder="Brief title of your improvement idea" /></div>
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Problem / Current Condition <span className="text-red-500">*</span></label><textarea rows={3} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="Describe the current problem or inefficiency..." /></div>
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Proposed Improvement <span className="text-red-500">*</span></label><textarea rows={3} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="What improvement do you suggest?" /></div>
          <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Expected Benefit</label><textarea rows={2} className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none" placeholder="What benefit do you expect? (time, cost, quality, safety...)" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Category</label><select className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"><option>Efficiency</option><option>Quality</option><option>Safety</option><option>Environment</option><option>Automation</option><option>People</option></select></div>
            <div><label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Expected Saving (₹)</label><input type="number" className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" placeholder="e.g. 50000" /></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC] sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
          <button className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">Submit Kaizen</button>
        </div>
      </div>
    </div>
  );
}

export default function KaizenPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<KStatus | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Kaizen | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = DEMO_KAIZEN.filter(k =>
    k.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'ALL' || k.status === filter)
  );

  const totalSaved = DEMO_KAIZEN.filter(k => k.actualSaving).reduce((s, k) => s + (k.actualSaving ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">Kaizen</h1><p className="text-sm text-[#757575] mt-0.5">Continuous improvement suggestions</p></div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">Submit Kaizen</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          ['Submitted', DEMO_KAIZEN.filter(k=>k.status==='SUBMITTED').length, 'bg-blue-50 text-blue-700'],
          ['Under Review', DEMO_KAIZEN.filter(k=>k.status==='UNDER_REVIEW').length, 'bg-orange-50 text-orange-700'],
          ['Approved', DEMO_KAIZEN.filter(k=>k.status==='APPROVED').length, 'bg-green-50 text-green-700'],
          ['Implemented', DEMO_KAIZEN.filter(k=>k.status==='IMPLEMENTED').length, 'bg-purple-50 text-purple-700'],
          [`₹${(totalSaved/1000).toFixed(0)}K`, 'Total Savings', 'bg-gray-50 text-gray-700'],
        ].map(([l, c, cls], i) => (
          <div key={i} className={`rounded-xl p-4 ${cls}`}>
            <p className="text-2xl font-bold">{l}</p>
            <p className="text-xs font-medium mt-0.5">{c}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ABABAB]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search kaizen..." className="w-full pl-9 pr-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white" />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-orange-500 text-white' : 'bg-white border border-[#E2E0DC] text-[#757575] hover:border-gray-300'}`}>
              {s === 'ALL' ? 'All' : STATUS_CFG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
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
      {showNew && <NewKaizenModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

