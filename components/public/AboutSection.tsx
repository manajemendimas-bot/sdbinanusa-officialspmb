'use client';

import React from 'react';
import { 
  Building2, 
  History, 
  MapPin, 
  GraduationCap, 
  Users, 
  Award, 
  BookOpenCheck,
  Compass,
  HeartHandshake
} from 'lucide-react';

export default function AboutSection() {
  const stats = [
    { number: '2008', label: 'Tahun Operasional', desc: 'Memulai perjalanan dengan 5 guru & 20 siswa' },
    { number: '13+', label: 'Angkatan Alumni', desc: 'Meluluskan generasi berkarakter dan berprestasi' },
    { number: '1.500+', label: 'Total Alumni', desc: 'Melanjutkan ke jenjang pendidikan lanjutan unggulan' },
    { number: '±500', label: 'Siswa Aktif', desc: 'Mendapat bimbingan pembelajaran komprehensif' },
  ];

  const milestones = [
    {
      year: '2005',
      title: 'Pendirian Yayasan Pendidikan Arrafah Rajeg',
      description: 'Langkah awal pembentukan yayasan berorientasi pendidikan Islam yang kuat di wilayah Rajeg, Tangerang.',
    },
    {
      year: '2008',
      title: 'Peresmian & Operasional SD Bina Nusa',
      description: 'Dimulai dengan dedikasi 5 orang guru dan 20 murid perdana dengan semangat mewujudkan pendidikan berkualitas.',
    },
    {
      year: 'Berkembang',
      title: 'Perluasan Fasilitas & Jenjang Lanjutan',
      description: 'Pengembangan gedung permanen, sarana ber-AC, aula, lapangan luas, dan ekspansi ke jenjang SMP.',
    },
    {
      year: '2027/2028',
      title: 'Menuju Generasi Bina Nusa Berkarakter Qur\'ani',
      description: 'Terus mengukuhkan peran sebagai institusi dasar pilihan utama keluarga di Kabupaten Tangerang.',
    },
  ];

  return (
    <section id="tentang" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#1F4590] uppercase mb-3">
            <span className="w-8 h-[2px] bg-[#FFBE00]"></span>
            <span>Profil Institusi</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F172A] tracking-tight">
            Membangun Fondasi Karakter & Intelektual Sejak 2008
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#475569] leading-relaxed font-sans">
            SD Bina Nusa didirikan di bawah naungan <strong>Yayasan Pendidikan Arrafah Rajeg</strong> (berdiri sejak 2005) dengan komitmen tulus mendampingi masa tumbuh kembang anak secara seimbang antara ilmu pengetahuan umum dan akhlak Islam.
          </p>
        </div>

        {/* Narrative & Institutional Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Narrative Article Layout */}
          <div className="lg:col-span-7 space-y-6 text-[#334155] leading-relaxed text-sm sm:text-base">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#F5F8FC] border border-[#E2E8F0] space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#03357E] flex items-center gap-2.5">
                <History className="w-5 h-5 text-[#03357E]" />
                Perjalanan & Dedikasi Sekolah
              </h3>
              <p>
                Perjalanan SD Bina Nusa dimulai pada tahun <strong>2008</strong> dari sebuah ikhtiar sederhana: 5 tenaga pendidik penuh dedikasi dan 20 murid angkatan pertama. Dengan kepercayaan orang tua serta komitmen yayasan, sekolah ini terus bertumbuh secara konsisten dan sehat.
              </p>
              <p>
                Kini, SD Bina Nusa mendidik <strong>hampir 500 siswa aktif</strong> dan telah meluluskan <strong>hampir 1.500 alumni</strong> dalam <strong>13 angkatan</strong>. Seiring berjalannya waktu, Yayasan Pendidikan Arrafah Rajeg juga telah memperluas layanan pendidikan hingga ke jenjang Sekolah Menengah Pertama (SMP) untuk memastikan kesinambungan pembinaan karakter peserta didik.
              </p>
            </div>

            {/* Core Values / Nilai Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-[#03357E]/10 text-[#03357E] flex items-center justify-center font-bold mb-3">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-[#0F172A] text-base mb-1">
                  Karakter Qur&apos;ani & Disiplin
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Integrasi harian Tahfidz, BTQ, serta pembiasaan Sholat Dhuha dan Dzuhur berjamaah membentuk kepribadian yang luhur.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#E2E8F0] bg-white shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-[#03357E]/10 text-[#03357E] flex items-center justify-center font-bold mb-3">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-[#0F172A] text-base mb-1">
                  Kemitraan Guru & Orang Tua
                </h4>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Lingkungan belajar yang hangat, ramah anak, dan terbuka menjamin pendampingan yang personal bagi setiap potensi siswa.
                </p>
              </div>
            </div>

            {/* Official School Location */}
            <div className="p-4 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] flex items-start gap-3.5">
              <MapPin className="w-5 h-5 text-[#03357E] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#03357E] block mb-0.5">Lokasi Kampus Resmi:</span>
                <span className="text-[#475569]">
                  Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540
                </span>
              </div>
            </div>
          </div>

          {/* Right: Milestone Timeline & Real Statistics */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((item) => (
                <div 
                  key={item.label}
                  className="p-5 rounded-xl bg-[#F5F8FC] border border-[#E2E8F0] hover:border-[#1F4590]/40 transition-colors"
                >
                  <div className="font-serif text-3xl font-bold text-[#03357E]">
                    {item.number}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mt-1">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-1 leading-snug">
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Milestones Card */}
            <div className="p-6 rounded-2xl bg-[#03357E] text-white border border-[#1F4590] shadow-sm">
              <h4 className="font-serif text-lg font-bold text-white mb-4 pb-3 border-b border-white/20 flex items-center justify-between">
                <span>Tonggak Sejarah Sekolah</span>
                <Compass className="w-4 h-4 text-[#FFBE00]" />
              </h4>

              <div className="space-y-4">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <span className="font-mono font-bold text-[#FFBE00] bg-[#1F4590] px-2 py-0.5 rounded shrink-0 h-fit">
                      {m.year}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{m.title}</div>
                      <div className="text-white/80 text-[11px] mt-0.5 leading-relaxed">
                        {m.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
