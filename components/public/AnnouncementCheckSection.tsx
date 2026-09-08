'use client';

import React, { useState } from 'react';
import { FileCheck2, Search, CheckCircle2, Clock3, XCircle, AlertCircle, Printer } from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { PublicAnnouncementLookupResult } from '@/lib/types';

interface Props { prefilledRegNumber?: string; }

export default function AnnouncementCheckSection({ prefilledRegNumber }: Props) {
  const [regNumberInput, setRegNumberInput] = useState(prefilledRegNumber || '');
  const [result, setResult] = useState<PublicAnnouncementLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [prevPrefilled, setPrevPrefilled] = useState(prefilledRegNumber);
  if (prefilledRegNumber !== prevPrefilled) {
    setPrevPrefilled(prefilledRegNumber);
    if (prefilledRegNumber) setRegNumberInput(prefilledRegNumber);
  }

  const doLookup = async (num: string) => {
    setSearching(true); setHasSearched(true); setErrorMessage(null); setResult(null);
    try {
      const res = await SchoolDatabase.lookupAnnouncement(num);
      if ('error' in res) setErrorMessage(res.error); else setResult(res);
    } catch (e: unknown) { setErrorMessage(e instanceof Error ? e.message : String(e)); }
    finally { setSearching(false); }
  };

  const handleSearch = async (e: React.FormEvent) => { e.preventDefault(); if (!regNumberInput.trim()) return; await doLookup(regNumberInput); };
  const handleSampleClick = async (num: string) => { setRegNumberInput(num); await doLookup(num); };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Diterima': return <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-sm font-bold shadow-xs"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span>DITERIMA</span></div>;
      case 'Belum Diterima': return <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border-2 border-rose-400 text-rose-800 text-sm font-bold shadow-xs"><XCircle className="w-5 h-5 text-rose-600" /><span>BELUM DITERIMA</span></div>;
      default: return <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-800 text-sm font-bold shadow-xs"><Clock3 className="w-5 h-5 text-amber-600 animate-spin" /><span>DALAM PROSES</span></div>;
    }
  };

  return (
    <section id="cek-pengumuman" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#03357E]/10 text-[#03357E] text-xs font-semibold mb-3 border border-[#03357E]/20"><FileCheck2 className="w-3.5 h-3.5 text-[#03357E]" /><span className="tracking-[0.2em] uppercase font-bold text-[11px]">Pengumuman Hasil Seleksi</span></div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F172A] tracking-tight">Cek Hasil Kelulusan SPMB</h2>
          <p className="mt-3 text-sm text-[#475569] font-sans">Ketahui status kelulusan penerimaan murid baru Tahun Pelajaran 2027/2028 dengan memasukkan Nomor Registrasi resmi.</p>
        </div>
        <div className="bg-[#F5F8FC] p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E2E8F0] mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]"><Search className="w-4 h-4" /></div><input type="text" required value={regNumberInput} onChange={(e) => setRegNumberInput(e.target.value.toUpperCase())} placeholder="Masukkan Nomor Registrasi (SPMB-BINA-NUSA-XXX)" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white border border-[#CBD5E1] focus:outline-hidden focus:ring-2 focus:ring-[#03357E] font-mono tracking-wider font-semibold text-[#0F172A]" /></div>
            <button type="submit" disabled={searching} className="py-3 px-6 rounded-full text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60">{searching ? 'Mencari...' : 'Cek Pengumuman'}</button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#64748B]"><span>Coba contoh data:</span>{['SPMB-BINA-NUSA-001', 'SPMB-BINA-NUSA-003', 'SPMB-BINA-NUSA-004'].map((num) => <button key={num} type="button" onClick={() => handleSampleClick(num)} className="font-mono text-[11px] font-semibold text-[#03357E] bg-white hover:bg-[#F5F8FC] px-2.5 py-1 rounded-full cursor-pointer border border-[#E2E8F0]">{num}</button>)}</div>
        </div>
        {hasSearched && (
          <div className="animate-fadeIn">
            {errorMessage && <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 text-center space-y-2"><AlertCircle className="w-8 h-8 text-amber-700 mx-auto" /><h4 className="font-serif font-bold text-amber-950 text-lg">Nomor Registrasi Tidak Ditemukan</h4><p className="text-xs text-amber-900 max-w-lg mx-auto">{errorMessage}</p></div>}
            {result && (
              <div className="bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden">
                <div className="bg-white p-6 sm:p-8 border-b border-[#E2E8F0] text-center relative">
                  <div className="flex items-center justify-center gap-3 mb-2"><img src="/logo-bina-nusa.jpeg" alt="Logo SD Bina Nusa" className="w-10 h-10 rounded-xl object-cover" /><div className="text-left"><div className="font-serif font-bold text-lg text-[#0F172A] leading-tight">SD BINA NUSA</div><div className="text-[10px] text-[#64748B] uppercase tracking-wider font-sans">Yayasan Pendidikan Arrafah Rajeg</div></div></div>
                  <div className="h-[2px] bg-[#03357E] w-32 mx-auto mt-3 mb-4"></div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F172A]">Surat Keputusan Panitia SPMB TP {result.academic_year}</h3>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status Hasil Seleksi:</span>
                    {getStatusBadge(result.announcement?.status || 'Dalam Proses')}
                    {result.announcement?.notes && <p className="text-xs text-[#475569] max-w-md pt-2 italic font-sans">&ldquo;{result.announcement.notes}&rdquo;</p>}
                  </div>
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden text-xs">
                    <table className="w-full"><tbody>
                      <tr className="border-b border-[#E2E8F0]"><td className="px-4 py-3 font-semibold text-[#64748B] w-1/3 bg-[#F5F8FC]">Nama Calon Siswa</td><td className="px-4 py-3 font-bold text-[#0F172A] text-sm">{result.registrant.full_name}</td></tr>
                      <tr className="border-b border-[#E2E8F0]"><td className="px-4 py-3 font-semibold text-[#64748B] bg-[#F5F8FC]">Nomor Registrasi</td><td className="px-4 py-3 font-mono font-bold text-[#03357E]">{result.registrant.registration_number}</td></tr>
                      <tr className="border-b border-[#E2E8F0]"><td className="px-4 py-3 font-semibold text-[#64748B] bg-[#F5F8FC]">Tahun Pelajaran</td><td className="px-4 py-3 font-medium text-[#0F172A]">{result.academic_year}</td></tr>
                      <tr className="border-b border-[#E2E8F0]"><td className="px-4 py-3 font-semibold text-[#64748B] bg-[#F5F8FC]">Asal Sekolah</td><td className="px-4 py-3 font-medium text-[#0F172A]">{result.registrant.previous_school}</td></tr>
                      <tr><td className="px-4 py-3 font-semibold text-[#64748B] bg-[#F5F8FC]">Jenjang Pendidikan</td><td className="px-4 py-3 font-medium text-[#0F172A]">Sekolah Dasar (SD)</td></tr>
                    </tbody></table>
                  </div>
                  {result.announcement?.status === 'Diterima' && <div className="p-5 rounded-2xl bg-[#03357E]/5 border border-[#03357E]/20 text-xs text-[#0F172A] space-y-2 font-sans"><span className="font-bold block text-sm text-[#03357E]">Langkah Selanjutnya bagi Calon Murid Baru:</span><ol className="list-decimal list-inside space-y-1 pl-1 text-[#475569]"><li>Melakukan konfirmasi kesediaan dan verifikasi berkas ke Sekretariat Panitia SPMB SD Bina Nusa.</li><li>Menyelesaikan administrasi Dana Sumbangan Pendidikan (DSP) sesuai gelombang yang dipilih.</li><li>Pengukuran seragam dan pengambilan paket buku pada jadwal yang ditentukan panitia.</li></ol></div>}
                  <div className="flex justify-end pt-2">
                    <button onClick={() => {
                      if (!result) return;
                      const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
                      const badge = result.announcement?.status==='Diterima' ? '<span style="background:#ECFDF5;border:2px solid #10B981;color:#065F46;padding:8px 16px;border-radius:10px;font-weight:800">DITERIMA</span>' : result.announcement?.status==='Belum Diterima' ? '<span style="background:#FFF1F2;border:2px solid #FB7185;color:#881337;padding:8px 16px;border-radius:10px;font-weight:800">BELUM DITERIMA</span>' : '<span style="background:#FFFBEB;border:2px solid #F59E0B;color:#92400E;padding:8px 16px;border-radius:10px;font-weight:800">DALAM PROSES</span>';
                      const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Pengumuman - ${esc(result.registrant.registration_number)}</title><style>body{font-family:system-ui,sans-serif;color:#0F172A;padding:32px;max-width:640px;margin:0 auto}</style></head><body><div style="text-align:center;border-bottom:3px solid #03357E;padding-bottom:12px"><img src="${new URL('/logo-bina-nusa.jpeg', window.location.origin).href}" alt="Logo" style="width:40px;height:40px;object-fit:cover;border-radius:10px;display:inline-block"/><div style="font-weight:800">SD BINA NUSA</div><div style="font-size:10px;color:#64748B">Yayasan Pendidikan Arrafah Rajeg</div><h2>Surat Keputusan Panitia SPMB TP ${esc(result.academic_year)}</h2></div><div style="text-align:center;margin:20px 0">${badge}${result.announcement?.notes ? `<p style="font-size:12px;color:#475569;font-style:italic">&ldquo;${esc(result.announcement.notes)}&rdquo;</p>`:''}</div><table style="width:100%;font-size:13px;border-collapse:collapse"><tr><td style="background:#F5F8FC;padding:8px;color:#64748B;width:35%">Nama</td><td style="padding:8px;font-weight:700">${esc(result.registrant.full_name)}</td></tr><tr><td style="background:#F5F8FC;padding:8px;color:#64748B">No. Registrasi</td><td style="padding:8px;font-family:monospace;font-weight:800;color:#03357E">${esc(result.registrant.registration_number)}</td></tr><tr><td style="background:#F5F8FC;padding:8px;color:#64748B">Tahun Pelajaran</td><td style="padding:8px">${esc(result.academic_year)}</td></tr><tr><td style="background:#F5F8FC;padding:8px;color:#64748B">Asal Sekolah</td><td style="padding:8px">${esc(result.registrant.previous_school)}</td></tr></table><div style="margin-top:16px;font-size:11px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:10px">Dicetak: ${new Date().toLocaleString('id-ID')} • Dokumen ini hanya untuk 1 pendaftar tersebut.</div></body></html>`;
                      const w = window.open('', '_blank', 'width=720,height=800'); if(!w){window.print();return;} w.document.open(); w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(),300);
                    }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#03357E] bg-white hover:bg-[#F5F8FC] border border-[#CBD5E1] cursor-pointer"><Printer className="w-3.5 h-3.5" /><span>Cetak Lembar Pengumuman</span></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
