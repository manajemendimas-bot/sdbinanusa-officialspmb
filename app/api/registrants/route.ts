import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

function isValidPhone(phone: string): boolean {
  const clean = phone.replace(/[^0-9]/g, '');
  const digits = clean.replace(/^0+/, '');
  return clean.length >= 9 && clean.length <= 15 && digits.length >= 9;
}

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('registrants').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  let body: {
    full_name?: string;
    gender?: string;
    birth_date?: string;
    education_level?: string;
    previous_school?: string;
    phone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }

  const full_name = (body.full_name || '').trim();
  const gender = body.gender as 'Laki-laki' | 'Perempuan';
  const birth_date = (body.birth_date || '').trim();
  const previous_school = (body.previous_school || '').trim();
  const phone = (body.phone || '').trim();
  const education_level = (body.education_level || 'SD').trim() || 'SD';

  if (!full_name || full_name.length < 3) return NextResponse.json({ error: 'Nama lengkap minimal 3 karakter.' }, { status: 400 });
  if (gender !== 'Laki-laki' && gender !== 'Perempuan') return NextResponse.json({ error: 'Jenis kelamin tidak valid.' }, { status: 400 });
  if (!birth_date) return NextResponse.json({ error: 'Tanggal lahir wajib diisi.' }, { status: 400 });
  {
    const birth = new Date(birth_date);
    if (isNaN(birth.getTime())) return NextResponse.json({ error: 'Tanggal lahir tidak valid.' }, { status: 400 });
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    if (age < 4 || age > 12) return NextResponse.json({ error: 'Harap periksa tanggal lahir (usia calon peserta didik SD 5–8 tahun).' }, { status: 400 });
  }
  if (!previous_school) return NextResponse.json({ error: 'Asal sekolah wajib diisi.' }, { status: 400 });
  if (!isValidPhone(phone)) return NextResponse.json({ error: 'Nomor telepon / WhatsApp harus berupa nomor valid (9–15 digit angka).' }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const { data: settings } = await supabase.from('system_settings').select('registration_prefix').eq('id', 1).maybeSingle();
  const prefix = ((settings?.registration_prefix as string) || 'SPMB-BINA-NUSA').trim() || 'SPMB-BINA-NUSA';

  let registrant: Record<string, unknown> | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: seqData, error: seqErr } = await supabase.rpc('next_reg_seq');
    let seq: number | null = typeof seqData === 'number' ? seqData : null;
    if (seqErr || seq == null) {
      // Fallback: count-based (only if RPC missing, e.g. migration belum dijalankan)
      const { count } = await supabase.from('registrants').select('id', { count: 'exact', head: true });
      seq = (count || 0) + 1 + attempt;
      lastError = seqErr?.message || null;
    }
    if (seq == null || seq <= 0) {
      lastError = lastError || 'Gagal menghasilkan nomor registrasi.';
      continue;
    }
    const padded = String(seq).padStart(3, '0');
    const registration_number = `${prefix}-${padded}`;
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const { data: inserted, error: insErr } = await supabase
      .from('registrants')
      .insert({ id, registration_number, full_name, gender, birth_date, education_level, previous_school, phone, created_at: now, updated_at: now })
      .select()
      .single();

    if (!insErr && inserted) {
      registrant = inserted as Record<string, unknown>;
      break;
    }
    if ((insErr as { code?: string })?.code === '23505') {
      lastError = insErr?.message || 'Gagal menyimpan pendaftar.';
      continue; // retry with next seq
    }
    lastError = insErr?.message || 'Gagal menyimpan pendaftar.';
    break;
  }

  if (!registrant) return NextResponse.json({ error: lastError || 'Gagal menyimpan pendaftar.' }, { status: 500 });

  const now = new Date().toISOString();
  const annId = crypto.randomUUID();
  const { data: announcement, error: annErr } = await supabase
    .from('announcements')
    .insert({
      id: annId,
      registrant_id: registrant.id,
      status: 'Dalam Proses',
      is_published: true,
      notes: 'Pendaftaran berhasil diterima. Jadwal ujian dan hasil verifikasi akan diperbarui oleh panitia SPMB.',
      published_at: now,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (annErr) {
    await supabase.from('registrants').delete().eq('id', registrant.id as string);
    return NextResponse.json({ error: annErr.message || 'Gagal membuat status pendaftaran.' }, { status: 500 });
  }

  return NextResponse.json({ registrant, announcement }, { status: 201 });
}
