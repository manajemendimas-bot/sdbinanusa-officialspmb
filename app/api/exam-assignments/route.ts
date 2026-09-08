import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

function timeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map((x) => parseInt(x || '0', 10));
  return h * 60 + m;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const url = req.nextUrl;
  const registrantId = url.searchParams.get('registrant_id');
  const sessionId = url.searchParams.get('exam_session_id');
  let q = supabase.from('exam_assignments').select('*');
  if (registrantId) q = q.eq('registrant_id', registrantId);
  if (sessionId) q = q.eq('exam_session_id', sessionId);
  const { data, error } = await q.order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { registrant_id?: string; exam_session_id?: string; sessionIds?: string[]; onlyUnscheduled?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 }); }

  // Auto-map mode: { sessionIds?: string[], onlyUnscheduled?: boolean }
  // Heuristic: if body has registrant_id + exam_session_id => manual assign; otherwise auto-map
  if (body.registrant_id && body.exam_session_id) {
    return handleManualAssign(body.registrant_id, body.exam_session_id);
  }
  if (body.sessionIds !== undefined || body.onlyUnscheduled !== undefined || (!body.registrant_id && !body.exam_session_id)) {
    // If no registrant/session specified and it looks like auto-map call (or empty POST), treat as auto-map
    // But if body is empty object, also auto-map (default behavior per original lib)
    // To avoid ambiguity, check if either key exists; if neither, it's auto-map
    if (!body.registrant_id && !body.exam_session_id) {
      return handleAutoMap(body.sessionIds, body.onlyUnscheduled);
    }
  }
  return NextResponse.json({ error: 'registrant_id dan exam_session_id wajib diisi.' }, { status: 400 });
}

async function handleManualAssign(registrantId: string, sessionId: string): Promise<NextResponse> {
  const supabase = getSupabaseServerClient();
  const { data: registrant } = await supabase.from('registrants').select('id, full_name').eq('id', registrantId).maybeSingle();
  if (!registrant) return NextResponse.json({ error: 'Peserta tidak ditemukan.' }, { status: 404 });
  const { data: sess } = await supabase.from('exam_sessions').select('*').eq('id', sessionId).maybeSingle();
  if (!sess) return NextResponse.json({ error: 'Sesi ujian tidak ditemukan.' }, { status: 404 });
  const { data: room } = await supabase.from('rooms').select('id, name, is_active').eq('id', (sess as { room_id: string }).room_id).maybeSingle();
  if (!room || !(room as { is_active: boolean }).is_active) return NextResponse.json({ error: 'Ruangan untuk sesi ini tidak aktif.' }, { status: 400 });

  const sessRow = sess as { id: string; name: string; exam_date: string; start_time: string; end_time: string; capacity: number };
  const { count: curCount } = await supabase.from('exam_assignments').select('id', { count: 'exact', head: true }).eq('exam_session_id', sessionId);
  if ((curCount || 0) >= sessRow.capacity) {
    return NextResponse.json({ error: `Kapasitas sesi "${sessRow.name}" di ruangan ${(room as { name: string }).name} sudah penuh (${sessRow.capacity}/${sessRow.capacity}).` }, { status: 409 });
  }

  // Participant conflict: same session or overlapping time on same date
  const { data: existing } = await supabase.from('exam_assignments').select('exam_session_id').eq('registrant_id', registrantId);
  const existingIds = (existing as { exam_session_id: string }[] || []).map((a) => a.exam_session_id);
  if (existingIds.includes(sessionId)) {
    return NextResponse.json({ error: `Konflik Peserta: ${(registrant as { full_name: string }).full_name} sudah memiliki jadwal ujian "${sessRow.name}" pada tanggal & jam yang bertabrakan.` }, { status: 409 });
  }
  if (existingIds.length > 0) {
    const { data: otherSessions } = await supabase.from('exam_sessions').select('id, name, exam_date, start_time, end_time').in('id', existingIds);
    const nS = timeToMinutes(sessRow.start_time), nE = timeToMinutes(sessRow.end_time);
    for (const o of (otherSessions as { id: string; name: string; exam_date: string; start_time: string; end_time: string }[] || [])) {
      if (o.exam_date === sessRow.exam_date) {
        const eS = timeToMinutes(o.start_time), eE = timeToMinutes(o.end_time);
        if (Math.max(nS, eS) < Math.min(nE, eE)) {
          return NextResponse.json({ error: `Konflik Peserta: ${(registrant as { full_name: string }).full_name} sudah memiliki jadwal ujian "${o.name}" pada tanggal & jam yang bertabrakan.` }, { status: 409 });
        }
      }
    }
  }

  const { data, error } = await supabase
    .from('exam_assignments')
    .insert({ id: crypto.randomUUID(), registrant_id: registrantId, exam_session_id: sessionId, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) {
    if ((error as { code?: string }).code === '23505') return NextResponse.json({ error: 'Peserta sudah terdaftar di sesi ini.' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

async function handleAutoMap(sessionIds?: string[], onlyUnscheduled?: boolean): Promise<NextResponse> {
  const supabase = getSupabaseServerClient();
  const { data: allSessions } = await supabase.from('exam_sessions').select('*');
  const { data: rooms } = await supabase.from('rooms').select('id, name, is_active');
  const roomMap = new Map((rooms as { id: string; name: string; is_active: boolean }[] || []).map((r) => [r.id, r]));
  const activeRoomIds = new Set((rooms as { id: string; is_active: boolean }[] || []).filter((r) => r.is_active).map((r) => r.id));

  let targetSessions = (allSessions as { id: string; name: string; exam_date: string; start_time: string; end_time: string; room_id: string; capacity: number }[] || []).filter((s) => activeRoomIds.has(s.room_id));
  if (sessionIds && sessionIds.length > 0) targetSessions = targetSessions.filter((s) => sessionIds.includes(s.id));

  if (targetSessions.length === 0) {
    return NextResponse.json({ error: 'Tidak ada sesi ujian aktif yang tersedia untuk pemetaan otomatis.' }, { status: 400 });
  }

  const { data: registrants } = await supabase.from('registrants').select('id');
  const { data: currentAssignments } = await supabase.from('exam_assignments').select('id, registrant_id, exam_session_id');

  const assignedIds = new Set((currentAssignments as { registrant_id: string }[] || []).map((a) => a.registrant_id));
  let candidates: { id: string }[] = [];
  if (onlyUnscheduled !== false) {
    candidates = (registrants as { id: string }[] || []).filter((r) => !assignedIds.has(r.id));
  } else {
    candidates = (registrants as { id: string }[] || []) as { id: string }[];
  }
  if (candidates.length === 0) {
    return NextResponse.json({ error: 'Semua pendaftar sudah memiliki jadwal ujian atau tidak ada calon peserta baru.' }, { status: 400 });
  }

  // Need full session objects for conflict check
  const { data: allExamSessionsForConflict } = await supabase.from('exam_sessions').select('id, exam_date, start_time, end_time');
  const sessionById = new Map((allExamSessionsForConflict as { id: string; exam_date: string; start_time: string; end_time: string }[] || []).map((s) => [s.id, s]));

  // Count per session
  const countBySession = new Map<string, number>();
  for (const a of (currentAssignments as { exam_session_id: string }[] || [])) {
    countBySession.set(a.exam_session_id, (countBySession.get(a.exam_session_id) || 0) + 1);
  }

  // For conflict check: map registrant -> their existing sessions
  const sessionsByRegistrant = new Map<string, Set<string>>();
  for (const a of (currentAssignments as { registrant_id: string; exam_session_id: string }[] || [])) {
    if (!sessionsByRegistrant.has(a.registrant_id)) sessionsByRegistrant.set(a.registrant_id, new Set());
    sessionsByRegistrant.get(a.registrant_id)!.add(a.exam_session_id);
  }

  const newRows: { id: string; registrant_id: string; exam_session_id: string; created_at: string }[] = [];
  const sessionDetails: Record<string, { sessionName: string; roomName: string; added: number; total: number }> = {};
  for (const s of targetSessions) {
    sessionDetails[s.id] = { sessionName: s.name, roomName: roomMap.get(s.room_id)?.name || 'Ruangan', added: 0, total: countBySession.get(s.id) || 0 };
  }

  for (const cand of candidates) {
    const existingSids = sessionsByRegistrant.get(cand.id) || new Set<string>();
    // Also track newly added for this candidate in this run (avoid duplicate)
    const newlyAddedSids = new Set<string>();
    for (const sess of targetSessions) {
      const detail = sessionDetails[sess.id];
      if (detail.total >= sess.capacity) continue;
      if (existingSids.has(sess.id) || newlyAddedSids.has(sess.id)) continue;
      // Time conflict check
      let conflict = false;
      const nSess = sessionById.get(sess.id);
      if (nSess) {
        const nS = timeToMinutes(nSess.start_time), nE = timeToMinutes(nSess.end_time);
        for (const eid of [...existingSids, ...newlyAddedSids]) {
          const o = sessionById.get(eid);
          if (!o || o.exam_date !== nSess.exam_date) continue;
          const eS = timeToMinutes(o.start_time), eE = timeToMinutes(o.end_time);
          if (Math.max(nS, eS) < Math.min(nE, eE)) { conflict = true; break; }
        }
      }
      if (conflict) continue;
      newRows.push({ id: crypto.randomUUID(), registrant_id: cand.id, exam_session_id: sess.id, created_at: new Date().toISOString() });
      detail.added += 1;
      detail.total += 1;
      newlyAddedSids.add(sess.id);
      if (!sessionsByRegistrant.has(cand.id)) sessionsByRegistrant.set(cand.id, new Set());
      sessionsByRegistrant.get(cand.id)!.add(sess.id);
      break;
    }
  }

  if (newRows.length > 0) {
    const { error } = await supabase.from('exam_assignments').insert(newRows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, assignedCount: newRows.length, details: Object.values(sessionDetails) });
}
