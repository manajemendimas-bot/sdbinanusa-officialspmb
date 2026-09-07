'use client';

import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  SunMedium, 
  Clock, 
  Languages, 
  Scroll, 
  Heart, 
  CheckCircle2,
  Bookmark
} from 'lucide-react';

export default function ProgramsSection() {
  const religiousPrograms = [
    {
      title: 'Tahfidz & BTQ',
      subtitle: 'Baca Tulis Al-Qur\'an & Hafalan Terarah',
      desc: 'Program bimbingan tahfidz juz 30 dan pembelajaran kaidah tajwid secara terstruktur sejak kelas 1.',
      icon: BookOpen,
      tag: 'Program Utama',
    },
    {
      title: 'Aqidah & Akhlak',
      subtitle: 'Penanaman Adab & Budi Pekerti',
      desc: 'Membentuk santun berbahasa, menghormati orang tua dan guru, serta kepribadian berintegritas.',
      icon: Heart,
      tag: 'Karakter',
    },
    {
      title: 'Al-Qur\'an & Hadist',
      subtitle: 'Pemahaman Makna Dasar & Asas Nilai',
      desc: 'Mengenalkan ayat dan hadist pilihan yang aplikatif dalam kehidupan sehari-hari anak.',
      icon: Bookmark,
      tag: 'Dasar Ilmu',
    },
    {
      title: 'Bahasa Arab',
      subtitle: 'Pengenalan Kosakata & Percakapan Harian',
      desc: 'Membiasakan mufradat dasar, angka, dan kalimat sederhana dengan metode interaktif ceria.',
      icon: Languages,
      tag: 'Bahasa',
    },
    {
      title: 'Fiqh Ibadah',
      subtitle: 'Praktik Bersuci & Tata Cara Sholat',
      desc: 'Pengajaran thaharah, wudhu sempurna, rukun sholat, dan adab ibadah praktis.',
      icon: Scroll,
      tag: 'Praktik Ibadah',
    },
    {
      title: 'Sejarah Kebudayaan Islam (SKI)',
      subtitle: 'Keteladanan Rasulullah & Para Sahabat',
      desc: 'Meneladani kisah perjuangan para nabi dan pahlawan Islam untuk memupuk kecintaan pada sejarah.',
      icon: Sparkles,
      tag: 'Keteladanan',
    },
  ];

  const dailyRoutines = [
    {
      time: 'Pagi Hari (07.00 - 07.30)',
      name: 'Pembiasaan Sholat Dhuha Berjamaah',
      desc: 'Dilaksanakan di aula/musholla sekolah secara teratur untuk melatih kedisiplinan dan keberkahan mengawali hari.',
      icon: SunMedium,
    },
    {
      time: 'Siang Hari (12.00 - 12.45)',
      name: 'Pembiasaan Sholat Dzuhur Berjamaah',
      desc: 'Kultum singkat, adzan bergilir oleh siswa, dan sholat berjamaah bersama seluruh dewan guru.',
      icon: Clock,
    },
  ];

  return (
    <section id="pendidikan" className="py-16 sm:py-24 bg-[#F5F8FC] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#1F4590] uppercase mb-3">
            <span className="w-8 h-[2px] bg-[#FFBE00]"></span>
            <span>Kurikulum & Pembiasaan</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F172A] tracking-tight">
            Program Pendidikan Islami yang Holistik & Autentik
          </h2>
          <p className="mt-4 text-base text-[#475569] leading-relaxed font-sans">
            Kurikulum SD Bina Nusa mengintegrasikan standar kurikulum nasional dengan materi muatan lokal keislaman yang komprehensif, ditopang oleh pembiasaan ibadah harian.
          </p>
        </div>

        {/* 6 Core Curriculum Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {religiousPrograms.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#1F4590]/40 transition-all duration-200 shadow-2xs hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#03357E]/10 text-[#03357E] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F8FC] text-[#03357E] border border-[#E2E8F0]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#0F172A]">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-[#1F4590] mt-1 mb-3">
                    {item.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Spiritual Routines Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#03357E] text-white border border-[#1F4590] shadow-sm">
          <div className="max-w-3xl mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFBE00]">
              Pembiasaan Harian
            </span>
            <h3 className="font-serif text-2xl font-normal text-white mt-1">
              Rutinitas Ibadah Berjamaah Setiap Hari Sekolah
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mt-1 font-sans">
              Bukan sekadar teori di kelas, nilai-nilai ibadah langsung dipraktikkan bersama bimbingan guru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dailyRoutines.map((routine, idx) => {
              const Icon = routine.icon;
              return (
                <div 
                  key={idx}
                  className="p-5 rounded-xl bg-[#1F4590] border border-[#03357E] flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#03357E] text-white flex items-center justify-center shrink-0 border border-white/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-[#FFBE00] bg-[#03357E] px-2 py-0.5 rounded">
                      {routine.time}
                    </span>
                    <h4 className="font-serif font-bold text-white text-base mt-1.5 mb-1">
                      {routine.name}
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {routine.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
