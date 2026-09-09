'use client';

import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import DashboardOverview from '@/components/admin/DashboardOverview';
import RegistrantManagement from '@/components/admin/RegistrantManagement';
import ExamSessionManagement from '@/components/admin/ExamSessionManagement';
import ExamMappingManagement from '@/components/admin/ExamMappingManagement';
import RoomManagement from '@/components/admin/RoomManagement';
import AnnouncementManagement from '@/components/admin/AnnouncementManagement';
import SettingsManagement from '@/components/admin/SettingsManagement';
import { AdminAuth, AdminUser } from '@/lib/auth';
import { Menu, ShieldCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    AdminAuth.getSession().then((u) => {
      setCurrentUser(u);
      setAuthChecked(true);
    });
  }, []);

  const handleLoginSuccess = (user: AdminUser) => setCurrentUser(user);
  const handleLogout = async () => {
    await AdminAuth.logout();
    setCurrentUser(null);
  };
  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#03357E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <AdminLogin onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex">
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        user={currentUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E2E8F0] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 rounded-lg text-[#334155] hover:bg-[#F5F8FC] lg:hidden cursor-pointer" aria-label="Buka Menu">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider">Sistem Informasi SPMB</span>
              <div className="font-serif font-bold text-sm text-[#03357E]">SD Bina Nusa • Arrafah Rajeg</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-[#03357E] bg-[#03357E]/10 px-3 py-1 rounded-full border border-[#03357E]/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#03357E]" />
              <span className="font-medium">Sesi Terautentikasi (Admin)</span>
            </div>
            <Link href="/" target="_blank" className="text-xs font-semibold text-[#03357E] hover:text-[#03357E] bg-[#F5F8FC] hover:bg-[#E2E8F0] border border-[#CBD5E1] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <span>Website Sekolah</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && <DashboardOverview onNavigateTab={(tab) => setCurrentTab(tab)} onRefresh={handleRefresh} />}
          {currentTab === 'registrants' && <RegistrantManagement onRefreshParent={handleRefresh} />}
          {currentTab === 'exams' && <ExamSessionManagement onRefreshParent={handleRefresh} />}
          {currentTab === 'mapping' && <ExamMappingManagement onRefreshParent={handleRefresh} />}
          {currentTab === 'rooms' && <RoomManagement onRefreshParent={handleRefresh} />}
          {currentTab === 'announcements' && <AnnouncementManagement onRefreshParent={handleRefresh} />}
          {currentTab === 'settings' && <SettingsManagement onRefreshParent={handleRefresh} />}
        </main>
        <footer className="p-4 sm:px-8 border-t border-[#E2E8F0] bg-white text-center sm:text-left text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} SD Bina Nusa • Portal Resmi SPMB TP 2027/2028</div>
          <div className="font-mono text-[11px] text-[#64748B]">Versi Sistem: 1.0 (Baseline Production)</div>
        </footer>
      </div>
    </div>
  );
}
