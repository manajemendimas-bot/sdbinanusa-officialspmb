'use client';

import React, { useState } from 'react';
import { 
  DoorOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  ShieldAlert,
  Users,
  PowerOff,
  Power
} from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { Room } from '@/lib/types';

interface RoomManagementProps {
  onRefreshParent: () => void;
}

export default function RoomManagement({ onRefreshParent }: RoomManagementProps) {
  const [rooms, setRooms] = useState<Room[]>(SchoolDatabase.getRooms());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [capacityInput, setCapacityInput] = useState(25);
  const [isActiveInput, setIsActiveInput] = useState(true);

  const refreshData = () => {
    setRooms(SchoolDatabase.getRooms());
    onRefreshParent();
  };

  const handleOpenAdd = () => {
    setNameInput('');
    setCapacityInput(25);
    setIsActiveInput(true);
    setErrorMessage(null);
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      SchoolDatabase.addRoom({
        name: nameInput.trim(),
        capacity: Number(capacityInput) || 25,
        is_active: isActiveInput,
      });
      setIsAddModalOpen(false);
      refreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menambahkan ruangan');
    }
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setNameInput(room.name);
    setCapacityInput(room.capacity);
    setIsActiveInput(room.is_active);
    setErrorMessage(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !nameInput.trim()) return;

    try {
      SchoolDatabase.updateRoom(editingRoom.id, {
        name: nameInput.trim(),
        capacity: Number(capacityInput) || 25,
        is_active: isActiveInput,
      });
      setEditingRoom(null);
      refreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memperbarui ruangan');
    }
  };

  const handleToggleActive = (room: Room) => {
    SchoolDatabase.updateRoom(room.id, {
      is_active: !room.is_active,
    });
    refreshData();
  };

  const handleConfirmDelete = () => {
    if (!deletingRoom) return;
    const res = SchoolDatabase.deleteRoom(deletingRoom.id);
    if (!res.success) {
      alert(res.error);
    }
    setDeletingRoom(null);
    refreshData();
  };

  const sessions = SchoolDatabase.getExamSessions();

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">
            Master Ruangan Ujian
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Atur daftar ruangan, daya tampung (kapasitas), dan status keaktifan ruangan untuk jadwal ujian SPMB.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ruangan</span>
        </button>
      </div>

      {/* Info Warning Banner */}
      <div className="p-4 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] flex items-center gap-3 text-xs text-[#03357E]">
        <DoorOpen className="w-5 h-5 shrink-0 text-[#03357E]" />
        <span>
          <strong>Aturan Validasi:</strong> Ruangan dengan status <strong>Nonaktif</strong> secara otomatis ditolak oleh sistem dan tidak dapat dialokasikan pada sesi ujian atau pemetaan otomatis.
        </span>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => {
          const roomSessions = sessions.filter((s) => s.room_id === room.id);

          return (
            <div
              key={room.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-2xs ${
                room.is_active ? 'border-[#E2E8F0] hover:border-[#03357E]' : 'border-gray-200 bg-gray-50/70 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    room.is_active 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {room.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>

                  <button
                    onClick={() => handleToggleActive(room)}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      room.is_active 
                        ? 'text-gray-500 hover:text-rose-600 hover:bg-rose-50' 
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                    title={room.is_active ? 'Nonaktifkan Ruangan' : 'Aktifkan Ruangan'}
                  >
                    {room.is_active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#0F172A]">
                  {room.name}
                </h3>

                <div className="mt-4 space-y-2 text-xs text-[#64748B]">
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span>Daya Tampung:</span>
                    <strong className="font-mono text-[#0F172A] text-sm">{room.capacity} Kursi</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F1F5F9]">
                    <span>Sesi Terjadwal:</span>
                    <span className="font-semibold text-[#03357E]">{roomSessions.length} Sesi Ujian</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(room)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#334155] bg-[#F5F8FC] hover:bg-[#03357E]/10 hover:text-[#03357E] border border-[#CBD5E1] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingRoom(room)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingRoom) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#03357E] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">
                {isAddModalOpen ? 'Tambah Ruangan Baru' : `Edit: ${editingRoom?.name}`}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingRoom(null); }} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 1A, Aula, Lab"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:ring-2 focus:ring-[#03357E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Kapasitas Maksimal (Kursi)</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={capacityInput}
                  onChange={(e) => setCapacityInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:ring-2 focus:ring-[#03357E]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActiveInput}
                    onChange={(e) => setIsActiveInput(e.target.checked)}
                    className="w-4 h-4 rounded text-[#03357E] focus:ring-[#03357E]"
                  />
                  <span>Status Aktif (Dapat digunakan untuk ujian)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingRoom(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#0F172A]">
                Hapus Ruangan: {deletingRoom.name}
              </h3>
              <p className="text-xs text-[#64748B]">
                Pastikan ruangan tidak sedang digunakan oleh sesi ujian aktif sebelum menghapus.
              </p>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setDeletingRoom(null)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#F5F8FC] border border-[#CBD5E1] text-[#64748B] cursor-pointer hover:bg-[#E2E8F0]"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
