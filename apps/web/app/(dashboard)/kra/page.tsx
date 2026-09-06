'use client';
import { useState, useEffect, useCallback } from 'react';
import { Target, ChevronRight, X, CheckCircle2, Clock, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { kraApi } from '../../../lib/api-client';
import { useAuthStore } from '../../../store/auth.store';
import { getErrorMessage } from '../../../lib/api';

type Rating = 1 | 2 | 3 | 4 | 5;

const STATUS_CFG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  DRAFT:        { label: 'Draft',           icon: Clock,        color: 'text-gray-500',   bg: 'bg-gray-100' },
  SUBMITTED:    { label: 'Submitted',       icon: CheckCircle2, color: 'text-blue-600',   bg: 'bg-blue-50' },
  HOD_REVIEWED: { label: 'HOD Review',      icon: AlertCircle,  color: 'text-orange-600', bg: 'bg-orange-50' },
  HEAD_REVIEWED:{ label: 'Head Review',     icon: AlertCircle,  color: 'text-yellow-600', bg: 'bg-yellow-50' },
  FINALIZED:    { label: 'Finalized',       icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
  ACTIVE:       { label: 'Active',          icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
  CLOSED:       { label: 'Closed',          icon: Clock,        color: 'text-gray-500',   bg: 'bg-gray-100' },
};

const RATING_LABELS: Record<number, string> = { 1: 'Poor', 2: 'Below Expectation', 3: 'Meets Expectation', 4: 'Exceeds Expectation', 5: 'Outstanding' };

function RatingStars({ value, onChange }: { value?: number; onChange?: (r: Rating) => void }) {
  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4, 5] as Rating[]).map(r => (
        <button key={r} onClick={() => onChange?.(r)}
          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${value === r ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-600'}`}>
          {r}
        </button>
      ))}
      {value && <span className="text-xs text-[#757575] ml-1">{RATING_LABELS[value]}</span>}
    </div>
  );
}

function ObjectivePanel({ objective, onClose, userId }: { objective: any; onClose: () => void; userId: string }) {
  const [selfRating, setSelfRating] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratings, setRatings] = useState<any[]>([]);

  useEffect(() => {
    kraApi.getRatings(objective.id).then(r => {
      const rs = Array.isArray(r) ? r : [];
      setRatings(rs);
      const self = rs.find((x: any) => x.raterType === 'SELF');
      if (self) setSelfRating(self.rating);
    }).catch(() => {});
  }, [objective.id]);

  const handleSubmitRating = async () => {
    if (!selfRating) return;
    setSubmitting(true);
    try {
      await kraApi.submitRating(objective.id, 'SELF', selfRating);
      setSubmitted(true);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const sc = STATUS_CFG[objective.status] ?? STATUS_CFG.DRAFT;
  const Icon = sc.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#E2E0DC]">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
              <Icon size={11} />{sc.label}
            </span>
            <span className="text-xs text-[#757575]">W: {objective.weightage}%</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">{objective.title}</h2>
          {objective.description && <p className="text-sm text-[#757575]">{objective.description}</p>}
          {(objective.target || objective.unit) && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-[#757575] mb-1">Target</p>
              <p className="text-sm text-[#1A1A1A]">{objective.target}{objective.unit ? ` (${objective.unit})` : ''}</p>
            </div>
          )}

          <div className="border-t border-[#E2E0DC] pt-4">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Self Rating</p>
            <RatingStars value={selfRating} onChange={v => setSelfRating(v)} />
            {selfRating && !submitted && (
              <button onClick={handleSubmitRating} disabled={submitting}
                className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60">
                {submitting && <Loader2 size={14} className="animate-spin" />}Submit Rating
              </button>
            )}
            {submitted && <p className="mt-2 text-sm text-green-600 font-medium">Rating submitted!</p>}
          </div>

          {ratings.filter(r => r.raterType !== 'SELF').length > 0 && (
            <div className="border-t border-[#E2E0DC] pt-4">
              <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Reviewer Ratings</p>
              {ratings.filter(r => r.raterType !== 'SELF').map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-[#757575]">{r.raterType}</span>
                  <RatingStars value={r.rating} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KraPage() {
  const { user } = useAuthStore();
  const [cycles, setCycles] = useState<any[]>([]);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);
  const [selectedObj, setSelectedObj] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cs = await kraApi.listCycles();
      const cyclesArr = Array.isArray(cs) ? cs : [];
      setCycles(cyclesArr);
      const active = cyclesArr.find((c: any) => c.status === 'ACTIVE') ?? cyclesArr[0];
      setSelectedCycle(active ?? null);
      if (active) {
        const objs = await kraApi.listObjectives({ cycleId: active.id, employeeId: user?.id });
        setObjectives(objs.items ?? objs ?? []);
      }
    } catch {
      setCycles([]); setObjectives([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleCycleChange = async (cycleId: string) => {
    const cycle = cycles.find(c => c.id === cycleId);
    setSelectedCycle(cycle ?? null);
    if (cycle) {
      try {
        const objs = await kraApi.listObjectives({ cycleId, employeeId: user?.id });
        setObjectives(objs.items ?? objs ?? []);
      } catch {
        setObjectives([]);
      }
    }
  };

  const totalWeight = objectives.reduce((s, o) => s + (o.weightage ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">KRA</h1>
          <p className="text-sm text-[#757575] mt-0.5">Key Result Areas — Performance Review</p>
        </div>
        {cycles.length > 1 && (
          <select value={selectedCycle?.id ?? ''} onChange={e => handleCycleChange(e.target.value)}
            className="px-3 py-2 border border-[#E2E0DC] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30">
            {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {cycles.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 text-center">
          <Target size={40} className="text-[#E2E0DC] mx-auto mb-3" />
          <p className="text-[#1A1A1A] font-medium">No KRA cycles</p>
          <p className="text-sm text-[#757575] mt-1">KRA cycles will appear here once created by admin.</p>
        </div>
      ) : (
        <>
          {selectedCycle && (
            <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {(() => {
                      const sc = STATUS_CFG[selectedCycle.status] ?? STATUS_CFG.DRAFT;
                      const Icon = sc.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                          <Icon size={11} />{sc.label}
                        </span>
                      );
                    })()}
                    <h2 className="font-bold text-[#1A1A1A]">{selectedCycle.name}</h2>
                  </div>
                  <p className="text-sm text-[#757575]">
                    {new Date(selectedCycle.periodFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' → '}
                    {new Date(selectedCycle.periodTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#757575]">Total Weight</p>
                  <p className={`text-lg font-bold ${totalWeight > 100 ? 'text-red-500' : totalWeight === 100 ? 'text-green-600' : 'text-orange-500'}`}>{totalWeight}%</p>
                </div>
              </div>
            </div>
          )}

          {objectives.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E2E0DC] py-12 text-center">
              <Target size={36} className="text-[#E2E0DC] mx-auto mb-3" />
              <p className="text-[#1A1A1A] font-medium">No objectives defined</p>
              <p className="text-sm text-[#757575] mt-1">Your KRA objectives will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {objectives.map(obj => {
                const sc = STATUS_CFG[obj.status] ?? STATUS_CFG.DRAFT;
                const Icon = sc.icon;
                return (
                  <div key={obj.id} onClick={() => setSelectedObj(obj)}
                    className="bg-white rounded-xl border border-[#E2E0DC] p-4 cursor-pointer hover:shadow-md hover:border-orange-200 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                            <Icon size={10} />{sc.label}
                          </span>
                          <span className="text-xs text-[#ABABAB]">Weight: {obj.weightage}%</span>
                        </div>
                        <h3 className="font-semibold text-[#1A1A1A] text-sm">{obj.title}</h3>
                        {obj.target && <p className="text-xs text-[#757575] mt-0.5">Target: {obj.target}{obj.unit ? ` ${obj.unit}` : ''}</p>}
                      </div>
                      <ChevronRight size={16} className="text-[#ABABAB] flex-shrink-0 mt-1" />
                    </div>
                    <div className="mt-2 h-1 bg-gray-100 rounded-full">
                      <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(obj.weightage / 100) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedObj && (
        <ObjectivePanel
          objective={selectedObj}
          userId={user?.id ?? ''}
          onClose={() => setSelectedObj(null)}
        />
      )}
    </div>
  );
}
