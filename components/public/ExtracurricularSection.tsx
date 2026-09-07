'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Compass, 
  Music, 
  Activity, 
  Target, 
  Zap, 
  Globe2, 
  Award,
  Sparkles
} from 'lucide-react';

export default function ExtracurricularSection() {
  const extracurriculars = [
    {
      name: 'Pencak Silat',
      category: 'Bela Diri Tradisional',
      desc: 'Melatih ketangkasan fisik, jurus seni bela diri nusantara, kedisiplinan mental, dan pertahanan diri santun.',
      focus: 'Karakter & Fisik',
    },
    {
      name: 'Taekwondo',
      category: 'Bela Diri Prestasi',
      desc: 'Pengembangan teknik tendangan, fleksibilitas tubuh, kejuaraan antarsekolah, dan tingkatan sabuk resmi.',
      focus: 'Sportivitas',
    },
    {
      name: 'Pramuka',
      category: 'Kepanduan Wajib',
      desc: 'Menanamkan jiwa kepemimpinan, kemandirian berkemah, kebersamaan regu, dan kecintaan pada tanah air.',
      focus: 'Kepemimpinan',
    },
    {
      name: 'Drumband',
      category: 'Seni Musik & Harmoni',
      desc: 'Melatih ritme musikalitas, kekompakan baris-berbaris tim, dan sering tampil pada upacara & pawai resmi.',
      focus: 'Kerjasama Tim',
    },
    {
      name: 'Bulutangkis',
      category: 'Olahraga Raket',
      desc: 'Pembinaan teknik dasar servis, smash, footwork, serta stamina dan kelincahan motorik siswa.',
      focus: 'Ketangkasan',
    },
    {
      name: 'Futsal',
      category: 'Olahraga Bola',
      desc: 'Strategi operan, kontrol bola, kerjasama tim di lapangan, dan turnamen persahabatan antar-sekolah.',
      focus: 'Sportivitas',
    },
    {
      name: 'Voli',
      category: 'Olahraga Beregu',
      desc: 'Pelatihan passing atas-bawah, servis, komunikasi antar-pemain, dan koordinasi fisik motorik.',
      focus: 'Kekompakan',
    },
    {
      name: 'Atletik',
      category: 'Kebugaran & Lari',
      desc: 'Lari jarak pendek, lompat jauh, ketahanan stamina, dan pondasi dasar kebugaran atletik anak.',
      focus: 'Stamina',
    },
    {
      name: 'English Club',
      category: 'Bahasa & Komunikasi',
      desc: 'Conversation harian menyenangkan, story telling, vocabulary building, dan percaya diri berbahasa internasional.',
      focus: 'Wawasan Global',
    },
  ];

  return (
    <section id="ekstrakurikuler" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#1F4590] uppercase mb-3">
              <span className="w-8 h-[2px] bg-[#FFBE00]"></span>
              <span>Aktivitas & Bakat</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F172A] tracking-tight">
              Eksplorasi Minat, Bakat, & Kepemimpinan
            </h2>
            <p className="mt-3 text-base text-[#475569] font-sans">
              Setiap anak memiliki potensi unik. Kegiatan ekstrakurikuler SD Bina Nusa dirancang untuk menyalurkan bakat olahraga, seni, kepanduan, dan bahasa dalam wadah yang terarah.
            </p>
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#03357E] bg-[#03357E]/10 px-4 py-2.5 rounded-full border border-[#03357E]/20 w-fit">
            9 Program Pilihan Aktif
          </div>
        </div>

        {/* Editorial Grid of Extracurriculars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {extracurriculars.map((item) => (
            <div
              key={item.name}
              className="p-5 sm:p-6 rounded-2xl bg-[#F5F8FC] border border-[#E2E8F0] hover:border-[#1F4590]/40 hover:bg-white transition-all duration-200 hover:-translate-y-0.5 group shadow-2xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <span className="text-[11px] font-bold text-[#03357E] tracking-wider uppercase">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white text-[#64748B] border border-[#E2E8F0]">
                  {item.focus}
                </span>
              </div>

              <div className="pt-4">
                <h3 className="font-serif text-xl font-bold text-[#0F172A] group-hover:text-[#03357E] transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed mt-2 font-sans">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
