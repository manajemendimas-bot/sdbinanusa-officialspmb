'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X,
  AlertTriangle,
  DoorOpen
} from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { ExamSession, Room } from '@/lib/types';

interface ExamSessionManagementProps {
  onRefreshParent: () => void;
}

export default function ExamSessionManagement({ onRefreshParent }: ExamSessionManagementProps) {
  const [sessions, setSessions] = useState<ExamSession[]>(SchoolDatabase.getExamSessions());
  const [rooms, setRooms] = useState<Room[]>(SchoolDatabase.getRooms());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ExamSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<ExamSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('Tes Kemampuan Belajar');
  const [examDate, setExamDate] = useState('2027-03-07');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [roomId, setRoomId] = useState(rooms.find((r) => r.is_active)?.id || '');
  const [capacity, setCapacity] = useState(25);

  const refreshData = () => {
    setSessions(SchoolDatabase.getExamSessions());
    setRooms(SchoolDatabase.getRooms());
    onRefreshParent();
  };

  const handleOpenAdd = () => {
    const activeRooms = rooms.filter((r) => r.is_active);
    if (activeRooms.length === 0) {
      alert('Tidak ada ruangan aktif yang tersedia. Harap aktifkan minimal 1 ruangan terlebih dahulu di Master Ruangan.');
      return;
    }
    setName('Tes Kemampuan Belajar');
    setExamDate('2027-03-07');
    setStartTime('08:00');
    setEndTime('09:30');
    setRoomId(activeRooms[0].id);
    setCapacity(activeRooms[0].capacity);
    setErrorMessage(null);
    setIsAddModalOpen(true);
  };

  const handleRoomChange = (rId: string) => {
    setRoomId(rId);
    const selectedRoom = rooms.find((r) => r.id === rId);
    if (selectedRoom) {
      setCapacity(selectedRoom.capacity);
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = SchoolDatabase.addExamSession({
      name,
      exam_date: examDate,
      start_time: startTime,
      end_time: endTime,
      room_id: roomId,
      capacity: Number(capacity),
    });
    if (res.error) {
      setErrorMessage(res.error);
      return;
    }
    setIsAddModalOpen(false);
    refreshData();
  };

  const handleOpenEdit = (sess: ExamSession) => {
    setEditingSession(sess);
    setName(sess.name);
    setExamDate(sess.exam_date);
    setStartTime(sess.start_time);
    setEndTime(sess.end_time);
    setRoomId(sess.room_id);
    setCapacity(sess.capacity);
    setErrorMessage(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setErrorMessage(null);
    const res = SchoolDatabase.updateExamSession(editingSession.id, {
      name,
      exam_date: examDate,
      start_time: startTime,
      end_time: endTime,
      room_id: roomId,
      capacity: Number(capacity),
    });
    if (res.error) {
      setErrorMessage(res.error);
      return;
    }
    setEditingSession(null);
    refreshData();
  };

  const handleConfirmDelete = () => {
    if (!deletingSession) return;
    const res = SchoolDatabase.deleteExamSession(deletingSession.id);
    if (!res.success) {
      setErrorMessage(res.error || 'Gagal menghapus sesi');
      setDeletingSession(null);
      return;
    }
    setDeletingSession(null);
    setErrorMessage(null);
    refreshData();
  };

  const assignments = SchoolDatabase.getExamAssignments();

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">
            Jadwal Sesi Ujian & Observasi
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Buat dan kelola sesi ujian SPMB dengan validasi waktu & proteksi bentrok jadwal otomatis.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Sesi Ujian Baru</span>
        </button>
      </div>

      {/* Validation Features Banner */}
      <div className="p-4 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#03357E]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#03357E]" />
          <span>Validasi bentrok ruangan otomatis</span>
        </div>
        <div className="flex items-center gap-2 text-[#03357E]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#03357E]" />
          <span>Proteksi kapasitas melebihi kuota</span>
        </div>
        <div className="flex items-center gap-2 text-[#03357E]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#03357E]" />
          <span>Sinkronisasi langsung ke lookup publik</span>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#03357E] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4 font-bold">Nama Sesi Ujian</th>
                <th className="py-3 px-4 font-bold">Tanggal Ujian</th>
                <th className="py-3 px-4 font-bold">Waktu Pelaksanaan</th>
                <th className="py-3 px-4 font-bold">Ruangan</th>
                <th className="py-3 px-4 font-bold">Peserta / Kapasitas</th>
                <th className="py-3 px-4 font-bold">Status Kuota</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#64748B]">
                    Belum ada sesi ujian yang dibuat.
                  </td>
                </tr>
              ) : (
                sessions.map((sess) => {
                  const room = rooms.find((r) => r.id === sess.room_id);
                  const assignedCount = assignments.filter((a) => a.exam_session_id === sess.id).length;
                  const isFull = assignedCount >= sess.capacity;

                  return (
                    <tr key={sess.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-3 px-4 font-bold text-[#0F172A]">
                        {sess.name}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#475569]">
                        {sess.exam_date}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#03357E] font-semibold">
                        {sess.start_time} – {sess.end_time} WIB
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0F172A]">
                        {room?.name || 'Ruangan Nonaktif/Dihapus'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <strong className="text-[#03357E]">{assignedCount}</strong> / {sess.capacity}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isFull
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isFull ? 'Penuh' : `Tersedia ${sess.capacity - assignedCount} kursi`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(sess)}
                            className="p-1.5 text-[#334155] hover:text-[#03357E] hover:bg-[#03357E]/10 rounded transition-colors cursor-pointer"
                            title="Edit Sesi"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingSession(sess)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus Sesi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingSession) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#03357E] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">
                {isAddModalOpen ? 'Buat Sesi Ujian Baru' : `Edit Sesi: ${editingSession?.name}`}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingSession(null); }} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Nama Ujian / Observasi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tes Kemampuan Belajar, Psikotes, Wawancara"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:ring-2 focus:ring-[#03357E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Pilih Ruangan</label>
                  <select
                    value={roomId}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                  >
                    {rooms
                      .filter((r) => r.is_active || r.id === roomId)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (Kapasitas: {r.capacity}) {!r.is_active && '(Nonaktif)'}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Kapasitas Sesi</label>
                  <input
                    type="number"
                    min="1"
                    max={rooms.find((r) => r.id === roomId)?.capacity || 100}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingSession(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer"
                >
                  Simpan Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingSession && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#0F172A]">
                Hapus Sesi: {deletingSession.name}
              </h3>
              <p className="text-xs text-[#64748B]">
                Apakah Anda yakin? Seluruh peserta yang teralokasi pada sesi ini akan otomatis dilepaskan.
              </p>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setDeletingSession(null)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#F5F8FC] border border-[#CBD5E1] text-[#64748B] cursor-pointer hover:bg-[#E2E8F0]"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Hapus Sesi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
