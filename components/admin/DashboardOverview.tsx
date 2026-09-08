'use client';

import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck2, CalendarX2, CheckCircle2, XCircle, ArrowRight, DoorOpen, Building, School, Sparkles, RefreshCw } from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { AdminTab } from './AdminSidebar';
import { Registrant, Room, ExamSession, ExamAssignment, Announcement } from '@/lib/types';

interface DashboardOverviewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onRefresh: () => void;
}

export default function DashboardOverview({ onNavigateTab, onRefresh }: DashboardOverviewProps) {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [assignments, setAssignments] = useState<ExamAssignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [regs, rms, sess, assigns, anns] = await Promise.all([
          SchoolDatabase.getRegistrants(),
          SchoolDatabase.getRooms(),
          SchoolDatabase.getExamSessions(),
          SchoolDatabase.getExamAssignments(),
          SchoolDatabase.getAnnouncements(),
        ]);
        if (cancelled) return;
        setRegistrants(regs); setRooms(rms); setSessions(sess); setAssignments(assigns); setAnnouncements(anns);
      } catch (e: unknown) { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#03357E] border-t-transparent rounded-full animate-spin" /></div>;
  if (error) return <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>;

  const totalRegistrants = registrants.length;
  const scheduledRegistrantIds = new Set(assignments.map((a) => a.registrant_id));
  const scheduledCount = registrants.filter((r) => scheduledRegistrantIds.has(r.id)).length;
  const unscheduledCount = totalRegistrants - scheduledCount;
  const acceptedCount = announcements.filter((a) => a.status === 'Diterima').length;
  const rejectedCount = announcements.filter((a) => a.status === 'Belum Diterima').length;
  const inProcessCount = announcements.filter((a) => a.status === 'Dalam Proses').length;
  const latestRegistrants = [...registrants].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const upcomingSessions = [...sessions].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()).slice(0, 4);
  const schoolCountMap: Record<string, number> = {};
  for (const r of registrants) { const s = r.previous_school.trim() || 'Lainnya'; schoolCountMap[s] = (schoolCountMap[s] || 0) + 1; }
  const topSchools = Object.entries(schoolCountMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">Ringkasan Operasional SPMB</h1>
          <p className="text-xs text-[#64748B] mt-0.5">Tahun Pelajaran 2027/2028 • SD Bina Nusa Rajeg</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 text-xs font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:bg-[#F5F8FC] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs" title="Muat Ulang Data">
            <RefreshCw className="w-3.5 h-3.5 text-[#03357E]" /><span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={() => onNavigateTab('mapping')} className="px-3.5 py-2 text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <Sparkles className="w-3.5 h-3.5" /><span>Jalankan Auto Mapping</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div onClick={() => onNavigateTab('registrants')} className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#03357E] transition-colors cursor-pointer">
          <div className="flex items-center justify-between text-[#64748B] mb-2"><span className="text-[11px] font-bold uppercase tracking-wider">Total Pendaftar</span><Users className="w-4 h-4 text-[#03357E]" /></div>
          <div className="font-serif text-3xl font-bold text-[#03357E]">{totalRegistrants}</div><div className="text-[10px] text-[#64748B] mt-1">Calon Peserta Didik</div>
        </div>
        <div onClick={() => onNavigateTab('mapping')} className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#03357E] transition-colors cursor-pointer">
          <div className="flex items-center justify-between text-[#64748B] mb-2"><span className="text-[11px] font-bold uppercase tracking-wider">Sudah Terjadwal</span><CalendarCheck2 className="w-4 h-4 text-[#03357E]" /></div>
          <div className="font-serif text-3xl font-bold text-[#03357E]">{scheduledCount}</div><div className="text-[10px] text-[#64748B] mt-1">{totalRegistrants > 0 ? `${Math.round((scheduledCount / totalRegistrants) * 100)}% dari total` : '0%'}</div>
        </div>
        <div onClick={() => onNavigateTab('mapping')} className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#03357E] transition-colors cursor-pointer">
          <div className="flex items-center justify-between text-[#64748B] mb-2"><span className="text-[11px] font-bold uppercase tracking-wider">Belum Terjadwal</span><CalendarX2 className="w-4 h-4 text-amber-600" /></div>
          <div className="font-serif text-3xl font-bold text-amber-600">{unscheduledCount}</div><div className="text-[10px] text-amber-600 font-semibold mt-1">{unscheduledCount > 0 ? 'Perlu dialokasikan' : 'Semua teralokasi'}</div>
        </div>
        <div onClick={() => onNavigateTab('announcements')} className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#03357E] transition-colors cursor-pointer">
          <div className="flex items-center justify-between text-[#64748B] mb-2"><span className="text-[11px] font-bold uppercase tracking-wider">Diterima</span><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
          <div className="font-serif text-3xl font-bold text-emerald-700">{acceptedCount}</div><div className="text-[10px] text-[#64748B] mt-1">Status Lulus Seleksi</div>
        </div>
        <div onClick={() => onNavigateTab('announcements')} className="p-4 sm:p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#03357E] transition-colors cursor-pointer col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#64748B] mb-2"><span className="text-[11px] font-bold uppercase tracking-wider">Belum Diterima</span><XCircle className="w-4 h-4 text-rose-500" /></div>
          <div className="font-serif text-3xl font-bold text-rose-700">{rejectedCount}</div><div className="text-[10px] text-[#64748B] mt-1">{inProcessCount} Dalam Proses</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-[#03357E] text-base">Pendaftar Terbaru</h3></div>
              <button onClick={() => onNavigateTab('registrants')} className="text-xs font-semibold text-[#03357E] hover:underline flex items-center gap-1 cursor-pointer"><span>Lihat Semua ({totalRegistrants})</span><ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="text-[#64748B] border-b border-[#F1F5F9]"><th className="pb-2 font-bold">No. Registrasi</th><th className="pb-2 font-bold">Nama Lengkap</th><th className="pb-2 font-bold">Asal Sekolah</th><th className="pb-2 font-bold text-right">Status Jadwal</th></tr></thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {latestRegistrants.map((r) => { const isScheduled = scheduledRegistrantIds.has(r.id); return (
                    <tr key={r.id} className="hover:bg-[#F5F8FC]"><td className="py-2.5 font-mono font-bold text-[#03357E]">{r.registration_number}</td><td className="py-2.5 font-medium text-[#0F172A]">{r.full_name}</td><td className="py-2.5 text-[#64748B] truncate max-w-[140px]">{r.previous_school}</td><td className="py-2.5 text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isScheduled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{isScheduled ? 'Terjadwal' : 'Belum'}</span></td></tr>
                  ); })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2"><CalendarCheck2 className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-[#03357E] text-base">Jadwal Ujian Terdekat</h3></div>
              <button onClick={() => onNavigateTab('exams')} className="text-xs font-semibold text-[#03357E] hover:underline flex items-center gap-1 cursor-pointer"><span>Kelola Jadwal</span><ArrowRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="space-y-3">
              {upcomingSessions.length === 0 ? <p className="text-xs text-[#64748B] italic py-4 text-center">Belum ada sesi ujian dibuat.</p> : upcomingSessions.map((session) => {
                const room = rooms.find((r) => r.id === session.room_id);
                const assignedCount = assignments.filter((a) => a.exam_session_id === session.id).length;
                const isFull = assignedCount >= session.capacity;
                return (
                  <div key={session.id} className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] space-y-1.5">
                    <div className="flex items-center justify-between"><span className="font-serif font-bold text-xs text-[#0F172A] truncate max-w-[200px]">{session.name}</span><span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isFull ? 'bg-rose-100 text-rose-800' : 'bg-[#03357E]/10 text-[#03357E]'}`}>{assignedCount}/{session.capacity} Peserta</span></div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748B]"><span>📅 {session.exam_date} ({session.start_time}-{session.end_time})</span><span className="font-semibold text-[#03357E]">📍 {room?.name || 'Ruang'}</span></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2"><DoorOpen className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-[#03357E] text-base">Kapasitas Master Ruangan</h3></div>
            <button onClick={() => onNavigateTab('rooms')} className="text-xs font-semibold text-[#03357E] hover:underline cursor-pointer">Atur Ruangan</button>
          </div>
          <div className="space-y-3.5">
            {rooms.map((room) => {
              const roomSessions = sessions.filter((s) => s.room_id === room.id);
              const totalAssignedInRoom = assignments.filter((a) => roomSessions.some((s) => s.id === a.exam_session_id)).length;
              const percent = Math.min(100, Math.round((totalAssignedInRoom / (room.capacity * Math.max(1, roomSessions.length))) * 100));
              return (
                <div key={room.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between"><span className="font-semibold text-[#0F172A] flex items-center gap-1.5">{room.name}{!room.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-normal">Nonaktif</span>}</span><span className="font-mono text-[#64748B]">Kapasitas: {room.capacity} peserta ({roomSessions.length} sesi)</span></div>
                  <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden"><div className={`h-full transition-all duration-300 ${!room.is_active ? 'bg-gray-400' : percent > 90 ? 'bg-rose-500' : 'bg-[#03357E]'}`} style={{ width: `${percent}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2"><School className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-[#03357E] text-base">Statistik Asal Sekolah Pendaftar</h3></div>
            <span className="text-xs text-[#64748B] font-medium">{topSchools.length} Sekolah</span>
          </div>
          <div className="space-y-3">
            {topSchools.map(([schoolName, count]) => {
              const pct = totalRegistrants > 0 ? Math.round((count / totalRegistrants) * 100) : 0;
              return (
                <div key={schoolName} className="p-3 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#0F172A] mb-1"><span className="truncate max-w-[220px]">{schoolName}</span><span className="font-mono text-[#03357E] font-bold">{count} Siswa ({pct}%)</span></div>
                  <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden"><div className="h-full bg-[#03357E]" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
