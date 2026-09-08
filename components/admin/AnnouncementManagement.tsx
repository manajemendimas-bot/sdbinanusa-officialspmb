'use client';

import React, { useState, useEffect } from 'react';
import { Search, Edit, CheckCircle2, XCircle, Clock3, Lock, Unlock, X } from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { Announcement, AnnouncementStatus, Registrant } from '@/lib/types';

interface Props { onRefreshParent: () => void; }

export default function AnnouncementManagement({ onRefreshParent }: Props) {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AnnouncementStatus>('All');
  const [editingItem, setEditingItem] = useState<{ registrant: Registrant; announcement?: Announcement } | null>(null);
  const [formStatus, setFormStatus] = useState<AnnouncementStatus>('Dalam Proses');
  const [formNotes, setFormNotes] = useState('');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refreshData = async () => {
    try {
      const [regs, anns] = await Promise.all([SchoolDatabase.getRegistrants(), SchoolDatabase.getAnnouncements()]);
      setRegistrants(regs); setAnnouncements(anns); setError(null); onRefreshParent();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
  };

  useEffect(() => { (async () => { setLoading(true); await refreshData(); setLoading(false); })(); }, []);

  const handleOpenEdit = (r: Registrant) => {
    const ann = announcements.find((a) => a.registrant_id === r.id);
    setEditingItem({ registrant: r, announcement: ann });
    setFormStatus(ann?.status || 'Dalam Proses'); setFormNotes(ann?.notes || ''); setFormIsPublished(ann?.is_published ?? true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingItem) return;
    setSubmitting(true);
    try { await SchoolDatabase.upsertAnnouncement(editingItem.registrant.id, { status: formStatus, notes: formNotes, is_published: formIsPublished }); setEditingItem(null); await refreshData(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSubmitting(false); }
  };

  const handleQuickStatus = async (registrantId: string, status: AnnouncementStatus) => {
    try { await SchoolDatabase.upsertAnnouncement(registrantId, { status, is_published: true }); await refreshData(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const handleTogglePublish = async (ann: Announcement) => {
    try { await SchoolDatabase.upsertAnnouncement(ann.registrant_id, { status: ann.status, notes: ann.notes, is_published: !ann.is_published }); await refreshData(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
  };

  const handleBulkSetStatus = async (status: AnnouncementStatus) => {
    if (!confirm(`Ubah semua status pendaftar menjadi "${status}"?`)) return;
    setSubmitting(true);
    try { await SchoolDatabase.bulkUpdateAnnouncementStatus(registrants.map((r) => r.id), status, true); await refreshData(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSubmitting(false); }
  };

  const filteredRegistrants = registrants.filter((r) => {
    const ann = announcements.find((a) => a.registrant_id === r.id);
    const currentStatus = ann?.status || 'Dalam Proses';
    const matchesSearch = r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || r.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) || r.previous_school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#03357E] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div><h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">Hasil Pengumuman Kelulusan SPMB</h1><p className="text-xs text-[#64748B] mt-0.5">Tetapkan status hasil seleksi (Diterima / Belum Diterima / Dalam Proses) dan publikasi hasil untuk wali murid.</p></div>
        <div className="flex items-center gap-2"><button onClick={() => handleBulkSetStatus('Diterima')} disabled={submitting} className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer disabled:opacity-60">Set Semua Diterima</button></div>
      </div>
      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]"><Search className="w-4 h-4" /></div><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama atau no reg..." className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-[#F5F8FC] border border-[#CBD5E1] focus:outline-hidden focus:ring-2 focus:ring-[#03357E]" /></div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] w-full md:w-auto"><span>Filter Status:</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AnnouncementStatus | 'All')} className="py-1.5 px-2.5 rounded-md border border-[#CBD5E1] text-xs bg-[#F5F8FC] focus:outline-hidden"><option value="All">Semua Status ({registrants.length})</option><option value="Diterima">Diterima</option><option value="Belum Diterima">Belum Diterima</option><option value="Dalam Proses">Dalam Proses</option></select></div>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#03357E] border-b border-[#E2E8F0]"><tr><th className="py-3 px-4 font-bold">No. Registrasi</th><th className="py-3 px-4 font-bold">Nama Peserta Didik</th><th className="py-3 px-4 font-bold">Asal Sekolah</th><th className="py-3 px-4 font-bold">Status Hasil</th><th className="py-3 px-4 font-bold">Status Publikasi</th><th className="py-3 px-4 font-bold">Catatan</th><th className="py-3 px-4 font-bold text-right">Aksi Cepat</th></tr></thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredRegistrants.length === 0 ? <tr><td colSpan={7} className="py-8 text-center text-xs text-[#64748B]">Tidak ada data pengumuman yang sesuai filter.</td></tr> : filteredRegistrants.map((r) => {
                const ann = announcements.find((a) => a.registrant_id === r.id);
                const status = ann?.status || 'Dalam Proses'; const isPub = ann?.is_published ?? false;
                return (
                  <tr key={r.id} className="hover:bg-[#F5F8FC] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#03357E]">{r.registration_number}</td>
                    <td className="py-3 px-4 font-semibold text-[#0F172A]">{r.full_name}</td>
                    <td className="py-3 px-4 text-[#64748B] max-w-[150px] truncate">{r.previous_school}</td>
                    <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1.5 ${status === 'Diterima' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : status === 'Belum Diterima' ? 'bg-rose-50 text-rose-800 border border-rose-300' : 'bg-amber-50 text-amber-800 border border-amber-300'}`}>{status === 'Diterima' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}{status === 'Belum Diterima' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}{status === 'Dalam Proses' && <Clock3 className="w-3.5 h-3.5 text-amber-600" />}<span>{status}</span></span></td>
                    <td className="py-3 px-4"><button onClick={() => ann && handleTogglePublish(ann)} className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${isPub ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{isPub ? <Unlock className="w-3 h-3 text-emerald-700" /> : <Lock className="w-3 h-3 text-gray-500" />}<span>{isPub ? 'Dipublikasi' : 'Disembunyikan'}</span></button></td>
                    <td className="py-3 px-4 text-[#64748B] max-w-[180px] truncate">{ann?.notes || '-'}</td>
                    <td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => handleQuickStatus(r.id, 'Diterima')} className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold cursor-pointer">Lulus</button><button onClick={() => handleQuickStatus(r.id, 'Belum Diterima')} className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-bold cursor-pointer">Tidak</button><button onClick={() => handleOpenEdit(r)} className="p-1 text-[#334155] hover:bg-[#03357E]/10 hover:text-[#03357E] rounded cursor-pointer"><Edit className="w-3.5 h-3.5" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#03357E] text-white px-5 py-4 flex items-center justify-between"><div><span className="text-[10px] font-mono text-[#FFBE00] uppercase">Edit Keputusan Hasil SPMB</span><h3 className="font-serif font-bold text-lg">{editingItem.registrant.full_name}</h3></div><button onClick={() => setEditingItem(null)} className="text-white/80 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div><label className="block text-xs font-bold text-[#0F172A] mb-1">Status Keputusan</label><select value={formStatus} onChange={(e) => setFormStatus(e.target.value as AnnouncementStatus)} className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]"><option value="Dalam Proses">Dalam Proses (Sedang Review / Belum Ujian)</option><option value="Diterima">Diterima (Lulus Seleksi & Siap Daftar Ulang)</option><option value="Belum Diterima">Belum Diterima (Kuota Penuh / Belum Memenuhi Kriteria)</option></select></div>
              <div><label className="block text-xs font-bold text-[#0F172A] mb-1">Catatan / Petunjuk Khusus</label><textarea rows={3} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Contoh: Harap melengkapi berkas fotokopi Akta Kelahiran dan konfirmasi daftar ulang sebelum 15 Maret 2027." className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]" /></div>
              <div><label className="flex items-center gap-2 font-semibold text-[#0F172A] cursor-pointer"><input type="checkbox" checked={formIsPublished} onChange={(e) => setFormIsPublished(e.target.checked)} className="w-4 h-4 rounded text-[#03357E]" /><span>Publikasikan hasil ini ke portal pencarian publik</span></label></div>
              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2"><button type="button" onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer">Batal</button><button type="submit" disabled={submitting} className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer disabled:opacity-60">{submitting ? 'Menyimpan...' : 'Simpan Keputusan'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
