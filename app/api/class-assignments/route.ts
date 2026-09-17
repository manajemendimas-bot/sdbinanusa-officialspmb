import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getSupabaseServerClient();
  const url = req.nextUrl;
  const registrantId = url.searchParams.get('registrant_id');
  const classId = url.searchParams.get('class_id');
  let q = supabase.from('class_assignments').select('*');
  if (registrantId) q = q.eq('registrant_id', registrantId);
  if (classId) q = q.eq('class_id', classId);
  const { data, error } = await q.order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: { registrant_id?: string; class_id?: string; classIds?: string[]; onlyUnassigned?: boolean };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 }); }

  if (body.registrant_id && body.class_id) {
    return handleManualAssign(body.registrant_id, body.class_id);
  }
  if (!body.registrant_id && !body.class_id) {
    return handleAutoMap(body.classIds, body.onlyUnassigned);
  }
  return NextResponse.json({ error: 'registrant_id dan class_id wajib diisi.' }, { status: 400 });
}

async function handleManualAssign(registrantId: string, classId: string): Promise<NextResponse> {
  const supabase = getSupabaseServerClient();
  const { data: registrant } = await supabase.from('registrants').select('id, full_name').eq('id', registrantId).maybeSingle();
  if (!registrant) return NextResponse.json({ error: 'Peserta tidak ditemukan.' }, { status: 404 });
  const { data: cls } = await supabase.from('classes').select('id, name, capacity, is_active').eq('id', classId).maybeSingle();
  if (!cls) return NextResponse.json({ error: 'Kelas tidak ditemukan.' }, { status: 404 });
  const clsRow = cls as { id: string; name: string; capacity: number; is_active: boolean };
  if (!clsRow.is_active) return NextResponse.json({ error: 'Kelas ini tidak aktif.' }, { status: 400 });

  const { count: curCount } = await supabase
    .from('class_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .neq('registrant_id', registrantId);
  if ((curCount || 0) >= clsRow.capacity) {
    return NextResponse.json({ error: `Kapasitas kelas "${clsRow.name}" sudah penuh (${clsRow.capacity}/${clsRow.capacity}).` }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('class_assignments')
    .upsert(
      { id: crypto.randomUUID(), registrant_id: registrantId, class_id: classId, created_at: new Date().toISOString() },
      { onConflict: 'registrant_id' },
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// ponytail: greedy "assign to class with currently-lowest average" — bukan optimal partition (NP-hard).
// Cukup rata untuk kebutuhan pembagian kelas 1 SD; upgrade ke algoritma lain kalau butuh presisi lebih.
async function handleAutoMap(classIds?: string[], onlyUnassigned?: boolean): Promise<NextResponse> {
  const supabase = getSupabaseServerClient();
  const { data: allClasses } = await supabase.from('classes').select('*');
  let targetClasses = (allClasses as { id: string; name: string; capacity: number; is_active: boolean }[] || []).filter((c) => c.is_active);
  if (classIds && classIds.length > 0) targetClasses = targetClasses.filter((c) => classIds.includes(c.id));
  if (targetClasses.length === 0) {
    return NextResponse.json({ error: 'Tidak ada kelas aktif yang tersedia untuk alokasi otomatis.' }, { status: 400 });
  }

  const { data: eligibleAnn } = await supabase.from('announcements').select('registrant_id').eq('status', 'Diterima');
  const eligibleIds = new Set((eligibleAnn as { registrant_id: string }[] || []).map((a) => a.registrant_id));
  const { data: regs } = await supabase.from('registrants').select('id, exam_score').not('exam_score', 'is', null);
  const { data: currentAssignments } = await supabase.from('class_assignments').select('id, registrant_id, class_id');
  const assignedIds = new Set((currentAssignments as { registrant_id: string }[] || []).map((a) => a.registrant_id));

  let candidates = (regs as { id: string; exam_score: number }[] || []).filter((r) => eligibleIds.has(r.id));
  if (onlyUnassigned !== false) candidates = candidates.filter((r) => !assignedIds.has(r.id));
  candidates.sort((a, b) => b.exam_score - a.exam_score);

  if (candidates.length === 0) {
    return NextResponse.json({ error: 'Tidak ada pendaftar Diterima dengan nilai ujian yang siap dialokasikan.' }, { status: 400 });
  }

  // Stats awal per kelas dari assignment yang sudah ada (join manual via exam_score registrants)
  const { data: allRegsWithScore } = await supabase.from('registrants').select('id, exam_score');
  const scoreById = new Map((allRegsWithScore as { id: string; exam_score: number | null }[] || []).map((r) => [r.id, r.exam_score]));
  const stats = new Map<string, { sum: number; count: number; capacity: number; name: string }>();
  for (const c of targetClasses) stats.set(c.id, { sum: 0, count: 0, capacity: c.capacity, name: c.name });
  for (const a of (currentAssignments as { class_id: string; registrant_id: string }[] || [])) {
    const st = stats.get(a.class_id);
    if (!st) continue;
    const sc = scoreById.get(a.registrant_id);
    st.count += 1;
    if (typeof sc === 'number') st.sum += sc;
  }

  const newRows: { id: string; registrant_id: string; class_id: string; created_at: string }[] = [];
  const details: Record<string, { className: string; added: number; total: number }> = {};
  for (const c of targetClasses) details[c.id] = { className: c.name, added: 0, total: stats.get(c.id)!.count };

  for (const cand of candidates) {
    let bestId: string | null = null;
    let bestAvg = Infinity;
    for (const c of targetClasses) {
      const st = stats.get(c.id)!;
      if (st.count >= st.capacity) continue;
      const avg = st.count > 0 ? st.sum / st.count : 0;
      if (avg < bestAvg) { bestAvg = avg; bestId = c.id; }
    }
    if (!bestId) break; // semua kelas penuh
    const st = stats.get(bestId)!;
    st.sum += cand.exam_score; st.count += 1;
    newRows.push({ id: crypto.randomUUID(), registrant_id: cand.id, class_id: bestId, created_at: new Date().toISOString() });
    details[bestId].added += 1; details[bestId].total += 1;
  }

  if (newRows.length > 0) {
    const { error } = await supabase.from('class_assignments').upsert(newRows, { onConflict: 'registrant_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, assignedCount: newRows.length, details: Object.values(details) });
}
