'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/public/Header';
import Hero from '@/components/public/Hero';
import AboutSection from '@/components/public/AboutSection';
import ProgramsSection from '@/components/public/ProgramsSection';
import ExtracurricularSection from '@/components/public/ExtracurricularSection';
import FacilitiesSection from '@/components/public/FacilitiesSection';
import GallerySection from '@/components/public/GallerySection';
import SpmbInfoSection from '@/components/public/SpmbInfoSection';
import ScheduleCheckSection from '@/components/public/ScheduleCheckSection';
import AnnouncementCheckSection from '@/components/public/AnnouncementCheckSection';
import Footer from '@/components/public/Footer';
import RegistrationModal from '@/components/public/RegistrationModal';
import { SchoolDatabase } from '@/lib/db';
import { ArrowRight, Sparkles, Phone, FileCheck, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedRegNumberForLookup, setSelectedRegNumberForLookup] = useState<string>('');

  useEffect(() => {
    SchoolDatabase.init();
  }, []);

  const handleOpenRegister = () => {
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  const handleCheckScheduleFromRegistration = (regNum: string) => {
    setSelectedRegNumberForLookup(regNum);
    const scheduleEl = document.getElementById('cek-jadwal');
    if (scheduleEl) {
      scheduleEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC]">
      {/* Official School Header */}
      <Header 
        onOpenRegister={handleOpenRegister} 
      />

      {/* Hero Section */}
      <Hero 
        onOpenRegister={handleOpenRegister} 
      />

      {/* About Section (Tentang SD Bina Nusa & Sejarah) */}
      <AboutSection />

      {/* Programs & Islamic Habituation Section */}
      <ProgramsSection />

      {/* Extracurricular Activities */}
      <ExtracurricularSection />

      {/* Facilities & Campus Environment */}
      <FacilitiesSection />

      {/* Galeri Sekolah — foto asli */}
      <GallerySection />

      {/* SPMB 2027/2028 Information & Cost Breakdown */}
      <SpmbInfoSection 
        onOpenRegister={handleOpenRegister} 
      />

      {/* Public Self-Service Section Anchor */}
      <div id="cek-layanan" className="scroll-mt-24">
        {/* Schedule Check Section */}
        <ScheduleCheckSection 
          prefilledRegNumber={selectedRegNumberForLookup} 
        />

        {/* Announcement Check Section */}
        <AnnouncementCheckSection 
          prefilledRegNumber={selectedRegNumberForLookup} 
        />
      </div>

      {/* Final Closing Call to Action */}
      <section className="py-16 sm:py-20 bg-[#03357E] text-white border-b border-[#02285E] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F4590] border border-[#2A57AB] text-[#FFBE00] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PENERIMAAN MURID BARU 2027/2028</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-3xl mx-auto">
            Mari Bergabung Bersama Keluarga Besar SD Bina Nusa
          </h2>

          <p className="text-sm sm:text-base text-[#D0E0FC] max-w-2xl mx-auto leading-relaxed">
            Berikan fondasi terbaik bagi masa depan buah hati Anda dengan pendidikan berkarakter Qur&apos;ani, berakhlak mulia, dan berwawasan luas.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleOpenRegister}
              id="btn-cta-bottom-register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>DAFTAR SEKARANG</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/6281289002008"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg text-sm font-semibold text-white bg-[#1F4590] hover:bg-[#163570] border border-[#2A57AB] transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#FFBE00]" />
              <span>Konsultasi Panitia via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <Footer 
        onOpenRegister={handleOpenRegister} 
      />

      {/* Registration Modal Dialog */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={handleCloseRegister}
        onCheckSchedule={handleCheckScheduleFromRegistration}
      />
    </div>
  );
}
