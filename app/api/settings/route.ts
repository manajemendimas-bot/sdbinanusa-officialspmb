import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

const ALLOWED_FIELDS = new Set([
  'school_name', 'academic_year', 'registration_prefix', 'registration_number_prefix',
  'registration_start_seq', 'announcement_published_global', 'is_announcement_published',
  'school_phone', 'phone', 'school_email', 'email', 'school_address', 'address', 'foundation_name',
]);

export async function GET() {
  const supabase = getSupabaseServerClient();
  // Public read allowed for registration page display
  const { data, error } = await supabase.from('system_settings').select('*').eq('id', 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Settings tidak ditemukan.' }, { status: 404 });
  // Normalize aliases for client compat
  const row = data as Record<string, unknown>;
  const prefix = (row.registration_prefix as string) || (row.registration_number_prefix as string) || 'SPMB-BINA-NUSA';
  const phone = (row.school_phone as string) || (row.phone as string) || '';
  const email = (row.school_email as string) || (row.email as string) || '';
  const address = (row.school_address as string) || (row.address as string) || '';
  const isPub = row.announcement_published_global !== undefined ? row.announcement_published_global : row.is_announcement_published;
  return NextResponse.json({
    ...row,
    registration_prefix: prefix,
    registration_number_prefix: prefix,
    school_phone: phone,
    phone,
    school_email: email,
    email,
    school_address: address,
    address,
    announcement_published_global: isPub,
    is_announcement_published: isPub,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 }); }

  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED_FIELDS.has(k)) continue;
    patch[k] = v;
  }
  // Alias sync
  if (patch.registration_number_prefix !== undefined && patch.registration_prefix === undefined) patch.registration_prefix = patch.registration_number_prefix;
  if (patch.registration_prefix !== undefined) patch.registration_number_prefix = patch.registration_prefix;
  if (patch.phone !== undefined && patch.school_phone === undefined) patch.school_phone = patch.phone;
  if (patch.school_phone !== undefined) patch.phone = patch.school_phone;
  if (patch.email !== undefined && patch.school_email === undefined) patch.school_email = patch.email;
  if (patch.school_email !== undefined) patch.email = patch.school_email;
  if (patch.address !== undefined && patch.school_address === undefined) patch.school_address = patch.address;
  if (patch.school_address !== undefined) patch.address = patch.school_address;
  if (patch.is_announcement_published !== undefined && patch.announcement_published_global === undefined) patch.announcement_published_global = patch.is_announcement_published;
  if (patch.announcement_published_global !== undefined) patch.is_announcement_published = patch.announcement_published_global;
  // Remove non-column aliases that don't exist in DB (keep only real columns)
  // Real columns: school_name, academic_year, registration_prefix, registration_start_seq, announcement_published_global, school_phone, school_email, school_address, foundation_name
  // Aliases are not real columns — strip them before update
  delete patch.registration_number_prefix;
  delete patch.phone;
  delete patch.email;
  delete patch.address;
  delete patch.is_announcement_published;

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Tidak ada field valid untuk diupdate.' }, { status: 400 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('system_settings').update(patch).eq('id', 1).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
