import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH single: { registrant_id, status?, is_published?, notes? }
export async function PATCH(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { registrant_id?: string; status?: string; is_published?: boolean; notes?: string | null };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 }); }
  const registrant_id = (body.registrant_id || '').trim();
  if (!registrant_id) return NextResponse.json({ error: 'registrant_id wajib diisi.' }, { status: 400 });
  if (body.status && !['Dalam Proses', 'Diterima', 'Belum Diterima'].includes(body.status)) {
    return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from('announcements').select('*').eq('registrant_id', registrant_id).maybeSingle();

  if (!existing) {
    const row = {
      id: crypto.randomUUID(),
      registrant_id,
      status: body.status || 'Dalam Proses',
      is_published: body.is_published !== undefined ? Boolean(body.is_published) : true,
      notes: body.notes ?? null,
      published_at: body.is_published ? now : null,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await supabase.from('announcements').insert(row).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const patch: Record<string, unknown> = { updated_at: now };
  if (body.status !== undefined) patch.status = body.status;
  if (body.is_published !== undefined) {
    patch.is_published = Boolean(body.is_published);
    if (body.is_published && !(existing as { published_at: string | null }).published_at) patch.published_at = now;
    if (!body.is_published) patch.published_at = null;
  }
  if (body.notes !== undefined) patch.notes = body.notes;

  const { data, error } = await supabase.from('announcements').update(patch).eq('registrant_id', registrant_id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // Bulk: { registrant_ids: string[], status: string, is_published?: boolean }
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { registrant_ids?: string[]; status?: string; is_published?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 }); }
  const ids = body.registrant_ids || [];
  const status = body.status as 'Dalam Proses' | 'Diterima' | 'Belum Diterima';
  if (!ids.length) return NextResponse.json({ error: 'registrant_ids wajib diisi.' }, { status: 400 });
  if (!['Dalam Proses', 'Diterima', 'Belum Diterima'].includes(status)) return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
  const isPublished = body.is_published !== undefined ? Boolean(body.is_published) : true;

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();
  const { data: existing } = await supabase.from('announcements').select('registrant_id, published_at').in('registrant_id', ids);
  const existingMap = new Map((existing as { registrant_id: string; published_at: string | null }[] || []).map((r) => [r.registrant_id, r.published_at]));

  const toUpdate: string[] = [];
  const toInsert: Record<string, unknown>[] = [];
  for (const rid of ids) {
    if (existingMap.has(rid)) toUpdate.push(rid);
    else toInsert.push({ id: crypto.randomUUID(), registrant_id: rid, status, is_published: isPublished, published_at: isPublished ? now : null, created_at: now, updated_at: now });
  }

  if (toInsert.length) {
    const { error } = await supabase.from('announcements').insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  for (const rid of toUpdate) {
    const patch: Record<string, unknown> = { status, is_published: isPublished, updated_at: now };
    const prevPublished = existingMap.get(rid);
    patch.published_at = isPublished ? (prevPublished || now) : null;
    const { error } = await supabase.from('announcements').update(patch).eq('registrant_id', rid);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, updated: ids.length });
}
