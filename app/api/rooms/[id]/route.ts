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
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) {
    const n = String(body.name).trim();
    if (!n) return NextResponse.json({ error: 'Nama ruangan wajib diisi.' }, { status: 400 });
    patch.name = n;
  }
  if (body.capacity !== undefined) {
    const c = Number(body.capacity);
    if (!Number.isFinite(c) || c <= 0) return NextResponse.json({ error: 'Kapasitas harus > 0.' }, { status: 400 });
    patch.capacity = c;
  }
  if (body.is_active !== undefined) patch.is_active = Boolean(body.is_active);
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Tidak ada field untuk diupdate.' }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('rooms').update(patch).eq('id', id).select().single();
  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json({ error: 'Ruangan tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { data: sessions } = await supabase.from('exam_sessions').select('id').eq('room_id', id).limit(1);
  if (sessions && sessions.length > 0) {
    return NextResponse.json(
      { error: 'Ruangan sedang digunakan dalam sesi ujian aktif. Harap pindahkan sesi ujian terlebih dahulu atau nonaktifkan ruangan.' },
      { status: 409 },
    );
  }
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
