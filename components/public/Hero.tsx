'use client';

import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Award, 
  CheckCircle2, 
  Search,
  Building,
  Calendar
} from 'lucide-react';

interface HeroProps {
  onOpenRegister: () => void;
}

export default function Hero({ onOpenRegister }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E2E8F0] bg-[#F5F8FC]">
      {/* Subtle modern pattern background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#03357E_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Editorial Headline & Messaging */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Institution Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#03357E]/10 border border-[#03357E]/20 text-[#03357E] text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#03357E]"></span>
              <span className="tracking-[0.1em] uppercase">Yayasan Pendidikan Arrafah Rajeg</span>
              <span className="text-[#03357E]/40">•</span>
              <span className="font-normal">Sejak 2008</span>
            </div>

            {/* Main Headline */}
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#1F4590] mb-2 block">
                Penerimaan Siswa Baru 2027/2028
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0F172A] leading-[1.08]">
                Tempat tumbuhnya <br className="hidden sm:inline" />
                <span className="text-[#03357E]">
                  Generasi Bina Nusa.
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl font-sans">
              Membangun karakter unggul melalui pendidikan holistik yang mengintegrasikan nilai keislaman, kurikulum terpadu, dan pembiasaan Qur&apos;ani sejak usia dini.
            </p>

            {/* Key Pillars Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-[#0F172A]">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#03357E] shrink-0" />
                <span>Tahfidz & BTQ Unggulan</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#03357E] shrink-0" />
                <span>Sholat Berjamaah Harian</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-[#03357E] shrink-0" />
                <span>Ruang Kelas Nyaman AC</span>
              </div>
            </div>

            {/* CTA Group */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenRegister}
                id="btn-hero-register"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-bold uppercase tracking-widest text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4 text-[#03357E]" />
              </button>

              <a
                href="#tentang"
                id="btn-hero-explore"
                className="inline-flex items-center justify-center gap-3 bg-white border border-[#CBD5E1] px-6 py-4 rounded-full hover:bg-[#F5F8FC] hover:border-[#1F4590] transition-all text-[#03357E] text-xs font-bold uppercase tracking-wider group text-center"
              >
                <span>Kenal Lebih Dekat</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#1F4590] transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Status Live Indicator */}
            <div className="pt-1 flex items-center gap-3 text-xs text-[#64748B]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBE00] animate-pulse"></div>
              <span>Pendaftaran Gelombang <strong>PPDB Inden & Reguler 1</strong> Sedang Dibuka</span>
            </div>
          </div>

          {/* Right Column: Editorial Institutional Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Outer White Container */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] relative overflow-hidden shadow-sm">
                
                {/* Header Badge */}
                <div className="flex items-start justify-between pb-5 border-b border-[#E2E8F0]">
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#1F4590] font-bold">
                      Profil Institusi
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#03357E] mt-1">
                      SD Bina Nusa
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                      Gedung Bina Nusa Islamic School • Rajeg
                    </p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-bina-nusa.jpeg" alt="Logo" className="w-11 h-11 rounded-xl object-cover shadow-xs border border-[#E2E8F0]" />
                </div>

                {/* Editorial Data Highlights (Stats with Accent Yellow / Navy) */}
                <div className="grid grid-cols-2 gap-3.5 my-5">
                  <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0]">
                    <div className="text-2xl font-serif font-bold text-[#03357E]">2008</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      Tahun Operasional
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0]">
                    <div className="text-2xl font-serif font-bold text-[#03357E]">13+</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      Angkatan Alumni
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0]">
                    <div className="text-2xl font-serif font-bold text-[#03357E]">1.500+</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      Lulusan Terbaik
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0]">
                    <div className="text-2xl font-serif font-bold text-[#03357E]">±500</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                      Siswa Aktif
                    </div>
                  </div>
                </div>

                {/* Self-Service Card in Hero */}
                <div className="bg-[#F5F8FC] p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1">
                    <h4 className="font-serif italic text-base text-[#03357E]">Layanan SPMB Mandiri</h4>
                    <span className="text-[10px] bg-[#FFBE00]/20 text-[#03357E] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border border-[#FFBE00]/40">
                      TP 2027/2028
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="#cek-jadwal"
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#E2E8F0] hover:border-[#03357E]/40 hover:bg-[#EBF2FA] transition-all text-xs"
                    >
                      <span className="font-medium text-[#0F172A]">Jadwal Ujian</span>
                      <span className="text-[10px] text-[#03357E] font-bold">Input No →</span>
                    </a>
                    <a
                      href="#cek-pengumuman"
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#E2E8F0] hover:border-[#03357E]/40 hover:bg-[#EBF2FA] transition-all text-xs"
                    >
                      <span className="font-medium text-[#0F172A]">Pengumuman</span>
                      <span className="text-[10px] text-[#03357E] font-bold">Hasil Seleksi →</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
