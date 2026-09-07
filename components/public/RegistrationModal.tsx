'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Printer, 
  ArrowRight, 
  Sparkles, 
  User, 
  Phone, 
  Calendar, 
  School,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { SchoolDatabase } from '@/lib/db';
import { Registrant, Gender } from '@/lib/types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRegistered?: (registrant: Registrant) => void;
  onCheckSchedule?: (regNumber: string) => void;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  onSuccessRegistered,
  onCheckSchedule,
}: RegistrationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'Laki-laki' as Gender,
    birthDate: '',
    educationLevel: 'SD' as const,
    previousSchool: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<Registrant | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Nama lengkap calon peserta didik minimal 3 karakter.';
    }
    if (!formData.birthDate) {
      errs.birthDate = 'Tanggal lahir wajib diisi.';
    } else {
      const birth = new Date(formData.birthDate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
      if (age < 4 || age > 12) {
        errs.birthDate = 'Harap periksa tanggal lahir (usia calon peserta didik SD 5–8 tahun).';
      }
    }
    if (!formData.previousSchool.trim()) {
      errs.previousSchool = 'Asal sekolah (TK/RA/PAUD) wajib diisi.';
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    const digits = cleanPhone.replace(/^0+/, '');
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 15 || digits.length < 9) {
      errs.phone = 'Nomor telepon / WhatsApp harus berupa nomor valid (9–15 digit angka).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { registrant } = SchoolDatabase.registerNewStudent({
        full_name: formData.fullName,
        gender: formData.gender,
        birth_date: formData.birthDate,
        education_level: formData.educationLevel,
        previous_school: formData.previousSchool,
        phone: formData.phone,
      });

      setSuccessResult(registrant);
      if (onSuccessRegistered) {
        onSuccessRegistered(registrant);
      }
    } catch (err: any) {
      setErrors({ form: err.message || 'Terjadi kesalahan saat memproses pendaftaran.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRegNumber = () => {
    if (!successResult) return;
    navigator.clipboard.writeText(successResult.registration_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintSlip = () => {
    if (!successResult) return;
    const settings = SchoolDatabase.getSettings();
    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Bukti Pendaftaran - ${esc(successResult.registration_number)}</title><style>body{font-family:system-ui,sans-serif;color:#0F172A;padding:40px;max-width:640px;margin:0 auto}h1{color:#03357E;font-size:22px;margin:0}small{color:#64748B}.card{border:2px dashed #03357E;border-radius:16px;padding:24px;margin:20px 0;background:#F5F8FC;text-align:center}.num{font-family:monospace;font-size:28px;font-weight:800;color:#03357E;letter-spacing:2px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E2E8F0;font-size:13px}.label{color:#64748B}.foot{font-size:11px;color:#64748B;margin-top:16px;border-top:1px solid #E2E8F0;padding-top:12px}@media print{body{padding:20px}}</style></head><body>
      <div style="text-align:center;border-bottom:3px solid #03357E;padding-bottom:16px;margin-bottom:20px"><img src="${new URL('/logo-bina-nusa.jpeg', window.location.origin).href}" alt="Logo" style="width:48px;height:48px;object-fit:cover;border-radius:12px;display:inline-block"/><h1>SD Bina Nusa</h1><small>${esc(settings.foundation_name||'')} • ${esc(settings.school_address||'')}</small><br><small>SPMB TP ${esc(settings.academic_year||'')} • ${esc(settings.school_phone||'')}</small></div>
      <h2 style="text-align:center">Bukti Pendaftaran SPMB</h2>
      <div class="card"><div style="font-size:11px;color:#64748B;letter-spacing:1px">NOMOR REGISTRASI</div><div class="num">${esc(successResult.registration_number)}</div></div>
      <div class="row"><span class="label">Nama Lengkap</span><strong>${esc(successResult.full_name)}</strong></div>
      <div class="row"><span class="label">Jenis Kelamin</span><span>${esc(successResult.gender)}</span></div>
      <div class="row"><span class="label">Tanggal Lahir</span><span>${esc(successResult.birth_date)}</span></div>
      <div class="row"><span class="label">Asal Sekolah</span><span>${esc(successResult.previous_school)}</span></div>
      <div class="row"><span class="label">No. Telepon</span><span style="font-family:monospace">${esc(successResult.phone)}</span></div>
      <div class="row"><span class="label">Tanggal Daftar</span><span>${new Date(successResult.created_at).toLocaleString('id-ID')}</span></div>
      <div class="foot"><strong>Penting:</strong> Simpan nomor registrasi ini untuk cek jadwal ujian & pengumuman. Cetakan ini hanya untuk 1 pendaftar tersebut.</div>
      <div class="foot" style="text-align:right">Dicetak: ${new Date().toLocaleString('id-ID')}</div>
    </body></html>`;
    const w = window.open('', '_blank', 'width=720,height=800');
    if (!w) { window.print(); return; }
    w.document.open(); w.document.write(html); w.document.close();
    w.focus();
    // ponytail: isolated slip window — ceiling single record. Upgrade to PDF lib if need QR/barcode.
    setTimeout(() => w.print(), 300);
  };

  const handleResetAndClose = () => {
    setSuccessResult(null);
    setFormData({
      fullName: '',
      gender: 'Laki-laki',
      birthDate: '',
      educationLevel: 'SD',
      previousSchool: '',
      phone: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden relative text-[#0F172A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#03357E] text-white px-6 py-5 flex items-center justify-between border-b border-[#1F4590]">
          <div>
            <div className="text-[11px] font-mono tracking-wider text-[#FFBE00] uppercase font-bold">
              Formulir SPMB TP 2027/2028
            </div>
            <h3 className="font-serif text-xl font-bold text-white mt-0.5">
              {successResult ? 'Pendaftaran Selesai' : 'Pendaftaran Calon Peserta Didik'}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-[#1F4590] transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {successResult ? (
            /* SUCCESS STATE */
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#03357E]/10 text-[#03357E] mx-auto flex items-center justify-center border border-[#03357E]/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#03357E] tracking-[0.2em] uppercase bg-[#03357E]/10 px-3 py-1 rounded-full border border-[#03357E]/20">
                  PENDAFTARAN BERHASIL
                </span>
                <h4 className="font-serif text-2xl font-bold text-[#0F172A] mt-3">
                  Selamat, Berkas Telah Terdaftar!
                </h4>
                <p className="text-xs text-[#64748B] mt-1 font-sans">
                  Nomor Registrasi resmi telah diterbitkan secara otomatis oleh sistem SPMB SD Bina Nusa.
                </p>
              </div>

              {/* Registration Number Highlight Card */}
              <div className="p-5 rounded-2xl bg-[#F5F8FC] border-2 border-dashed border-[#03357E] text-center space-y-3">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider block">
                  Nomor Registrasi Anda:
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-bold text-[#03357E] tracking-wider select-all">
                  {successResult.registration_number}
                </div>
                
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleCopyRegNumber}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#03357E] bg-white border border-[#CBD5E1] hover:border-[#03357E] transition-colors shadow-2xs cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#03357E]" />
                        <span className="text-[#03357E] font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nomor</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handlePrintSlip}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] hover:bg-[#F5F8FC] transition-colors shadow-2xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Bukti</span>
                  </button>
                </div>
              </div>

              {/* Summary Details */}
              <div className="text-left bg-[#F5F8FC] p-4 rounded-2xl border border-[#E2E8F0] text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Nama Calon Murid:</span>
                  <span className="font-bold text-[#0F172A]">{successResult.full_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Jenis Kelamin:</span>
                  <span className="font-medium text-[#0F172A]">{successResult.gender}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Asal Sekolah:</span>
                  <span className="font-medium text-[#0F172A]">{successResult.previous_school}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#64748B]">No. Telepon:</span>
                  <span className="font-mono text-[#0F172A]">{successResult.phone}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#03357E]/10 border border-[#03357E]/20 text-xs text-[#03357E] leading-relaxed font-sans">
                <strong>Penting:</strong> Simpan nomor registrasi ini untuk mengecek jadwal ujian seleksi/observasi dan hasil pengumuman kelulusan.
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 font-sans">
                {onCheckSchedule && (
                  <button
                    onClick={() => {
                      onCheckSchedule(successResult.registration_number);
                      handleResetAndClose();
                    }}
                    className="flex-1 py-3 px-4 rounded-full text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Cek Jadwal Ujian Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleResetAndClose}
                  className="py-3 px-5 rounded-full text-xs font-semibold text-[#0F172A] bg-[#F5F8FC] hover:bg-[#E2E8F0] transition-colors border border-[#CBD5E1] cursor-pointer"
                >
                  Selesai & Tutup
                </button>
              </div>
            </div>
          ) : (
            /* FORM STATE */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Field: Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Nama Lengkap Calon Peserta Didik <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Fauzan Al-Ghifari"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F5F8FC] border focus:outline-hidden focus:ring-2 focus:ring-[#03357E] transition-colors text-[#0F172A] ${
                      errors.fullName ? 'border-red-400 bg-red-50/40' : 'border-[#CBD5E1]'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              {/* Field: Gender & Education Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F5F8FC] border border-[#CBD5E1] focus:outline-hidden focus:ring-2 focus:ring-[#03357E] text-[#0F172A]"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Jenjang Pendidikan
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Sekolah Dasar (SD Kelas 1)"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#E2E8F0] border border-[#CBD5E1] text-[#64748B] cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Field: Birth Date */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F5F8FC] border focus:outline-hidden focus:ring-2 focus:ring-[#03357E] text-[#0F172A] ${
                    errors.birthDate ? 'border-red-400 bg-red-50/40' : 'border-[#CBD5E1]'
                  }`}
                />
                {errors.birthDate && <p className="text-[11px] text-red-600 mt-1">{errors.birthDate}</p>}
              </div>

              {/* Field: Previous School */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Asal Sekolah (TK / RA / PAUD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TK Ar-Rafah Rajeg / TK Islam Al-Azhar"
                  value={formData.previousSchool}
                  onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F5F8FC] border focus:outline-hidden focus:ring-2 focus:ring-[#03357E] text-[#0F172A] ${
                    errors.previousSchool ? 'border-red-400 bg-red-50/40' : 'border-[#CBD5E1]'
                  }`}
                />
                <p className="text-[11px] text-[#64748B] mt-1 font-sans">
                  Cantumkan nama sekolah sebelumnya untuk verifikasi jalur afiliasi atau umum.
                </p>
                {errors.previousSchool && <p className="text-[11px] text-red-600 mt-1">{errors.previousSchool}</p>}
              </div>

              {/* Field: Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Nomor WhatsApp / Telepon Orang Tua <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F5F8FC] border focus:outline-hidden focus:ring-2 focus:ring-[#03357E] text-[#0F172A] ${
                    errors.phone ? 'border-red-400 bg-red-50/40' : 'border-[#CBD5E1]'
                  }`}
                />
                <p className="text-[11px] text-[#64748B] mt-1 font-sans">
                  Digunakan untuk konfirmasi jadwal ujian dan informasi resmi panitia.
                </p>
                {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#64748B] hover:bg-[#F5F8FC] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full text-xs font-bold text-[#03357E] bg-[#FFBE00] hover:bg-[#E6AB00] transition-all disabled:opacity-50 shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#03357E] border-t-transparent rounded-full animate-spin"></span>
                      <span>Menerbitkan Nomor...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Pendaftaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
