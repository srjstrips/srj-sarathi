'use client';
import { useState } from 'react';
import { Target, ChevronRight, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

type KRAStatus = 'DRAFT' | 'SELF_REVIEW' | 'MANAGER_REVIEW' | 'FINALIZED';
type Rating = 1 | 2 | 3 | 4 | 5;

interface KRAObjective {
  id: string; area: string; target: string; measurement: string;
  weight: number; actual?: string; selfRating?: Rating; managerRating?: Rating;
}

interface KRACycle {
  id: string; period: string; status: KRAStatus;
  objectives: KRAObjective[];
  finalScore?: number;
}

const DEMO_CYCLE: KRACycle = {
  id: 'c1', period: 'Q3 2026 (Jul – Sep 2026)', status: 'SELF_REVIEW',
  objectives: [
    { id: 'o1', area: 'Production Output', target: 'Achieve 95% of monthly billet production target', measurement: 'Monthly production report vs target', weight: 30, actual: '92%', selfRating: 4 },
    { id: 'o2', area: 'Quality', target: 'Maintain rejection rate below 2%', measurement: 'QC monthly report', weight: 25, actual: '1.8%', selfRating: 5 },
    { id: 'o3', area: 'Safety', target: 'Zero LTI incidents in the quarter', measurement: 'Incident register', weight: 20, actual: 'Zero', selfRating: 5 },
    { id: 'o4', area: 'Kaizen Submission', target: 'Submit minimum 2 kaizen per quarter', measurement: 'Kaizen system', weight: 15, actual: '1 submitted', selfRating: 2 },
    { id: 'o5', area: 'Team Development', target: 'Complete cross-training for 3 team members', measurement: 'Training records', weight: 10, actual: 'In progress', selfRating: 3 },
  ],
};

const STATUS_CFG: Record<KRAStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  DRAFT:          { label: 'Draft',           icon: Clock,        color: 'text-gray-500',   bg: 'bg-gray-100' },
  SELF_REVIEW:    { label: 'Self Review',     icon: CheckCircle2, color: 'text-blue-600',   bg: 'bg-blue-50' },
  MANAGER_REVIEW: { label: 'Manager Review',  icon: AlertCircle,  color: 'text-orange-600', bg: 'bg-orange-50' },
  FINALIZED:      { label: 'Finalized',       icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
};

const RATING_LABELS: Record<Rating, string> = { 1: 'Poor', 2: 'Below Expectation', 3: 'Meets Expectation', 4: 'Exceeds Expectation', 5: 'Outstanding' };

function RatingStars({ value, onChange }: { value?: Rating; onChange?: (r: Rating) => void }) {
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

export default function KraPage() {
  const [selected, setSelected] = useState<KRAObjective | null>(null);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const cycle = DEMO_CYCLE;
  const StatusIcon = STATUS_CFG[cycle.status].icon;

  const getWeightedScore = () => {
    const totalWeight = cycle.objectives.reduce((s, o) => s + o.weight, 0);
    const scored = cycle.objectives.reduce((s, o) => {
      const r = ratings[o.id] ?? o.selfRating;
      return s + (r ? (r / 5) * o.weight : 0);
    }, 0);
    return Math.round((scored / totalWeight) * 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-[#1A1A1A]">KRA</h1><p className="text-sm text-[#757575] mt-0.5">Key Result Areas — Performance Review</p></div>
      </div>

      {/* Cycle header */}
      <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CFG[cycle.status].bg} ${STATUS_CFG[cycle.status].color}`}>
                <StatusIcon size={11} />{STATUS_CFG[cycle.status].label}
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#1A1A1A]">{cycle.period}</h2>
            <p className="text-sm text-[#757575] mt-0.5">Please complete your self-assessment for all objectives.</p>
          </div>
          <div className="text-center flex-shrink-0">
            <div className="w-20 h-20 rounded-full border-4 border-orange-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#1A1A1A]">{getWeightedScore()}%</span>
            </div>
            <p className="text-xs text-[#757575] mt-1">Current Score</p>
          </div>
        </div>

        {/* Status steps */}
        <div className="flex items-center mt-4 pt-4 border-t border-[#E2E0DC]">
          {(['DRAFT', 'SELF_REVIEW', 'MANAGER_REVIEW', 'FINALIZED'] as KRAStatus[]).map((s, i) => {
            const steps: KRAStatus[] = ['DRAFT', 'SELF_REVIEW', 'MANAGER_REVIEW', 'FINALIZED'];
            const active = steps.indexOf(cycle.status) >= i;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${active ? 'bg-orange-500' : 'bg-gray-200'}`} />
                <p className={`text-xs ml-1 hidden sm:block ${active ? 'text-orange-600 font-medium' : 'text-[#ABABAB]'}`}>{STATUS_CFG[s].label.split(' ')[0]}</p>
                {i < 3 && <div className={`flex-1 h-0.5 mx-2 ${steps.indexOf(cycle.status) > i ? 'bg-orange-500' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Objectives */}
      <div className="space-y-3">
        {cycle.objectives.map((obj, idx) => {
          const selfR = ratings[obj.id] ?? obj.selfRating;
          return (
            <div key={obj.id} className="bg-white rounded-xl border border-[#E2E0DC] p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-orange-500">#{idx + 1}</span>
                    <h3 className="font-semibold text-[#1A1A1A] text-sm">{obj.area}</h3>
                    <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">{obj.weight}%</span>
                  </div>
                  <p className="text-xs text-[#757575] mb-2">{obj.target}</p>
                  <p className="text-xs text-[#ABABAB]">Measure: {obj.measurement}</p>
                </div>
              </div>

              {obj.actual && (
                <div className="mt-3 p-2.5 bg-[#F8F7F4] rounded-lg">
                  <p className="text-xs text-[#ABABAB] mb-0.5">Actual Achievement</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{obj.actual}</p>
                </div>
              )}

              <div className="mt-3">
                <p className="text-xs text-[#757575] mb-1.5">Self Rating</p>
                <RatingStars value={selfR} onChange={r => setRatings(prev => ({ ...prev, [obj.id]: r }))} />
              </div>

              {obj.managerRating && (
                <div className="mt-2">
                  <p className="text-xs text-[#757575] mb-1.5">Manager Rating</p>
                  <RatingStars value={obj.managerRating} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary and actions */}
      <div className="bg-white rounded-xl border border-[#E2E0DC] p-5">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[['Objectives', cycle.objectives.length, 'text-[#1A1A1A]'],
            ['Self-Rated', cycle.objectives.filter(o => ratings[o.id] || o.selfRating).length, 'text-blue-600'],
            ['Pending', cycle.objectives.filter(o => !ratings[o.id] && !o.selfRating).length, 'text-orange-600']].map(([l, v, cls]) => (
            <div key={String(l)} className="text-center">
              <p className={`text-2xl font-bold ${cls}`}>{v}</p>
              <p className="text-xs text-[#757575]">{l}</p>
            </div>
          ))}
        </div>
        <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          Submit Self Assessment
        </button>
      </div>
    </div>
  );
}

