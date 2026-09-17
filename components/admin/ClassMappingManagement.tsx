'use client';

import React, { useState, useEffect } from 'react';
import { Network, Sparkles, UserCheck, AlertCircle, CheckCircle2, Trash2, Check, ClipboardEdit, Save } from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { Registrant, Announcement, SchoolClass, ClassAssignment } from '@/lib/types';

interface Props { onRefreshParent: () => void; }

export default function ClassMappingManagement({ onRefreshParent }: Props) {
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [assignments, setAssignments] = useState<ClassAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});
  const [savingScoreId, setSavingScoreId] = useState<string | null>(null);
  const [isAutoMappingModalOpen, setIsAutoMappingModalOpen] = useState(false);
  const [autoMapSuccessInfo, setAutoMapSuccessInfo] = useState<{ assignedCount: number; details: { className: string; added: number; total: number }[] } | null>(null);
  const [selectedRegistrantId, setSelectedRegistrantId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');

  const refreshData = async () => {
    try {
      const [regs, anns, cls, assigns] = await Promise.all([SchoolDatabase.getRegistrants(), SchoolDatabase.getAnnouncements(), SchoolDatabase.getClasses(), SchoolDatabase.getClassAssignments()]);
      setRegistrants(regs); setAnnouncements(anns); setClasses(cls); setAssignments(assigns);
      if (!selectedClassId && cls.length) setSelectedClassId(cls[0].id);
      setError(null); onRefreshParent();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
  };

  useEffect(() => { (async () => { setLoading(true); await refreshData(); setLoading(false); })(); }, []);

  const passedRegistrants = registrants.filter((r) => announcements.find((a) => a.registrant_id === r.id)?.status === 'Diterima');
  const assignedRegistrantIds = new Set(assignments.map((a) => a.registrant_id));
  const readyForMapping = passedRegistrants.filter((r) => r.exam_score !== null && r.exam_score !== undefined);
  const unassignedReady = readyForMapping.filter((r) => !assignedRegistrantIds.has(r.id));

  const handleSaveScore = async (registrantId: string) => {
    const raw = scoreInputs[registrantId];
    const score = raw === undefined || raw === '' ? null : Number(raw);
    if (score !== null && (!Number.isFinite(score) || score < 0)) { setError('Nilai ujian harus angka >= 0.'); return; }
    setSavingScoreId(registrantId);
    try { await SchoolDatabase.updateRegistrant(registrantId, { exam_score: score }); await refreshData(); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSavingScoreId(null); }
  };

  const handleExecuteAutoMap = async () => {
    setSubmitting(true);
    try {
      const result = await SchoolDatabase.autoMapClasses({ onlyUnassigned: true });
      if (!result.success) { setError(result.error || 'Gagal auto generate pembagian kelas'); return; }
      setAutoMapSuccessInfo({ assignedCount: result.assignedCount, details: result.details });
      await refreshData();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSubmitting(false); }
  };

  const handleAssignManual = async (e: React.FormEvent) => {
    e.preventDefault(); setManualError(null); setManualSuccess(null);
    if (!selectedRegistrantId || !selectedClassId) { setManualError('Pilih pendaftar dan kelas.'); return; }
    setSubmitting(true);
    const res = await SchoolDatabase.assignToClassManual(selectedRegistrantId, selectedClassId);
    setSubmitting(false);
    if (!res.success) setManualError(res.error || 'Gagal mengalokasikan siswa');
    else { setManualSuccess('Siswa berhasil dialokasikan ke kelas!'); setSelectedRegistrantId(''); await refreshData(); setTimeout(() => setManualSuccess(null), 3000); }
  };

  const handleRemoveAssignment = async (assignmentId: string) => { await SchoolDatabase.removeClassAssignment(assignmentId); await refreshData(); };

  const filteredAssignments = assignments.filter((a) => {
    if (classFilter !== 'All' && a.class_id !== classFilter) return false;
    if (!searchQuery) return true;
    const r = registrants.find((reg) => reg.id === a.registrant_id);
    return r?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || r?.registration_number.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) return <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#03357E] border-t-transparent rounded-full animate-spin" /></div>;
  if (error && registrants.length === 0) return <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E2E8F0]">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">Nilai & Alokasi Kelas</h1>
        <p className="text-xs text-[#64748B] mt-0.5">Input nilai ujian calon siswa yang Diterima, lalu bagi rata ke kelas 1 berdasarkan nilai ujian.</p>
      </div>
      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}

      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F5F8FC] border-b border-[#E2E8F0] flex items-center gap-2"><ClipboardEdit className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-sm text-[#03357E]">Input Nilai Ujian ({passedRegistrants.length} Diterima)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#03357E] border-b border-[#E2E8F0]"><tr><th className="py-2.5 px-4 font-bold">No. Registrasi</th><th className="py-2.5 px-4 font-bold">Nama Peserta Didik</th><th className="py-2.5 px-4 font-bold">Nilai Ujian</th><th className="py-2.5 px-4 font-bold text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {passedRegistrants.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-xs text-[#64748B]">Belum ada pendaftar berstatus Diterima.</td></tr> : passedRegistrants.map((r) => (
                <tr key={r.id} className={r.exam_score !== null && r.exam_score !== undefined ? 'bg-emerald-50/40 hover:bg-emerald-50' : 'hover:bg-[#F5F8FC]'}>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#03357E]">{r.registration_number}</td>
                  <td className="py-2.5 px-4 font-semibold text-[#0F172A]">{r.full_name}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" step="0.01" value={scoreInputs[r.id] ?? (r.exam_score ?? '')} onChange={(e) => setScoreInputs((prev) => ({ ...prev, [r.id]: e.target.value }))} className="w-28 px-2 py-1 text-xs rounded-md border border-[#CBD5E1] bg-white focus:outline-hidden" />
                      {r.exam_score !== null && r.exam_score !== undefined ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0"><Check className="w-3 h-3" />Tersimpan</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#94A3B8] shrink-0">Belum diisi</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right"><button onClick={() => handleSaveScore(r.id)} disabled={savingScoreId === r.id} className="px-2.5 py-1 rounded-md text-[11px] font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer disabled:opacity-60 inline-flex items-center gap-1"><Save className="w-3 h-3" />{savingScoreId === r.id ? 'Menyimpan...' : 'Simpan'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h2 className="font-serif text-xl font-bold text-[#03357E]">Alokasi Kelas</h2><p className="text-xs text-[#64748B] mt-0.5">Bagi siswa Diterima (yang sudah punya nilai) ke kelas aktif secara rata berdasar nilai.</p></div>
        <button onClick={() => { setAutoMapSuccessInfo(null); setIsAutoMappingModalOpen(true); }} className="px-4 py-2 text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"><Sparkles className="w-4 h-4" /><span>Auto Generate Pembagian Kelas</span></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs"><div className="text-[11px] font-bold text-[#64748B] uppercase">Siap Dialokasikan</div><div className="font-serif text-2xl font-bold text-[#03357E] mt-1">{readyForMapping.length} Siswa</div></div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs"><div className="text-[11px] font-bold text-emerald-700 uppercase">Sudah Teralokasi</div><div className="font-serif text-2xl font-bold text-emerald-800 mt-1">{assignments.length} Siswa</div></div>
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs"><div className="text-[11px] font-bold text-amber-700 uppercase">Belum Teralokasi</div><div className="font-serif text-2xl font-bold text-amber-800 mt-1">{unassignedReady.length} Siswa</div></div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]"><Network className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-base text-[#03357E]">Alokasi Manual Siswa ke Kelas</h3></div>
        {manualError && <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{manualError}</span></div>}
        {manualSuccess && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2"><Check className="w-4 h-4 shrink-0" /><span>{manualSuccess}</span></div>}
        <form onSubmit={handleAssignManual} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5"><label className="block text-xs font-bold text-[#0F172A] mb-1">Pilih Siswa (Diterima)</label><select value={selectedRegistrantId} onChange={(e) => setSelectedRegistrantId(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:outline-hidden"><option value="">-- Pilih Siswa --</option>{passedRegistrants.map((r) => { const isAssigned = assignedRegistrantIds.has(r.id); return <option key={r.id} value={r.id}>{r.registration_number} - {r.full_name} (Nilai: {r.exam_score ?? '-'}) {isAssigned ? '[Sudah Teralokasi]' : ''}</option>; })}</select></div>
          <div className="sm:col-span-5"><label className="block text-xs font-bold text-[#0F172A] mb-1">Pilih Kelas</label><select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] focus:outline-hidden">{classes.map((c) => { const currentCount = assignments.filter((a) => a.class_id === c.id).length; const isFull = currentCount >= c.capacity; return <option key={c.id} value={c.id} disabled={isFull || !c.is_active}>{c.name} [{currentCount}/{c.capacity}] {isFull ? '(PENUH)' : ''}{!c.is_active ? '(Nonaktif)' : ''}</option>; })}</select></div>
          <div className="sm:col-span-2"><button type="submit" disabled={submitting} className="w-full py-2 px-4 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer disabled:opacity-60">{submitting ? '...' : 'Alokasikan'}</button></div>
        </form>
      </div>
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 bg-[#F5F8FC] border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-sm text-[#03357E]">Daftar Siswa Teralokasi ({filteredAssignments.length})</h3></div>
          <div className="flex items-center gap-3 w-full sm:w-auto"><div className="relative w-full sm:w-56"><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari siswa..." className="w-full pl-3 pr-3 py-1.5 text-xs rounded-md bg-white border border-[#CBD5E1] focus:outline-hidden" /></div><select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="py-1.5 px-2.5 rounded-md border border-[#CBD5E1] text-xs bg-white focus:outline-hidden"><option value="All">Semua Kelas</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F5F8FC] text-[#03357E] border-b border-[#E2E8F0]"><tr><th className="py-2.5 px-4 font-bold">No. Registrasi</th><th className="py-2.5 px-4 font-bold">Nama Peserta Didik</th><th className="py-2.5 px-4 font-bold">Nilai Ujian</th><th className="py-2.5 px-4 font-bold">Kelas</th><th className="py-2.5 px-4 font-bold text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredAssignments.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-xs text-[#64748B]">Belum ada alokasi kelas yang sesuai filter.</td></tr> : filteredAssignments.map((a) => {
                const r = registrants.find((reg) => reg.id === a.registrant_id);
                const cls = classes.find((c) => c.id === a.class_id);
                return (
                  <tr key={a.id} className="hover:bg-[#F5F8FC]"><td className="py-2.5 px-4 font-mono font-bold text-[#03357E]">{r?.registration_number || '-'}</td><td className="py-2.5 px-4 font-semibold text-[#0F172A]">{r?.full_name || 'Tidak Dikenal'}</td><td className="py-2.5 px-4 font-mono text-[#475569]">{r?.exam_score ?? '-'}</td><td className="py-2.5 px-4 font-bold text-[#03357E]">{cls?.name || '-'}</td><td className="py-2.5 px-4 text-right"><button onClick={() => handleRemoveAssignment(a.id)} className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></td></tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {isAutoMappingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="bg-[#03357E] text-white px-5 py-4 flex items-center justify-between"><div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#FFBE00]" /><h3 className="font-serif font-bold text-lg">Auto Generate Pembagian Kelas</h3></div><button onClick={() => setIsAutoMappingModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button></div>
            <div className="p-6 space-y-4 text-xs">
              {autoMapSuccessInfo ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center"><CheckCircle2 className="w-7 h-7" /></div>
                  <h4 className="font-serif font-bold text-lg text-[#0F172A]">Pembagian Kelas Selesai!</h4>
                  <p className="text-xs text-[#64748B]">Berhasil mendistribusikan <strong>{autoMapSuccessInfo.assignedCount}</strong> siswa ke kelas aktif secara rata berdasarkan nilai ujian.</p>
                  <div className="bg-[#F5F8FC] p-3 rounded-xl border border-[#E2E8F0] space-y-2 text-left"><div className="font-bold text-[#03357E] border-b border-[#E2E8F0] pb-1">Distribusi Kelas:</div>{autoMapSuccessInfo.details.map((d, i) => <div key={i} className="flex justify-between text-xs py-0.5"><span className="text-[#64748B]">{d.className}</span><strong className="font-mono text-[#03357E]">+{d.added} (Total {d.total})</strong></div>)}</div>
                  <div className="pt-2 flex justify-end"><button onClick={() => setIsAutoMappingModalOpen(false)} className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] cursor-pointer">Selesai</button></div>
                </div>
              ) : (
                <>
                  <p className="text-[#475569] leading-relaxed">Sistem akan mengurutkan siswa Diterima yang sudah punya nilai ujian dari tertinggi, lalu membagikannya satu-satu ke kelas aktif dengan rata-rata nilai saat ini terendah, hingga kapasitas kelas terpenuhi.</p>
                  <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] space-y-2"><div className="flex justify-between"><span className="text-[#64748B]">Siswa Belum Teralokasi:</span><strong className="text-amber-700 font-mono text-sm">{unassignedReady.length} Siswa</strong></div><div className="flex justify-between"><span className="text-[#64748B]">Total Kapasitas Kelas Aktif:</span><strong className="text-[#03357E] font-mono text-sm">{classes.filter((c) => c.is_active).reduce((sum, c) => sum + c.capacity, 0)} Siswa</strong></div></div>
                  <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-2"><button onClick={() => setIsAutoMappingModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer">Batal</button><button onClick={handleExecuteAutoMap} disabled={submitting} className="px-5 py-2 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"><Sparkles className="w-3.5 h-3.5" /><span>{submitting ? 'Memproses...' : 'Proses Auto Generate'}</span></button></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
