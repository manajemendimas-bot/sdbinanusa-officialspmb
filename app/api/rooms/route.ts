import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { name?: string; capacity?: number; is_active?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }
  const name = (body.name || '').trim();
  const capacity = Number(body.capacity);
  if (!name) return NextResponse.json({ error: 'Nama ruangan wajib diisi.' }, { status: 400 });
  if (!Number.isFinite(capacity) || capacity <= 0) return NextResponse.json({ error: 'Kapasitas harus > 0.' }, { status: 400 });
  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('rooms')
    .insert({ id: crypto.randomUUID(), name, capacity, is_active: body.is_active !== undefined ? Boolean(body.is_active) : true, created_at: now, updated_at: now })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
