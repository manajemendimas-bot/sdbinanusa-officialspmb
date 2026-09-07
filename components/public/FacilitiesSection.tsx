'use client';

import React from 'react';
import { 
  Airplay, 
  Building, 
  Car, 
  ShieldCheck, 
  Sparkles, 
  Trees, 
  Check, 
  Maximize2 
} from 'lucide-react';

export default function FacilitiesSection() {
  const facilities = [
    {
      name: 'Ruang Kelas Ber-AC',
      desc: 'Setiap ruang kelas dilengkapi pendingin udara (AC), pencahayaan alami memadai, sirkulasi udara baik, serta proyektor dan papan tulis interaktif untuk kenyamanan belajar optimal.',
      spec: 'Kapasitas 25 Siswa / Kelas',
      highlight: 'Kondusif & Sejuk',
    },
    {
      name: 'Lapangan Olahraga Luas',
      desc: 'Area lapangan outdoor serbaguna untuk kegiatan upacara bendera, olahraga futsal, bulutangkis, bola voli, senam pagi, dan latihan rutin bela diri.',
      spec: 'Multi-Court Standar Sekolah Dasar',
      highlight: 'Aman & Terawat',
    },
    {
      name: 'Gedung Aula Serbaguna',
      desc: 'Gedung pertemuan representatif untuk pembiasaan Sholat Dhuha bersama, pentas seni, wisuda tahfidz, seminar parenting, dan pertemuan wali murid.',
      spec: 'Kapasitas 200+ Orang',
      highlight: 'Serbaguna & Luas',
    },
    {
      name: 'Area Parkir Luas & Tertata',
      desc: 'Area parkir kendaraan roda dua dan roda empat yang luas dan tertata rapi di dalam kompleks sekolah, memudahkan proses antar-jemput peserta didik.',
      spec: 'Akses Satu Pintu (One Gate)',
      highlight: 'Tertib & Aman',
    },
  ];

  return (
    <section id="fasilitas" className="py-16 sm:py-24 bg-[#F5F8FC] border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#1F4590] uppercase mb-3">
            <span className="w-8 h-[2px] bg-[#FFBE00]"></span>
            <span>Sarana & Prasarana</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F172A] tracking-tight">
            Fasilitas Penunjang Pembelajaran yang Aman & Representatif
          </h2>
          <p className="mt-4 text-base text-[#475569] leading-relaxed font-sans">
            SD Bina Nusa menyediakan infrastruktur fisik yang dirancang khusus untuk memastikan rasa aman, kenyamanan, dan keleluasaan gerak anak dalam mengeksplorasi ilmu dan kreativitas.
          </p>
        </div>

        {/* 4 Primary Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#1F4590]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E8F0]">
                  <span className="text-xs font-mono font-bold text-[#03357E] bg-[#03357E]/10 px-2.5 py-1 rounded-full">
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-[#03357E] bg-[#F5F8FC] border border-[#E2E8F0] px-3 py-0.5 rounded-full">
                    {fac.highlight}
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-[#0F172A] mb-3">
                  {fac.name}
                </h3>
                
                <p className="text-sm text-[#64748B] leading-relaxed mb-6 font-sans">
                  {fac.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-medium text-[#0F172A]">Spesifikasi:</span>
                <span className="font-semibold text-[#03357E]">{fac.spec}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Environment & Security Assurance */}
        <div className="mt-10 p-5 rounded-2xl bg-white border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="flex items-center gap-3 text-[#0F172A]">
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#03357E]" />
            <span>
              <strong>Keamanan & Kenyamanan Terjamin:</strong> Pengawasan lingkungan ramah anak, gerbang terkontrol, dan kebersihan sarana sanitasi teratur.
            </span>
          </div>
          <div className="shrink-0 font-bold uppercase tracking-wider text-[11px] text-[#03357E] bg-[#03357E]/10 px-3.5 py-1.5 rounded-full border border-[#03357E]/20">
            Kampus Bina Nusa Rajeg
          </div>
        </div>

      </div>
    </section>
  );
}
