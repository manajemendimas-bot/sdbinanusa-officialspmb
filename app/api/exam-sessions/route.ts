import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

function timeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map((x) => parseInt(x || '0', 10));
  return h * 60 + m;
}

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('exam_sessions').select('*').order('exam_date', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { name?: string; exam_date?: string; start_time?: string; end_time?: string; room_id?: string; capacity?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }
  const name = (body.name || '').trim();
  const exam_date = (body.exam_date || '').trim();
  const start_time = (body.start_time || '').trim();
  const end_time = (body.end_time || '').trim();
  const room_id = (body.room_id || '').trim();
  if (!name || !exam_date || !start_time || !end_time || !room_id) {
    return NextResponse.json({ error: 'Field nama, tanggal, jam mulai/selesai, dan ruangan wajib diisi.' }, { status: 400 });
  }
  if (timeToMinutes(end_time) <= timeToMinutes(start_time)) {
    return NextResponse.json({ error: 'Jam selesai harus setelah jam mulai.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: room } = await supabase.from('rooms').select('id, name, capacity, is_active').eq('id', room_id).maybeSingle();
  if (!room) return NextResponse.json({ error: 'Ruangan tidak ditemukan.' }, { status: 404 });
  if (!(room as { is_active: boolean }).is_active) return NextResponse.json({ error: 'Ruangan yang dipilih berstatus nonaktif dan tidak dapat digunakan.' }, { status: 400 });

  const capacity = body.capacity != null ? Number(body.capacity) : (room as { capacity: number }).capacity;
  if (capacity > (room as { capacity: number }).capacity) {
    return NextResponse.json({ error: `Kapasitas sesi (${capacity}) melebihi batas maksimum kapasitas fisik ruangan (${(room as { capacity: number }).capacity}).` }, { status: 400 });
  }

  // Room conflict check
  const { data: sameDay } = await supabase.from('exam_sessions').select('id, name, start_time, end_time').eq('room_id', room_id).eq('exam_date', exam_date);
  const sMin = timeToMinutes(start_time), eMin = timeToMinutes(end_time);
  for (const s of (sameDay as { id: string; name: string; start_time: string; end_time: string }[] || [])) {
    const a = timeToMinutes(s.start_time), b = timeToMinutes(s.end_time);
    if (Math.max(sMin, a) < Math.min(eMin, b)) {
      return NextResponse.json({ error: `Konflik Jadwal: Ruangan ${(room as { name: string }).name} sudah digunakan pada tanggal ${exam_date} pukul ${s.start_time} - ${s.end_time} untuk sesi "${s.name}".` }, { status: 409 });
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({ id: crypto.randomUUID(), name, exam_date, start_time, end_time, room_id, capacity, created_at: now, updated_at: now })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
