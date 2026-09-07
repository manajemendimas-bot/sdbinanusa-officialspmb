'use client';

import React from 'react';
import { 
  Calendar, 
  Tag, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Receipt, 
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface SpmbInfoSectionProps {
  onOpenRegister: () => void;
}

export default function SpmbInfoSection({ onOpenRegister }: SpmbInfoSectionProps) {
  const waves = [
    {
      id: 'inden',
      name: 'PPDB Inden',
      badge: 'Prioritas & Paling Hemat',
      period: '10 November 2025 – 31 Agustus 2026',
      dspStandard: 'Rp7.000.000',
      dspTkArrafah: 'Rp5.000.000',
      dspTkLain: 'Rp5.500.000',
      status: 'Sedang Berlangsung',
      isPopular: true,
    },
    {
      id: 'reguler-1',
      name: 'Gelombang Reguler 1',
      badge: 'Tahap 1',
      period: '1 September 2026 – 30 November 2026',
      dspStandard: 'Rp7.500.000',
      dspTkArrafah: 'Rp6.000.000',
      dspTkLain: 'Rp6.500.000',
      status: 'Mendatang',
      isPopular: false,
    },
    {
      id: 'reguler-2',
      name: 'Gelombang Reguler 2',
      badge: 'Tahap 2',
      period: '1 Desember 2026 – 27 Februari 2027',
      dspStandard: 'Rp7.800.000',
      dspTkArrafah: 'Rp6.300.000',
      dspTkLain: 'Rp6.800.000',
      status: 'Mendatang',
      isPopular: false,
    },
  ];

  const additionalFees = [
    { name: 'Biaya Formulir Pendaftaran', amount: 'Rp50.000', note: 'Dibayarkan saat pendaftaran' },
    { name: 'SPP Bulan Juli 2027', amount: 'Rp275.000', note: 'SPP bulan pertama masuk sekolah' },
    { name: 'Buku & Modul Pembelajaran', amount: '± Rp2.100.000', note: 'Paket buku cetak & modul 1 tahun' },
    { name: 'Pemeliharaan Sarana & Prasarana', amount: 'Rp150.000', note: 'Biaya fasilitas tahunan' },
  ];

  const steps = [
    {
      step: '01',
      title: 'Pendaftaran Online',
      desc: 'Isi formulir identitas calon murid & orang tua secara mandiri di website ini.',
    },
    {
      step: '02',
      title: 'Dapatkan Nomor Registrasi',
      desc: 'Sistem menerbitkan nomor resmi SPMB-BINA-NUSA-XXX sebagai tanda bukti pendaftaran.',
    },
    {
      step: '03',
      title: 'Cek Jadwal & Ikuti Tes',
      desc: 'Cek jadwal ujian dan ruangan secara mandiri, lalu ikuti observasi kemampuan belajar.',
    },
    {
      step: '04',
      title: 'Pengumuman Hasil',
      desc: 'Pantau pengumuman kelulusan secara online melalui fitur Cek Pengumuman.',
    },
  ];

  return (
    <section id="spmb-info" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#03357E]/10 text-[#03357E] text-xs font-semibold mb-3 border border-[#03357E]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#03357E]" />
            <span className="tracking-[0.2em] uppercase font-bold text-[11px]">Penerimaan Peserta Didik Baru</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0F172A] tracking-tight">
            Informasi SPMB Tahun Pelajaran 2027/2028
          </h2>
          <p className="mt-4 text-base text-[#475569] font-sans">
            Pilih periode pendaftaran terbaik untuk kemudahan proses administrasi serta potongan khusus Dana Sumbangan Pendidikan (DSP).
          </p>
        </div>

        {/* Waves Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {waves.map((wave) => (
            <div
              key={wave.id}
              className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 relative ${
                wave.isPopular
                  ? 'bg-[#03357E] text-white shadow-md -translate-y-1 border border-[#1F4590]'
                  : 'bg-[#F5F8FC] text-[#0F172A] border border-[#E2E8F0] shadow-2xs hover:border-[#1F4590]/40'
              }`}
            >
              {wave.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-[#FFBE00] text-[#03357E] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
                  Paling Banyak Dipilih
                </div>
              )}

              <div>
                {/* Wave Header */}
                <div className="pb-4 border-b border-current/15 mb-4">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    wave.isPopular ? 'text-[#FFBE00]' : 'text-[#03357E]'
                  }`}>
                    {wave.badge}
                  </span>
                  <h3 className="font-serif text-2xl font-bold mt-1">
                    {wave.name}
                  </h3>
                  <div className={`flex items-center gap-1.5 text-xs mt-2 ${
                    wave.isPopular ? 'text-white/80' : 'text-[#64748B]'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{wave.period}</span>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="space-y-3.5 my-5">
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                    Rincian Dana Sumbangan Pendidikan (DSP):
                  </div>

                  <div className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                    wave.isPopular ? 'bg-[#1F4590] border border-white/10' : 'bg-white border border-[#E2E8F0]'
                  }`}>
                    <div>
                      <div className="font-bold">Alumni TK Ar-Rafah</div>
                      <div className="text-[10px] opacity-75">Potongan Jalur Afiliasi Yayasan</div>
                    </div>
                    <div className="font-serif font-bold text-sm text-right">
                      {wave.dspTkArrafah}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl flex items-center justify-between text-xs ${
                    wave.isPopular ? 'bg-[#1F4590] border border-white/10' : 'bg-white border border-[#E2E8F0]'
                  }`}>
                    <div>
                      <div className="font-bold">Alumni TK Lain / Luar</div>
                      <div className="text-[10px] opacity-75">Jalur TK Umum & PAUD</div>
                    </div>
                    <div className="font-serif font-bold text-sm text-right">
                      {wave.dspTkLain}
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl flex items-center justify-between text-xs opacity-75 ${
                    wave.isPopular ? 'bg-[#022457]' : 'bg-[#E2E8F0]'
                  }`}>
                    <div>
                      <div>Tarif Standar Non-Promo</div>
                    </div>
                    <div className="font-serif font-semibold text-xs">
                      {wave.dspStandard}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Action */}
              <div className="pt-4 border-t border-current/15 mt-2">
                <button
                  onClick={onOpenRegister}
                  className={`w-full py-2.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    wave.isPopular
                      ? 'bg-[#FFBE00] text-[#03357E] hover:bg-[#E6AB00]'
                      : 'bg-[#03357E] text-white hover:bg-[#1F4590]'
                  }`}
                >
                  <span>Daftar {wave.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Expenses Table */}
        <div className="bg-[#F5F8FC] rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] mb-16 shadow-2xs">
          <div className="max-w-2xl mb-6">
            <h3 className="font-serif text-xl font-bold text-[#0F172A] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#03357E]" />
              Komponen Biaya Operasional & Perlengkapan Sekolah
            </h3>
            <p className="text-xs text-[#64748B] mt-1 font-sans">
              Rincian biaya tambahan yang bersifat transparan dan resmi ditetapkan oleh Yayasan Pendidikan Arrafah Rajeg.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalFees.map((fee, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <div className="text-xs text-[#64748B] mb-1 font-medium">{fee.name}</div>
                <div className="font-serif text-xl font-bold text-[#03357E]">{fee.amount}</div>
                <div className="text-[11px] text-[#94A3B8] mt-1">{fee.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SPMB Workflow Steps */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F4590]">
              Panduan Calon Wali Murid
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#0F172A] mt-1">
              Alur 4 Langkah Pendaftaran SPMB
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-[#F5F8FC] border border-[#E2E8F0] shadow-2xs relative"
              >
                <div className="font-serif text-3xl font-bold text-[#03357E]/30 mb-2">
                  {item.step}
                </div>
                <h4 className="font-serif text-lg font-bold text-[#0F172A] mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
