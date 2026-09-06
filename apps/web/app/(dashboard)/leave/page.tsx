'use client';
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, X, Check, Clock, AlertCircle, ChevronDown, Loader2, FileText } from 'lucide-react';
import { leaveApi } from '../../../lib/api-client';
import { getErrorMessage } from '../../../lib/api';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: 'Draft',     color: 'text-gray-600',  bg: 'bg-gray-100' },
  SUBMITTED: { label: 'Submitted', color: 'text-blue-600',  bg: 'bg-blue-50' },
  APPROVED:  { label: 'Approved',  color: 'text-green-600', bg: 'bg-green-50' },
  REJECTED:  { label: 'Rejected',  color: 'text-red-600',   bg: 'bg-red-50' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-400',  bg: 'bg-gray-50' },
};

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function ApplyLeaveModal({ leaveTypes, onClose, onApplied }: {
  leaveTypes: any[]; onClose: () => void; onApplied: () => void;
}) {
  const [form, setForm] = useState({ leaveTypeId: '', fromDate: '', toDate: '', isHalfDay: false, reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.leaveTypeId || !form.fromDate || !form.toDate) {
      setError('Please fill all required fields'); return;
    }
    setSaving(true); setError('');
    try {
      await leaveApi.apply({ ...form });
      onApplied();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Apply for Leave</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Leave Type *</label>
            <select value={form.leaveTypeId} onChange={e => setForm(p => ({ ...p, leaveTypeId: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
              <option value="">Select leave type</option>
              {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">From Date *</label>
              <input type="date" value={form.fromDate} onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">To Date *</label>
              <input type="date" value={form.toDate} onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))}
                className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isHalfDay} onChange={e => setForm(p => ({ ...p, isHalfDay: e.target.checked }))} className="rounded" />
            <span className="text-sm text-[#1A1A1A]">Half day</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Reason</label>
            <textarea rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
              placeholder="Reason for leave..." />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-[#E2E0DC]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#757575] hover:text-[#1A1A1A]">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeavePage() {
  const [tab, setTab] = useState<'applications' | 'balances'>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appsResp, balsResp, typesResp] = await Promise.all([
        leaveApi.myApplications({ limit: 50 } as any),
        leaveApi.myBalances(),
        leaveApi.listTypes(),
      ]);
      setApplications(appsResp.items ?? appsResp ?? []);
      setBalances(Array.isArray(balsResp) ? balsResp : []);
      setLeaveTypes(Array.isArray(typesResp) ? typesResp : []);
    } catch {
      setApplications([]); setBalances([]); setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: string) => {
    try {
      await leaveApi.cancel(id);
      load();
    } catch { /* silently fail */ }
  };

  const filtered = applications.filter(a => statusFilter === 'ALL' || a.status === statusFilter);
  const typeMap = Object.fromEntries(leaveTypes.map(lt => [lt.id, lt]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Leave</h1>
          <p className="text-sm text-[#757575] mt-0.5">Manage your leave applications and balances</p>
        </div>
        <button onClick={() => setShowApply(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={16} /><span className="hidden sm:inline">Apply Leave</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['applications', 'balances'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === t ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#757575] hover:text-[#1A1A1A]'}`}>
            {t === 'applications' ? 'Applications' : 'Balances'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 flex items-center justify-center">
          <Loader2 size={32} className="text-orange-400 animate-spin" />
        </div>
      ) : tab === 'applications' ? (
        <>
          {/* Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {['ALL', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-[#E2E0DC] text-[#757575] hover:border-gray-300'}`}>
                {s === 'ALL' ? 'All' : STATUS_CFG[s]?.label ?? s}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
              <FileText size={40} className="text-[#E2E0DC] mx-auto mb-3" />
              <p className="text-[#1A1A1A] font-medium">No leave applications</p>
              <p className="text-sm text-[#757575] mt-1">Apply for leave using the button above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(app => {
                const lt = typeMap[app.leaveTypeId];
                const sc = STATUS_CFG[app.status] ?? { label: app.status, color: 'text-gray-600', bg: 'bg-gray-100' };
                return (
                  <div key={app.id} className="bg-white rounded-xl border border-[#E2E0DC] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          {lt && <span className="text-sm font-semibold text-[#1A1A1A]">{lt.name}</span>}
                        </div>
                        <p className="text-sm text-[#757575]">
                          {formatDate(app.fromDate)} → {formatDate(app.toDate)}
                          <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded">{app.days} day{app.days !== 1 ? 's' : ''}{app.isHalfDay ? ' (half day)' : ''}</span>
                        </p>
                        {app.reason && <p className="text-xs text-[#757575] mt-1">Reason: {app.reason}</p>}
                        {app.reviewNote && <p className="text-xs text-[#757575] mt-1">Note: {app.reviewNote}</p>}
                        <p className="text-xs text-[#ABABAB] mt-1">Applied {formatDate(app.appliedAt)}</p>
                      </div>
                      {app.status === 'SUBMITTED' && (
                        <button onClick={() => handleCancel(app.id)}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg transition-colors">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Balances */
        balances.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
            <Calendar size={40} className="text-[#E2E0DC] mx-auto mb-3" />
            <p className="text-[#1A1A1A] font-medium">No leave balances</p>
            <p className="text-sm text-[#757575] mt-1">Leave balances will appear here once allocated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map(b => {
              const lt = typeMap[b.leaveTypeId];
              const available = b.allocated + b.carryForward - b.used - b.pending;
              return (
                <div key={b.id} className="bg-white rounded-xl border border-[#E2E0DC] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#1A1A1A]">{lt?.name ?? 'Leave'}</h3>
                    <span className="text-xs text-[#757575]">{b.year}</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-500 mb-1">{available}</div>
                  <p className="text-xs text-[#757575] mb-3">days available</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[#757575]">
                      <span>Allocated</span><span className="font-medium text-[#1A1A1A]">{b.allocated}</span>
                    </div>
                    <div className="flex justify-between text-[#757575]">
                      <span>Carry Forward</span><span className="font-medium text-[#1A1A1A]">{b.carryForward}</span>
                    </div>
                    <div className="flex justify-between text-[#757575]">
                      <span>Used</span><span className="font-medium text-red-500">{b.used}</span>
                    </div>
                    <div className="flex justify-between text-[#757575]">
                      <span>Pending</span><span className="font-medium text-orange-500">{b.pending}</span>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((b.used + b.pending) / (b.allocated + b.carryForward || 1)) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showApply && (
        <ApplyLeaveModal
          leaveTypes={leaveTypes}
          onClose={() => setShowApply(false)}
          onApplied={() => { setShowApply(false); load(); }}
        />
      )}
    </div>
  );
}
