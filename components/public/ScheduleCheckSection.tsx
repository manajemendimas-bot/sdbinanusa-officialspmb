'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Search, Clock, MapPin, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { PublicScheduleLookupResult } from '@/lib/types';

interface Props { prefilledRegNumber?: string; }

export default function ScheduleCheckSection({ prefilledRegNumber }: Props) {
  const [regNumberInput, setRegNumberInput] = useState(prefilledRegNumber || '');
  const [result, setResult] = useState<PublicScheduleLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => { if (prefilledRegNumber) setRegNumberInput(prefilledRegNumber); }, [prefilledRegNumber]);

  const doLookup = async (num: string) => {
    setSearching(true); setHasSearched(true); setErrorMessage(null); setResult(null);
    try {
      const res = await SchoolDatabase.lookupExamSchedule(num);
      if ('error' in res) setErrorMessage(res.error); else setResult(res);
    } catch (e: unknown) { setErrorMessage(e instanceof Error ? e.message : String(e)); }
    finally { setSearching(false); }
  };

  const handleSearch = async (e: React.FormEvent) => { e.preventDefault(); if (!regNumberInput.trim()) return; await doLookup(regNumberInput); };
  const handleSampleClick = async (num: string) => { setRegNumberInput(num); await doLookup(num); };

  return (
    <section id="cek-jadwal" className="py-16 sm:py-24 bg-[#F5F8FC] border-b border-[#E2E8F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#03357E]/10 text-[#03357E] text-xs font-semibold mb-3 border border-[#03357E]/20"><Calendar className="w-3.5 h-3.5 text-[#03357E]" /><span className="tracking-[0.2em] uppercase font-bold text-[11px]">Layanan Mandiri</span></div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F172A] tracking-tight">Cek Jadwal Ujian & Observasi</h2>
          <p className="mt-3 text-sm text-[#475569] font-sans">Masukkan Nomor Registrasi resmi (contoh: <strong>SPMB-BINA-NUSA-001</strong>) untuk melihat tanggal, waktu, dan ruangan ujian calon peserta didik.</p>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E2E8F0] mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]"><Search className="w-4 h-4" /></div>
              <input type="text" required value={regNumberInput} onChange={(e) => setRegNumberInput(e.target.value.toUpperCase())} placeholder="Masukkan Nomor Registrasi (SPMB-BINA-NUSA-XXX)" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-[#F5F8FC] border border-[#CBD5E1] focus:outline-hidden focus:ring-2 focus:ring-[#03357E] font-mono tracking-wider font-semibold placeholder:font-sans placeholder:font-normal text-[#0F172A]" />
            </div>
            <button type="submit" disabled={searching} className="py-3 px-6 rounded-full text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60">{searching ? 'Mencari...' : 'Cek Jadwal'}</button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#64748B]"><span>Contoh nomor terdaftar:</span>{['SPMB-BINA-NUSA-001', 'SPMB-BINA-NUSA-002', 'SPMB-BINA-NUSA-003'].map((num) => <button key={num} type="button" onClick={() => handleSampleClick(num)} className="font-mono text-[11px] font-semibold text-[#03357E] bg-[#03357E]/10 hover:bg-[#03357E]/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-[#03357E]/20">{num}</button>)}</div>
        </div>
        {hasSearched && (
          <div className="animate-fadeIn">
            {errorMessage && <div className="p-6 rounded-2xl bg-amber-50/90 border border-amber-200 text-center space-y-2"><AlertCircle className="w-8 h-8 text-amber-700 mx-auto" /><h4 className="font-serif font-bold text-amber-950 text-lg">Informasi Belum Ditemukan</h4><p className="text-xs text-amber-900 max-w-lg mx-auto">{errorMessage}</p></div>}
            {result && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="bg-[#03357E] text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F4590]">
                  <div><span className="text-[11px] font-mono tracking-wider text-[#FFBE00] uppercase font-bold">Kartu Peserta Ujian SPMB 2027/2028</span><h3 className="font-serif text-2xl font-bold text-white mt-1">{result.registrant.full_name}</h3><div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-1 font-sans"><span className="font-mono bg-[#1F4590] px-2 py-0.5 rounded font-bold text-[#FFBE00]">{result.registrant.registration_number}</span><span>•</span><span>Asal: {result.registrant.previous_school}</span></div></div>
                  <button onClick={() => {
                    if (!result) return;
                    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
                    const rows = result.schedules.length ? result.schedules.map((it, idx) => `<div style="border:1px solid #E2E8F0;border-radius:12px;padding:14px;margin:8px 0;background:#F5F8FC"><div style="font-size:10px;color:#03357E;font-weight:800">Sesi 0${idx+1} • Terverifikasi</div><div style="font-weight:800;margin:4px 0">${esc(it.session_name)}</div><div style="font-size:12px">📅 ${esc(new Date(it.exam_date).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}</div><div style="font-size:12px">🕐 ${esc(it.start_time)} – ${esc(it.end_time)} WIB</div><div style="font-size:12px">📍 ${esc(it.room_name)}</div></div>`).join('') : '<div style="text-align:center;padding:20px;background:#F5F8FC;border:1px solid #E2E8F0;border-radius:12px">Belum ada jadwal dialokasikan.</div>';
                    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Jadwal Ujian - ${esc(result.registrant.registration_number)}</title><style>body{font-family:system-ui,sans-serif;color:#0F172A;padding:32px;max-width:680px;margin:0 auto}h1{color:#03357E}</style></head><body><h1 style="text-align:center;color:#03357E">SD Bina Nusa</h1><p style="text-align:center;color:#64748B;font-size:12px">Jadwal Ujian & Observasi SPMB</p><div style="background:#03357E;color:#fff;padding:16px;border-radius:12px"><div style="color:#FFBE00;font-size:10px;letter-spacing:1px">KARTU PESERTA UJIAN</div><div style="font-size:18px;font-weight:800">${esc(result.registrant.full_name)}</div><div style="font-family:monospace;background:#1F4590;display:inline-block;padding:2px 8px;border-radius:6px;color:#FFBE00;margin-top:4px">${esc(result.registrant.registration_number)}</div><div style="font-size:12px;opacity:.8">Asal: ${esc(result.registrant.previous_school)}</div></div><h3 style="margin-top:20px">Daftar Sesi (${result.schedules.length})</h3>${rows}<div style="margin-top:16px;font-size:11px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:10px">Tata tertib: hadir 15 menit sebelum sesi, bawa pensil 2B/penghapus, busana rapi menutup aurat.<br>Dicetak: ${new Date().toLocaleString('id-ID')}</div></body></html>`;
                    const w = window.open('', '_blank', 'width=720,height=800'); if(!w){window.print();return;} w.document.open(); w.document.write(html); w.document.close(); w.focus(); setTimeout(()=>w.print(),300);
                  }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#03357E] bg-white hover:bg-[#F5F8FC] transition-colors cursor-pointer"><Printer className="w-3.5 h-3.5" /><span>Cetak Jadwal</span></button>
                </div>
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F4590]">Daftar Sesi Ujian / Observasi</span><span className="text-xs font-semibold text-[#64748B]">{result.schedules.length} Sesi Terjadwal</span></div>
                  {result.schedules.length === 0 ? <div className="p-8 text-center bg-[#F5F8FC] rounded-2xl border border-[#E2E8F0] space-y-2"><Clock className="w-8 h-8 text-[#94A3B8] mx-auto" /><h4 className="font-serif font-bold text-[#0F172A] text-base">Jadwal Belum Dialokasikan</h4><p className="text-xs text-[#64748B] max-w-md mx-auto font-sans">Pendaftaran Anda telah tercatat. Panitia sedang dalam proses pemetaan ruangan dan waktu ujian. Harap periksa kembali secara berkala.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{result.schedules.map((item, idx) => <div key={item.id} className="p-5 rounded-2xl bg-[#F5F8FC] border border-[#E2E8F0] space-y-3"><div className="flex items-center justify-between"><span className="text-xs font-mono font-bold text-[#03357E] bg-[#03357E]/10 px-2.5 py-0.5 rounded-full">Sesi 0{idx + 1}</span><span className="text-xs font-semibold text-[#03357E] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-[#03357E]" /> Terverifikasi</span></div><h4 className="font-serif text-lg font-bold text-[#0F172A]">{item.session_name}</h4><div className="space-y-1.5 text-xs text-[#475569] pt-1 font-sans"><div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#03357E] shrink-0" /><span className="font-medium text-[#0F172A]">{new Date(item.exam_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div><div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#03357E] shrink-0" /><span>Pukul <strong>{item.start_time} – {item.end_time} WIB</strong></span></div><div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#03357E] shrink-0" /><span>Ruangan: <strong>{item.room_name}</strong></span></div></div></div>)}</div>}
                  <div className="p-4 rounded-2xl bg-[#F5F8FC] border border-[#E2E8F0] text-xs text-[#64748B] space-y-1.5 font-sans"><span className="font-bold text-[#0F172A] block">Tata Tertib Peserta:</span><ul className="list-disc list-inside space-y-1 pl-1"><li>Hadir 15 menit sebelum sesi ujian dimulai di Gedung SD Bina Nusa.</li><li>Membawa alat tulis sederhana (pensil 2B, penghapus, dan pensil warna jika diperlukan).</li><li>Berbusana rapi, sopan, dan menutup aurat (seragam TK asal atau pakaian muslim/muslimah rapi).</li></ul></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
