'use client';

import React, { useState } from 'react';
import { 
  Network, 
  Sparkles, 
  UserCheck, 
  UserX, 
  ArrowRight, 
  DoorOpen, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Trash2, 
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { Registrant, ExamSession, ExamAssignment } from '@/lib/types';

interface ExamMappingManagementProps {
  onRefreshParent: () => void;
}

export default function ExamMappingManagement({ onRefreshParent }: ExamMappingManagementProps) {
  const [registrants, setRegistrants] = useState<Registrant[]>(SchoolDatabase.getRegistrants());
  const [sessions, setSessions] = useState<ExamSession[]>(SchoolDatabase.getExamSessions());
  const [assignments, setAssignments] = useState<ExamAssignment[]>(SchoolDatabase.getExamAssignments());
  const [rooms, setRooms] = useState(SchoolDatabase.getRooms());

  // Auto Mapping Modal state
  const [isAutoMappingModalOpen, setIsAutoMappingModalOpen] = useState(false);
  const [selectedExamTypeForAuto, setSelectedExamTypeForAuto] = useState<string>(
    sessions[0]?.name || 'Tes Kemampuan Belajar'
  );
  const [autoMapSuccessInfo, setAutoMapSuccessInfo] = useState<{
    assignedCount: number;
    details: { sessionName: string; roomName: string; added: number; total: number }[];
  } | null>(null);

  // Manual Mapping State
  const [selectedRegistrantId, setSelectedRegistrantId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState<string>('All');

  const refreshData = () => {
    setRegistrants(SchoolDatabase.getRegistrants());
    setSessions(SchoolDatabase.getExamSessions());
    setAssignments(SchoolDatabase.getExamAssignments());
    setRooms(SchoolDatabase.getRooms());
    onRefreshParent();
  };

  // Get unscheduled vs scheduled
  const assignedRegistrantIds = new Set(assignments.map((a) => a.registrant_id));
  const unscheduledRegistrants = registrants.filter((r) => !assignedRegistrantIds.has(r.id));
  const scheduledRegistrants = registrants.filter((r) => assignedRegistrantIds.has(r.id));

  // Unique exam types
  const uniqueExamNames = Array.from(new Set(sessions.map((s) => s.name)));

  // Auto Mapping Execution
  const handleExecuteAutoMap = () => {
    const targetSessionIds = sessions
      .filter((s) => s.name === selectedExamTypeForAuto)
      .map((s) => s.id);

    const result = SchoolDatabase.autoMapParticipants({
      sessionIds: targetSessionIds.length > 0 ? targetSessionIds : undefined,
      onlyUnscheduled: true,
    });

    if (!result.success) {
      alert(result.error || 'Gagal menjalankan auto mapping');
      return;
    }

    setAutoMapSuccessInfo({
      assignedCount: result.assignedCount,
      details: result.details,
    });
    refreshData();
  };

  // Manual Assignment
  const handleAssignManual = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    setManualSuccess(null);

    if (!selectedRegistrantId || !selectedSessionId) {
      setManualError('Pilih pendaftar dan sesi ujian.');
      return;
    }

    const res = SchoolDatabase.assignParticipantToSession(selectedRegistrantId, selectedSessionId);
    if (!res.success) {
      setManualError(res.error || 'Gagal memetakan peserta');
    } else {
      setManualSuccess('Peserta berhasil dipetakan ke sesi ujian!');
      setSelectedRegistrantId('');
      refreshData();
      setTimeout(() => setManualSuccess(null), 3000);
    }
  };

  // Unassign Participant
  const handleUnassign = (assignmentId: string) => {
    SchoolDatabase.unassignParticipant(assignmentId);
    refreshData();
  };

  // Mapped list with filters
  const filteredAssignments = assignments.filter((a) => {
    if (sessionFilter !== 'All' && a.exam_session_id !== sessionFilter) return false;
    if (!searchQuery) return true;
    const r = registrants.find((reg) => reg.id === a.registrant_id);
    return (
      r?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r?.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">
            Pemetaan & Alokasi Ruang Ujian
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Distribusikan calon peserta didik ke ruangan ujian secara otomatis atau manual dengan validasi kuota.
          </p>
        </div>

        <button
          onClick={() => {
            setAutoMapSuccessInfo(null);
            setIsAutoMappingModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Jalankan Auto Mapping Peserta</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-[#64748B] uppercase">Total Pendaftar</div>
          <div className="font-serif text-2xl font-bold text-[#03357E] mt-1">{registrants.length} Siswa</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">Sudah Teralokasi</div>
          <div className="font-serif text-2xl font-bold text-emerald-800 mt-1">{scheduledRegistrants.length} Siswa</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase">Belum Teralokasi</div>
          <div className="font-serif text-2xl font-bold text-amber-800 mt-1">{unscheduledRegistrants.length} Siswa</div>
        </div>
      </div>

      {/* Manual Mapping Form Box */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]">
          <Network className="w-4 h-4 text-[#03357E]" />
          <h3 className="font-serif font-bold text-base text-[#03357E]">
            Alokasi Manual Peserta ke Ruangan
          </h3>
        </div>

        {manualError && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{manualError}</span>
          </div>
        )}

        {manualSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{manualSuccess}</span>
          </div>
        )}

        <form onSubmit={handleAssignManual} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Pilih Calon Peserta Didik
            </label>
            <select
              value={selectedRegistrantId}
              onChange={(e) => setSelectedRegistrantId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:outline-hidden"
            >
              <option value="">-- Pilih Calon Murid --</option>
              {registrants.map((r) => {
                const isAssigned = assignedRegistrantIds.has(r.id);
                return (
                  <option key={r.id} value={r.id}>
                    {r.registration_number} - {r.full_name} ({r.previous_school}) {isAssigned ? '[Sudah Terjadwal]' : '[Belum]'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-[#0F172A] mb-1">
              Pilih Sesi Ujian & Ruangan
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:outline-hidden"
            >
              {sessions.map((s) => {
                const room = rooms.find((r) => r.id === s.room_id);
                const currentCount = assignments.filter((a) => a.exam_session_id === s.id).length;
                const isFull = currentCount >= s.capacity;
                return (
                  <option key={s.id} value={s.id} disabled={isFull}>
                    {s.name} ({room?.name}) • {s.exam_date} {s.start_time}-{s.end_time} [{currentCount}/{s.capacity}] {isFull ? '(PENUH)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-colors cursor-pointer"
            >
              Alokasikan
            </button>
          </div>
        </form>
      </div>

      {/* Mapped Assignments Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F5F8FC] border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#03357E]" />
            <h3 className="font-serif font-bold text-sm text-[#03357E]">
              Daftar Peserta Teralokasi ({filteredAssignments.length})
            </h3>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari peserta..."
                className="w-full pl-3 pr-3 py-1.5 text-xs rounded-md bg-white border border-[#CBD5E1] focus:outline-hidden"
              />
            </div>

            {/* Filter by session */}
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-md border border-[#CBD5E1] text-xs bg-white focus:outline-hidden"
            >
              <option value="All">Semua Sesi Ujian</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({rooms.find((r) => r.id === s.room_id)?.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#03357E] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-2.5 px-4 font-bold">No. Registrasi</th>
                <th className="py-2.5 px-4 font-bold">Nama Peserta Didik</th>
                <th className="py-2.5 px-4 font-bold">Sesi Ujian</th>
                <th className="py-2.5 px-4 font-bold">Ruangan</th>
                <th className="py-2.5 px-4 font-bold">Jadwal & Waktu</th>
                <th className="py-2.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#64748B]">
                    Belum ada pemetaan peserta yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => {
                  const r = registrants.find((reg) => reg.id === a.registrant_id);
                  const sess = sessions.find((s) => s.id === a.exam_session_id);
                  const room = rooms.find((rm) => rm.id === sess?.room_id);

                  return (
                    <tr key={a.id} className="hover:bg-[#F5F8FC]">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#03357E]">
                        {r?.registration_number || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-[#0F172A]">
                        {r?.full_name || 'Tidak Dikenal'}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-[#475569]">
                        {sess?.name || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-[#03357E]">
                        📍 {room?.name || '-'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#64748B]">
                        {sess?.exam_date} ({sess?.start_time} - {sess?.end_time})
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleUnassign(a.id)}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Batalkan Alokasi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUTO MAPPING DIALOG MODAL */}
      {isAutoMappingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#03357E] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFBE00]" />
                <h3 className="font-serif font-bold text-lg">Auto Mapping Peserta Ujian</h3>
              </div>
              <button onClick={() => setIsAutoMappingModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {autoMapSuccessInfo ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-[#0F172A]">
                    Auto Mapping Selesai!
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Berhasil mendistribusikan <strong>{autoMapSuccessInfo.assignedCount}</strong> peserta ke ruangan ujian aktif sesuai kapasitas.
                  </p>

                  <div className="bg-[#F5F8FC] p-3 rounded-xl border border-[#E2E8F0] space-y-2 text-left">
                    <div className="font-bold text-[#03357E] border-b border-[#E2E8F0] pb-1">
                      Distribusi Alokasi Ruangan:
                    </div>
                    {autoMapSuccessInfo.details.map((d, i) => (
                      <div key={i} className="flex justify-between text-xs py-0.5">
                        <span className="text-[#64748B]">{d.sessionName} ({d.roomName})</span>
                        <strong className="font-mono text-[#03357E]">+{d.added} (Total {d.total})</strong>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setIsAutoMappingModalOpen(false)}
                      className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[#475569] leading-relaxed">
                    Sistem akan secara cerdas menghitung peserta yang belum teralokasi, lalu membagikannya secara merata ke seluruh ruangan aktif hingga batas kapasitas maksimal.
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Peserta Belum Teralokasi:</span>
                      <strong className="text-amber-700 font-mono text-sm">{unscheduledRegistrants.length} Peserta</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Total Kapasitas Ruangan Aktif:</span>
                      <strong className="text-[#03357E] font-mono text-sm">
                        {rooms.filter((r) => r.is_active).reduce((sum, r) => sum + r.capacity, 0)} Kursi
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Pilih Jenis Ujian yang Ingin Dipetakan
                    </label>
                    <select
                      value={selectedExamTypeForAuto}
                      onChange={(e) => setSelectedExamTypeForAuto(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                    >
                      {uniqueExamNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2">
                    <button
                      onClick={() => setIsAutoMappingModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleExecuteAutoMap}
                      className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Proses Auto Mapping</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
