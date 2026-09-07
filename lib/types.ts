export type Gender = 'Laki-laki' | 'Perempuan';
export type EducationLevel = 'SD';
export type AnnouncementStatus = 'Dalam Proses' | 'Diterima' | 'Belum Diterima';

export interface Registrant {
  id: string; // UUID
  registration_number: string; // e.g. SPMB-BINA-NUSA-001
  full_name: string;
  gender: Gender;
  birth_date: string; // YYYY-MM-DD
  education_level: EducationLevel;
  previous_school: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string; // UUID
  name: string; // e.g. Kelas 1A
  capacity: number; // e.g. 25
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamSession {
  id: string; // UUID
  name: string; // e.g. Tes Kemampuan Belajar
  exam_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  room_id: string; // Reference to Room
  capacity: number; // Max allowed participants
  created_at: string;
  updated_at: string;
}

export interface ExamAssignment {
  id: string; // UUID
  registrant_id: string;
  exam_session_id: string;
  created_at: string;
}

export interface Announcement {
  id: string; // UUID
  registrant_id: string;
  status: AnnouncementStatus;
  is_published: boolean;
  notes?: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  school_name: string;
  academic_year: string;
  registration_prefix: string;
  registration_start_seq: number;
  announcement_published_global: boolean;
  school_phone: string;
  school_email: string;
  school_address: string;
  foundation_name: string;
  // Aliases for admin component ease
  registration_number_prefix?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_announcement_published?: boolean;
}

export type SchoolSettings = SystemSettings;

export interface EnrichedExamAssignment {
  id: string;
  registrant_id: string;
  exam_session_id: string;
  session_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
}

export interface PublicScheduleLookupResult {
  registrant: Registrant;
  schedules: EnrichedExamAssignment[];
}

export interface PublicAnnouncementLookupResult {
  registrant: Registrant;
  announcement: Announcement | null;
  academic_year: string;
  is_published: boolean;
}
