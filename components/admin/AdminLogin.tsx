'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft, 
  AlertCircle,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import { AdminAuth, AdminUser } from '@/lib/auth';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('admin@binanusa.sch.id');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = AdminAuth.login(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Login gagal. Periksa kembali email dan password.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleFillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Back to Public Web */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#03357E] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Website Resmi SD Bina Nusa</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center">
          <img src="/logo-bina-nusa.jpeg" alt="Logo SD Bina Nusa" className="w-14 h-14 rounded-xl object-cover mx-auto shadow-md border border-[#1F4590]" />
          <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-[#03357E]">
            Portal Panitia SPMB
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            SD Bina Nusa • Tahun Pelajaran 2027/2028
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 sm:px-8 shadow-md rounded-2xl border border-[#E2E8F0]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@binanusa.sch.id"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-sm bg-[#F5F8FC] border border-[#CBD5E1] focus:outline-hidden focus:ring-2 focus:ring-[#03357E] text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-sm bg-[#F5F8FC] border border-[#CBD5E1] focus:outline-hidden focus:ring-2 focus:ring-[#03357E] text-[#0F172A]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#03357E] border-t-transparent rounded-full animate-spin"></span>
                    <span>Memverifikasi Akses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-[#F1F0EA] text-xs">
            <div className="flex items-center gap-1.5 text-[#03357E] font-bold mb-2">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Akun Default Panitia:</span>
            </div>
            <div className="bg-[#F5F8FC] p-3 rounded-lg border border-[#E2E8F0] space-y-1.5 font-mono text-[11px] text-[#475569]">
              <div className="flex justify-between">
                <span>Email:</span>
                <strong className="text-[#03357E]">admin@binanusa.sch.id</strong>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <strong className="text-[#03357E]">admin123</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFillCredentials('admin@binanusa.sch.id', 'admin123')}
              className="mt-2 text-[11px] text-[#03357E] hover:underline font-semibold w-full text-center cursor-pointer"
            >
              Gunakan Akun Ini Otomatis
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-xs text-[#64748B] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#03357E]" />
          <span>Sistem Terenkripsi & Terproteksi Khusus Panitia SPMB SD Bina Nusa</span>
        </div>
      </div>
    </div>
  );
}
