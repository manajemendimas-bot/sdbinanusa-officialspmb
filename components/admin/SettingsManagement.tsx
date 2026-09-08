'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, CheckCircle2, Building2, Hash, Calendar } from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { SchoolSettings } from '@/lib/types';

interface Props { onRefreshParent: () => void; }

export default function SettingsManagement({ onRefreshParent }: Props) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    (async () => {
      try { setSettings(await SchoolDatabase.getSettings()); }
      catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!settings) return;
    setSaving(true); setError(null);
    try { const updated = await SchoolDatabase.updateSettings(settings); setSettings(updated); setSaveSuccess(true); onRefreshParent(); setTimeout(() => setSaveSuccess(false), 3000); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  const handleResetData = async () => {
    if (!confirm('Apakah Anda yakin ingin mengatur ulang data SPMB ke data awal? Semua pendaftar baru yang ditambahkan pada sesi ini akan direset ke baseline 5 pendaftar contoh.')) return;
    setIsResetting(true);
    try { await SchoolDatabase.resetToDefaults(); const s = await SchoolDatabase.getSettings(); setSettings(s); onRefreshParent(); alert('Data berhasil diatur ulang ke data dasar.'); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setIsResetting(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-2 border-[#03357E] border-t-transparent rounded-full animate-spin" /></div>;
  if (error && !settings) return <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>;
  if (!settings) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div><h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">Pengaturan Sistem SPMB</h1><p className="text-xs text-[#64748B] mt-0.5">Konfigurasi identitas sekolah, format penomoran registrasi, dan preferensi pengumuman.</p></div>
        <button onClick={handleResetData} disabled={isResetting} className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 cursor-pointer self-start sm:self-auto disabled:opacity-60"><RotateCcw className="w-3.5 h-3.5" /><span>{isResetting ? 'Memproses...' : 'Reset Sample Database'}</span></button>
      </div>
      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">{error}</div>}
      {saveSuccess && <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /><span>Pengaturan sistem berhasil disimpan dan diterapkan ke seluruh modul!</span></div>}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]"><Hash className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-base text-[#03357E]">Konfigurasi Format Nomor Registrasi</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div><label className="block font-bold text-[#0F172A] mb-1">Prefix Nomor Registrasi <span className="text-red-500">*</span></label><input type="text" required value={settings.registration_number_prefix || settings.registration_prefix} onChange={(e) => setSettings({ ...settings, registration_number_prefix: e.target.value.toUpperCase(), registration_prefix: e.target.value.toUpperCase() } as SchoolSettings)} className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] font-mono font-bold text-[#03357E]" /><p className="text-[11px] text-[#64748B] mt-1">Format yang dihasilkan: <strong className="font-mono text-[#03357E]">{settings.registration_number_prefix || settings.registration_prefix}-001</strong></p></div>
            <div><label className="block font-bold text-[#0F172A] mb-1">Tahun Pelajaran SPMB <span className="text-red-500">*</span></label><input type="text" required value={settings.academic_year} onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F5F8FC] font-semibold" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]"><Building2 className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-base text-[#03357E]">Identitas & Kontak Resmi Sekolah</h3></div>
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block font-bold text-[#0F172A] mb-1">Nama Satuan Pendidikan</label><input type="text" required value={settings.school_name} onChange={(e) => setSettings({ ...settings, school_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]" /></div><div><label className="block font-bold text-[#0F172A] mb-1">Badan Penyelenggara / Yayasan</label><input type="text" required value={settings.foundation_name} onChange={(e) => setSettings({ ...settings, foundation_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]" /></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block font-bold text-[#0F172A] mb-1">Nomor Telepon / WhatsApp Panitia</label><input type="text" required value={settings.phone || settings.school_phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value, school_phone: e.target.value } as SchoolSettings)} className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]" /></div><div><label className="block font-bold text-[#0F172A] mb-1">Email Resmi</label><input type="email" required value={settings.email || settings.school_email} onChange={(e) => setSettings({ ...settings, email: e.target.value, school_email: e.target.value } as SchoolSettings)} className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]" /></div></div>
            <div><label className="block font-bold text-[#0F172A] mb-1">Alamat Kampus Sekolah</label><textarea rows={2} required value={settings.address || settings.school_address} onChange={(e) => setSettings({ ...settings, address: e.target.value, school_address: e.target.value } as SchoolSettings)} className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-[#F5F8FC]" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F5F9]"><Calendar className="w-4 h-4 text-[#03357E]" /><h3 className="font-serif font-bold text-base text-[#03357E]">Status Publikasi Global</h3></div>
          <div className="text-xs space-y-3"><label className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F8FC] border border-[#CBD5E1] cursor-pointer"><input type="checkbox" checked={Boolean(settings.is_announcement_published ?? settings.announcement_published_global)} onChange={(e) => setSettings({ ...settings, is_announcement_published: e.target.checked, announcement_published_global: e.target.checked } as SchoolSettings)} className="w-4 h-4 rounded text-[#03357E] focus:ring-[#03357E]" /><div><span className="font-bold text-[#0F172A] block">Buka Portal Cek Hasil Pengumuman Publik</span><span className="text-[#64748B] text-[11px]">Jika dicentang, wali murid dapat memasukkan nomor registrasi untuk melihat kelulusan.</span></div></label></div>
        </div>
        <div className="flex justify-end gap-3 pt-2"><button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"><Save className="w-4 h-4" /><span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}</span></button></div>
      </form>
    </div>
  );
}
