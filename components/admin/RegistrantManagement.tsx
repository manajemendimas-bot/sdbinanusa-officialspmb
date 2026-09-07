'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  AlertTriangle,
  ArrowUpDown,
  Phone,
  Calendar,
  School,
  FileCheck
} from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { Registrant, Gender } from '@/lib/types';

interface RegistrantManagementProps {
  onRefreshParent: () => void;
}

export default function RegistrantManagement({ onRefreshParent }: RegistrantManagementProps) {
  const [registrants, setRegistrants] = useState<Registrant[]>(SchoolDatabase.getRegistrants());
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | Gender>('All');
  const [sortField, setSortField] = useState<'reg' | 'name' | 'date'>('reg');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRegistrant, setEditingRegistrant] = useState<Registrant | null>(null);
  const [detailRegistrant, setDetailRegistrant] = useState<Registrant | null>(null);
  const [deletingRegistrant, setDeletingRegistrant] = useState<Registrant | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Laki-laki' as Gender,
    birthDate: '',
    educationLevel: 'SD' as const,
    previousSchool: '',
    phone: '',
  });

  const refreshData = () => {
    const list = SchoolDatabase.getRegistrants();
    setRegistrants(list);
    onRefreshParent();
  };

  // Filter & Search Logic
  const filteredRegistrants = registrants.filter((r) => {
    const matchesSearch = 
      r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.previous_school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery);

    const matchesGender = genderFilter === 'All' || r.gender === genderFilter;

    return matchesSearch && matchesGender;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortField === 'reg') {
      comparison = a.registration_number.localeCompare(b.registration_number);
    } else if (sortField === 'name') {
      comparison = a.full_name.localeCompare(b.full_name);
    } else if (sortField === 'date') {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return sortAsc ? comparison : -comparison;
  });

  // Handle Add Form
  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      gender: 'Laki-laki',
      birthDate: '2020-05-15',
      educationLevel: 'SD',
      previousSchool: '',
      phone: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.previousSchool || !formData.phone) return;

    SchoolDatabase.registerNewStudent({
      full_name: formData.fullName,
      gender: formData.gender,
      birth_date: formData.birthDate,
      education_level: formData.educationLevel,
      previous_school: formData.previousSchool,
      phone: formData.phone,
    });

    setIsAddModalOpen(false);
    refreshData();
  };

  // Handle Edit Form
  const handleOpenEdit = (r: Registrant) => {
    setEditingRegistrant(r);
    setFormData({
      fullName: r.full_name,
      gender: r.gender,
      birthDate: r.birth_date,
      educationLevel: r.education_level,
      previousSchool: r.previous_school,
      phone: r.phone,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistrant) return;

    SchoolDatabase.updateRegistrant(editingRegistrant.id, {
      full_name: formData.fullName,
      gender: formData.gender,
      birth_date: formData.birthDate,
      education_level: formData.educationLevel,
      previous_school: formData.previousSchool,
      phone: formData.phone,
    });

    setEditingRegistrant(null);
    refreshData();
  };

  // Handle Delete with Confirmation
  const handleConfirmDelete = () => {
    if (!deletingRegistrant) return;
    SchoolDatabase.deleteRegistrant(deletingRegistrant.id);
    setDeletingRegistrant(null);
    refreshData();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      ['No Registrasi', 'Nama Lengkap', 'Jenis Kelamin', 'Tanggal Lahir', 'Jenjang', 'Asal Sekolah', 'No Telepon', 'Waktu Daftar'],
      ...filteredRegistrants.map((r) => [
        r.registration_number,
        `"${r.full_name.replace(/"/g, '""')}"`,
        r.gender,
        r.birth_date,
        r.education_level,
        `"${r.previous_school.replace(/"/g, '""')}"`,
        `"${r.phone}"`,
        r.created_at,
      ]),
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data-pendaftar-spmb-binus-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const assignments = SchoolDatabase.getExamAssignments();
  const announcements = SchoolDatabase.getAnnouncements();

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">
            Data Pendaftar SPMB
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Kelola master data seluruh calon peserta didik baru TP 2027/2028.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-[#334155] bg-white border border-[#CBD5E1] hover:bg-[#F5F8FC] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#03357E]" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pendaftar</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, no. reg, sekolah..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[#F5F8FC] border border-[#CBD5E1] focus:outline-hidden focus:ring-2 focus:ring-[#03357E]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5 text-[#03357E]" />
            <span>Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="py-1.5 px-2.5 rounded-md border border-[#CBD5E1] text-xs bg-[#F5F8FC] focus:outline-hidden"
            >
              <option value="All">Semua</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <span>Urutkan:</span>
            <button
              onClick={() => {
                if (sortField === 'reg') setSortAsc(!sortAsc);
                else { setSortField('reg'); setSortAsc(true); }
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${sortField === 'reg' ? 'bg-[#03357E] text-white' : 'bg-[#F5F8FC] border border-[#CBD5E1]'}`}
            >
              No Reg {sortField === 'reg' && (sortAsc ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortField === 'name') setSortAsc(!sortAsc);
                else { setSortField('name'); setSortAsc(true); }
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${sortField === 'name' ? 'bg-[#03357E] text-white' : 'bg-[#F5F8FC] border border-[#CBD5E1]'}`}
            >
              Nama {sortField === 'name' && (sortAsc ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#03357E] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4 font-bold">No. Registrasi</th>
                <th className="py-3 px-4 font-bold">Nama Lengkap</th>
                <th className="py-3 px-4 font-bold">L/P</th>
                <th className="py-3 px-4 font-bold">Asal Sekolah</th>
                <th className="py-3 px-4 font-bold">No. Telepon</th>
                <th className="py-3 px-4 font-bold">Jadwal Ujian</th>
                <th className="py-3 px-4 font-bold">Status Kelulusan</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredRegistrants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#64748B]">
                    Tidak ada data pendaftar yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredRegistrants.map((r) => {
                  const hasSchedule = assignments.some((a) => a.registrant_id === r.id);
                  const ann = announcements.find((a) => a.registrant_id === r.id);

                  return (
                    <tr key={r.id} className="hover:bg-[#F5F8FC] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#03357E]">
                        {r.registration_number}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0F172A]">
                        {r.full_name}
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">
                        {r.gender === 'Laki-laki' ? 'L' : 'P'}
                      </td>
                      <td className="py-3 px-4 text-[#475569] max-w-[180px] truncate">
                        {r.previous_school}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#64748B]">
                        {r.phone}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          hasSchedule
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {hasSchedule ? 'Terjadwal' : 'Belum'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ann?.status === 'Diterima'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ann?.status === 'Belum Diterima'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {ann?.status || 'Dalam Proses'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailRegistrant(r)}
                            className="p-1.5 text-[#334155] hover:text-[#03357E] hover:bg-[#03357E]/10 rounded transition-colors cursor-pointer"
                            title="Lihat Rincian"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 text-[#334155] hover:text-[#03357E] hover:bg-[#03357E]/10 rounded transition-colors cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRegistrant(r)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Hapus Data"
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

        {/* Footer Summary */}
        <div className="p-3 bg-[#F5F8FC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
          <span>Menampilkan <strong>{filteredRegistrants.length}</strong> dari <strong>{registrants.length}</strong> pendaftar</span>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingRegistrant) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#03357E] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">
                {isAddModalOpen ? 'Tambah Pendaftar Baru' : `Edit: ${editingRegistrant?.registration_number}`}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingRegistrant(null); }}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveNew : handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:outline-hidden focus:ring-2 focus:ring-[#03357E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Asal Sekolah</label>
                <input
                  type="text"
                  required
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  placeholder="Contoh: TK Ar-Rafah"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">No. WhatsApp / Telepon</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08123456789"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"
                />
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingRegistrant(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailRegistrant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#03357E] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FFBE00] uppercase font-bold">Kartu Rincian Pendaftar</span>
                <h3 className="font-serif font-bold text-lg">{detailRegistrant.full_name}</h3>
              </div>
              <button onClick={() => setDetailRegistrant(null)} className="text-white/80 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-[#F5F8FC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Nomor Registrasi:</span>
                  <span className="font-mono font-bold text-[#03357E]">{detailRegistrant.registration_number}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Jenis Kelamin:</span>
                  <span className="font-medium text-[#0F172A]">{detailRegistrant.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Tanggal Lahir:</span>
                  <span className="font-medium text-[#0F172A]">{detailRegistrant.birth_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Asal Sekolah:</span>
                  <span className="font-medium text-[#0F172A]">{detailRegistrant.previous_school}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">No. Telepon:</span>
                  <span className="font-mono text-[#0F172A]">{detailRegistrant.phone}</span>
                </div>
              </div>

              {/* Schedules Info */}
              <div>
                <h4 className="font-bold text-[#03357E] mb-2">Jadwal Ujian Teralokasi:</h4>
                {assignments.filter((a) => a.registrant_id === detailRegistrant.id).length === 0 ? (
                  <p className="text-[#64748B] italic bg-[#F5F8FC] p-3 rounded-lg border border-[#E2E8F0]">
                    Belum ada jadwal ujian yang dialokasikan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignments
                      .filter((a) => a.registrant_id === detailRegistrant.id)
                      .map((a) => {
                        const sess = SchoolDatabase.getExamSessions().find((s) => s.id === a.exam_session_id);
                        const room = SchoolDatabase.getRooms().find((r) => r.id === sess?.room_id);
                        return (
                          <div key={a.id} className="p-3 rounded-lg bg-[#03357E]/10 border border-[#03357E]/20 text-[#03357E]">
                            <div className="font-bold">{sess?.name}</div>
                            <div className="text-[11px] mt-0.5">
                              📅 {sess?.exam_date} ({sess?.start_time} - {sess?.end_time}) • 📍 {room?.name}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setDetailRegistrant(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#F5F8FC] border border-[#CBD5E1] text-[#334155] cursor-pointer hover:bg-[#E2E8F0]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRegistrant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#E2E8F0] p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#0F172A]">
                Konfirmasi Hapus Pendaftar
              </h3>
              <p className="text-xs text-[#64748B]">
                Apakah Anda yakin ingin menghapus <strong>{deletingRegistrant.full_name}</strong> ({deletingRegistrant.registration_number})? Tindakan ini akan menghapus alokasi ujian dan pengumuman terkait.
              </p>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => setDeletingRegistrant(null)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-[#F5F8FC] border border-[#CBD5E1] text-[#64748B] cursor-pointer hover:bg-[#E2E8F0]"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
