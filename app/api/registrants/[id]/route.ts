import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }
  const allowed: Record<string, unknown> = {};
  for (const k of ['full_name', 'gender', 'birth_date', 'education_level', 'previous_school', 'phone']) {
    if (body[k] !== undefined) allowed[k] = body[k];
  }
  if (Object.keys(allowed).length === 0) return NextResponse.json({ error: 'Tidak ada field untuk diupdate.' }, { status: 400 });
  if (allowed.full_name !== undefined && String(allowed.full_name).trim().length < 3) {
    return NextResponse.json({ error: 'Nama lengkap minimal 3 karakter.' }, { status: 400 });
  }
  if (allowed.full_name !== undefined) allowed.full_name = String(allowed.full_name).trim();
  if (allowed.previous_school !== undefined) allowed.previous_school = String(allowed.previous_school).trim();
  if (allowed.phone !== undefined) allowed.phone = String(allowed.phone).trim();

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('registrants').update(allowed).eq('id', id).select().single();
  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Pendaftar tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  // FK cascade handles assignments + announcements; explicit delete in case RLS/policy differs
  await supabase.from('exam_assignments').delete().eq('registrant_id', id);
  await supabase.from('announcements').delete().eq('registrant_id', id);
  const { error } = await supabase.from('registrants').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
