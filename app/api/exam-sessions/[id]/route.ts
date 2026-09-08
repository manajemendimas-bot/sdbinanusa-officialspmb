import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

function timeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map((x) => parseInt(x || '0', 10));
  return h * 60 + m;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 }); }

  const supabase = getSupabaseServerClient();
  const { data: current, error: curErr } = await supabase.from('exam_sessions').select('*').eq('id', id).maybeSingle();
  if (curErr) return NextResponse.json({ error: curErr.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: 'Sesi ujian tidak ditemukan.' }, { status: 404 });

  const cur = current as { room_id: string; exam_date: string; start_time: string; end_time: string; capacity: number };
  const roomId = (body.room_id as string | undefined)?.trim() || cur.room_id;
  const examDate = (body.exam_date as string | undefined)?.trim() || cur.exam_date;
  const startTime = (body.start_time as string | undefined)?.trim() || cur.start_time;
  const endTime = (body.end_time as string | undefined)?.trim() || cur.end_time;

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    return NextResponse.json({ error: 'Jam selesai harus setelah jam mulai.' }, { status: 400 });
  }

  const { data: room } = await supabase.from('rooms').select('id, name, capacity, is_active').eq('id', roomId).maybeSingle();
  if (!room) return NextResponse.json({ error: 'Ruangan tidak ditemukan.' }, { status: 404 });
  if (!(room as { is_active: boolean }).is_active) return NextResponse.json({ error: 'Ruangan yang dipilih berstatus nonaktif.' }, { status: 400 });

  const newCapacity = body.capacity !== undefined ? Number(body.capacity) : cur.capacity;
  const { count: assignedCount } = await supabase.from('exam_assignments').select('id', { count: 'exact', head: true }).eq('exam_session_id', id);
  const cnt = assignedCount || 0;
  if (newCapacity < cnt) {
    return NextResponse.json({ error: `Kapasitas baru (${newCapacity}) tidak boleh lebih kecil dari jumlah peserta yang sudah dialokasikan saat ini (${cnt}).` }, { status: 400 });
  }
  if (newCapacity > (room as { capacity: number }).capacity) {
    return NextResponse.json({ error: `Kapasitas sesi (${newCapacity}) melebihi batas kapasitas ruangan (${(room as { capacity: number }).capacity}).` }, { status: 400 });
  }

  // conflict check (exclude self)
  const { data: sameDay } = await supabase.from('exam_sessions').select('id, name, start_time, end_time').eq('room_id', roomId).eq('exam_date', examDate).neq('id', id);
  const sMin = timeToMinutes(startTime), eMin = timeToMinutes(endTime);
  for (const s of (sameDay as { id: string; name: string; start_time: string; end_time: string }[] || [])) {
    const a = timeToMinutes(s.start_time), b = timeToMinutes(s.end_time);
    if (Math.max(sMin, a) < Math.min(eMin, b)) {
      return NextResponse.json({ error: `Konflik Jadwal: Ruangan ${(room as { name: string }).name} bertabrakan dengan sesi "${s.name}" (${s.start_time}-${s.end_time}).` }, { status: 409 });
    }
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.exam_date !== undefined) patch.exam_date = examDate;
  if (body.start_time !== undefined) patch.start_time = startTime;
  if (body.end_time !== undefined) patch.end_time = endTime;
  if (body.room_id !== undefined) patch.room_id = roomId;
  patch.capacity = newCapacity;

  const { data, error } = await supabase.from('exam_sessions').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { count } = await supabase.from('exam_assignments').select('id', { count: 'exact', head: true }).eq('exam_session_id', id);
  if ((count || 0) > 0) {
    return NextResponse.json({ error: `Sesi ujian tidak dapat dihapus karena memiliki ${count} peserta terdaftar. Hapus alokasi peserta terlebih dahulu.` }, { status: 409 });
  }
  const { error } = await supabase.from('exam_sessions').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
