'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Menu, 
  X, 
  Search, 
  Award, 
  Calendar, 
  FileText, 
  Shield, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  onOpenRegister: () => void;
  onNavigateToCheckSchedule?: () => void;
  onNavigateToCheckAnnouncement?: () => void;
}

export default function Header({ 
  onOpenRegister, 
  onNavigateToCheckSchedule, 
  onNavigateToCheckAnnouncement 
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Tentang Sekolah', href: '#tentang' },
    { label: 'Pendidikan', href: '#pendidikan' },
    { label: 'Ekstrakurikuler', href: '#ekstrakurikuler' },
    { label: 'Fasilitas', href: '#fasilitas' },
    { label: 'Galeri', href: '#galeri' },
    { label: 'Biaya & Info SPMB', href: '#spmb-info' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      {/* Top Banner for Academic Year & Official Tag */}
      <div className="bg-[#03357E] text-white px-4 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#FFBE00] animate-pulse"></span>
            <span className="tracking-wide">Penerimaan Siswa Baru (SPMB) Tahun Pelajaran 2027/2028 Telah Dibuka</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/80">
            <span>Yayasan Pendidikan Arrafah Rajeg</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Rajeg, Kab. Tangerang</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & School Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-bina-nusa.jpeg" alt="Logo SD Bina Nusa" className="w-10 h-10 rounded-lg object-cover shadow-xs transition-transform group-hover:scale-105 border border-[#E2E8F0]" />
            <div className="flex flex-col">
              <span className="font-serif italic text-lg leading-none text-[#03357E]">
                SD Bina Nusa
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#64748B] mt-1 font-semibold">
                Official School Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide text-[#334155]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#03357E] transition-colors py-1 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#03357E] transition-all duration-200 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Quick Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Check Button */}
            <a
              href="#cek-layanan"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#03357E] bg-[#F5F8FC] hover:bg-[#EBF2FA] rounded-xl transition-colors border border-[#CBD5E1]"
            >
              <Search className="w-3.5 h-3.5 text-[#03357E]" />
              <span>Cek Jadwal / Hasil</span>
            </a>

            {/* Primary CTA (Accent Yellow #FFBE00) */}
            <button
              onClick={onOpenRegister}
              id="btn-header-register"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-full shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#03357E]" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={onOpenRegister}
              className="sm:hidden px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#03357E] bg-[#FFBE00] rounded-full"
            >
              Daftar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#0F172A] hover:text-[#03357E] hover:bg-[#F5F8FC] rounded-xl transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-[#334155] hover:bg-[#F5F8FC] hover:text-[#03357E] rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#cek-jadwal"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#03357E] bg-[#F5F8FC] rounded-xl"
            >
              🔍 Cek Jadwal Ujian
            </a>
            <a
              href="#cek-pengumuman"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-[#03357E] bg-[#F5F8FC] rounded-xl"
            >
              📜 Cek Pengumuman Kelulusan
            </a>
          </nav>

          <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegister();
              }}
              className="w-full py-3 text-center text-xs font-bold uppercase tracking-widest text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] rounded-full"
            >
              Daftar Sekarang (SPMB 2027/2028)
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2 text-center text-xs font-semibold text-[#64748B] hover:text-[#03357E]"
            >
              Login Petugas Admin SPMB →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
