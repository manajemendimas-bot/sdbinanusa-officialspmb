-- SPMB Bina Nusa — revisi #1-9
-- Jalankan di Supabase Dashboard → SQL Editor (paste & Run)

alter table announcements drop constraint if exists announcements_status_check;
alter table announcements add constraint announcements_status_check
  check (status in ('Dalam Proses','Diterima','Lulus Bersyarat (Tes Ulang)','Belum Diterima'));

alter table registrants add column if not exists exam_score numeric;

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists class_assignments (
  id uuid primary key default gen_random_uuid(),
  registrant_id uuid not null unique references registrants(id) on delete cascade,
  class_id uuid not null references classes(id) on delete restrict,
  created_at timestamptz not null default now()
);
create index if not exists idx_class_assignments_class on class_assignments(class_id);

alter table classes enable row level security;
alter table class_assignments enable row level security;
-- No policies → anon/authenticated denied; service_role bypasses RLS

drop trigger if exists t_classes_u on classes;
create trigger t_classes_u before update on classes for each row execute function touch_updated_at();
