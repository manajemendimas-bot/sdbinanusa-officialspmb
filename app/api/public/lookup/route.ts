import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const reg = (req.nextUrl.searchParams.get('reg') || '').trim().toUpperCase();
  const type = (req.nextUrl.searchParams.get('type') || 'schedule').trim().toLowerCase();
  if (!reg) return NextResponse.json({ error: 'Nomor registrasi wajib diisi.' }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const { data: registrant, error: regErr } = await supabase
    .from('registrants')
    .select('*')
    .ilike('registration_number', reg)
    .maybeSingle();

  if (regErr) return NextResponse.json({ error: regErr.message }, { status: 500 });
  if (!registrant) {
    return NextResponse.json(
      { error: 'Nomor registrasi tidak ditemukan. Pastikan Anda memasukkan nomor dengan format SPMB-BINA-NUSA-XXX yang sesuai.' },
      { status: 404 },
    );
  }

  if (type === 'announcement') {
    const { data: settings } = await supabase.from('system_settings').select('academic_year, announcement_published_global').eq('id', 1).maybeSingle();
    const academic_year = (settings?.academic_year as string) || '2027/2028';
    const isGlobalPublished = (settings?.announcement_published_global as boolean) !== false;
    const { data: announcement } = await supabase.from('announcements').select('*').eq('registrant_id', registrant.id).maybeSingle();
    const isItemPublished = announcement ? Boolean((announcement as { is_published: boolean }).is_published) : false;
    return NextResponse.json({
      registrant,
      announcement: announcement || null,
      academic_year,
      is_published: isGlobalPublished && isItemPublished,
    });
  }

  // default: schedule
  const { data: assignments } = await supabase.from('exam_assignments').select('id, registrant_id, exam_session_id').eq('registrant_id', registrant.id);
  const sessionIds = (assignments || []).map((a: { exam_session_id: string }) => a.exam_session_id);
  let enriched: unknown[] = [];
  if (sessionIds.length > 0) {
    const { data: sessions } = await supabase.from('exam_sessions').select('*').in('id', sessionIds);
    const roomIds = [...new Set((sessions || []).map((s: { room_id: string }) => s.room_id))];
    const { data: rooms } = roomIds.length ? await supabase.from('rooms').select('id, name').in('id', roomIds) : { data: [] as unknown[] };
    const roomMap = new Map((rooms as { id: string; name: string }[] || []).map((r) => [r.id, r.name]));
    const sessionMap = new Map((sessions || []).map((s: Record<string, unknown>) => [s.id as string, s]));
    enriched = (assignments || []).map((a: { id: string; registrant_id: string; exam_session_id: string }) => {
      const s = sessionMap.get(a.exam_session_id) as Record<string, string> | undefined;
      if (!s) return null;
      return {
        id: a.id,
        registrant_id: a.registrant_id,
        exam_session_id: a.exam_session_id,
        session_name: s.name,
        exam_date: s.exam_date,
        start_time: s.start_time,
        end_time: s.end_time,
        room_id: s.room_id,
        room_name: roomMap.get(s.room_id as string) || 'Ruangan Belum Ditentukan',
      };
    }).filter(Boolean);
  }

  return NextResponse.json({ registrant, schedules: enriched });
}
