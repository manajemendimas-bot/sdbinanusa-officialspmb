'use client';

const IMAGES = [
  { src: '/galeri-tampak-depan.jpeg', title: 'Tampak Depan Sekolah', desc: 'Gerbang & fasad utama SD Bina Nusa Islamic School, Rajeg.' },
  { src: '/galeri-gedung-lokal-kelas.jpeg', title: 'Gedung Lokal Kelas', desc: 'Ruang kelas ber-AC, terang, sirkulasi udara baik.' },
  { src: '/galeri-gedung-lokal-kelas-2.jpeg', title: 'Gedung Lokal Kelas 2', desc: 'Bangunan kelas tambahan — kapasitas 25 siswa/kelas.' },
  { src: '/galeri-koridor-kelas.jpeg', title: 'Koridor Kelas', desc: 'Koridor bersih & tertata, akses antar ruang belajar.' },
  { src: '/galeri-gedung-serbaguna.jpeg', title: 'Gedung Serbaguna (Aula)', desc: 'Aula 200+ orang — Sholat Dhuha, pentas seni, wisuda tahfidz.' },
];

export default function GallerySection() {
  return (
    <section id="galeri" className="py-16 sm:py-24 bg-white border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#1F4590] uppercase mb-3">
            <span className="w-8 h-[2px] bg-[#FFBE00]"></span>
            <span>Galeri Sekolah</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0F172A] tracking-tight">Lingkungan Belajar Nyata SD Bina Nusa</h2>
          <p className="mt-3 text-sm text-[#475569] leading-relaxed">Foto asli gedung, kelas, koridor, dan aula — dokumentasi kampus Bina Nusa Rajeg.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {IMAGES.map((img) => (
            <figure key={img.src} className="group overflow-hidden rounded-2xl bg-[#F5F8FC] border border-[#E2E8F0] shadow-2xs">
              <div className="aspect-[4/3] overflow-hidden bg-[#E2E8F0]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" />
              </div>
              <figcaption className="p-4">
                <div className="font-semibold text-sm text-[#0F172A]">{img.title}</div>
                <div className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{img.desc}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
