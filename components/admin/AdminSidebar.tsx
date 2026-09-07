'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Network, 
  DoorOpen, 
  Bell, 
  Settings, 
  LogOut, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { AdminUser } from '@/lib/auth';

export type AdminTab = 
  | 'dashboard'
  | 'registrants'
  | 'exams'
  | 'mapping'
  | 'rooms'
  | 'announcements'
  | 'settings';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  user: AdminUser;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  currentTab,
  onSelectTab,
  user,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const menuItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'registrants', label: 'Data Pendaftar', icon: Users },
    { id: 'exams', label: 'Jadwal Ujian', icon: Calendar },
    { id: 'mapping', label: 'Pemetaan Peserta', icon: Network },
    { id: 'rooms', label: 'Master Ruangan', icon: DoorOpen },
    { id: 'announcements', label: 'Hasil Pengumuman', icon: Bell },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#03357E] text-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-[#1F4590] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-bina-nusa.jpeg" alt="Logo SD Bina Nusa" className="w-9 h-9 rounded-lg object-cover border border-white/10 shadow-xs" />
              <div>
                <span className="font-serif text-base font-bold tracking-tight text-white block leading-tight">
                  SD BINA NUSA
                </span>
                <span className="text-[10px] font-mono text-[#FFBE00] tracking-wider uppercase font-semibold">
                  SPMB 2027/2028
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Mini Banner */}
          <div className="px-5 py-3.5 bg-[#1F4590]/70 border-b border-[#1F4590] flex items-center justify-between">
            <div className="text-xs">
              <div className="font-semibold text-white truncate max-w-[150px]">
                {user.name}
              </div>
              <div className="text-[10px] text-white/80 font-mono">
                {user.role} • Admin
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBE00]"></span>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#FFBE00] text-[#03357E] shadow-xs font-bold'
                      : 'text-white/80 hover:bg-[#1F4590] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#03357E]' : 'text-white/80'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#03357E]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#1F4590] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white/90 hover:text-white hover:bg-[#1F4590] transition-colors border border-white/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Website Publik</span>
          </Link>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-200 hover:text-white hover:bg-rose-900/50 transition-colors cursor-pointer border border-rose-800/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
