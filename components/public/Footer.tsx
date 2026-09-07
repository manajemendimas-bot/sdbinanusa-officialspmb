'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  Lock, 
  ArrowUp,
  Heart
} from 'lucide-react';

interface FooterProps {
  onOpenRegister: () => void;
}

export default function Footer({ onOpenRegister }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#03357E] text-white pt-16 pb-12 border-t border-[#1F4590]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#1F4590]">
          
          {/* Col 1: School Identity (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-bina-nusa.jpeg" alt="Logo SD Bina Nusa" className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-xs bg-white" />
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  SD BINA NUSA
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#FFBE00] font-sans font-semibold">
                  Yayasan Pendidikan Arrafah Rajeg
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-md font-sans">
              Mendidik generasi cerdas, berkarakter Qur&apos;ani, berakhlak mulia, dan berprestasi sejak tahun 2008 dengan integrasi kurikulum terpadu dan pembiasaan ibadah harian.
            </p>

            <div className="pt-2 text-xs text-white/75 space-y-2 font-sans">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFBE00] shrink-0 mt-0.5" />
                <span>
                  Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FFBE00] shrink-0" />
                <span>0812-8900-2008 / (021) 5937-2008</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FFBE00] shrink-0" />
                <span>info@binanusa.sch.id</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-white text-base">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs text-white/80 font-sans">
              <li>
                <a href="#tentang" className="hover:text-[#FFBE00] transition-colors">
                  Tentang SD Bina Nusa
                </a>
              </li>
              <li>
                <a href="#pendidikan" className="hover:text-[#FFBE00] transition-colors">
                  Kurikulum & Pembiasaan Islami
                </a>
              </li>
              <li>
                <a href="#ekstrakurikuler" className="hover:text-[#FFBE00] transition-colors">
                  Kegiatan Ekstrakurikuler
                </a>
              </li>
              <li>
                <a href="#fasilitas" className="hover:text-[#FFBE00] transition-colors">
                  Fasilitas & Sarana Prasarana
                </a>
              </li>
              <li>
                <a href="#spmb-info" className="hover:text-[#FFBE00] transition-colors">
                  Informasi & Biaya SPMB 2027/2028
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan SPMB (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="font-serif font-bold text-white text-base">
              Layanan Penerimaan Murid Baru
            </h4>
            <p className="text-xs text-white/80 font-sans">
              Pendaftaran Tahun Pelajaran 2027/2028 dibuka melalui Gelombang Inden, Reguler 1, dan Reguler 2.
            </p>

            <div className="flex flex-col gap-2 pt-1 font-sans">
              <button
                onClick={onOpenRegister}
                className="w-full py-2.5 px-4 rounded-full text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-colors text-center cursor-pointer shadow-xs"
              >
                Formulir Pendaftaran Online
              </button>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="#cek-jadwal"
                  className="py-2 px-3 rounded-full text-xs font-semibold text-center text-white bg-[#1F4590] hover:bg-[#183773] border border-white/20 transition-colors"
                >
                  Cek Jadwal Ujian
                </a>
                <a
                  href="#cek-pengumuman"
                  className="py-2 px-3 rounded-full text-xs font-semibold text-center text-white bg-[#1F4590] hover:bg-[#183773] border border-white/20 transition-colors"
                >
                  Cek Pengumuman
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70 font-sans">
          <div>
            © {new Date().getFullYear()} SD Bina Nusa • Yayasan Pendidikan Arrafah Rajeg. Hak Cipta Dilindungi.
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-[#FFBE00] transition-colors bg-[#1F4590] px-3.5 py-1.5 rounded-full border border-white/20"
            >
              <Lock className="w-3 h-3" />
              <span>Portal Admin SPMB</span>
            </Link>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-[#1F4590] text-white hover:bg-[#183773] border border-white/20 transition-colors cursor-pointer"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
