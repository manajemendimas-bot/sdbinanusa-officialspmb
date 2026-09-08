-- SPMB Bina Nusa — initial schema
-- Jalankan di Supabase Dashboard → SQL Editor (paste & Run)
-- Atau via Supabase CLI: supabase db push

create extension if not exists "pgcrypto";

create sequence if not exists reg_number_seq start 1;

create table if not exists registrants (
  id uuid primary key default gen_random_uuid(),
  registration_number text unique not null,
  full_name text not null,
  gender text not null check (gender in ('Laki-laki','Perempuan')),
  birth_date date not null,
  education_level text not null default 'SD',
  previous_school text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  capacity int not null check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists exam_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam_date date not null,
  start_time time not null,
  end_time time not null,
  room_id uuid not null references rooms(id) on delete restrict,
  capacity int not null check (capacity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_exam_sessions_room_date on exam_sessions(room_id, exam_date);

create table if not exists exam_assignments (
  id uuid primary key default gen_random_uuid(),
  registrant_id uuid not null references registrants(id) on delete cascade,
  exam_session_id uuid not null references exam_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (registrant_id, exam_session_id)
);
create index if not exists idx_assignments_registrant on exam_assignments(registrant_id);
create index if not exists idx_assignments_session on exam_assignments(exam_session_id);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  registrant_id uuid not null unique references registrants(id) on delete cascade,
  status text not null check (status in ('Dalam Proses','Diterima','Belum Diterima')),
  is_published boolean not null default true,
  notes text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists system_settings (
  id int primary key default 1 check (id = 1),
  school_name text not null default 'SD Bina Nusa',
  academic_year text not null default '2027/2028',
  registration_prefix text not null default 'SPMB-BINA-NUSA',
  registration_start_seq int not null default 1,
  announcement_published_global boolean not null default true,
  school_phone text not null default '0812-8900-2008 / (021) 5937-2008',
  school_email text not null default 'info@binanusa.sch.id',
  school_address text not null default 'Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540',
  foundation_name text not null default 'Yayasan Pendidikan Arrafah Rajeg',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into system_settings(id) values (1) on conflict (id) do nothing;

alter table registrants enable row level security;
alter table rooms enable row level security;
alter table exam_sessions enable row level security;
alter table exam_assignments enable row level security;
alter table announcements enable row level security;
alter table system_settings enable row level security;
-- No policies → anon/authenticated denied; service_role bypasses RLS

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists t_registrants_u on registrants;
create trigger t_registrants_u before update on registrants for each row execute function touch_updated_at();
drop trigger if exists t_rooms_u on rooms;
create trigger t_rooms_u before update on rooms for each row execute function touch_updated_at();
drop trigger if exists t_exam_sessions_u on exam_sessions;
create trigger t_exam_sessions_u before update on exam_sessions for each row execute function touch_updated_at();
drop trigger if exists t_announcements_u on announcements;
create trigger t_announcements_u before update on announcements for each row execute function touch_updated_at();
drop trigger if exists t_settings_u on system_settings;
create trigger t_settings_u before update on system_settings for each row execute function touch_updated_at();

-- Helper for atomic registration number (service_role only)
create or replace function next_reg_seq() returns bigint language sql security definer as $$ select nextval('reg_number_seq') $$;
