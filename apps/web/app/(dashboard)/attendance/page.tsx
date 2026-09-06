'use client';
import { useState, useEffect, useCallback } from 'react';
import { Clock, Play, Square, Calendar, CheckCircle2, XCircle, AlertCircle, Loader2, Sun, Sunset } from 'lucide-react';
import { attendanceApi } from '../../../lib/api-client';
import { getErrorMessage } from '../../../lib/api';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PRESENT:  { label: 'Present',  color: 'text-green-600',  bg: 'bg-green-50',  icon: CheckCircle2 },
  ABSENT:   { label: 'Absent',   color: 'text-red-600',    bg: 'bg-red-50',    icon: XCircle },
  HALF_DAY: { label: 'Half Day', color: 'text-orange-600', bg: 'bg-orange-50', icon: Sun },
  LATE:     { label: 'Late',     color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertCircle },
  LEAVE:    { label: 'On Leave', color: 'text-purple-600', bg: 'bg-purple-50', icon: Calendar },
  HOLIDAY:  { label: 'Holiday',  color: 'text-blue-600',   bg: 'bg-blue-50',   icon: Sunset },
  WEEKEND:  { label: 'Weekend',  color: 'text-gray-500',   bg: 'bg-gray-50',   icon: Calendar },
};

function formatTime(d: string | null) {
  if (!d) return '—';
  try { return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

function formatDate(d: string) {
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

export default function AttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'today' | 'history' | 'holidays'>('today');
  const [holidays, setHolidays] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [histResp, hols] = await Promise.all([
        attendanceApi.myAttendance({ limit: 30 }),
        attendanceApi.listHolidays(),
      ]);
      const items: any[] = histResp.items ?? histResp ?? [];
      setRecords(items);
      const today = new Date().toDateString();
      const todayRec = items.find((r: any) => new Date(r.date).toDateString() === today);
      setTodayRecord(todayRec ?? null);
      setHolidays(Array.isArray(hols) ? hols : []);
    } catch {
      setRecords([]); setHolidays([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async () => {
    setCheckingIn(true); setError('');
    try {
      const rec = await attendanceApi.checkIn();
      setTodayRecord(rec);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true); setError('');
    try {
      const rec = await attendanceApi.checkOut();
      setTodayRecord(rec);
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setCheckingOut(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Attendance</h1>
          <p className="text-sm text-[#757575] mt-0.5">{dateStr}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['today', 'history', 'holidays'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#757575] hover:text-[#1A1A1A]'}`}>
            {t}
          </button>
        ))}
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] py-16 flex items-center justify-center">
          <Loader2 size={32} className="text-orange-400 animate-spin" />
        </div>
      ) : tab === 'today' ? (
        <div className="space-y-4">
          {/* Clock card */}
          <div className="bg-white rounded-2xl border border-[#E2E0DC] p-8 text-center">
            <div className="text-5xl font-mono font-bold text-[#1A1A1A] mb-1">{timeStr}</div>
            <p className="text-sm text-[#757575] mb-8">{dateStr}</p>

            {todayRecord ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-[#757575] mb-1">Check In</p>
                    <p className="font-bold text-green-600 text-lg">{formatTime(todayRecord.checkIn)}</p>
                  </div>
                  <div className={`${todayRecord.checkOut ? 'bg-blue-50' : 'bg-gray-50'} rounded-xl p-3`}>
                    <p className="text-xs text-[#757575] mb-1">Check Out</p>
                    <p className={`font-bold text-lg ${todayRecord.checkOut ? 'text-blue-600' : 'text-gray-300'}`}>
                      {formatTime(todayRecord.checkOut)}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <p className="text-xs text-[#757575] mb-1">Working Hrs</p>
                    <p className="font-bold text-orange-600 text-lg">
                      {todayRecord.workingHours ? `${todayRecord.workingHours.toFixed(1)}h` : '—'}
                    </p>
                  </div>
                </div>
                {!todayRecord.checkOut && (
                  <button onClick={handleCheckOut} disabled={checkingOut}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3 text-lg disabled:opacity-60">
                    {checkingOut ? <Loader2 size={20} className="animate-spin" /> : <Square size={20} />}
                    Check Out
                  </button>
                )}
                {todayRecord.checkOut && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <p className="text-green-700 font-medium">You have completed today's attendance.</p>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleCheckIn} disabled={checkingIn}
                className="w-full py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-3 text-xl disabled:opacity-60">
                {checkingIn ? <Loader2 size={24} className="animate-spin" /> : <Play size={24} />}
                Check In
              </button>
            )}
          </div>
        </div>
      ) : tab === 'history' ? (
        <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
          {records.length === 0 ? (
            <div className="py-16 text-center">
              <Clock size={40} className="text-[#E2E0DC] mx-auto mb-3" />
              <p className="text-[#1A1A1A] font-medium">No attendance records</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E0DC] bg-gray-50">
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">In</th>
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">Out</th>
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">Hours</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const sc = STATUS_CFG[r.status] ?? STATUS_CFG.PRESENT;
                  const Icon = sc.icon;
                  return (
                    <tr key={r.id} className="border-b border-[#E2E0DC] hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1A1A1A]">{formatDate(r.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                          <Icon size={10} />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#757575]">{formatTime(r.checkIn)}</td>
                      <td className="px-4 py-3 text-[#757575]">{formatTime(r.checkOut)}</td>
                      <td className="px-4 py-3 text-[#757575]">{r.workingHours ? `${r.workingHours.toFixed(1)}h` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Holidays */
        <div className="bg-white rounded-xl border border-[#E2E0DC] overflow-hidden">
          {holidays.length === 0 ? (
            <div className="py-16 text-center">
              <Calendar size={40} className="text-[#E2E0DC] mx-auto mb-3" />
              <p className="text-[#1A1A1A] font-medium">No holidays listed</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E0DC] bg-gray-50">
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">Holiday</th>
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-[#757575] uppercase tracking-wide px-4 py-3">Type</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map(h => (
                  <tr key={h.id} className="border-b border-[#E2E0DC] hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#1A1A1A]">{h.name}</td>
                    <td className="px-4 py-3 text-[#757575]">{formatDate(h.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.isOptional ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        {h.isOptional ? 'Optional' : 'Mandatory'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
