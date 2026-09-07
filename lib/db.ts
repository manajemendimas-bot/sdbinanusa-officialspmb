import {
  Registrant,
  Room,
  ExamSession,
  ExamAssignment,
  Announcement,
  SystemSettings,
  EnrichedExamAssignment,
  PublicScheduleLookupResult,
  PublicAnnouncementLookupResult,
} from './types';

// Storage Keys
const STORAGE_KEYS = {
  REGISTRANTS: 'sdbinanusa_registrants_v2',
  ROOMS: 'sdbinanusa_rooms_v2',
  EXAM_SESSIONS: 'sdbinanusa_exam_sessions_v2',
  EXAM_ASSIGNMENTS: 'sdbinanusa_exam_assignments_v2',
  ANNOUNCEMENTS: 'sdbinanusa_announcements_v2',
  SETTINGS: 'sdbinanusa_settings_v2',
  NEXT_REG_SEQ: 'sdbinanusa_next_reg_seq_v2',
  ADMIN_AUTH: 'sdbinanusa_admin_auth_v2',
};

// Initial Seed Data
const DEFAULT_SETTINGS: SystemSettings = {
  school_name: 'SD Bina Nusa',
  academic_year: '2027/2028',
  registration_prefix: 'SPMB-BINA-NUSA',
  registration_start_seq: 1,
  announcement_published_global: true,
  school_phone: '0812-8900-2008 / (021) 5937-2008',
  school_email: 'info@binanusa.sch.id',
  school_address: 'Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540',
  foundation_name: 'Yayasan Pendidikan Arrafah Rajeg',
  registration_number_prefix: 'SPMB-BINA-NUSA',
  phone: '0812-8900-2008 / (021) 5937-2008',
  email: 'info@binanusa.sch.id',
  address: 'Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540',
  is_announcement_published: true,
};

const DEFAULT_ROOMS: Room[] = [];

const DEFAULT_EXAM_SESSIONS: ExamSession[] = [];

const DEFAULT_REGISTRANTS: Registrant[] = [];

const DEFAULT_ASSIGNMENTS: ExamAssignment[] = [];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [];

// Helper to safely access browser storage
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage for key ${key}:`, err);
  }
}

// Generate simple browser-safe UUID
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Database Engine Class
export class SchoolDatabase {
  static init(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      setStorageItem(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAM_SESSIONS)) {
      setStorageItem(STORAGE_KEYS.EXAM_SESSIONS, DEFAULT_EXAM_SESSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRANTS)) {
      setStorageItem(STORAGE_KEYS.REGISTRANTS, DEFAULT_REGISTRANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAM_ASSIGNMENTS)) {
      setStorageItem(STORAGE_KEYS.EXAM_ASSIGNMENTS, DEFAULT_ASSIGNMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEXT_REG_SEQ)) {
      setStorageItem(STORAGE_KEYS.NEXT_REG_SEQ, 1);
    }
  }

  // --- SETTINGS ---
  static getSettings(): SystemSettings {
    const raw = getStorageItem<SystemSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...raw,
      registration_prefix: raw.registration_prefix || raw.registration_number_prefix || 'SPMB-BINA-NUSA',
      registration_number_prefix: raw.registration_number_prefix || raw.registration_prefix || 'SPMB-BINA-NUSA',
      school_phone: raw.school_phone || raw.phone || '0812-8900-2008 / (021) 5937-2008',
      phone: raw.phone || raw.school_phone || '0812-8900-2008 / (021) 5937-2008',
      school_email: raw.school_email || raw.email || 'info@binanusa.sch.id',
      email: raw.email || raw.school_email || 'info@binanusa.sch.id',
      school_address: raw.school_address || raw.address || 'Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540',
      address: raw.address || raw.school_address || 'Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540',
      announcement_published_global: raw.announcement_published_global !== undefined ? raw.announcement_published_global : (raw.is_announcement_published !== undefined ? raw.is_announcement_published : true),
      is_announcement_published: raw.is_announcement_published !== undefined ? raw.is_announcement_published : (raw.announcement_published_global !== undefined ? raw.announcement_published_global : true),
    };
  }

  static updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const prefix = settings.registration_number_prefix || settings.registration_prefix || current.registration_prefix;
    const phone = settings.phone || settings.school_phone || current.school_phone;
    const email = settings.email || settings.school_email || current.school_email;
    const address = settings.address || settings.school_address || current.school_address;
    const isPub = settings.is_announcement_published !== undefined 
      ? settings.is_announcement_published 
      : (settings.announcement_published_global !== undefined ? settings.announcement_published_global : current.announcement_published_global);

    const updated: SystemSettings = {
      ...current,
      ...settings,
      registration_prefix: prefix,
      registration_number_prefix: prefix,
      school_phone: phone,
      phone: phone,
      school_email: email,
      email: email,
      school_address: address,
      address: address,
      announcement_published_global: isPub,
      is_announcement_published: isPub,
    };
    setStorageItem(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  // --- REGISTRANTS ---
  static getRegistrants(): Registrant[] {
    return getStorageItem<Registrant[]>(STORAGE_KEYS.REGISTRANTS, DEFAULT_REGISTRANTS);
  }

  static getRegistrantById(id: string): Registrant | undefined {
    return this.getRegistrants().find((r) => r.id === id);
  }

  static getRegistrantByNumber(regNum: string): Registrant | undefined {
    const cleanNum = regNum.trim().toUpperCase();
    return this.getRegistrants().find(
      (r) => r.registration_number.toUpperCase() === cleanNum
    );
  }

  static generateNextRegistrationNumber(): string {
    const settings = this.getSettings();
    const prefix = settings.registration_prefix || 'SPMB-BINA-NUSA';
    
    // Find the current highest number among existing registrants to guarantee uniqueness
    const registrants = this.getRegistrants();
    let maxSeq = 0;
    const regex = new RegExp(`^${prefix}-(\\d+)$`, 'i');
    
    for (const r of registrants) {
      const match = r.registration_number.match(regex);
      if (match && match[1]) {
        const seq = parseInt(match[1], 10);
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }

    const storedSeq = getStorageItem<number>(STORAGE_KEYS.NEXT_REG_SEQ, 1);
    const nextSeq = Math.max(maxSeq + 1, storedSeq);
    setStorageItem(STORAGE_KEYS.NEXT_REG_SEQ, nextSeq + 1);

    const padded = String(nextSeq).padStart(3, '0');
    return `${prefix}-${padded}`;
  }

  static registerNewStudent(data: {
    full_name: string;
    gender: 'Laki-laki' | 'Perempuan';
    birth_date: string;
    education_level?: 'SD';
    previous_school: string;
    phone: string;
  }): { registrant: Registrant; announcement: Announcement } {
    const now = new Date().toISOString();
    const regNum = this.generateNextRegistrationNumber();
    const newRegistrant: Registrant = {
      id: generateUUID(),
      registration_number: regNum,
      full_name: data.full_name.trim(),
      gender: data.gender,
      birth_date: data.birth_date,
      education_level: data.education_level || 'SD',
      previous_school: data.previous_school.trim(),
      phone: data.phone.trim(),
      created_at: now,
      updated_at: now,
    };

    const currentRegistrants = this.getRegistrants();
    const updatedRegistrants = [newRegistrant, ...currentRegistrants];
    setStorageItem(STORAGE_KEYS.REGISTRANTS, updatedRegistrants);

    // Automatically create initial announcement state in 'Dalam Proses'
    const newAnnouncement: Announcement = {
      id: generateUUID(),
      registrant_id: newRegistrant.id,
      status: 'Dalam Proses',
      is_published: true,
      notes: 'Pendaftaran berhasil diterima. Jadwal ujian dan hasil verifikasi akan diperbarui oleh panitia SPMB.',
      published_at: now,
      created_at: now,
      updated_at: now,
    };

    const currentAnnouncements = this.getAnnouncements();
    setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, [newAnnouncement, ...currentAnnouncements]);

    return { registrant: newRegistrant, announcement: newAnnouncement };
  }

  static updateRegistrant(id: string, updates: Partial<Registrant>): Registrant {
    const registrants = this.getRegistrants();
    const idx = registrants.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Registrant not found');

    const updated: Registrant = {
      ...registrants[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    registrants[idx] = updated;
    setStorageItem(STORAGE_KEYS.REGISTRANTS, registrants);
    return updated;
  }

  static deleteRegistrant(id: string): void {
    // Delete registrant
    const registrants = this.getRegistrants().filter((r) => r.id !== id);
    setStorageItem(STORAGE_KEYS.REGISTRANTS, registrants);

    // Delete associated assignments
    const assignments = this.getExamAssignments().filter((a) => a.registrant_id !== id);
    setStorageItem(STORAGE_KEYS.EXAM_ASSIGNMENTS, assignments);

    // Delete associated announcements
    const announcements = this.getAnnouncements().filter((a) => a.registrant_id !== id);
    setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  }

  // --- ROOMS ---
  static getRooms(): Room[] {
    return getStorageItem<Room[]>(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
  }

  static getActiveRooms(): Room[] {
    return this.getRooms().filter((r) => r.is_active);
  }

  static getRoomById(id: string): Room | undefined {
    return this.getRooms().find((r) => r.id === id);
  }

  static createRoom(data: { name: string; capacity: number; is_active?: boolean }): Room {
    const now = new Date().toISOString();
    const newRoom: Room = {
      id: generateUUID(),
      name: data.name.trim(),
      capacity: Number(data.capacity) || 25,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: now,
      updated_at: now,
    };

    const rooms = this.getRooms();
    rooms.push(newRoom);
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    return newRoom;
  }

  static updateRoom(id: string, updates: Partial<Room>): Room {
    const rooms = this.getRooms();
    const idx = rooms.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Room not found');

    const updated: Room = {
      ...rooms[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    rooms[idx] = updated;
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    return updated;
  }

  static deleteRoom(id: string): { success: boolean; error?: string } {
    // Check if room is used in exam sessions
    const sessions = this.getExamSessions();
    const isUsed = sessions.some((s) => s.room_id === id);
    if (isUsed) {
      return {
        success: false,
        error: 'Ruangan sedang digunakan dalam sesi ujian aktif. Harap pindahkan sesi ujian terlebih dahulu atau nonaktifkan ruangan.',
      };
    }

    const rooms = this.getRooms().filter((r) => r.id !== id);
    setStorageItem(STORAGE_KEYS.ROOMS, rooms);
    return { success: true };
  }

  // --- EXAM SESSIONS ---
  static getExamSessions(): ExamSession[] {
    return getStorageItem<ExamSession[]>(STORAGE_KEYS.EXAM_SESSIONS, DEFAULT_EXAM_SESSIONS);
  }

  static getExamSessionById(id: string): ExamSession | undefined {
    return this.getExamSessions().find((s) => s.id === id);
  }

  // VALIDATION: Room time conflict validation
  static validateRoomConflict(
    roomId: string,
    examDate: string,
    startTime: string,
    endTime: string,
    excludeSessionId?: string
  ): { hasConflict: boolean; conflictingSession?: ExamSession } {
    const sessions = this.getExamSessions();
    const room = this.getRoomById(roomId);

    if (!room || !room.is_active) {
      return { hasConflict: true };
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    for (const session of sessions) {
      if (excludeSessionId && session.id === excludeSessionId) continue;
      if (session.room_id === roomId && session.exam_date === examDate) {
        const sStart = timeToMinutes(session.start_time);
        const sEnd = timeToMinutes(session.end_time);

        // Check time interval overlap
        if (Math.max(startMinutes, sStart) < Math.min(endMinutes, sEnd)) {
          return { hasConflict: true, conflictingSession: session };
        }
      }
    }
    return { hasConflict: false };
  }

  static createExamSession(data: {
    name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    room_id: string;
    capacity?: number;
  }): { session?: ExamSession; error?: string } {
    const room = this.getRoomById(data.room_id);
    if (!room) {
      return { error: 'Ruangan tidak ditemukan.' };
    }
    if (!room.is_active) {
      return { error: 'Ruangan yang dipilih berstatus nonaktif dan tidak dapat digunakan.' };
    }

    // Check room conflict
    const conflictCheck = this.validateRoomConflict(
      data.room_id,
      data.exam_date,
      data.start_time,
      data.end_time
    );

    if (conflictCheck.hasConflict && conflictCheck.conflictingSession) {
      return {
        error: `Konflik Jadwal: Ruangan ${room.name} sudah digunakan pada tanggal ${data.exam_date} pukul ${conflictCheck.conflictingSession.start_time} - ${conflictCheck.conflictingSession.end_time} untuk sesi "${conflictCheck.conflictingSession.name}".`,
      };
    }

    const capacity = data.capacity ? Number(data.capacity) : room.capacity;
    if (capacity > room.capacity) {
      return {
        error: `Kapasitas sesi (${capacity}) melebihi batas maksimum kapasitas fisik ruangan (${room.capacity}).`,
      };
    }

    const now = new Date().toISOString();
    const newSession: ExamSession = {
      id: generateUUID(),
      name: data.name.trim(),
      exam_date: data.exam_date,
      start_time: data.start_time,
      end_time: data.end_time,
      room_id: data.room_id,
      capacity: capacity,
      created_at: now,
      updated_at: now,
    };

    const sessions = this.getExamSessions();
    sessions.push(newSession);
    setStorageItem(STORAGE_KEYS.EXAM_SESSIONS, sessions);
    return { session: newSession };
  }

  static updateExamSession(
    id: string,
    updates: Partial<ExamSession>
  ): { session?: ExamSession; error?: string } {
    const sessions = this.getExamSessions();
    const current = sessions.find((s) => s.id === id);
    if (!current) return { error: 'Sesi ujian tidak ditemukan.' };

    const roomId = updates.room_id || current.room_id;
    const room = this.getRoomById(roomId);
    if (!room) return { error: 'Ruangan tidak ditemukan.' };
    if (!room.is_active) return { error: 'Ruangan yang dipilih berstatus nonaktif.' };

    const examDate = updates.exam_date || current.exam_date;
    const startTime = updates.start_time || current.start_time;
    const endTime = updates.end_time || current.end_time;

    const conflictCheck = this.validateRoomConflict(
      roomId,
      examDate,
      startTime,
      endTime,
      id
    );

    if (conflictCheck.hasConflict && conflictCheck.conflictingSession) {
      return {
        error: `Konflik Jadwal: Ruangan ${room.name} bertabrakan dengan sesi "${conflictCheck.conflictingSession.name}" (${conflictCheck.conflictingSession.start_time}-${conflictCheck.conflictingSession.end_time}).`,
      };
    }

    const currentAssignedCount = this.getAssignmentsForSession(id).length;
    const newCapacity = updates.capacity !== undefined ? Number(updates.capacity) : current.capacity;
    if (newCapacity < currentAssignedCount) {
      return {
        error: `Kapasitas baru (${newCapacity}) tidak boleh lebih kecil dari jumlah peserta yang sudah dialokasikan saat ini (${currentAssignedCount}).`,
      };
    }
    if (newCapacity > room.capacity) {
      return {
        error: `Kapasitas sesi (${newCapacity}) melebihi batas kapasitas ruangan (${room.capacity}).`,
      };
    }

    const updated: ExamSession = {
      ...current,
      ...updates,
      capacity: newCapacity,
      updated_at: new Date().toISOString(),
    };

    const idx = sessions.findIndex((s) => s.id === id);
    sessions[idx] = updated;
    setStorageItem(STORAGE_KEYS.EXAM_SESSIONS, sessions);
    return { session: updated };
  }

  static deleteExamSession(id: string): { success: boolean; error?: string } {
    const assignments = this.getAssignmentsForSession(id);
    if (assignments.length > 0) {
      return {
        success: false,
        error: `Sesi ujian tidak dapat dihapus karena memiliki ${assignments.length} peserta terdaftar. Hapus alokasi peserta terlebih dahulu.`,
      };
    }

    const sessions = this.getExamSessions().filter((s) => s.id !== id);
    setStorageItem(STORAGE_KEYS.EXAM_SESSIONS, sessions);
    return { success: true };
  }

  // --- EXAM ASSIGNMENTS & MAPPING ---
  static getExamAssignments(): ExamAssignment[] {
    return getStorageItem<ExamAssignment[]>(STORAGE_KEYS.EXAM_ASSIGNMENTS, DEFAULT_ASSIGNMENTS);
  }

  static getAssignmentsForSession(sessionId: string): ExamAssignment[] {
    return this.getExamAssignments().filter((a) => a.exam_session_id === sessionId);
  }

  static getAssignmentsForRegistrant(registrantId: string): ExamAssignment[] {
    return this.getExamAssignments().filter((a) => a.registrant_id === registrantId);
  }

  // VALIDATION: Participant conflict validation
  static validateParticipantConflict(
    registrantId: string,
    newSessionId: string
  ): { hasConflict: boolean; conflictingSession?: ExamSession } {
    const newSession = this.getExamSessionById(newSessionId);
    if (!newSession) return { hasConflict: false };

    const currentAssignments = this.getAssignmentsForRegistrant(registrantId);
    const nStart = timeToMinutes(newSession.start_time);
    const nEnd = timeToMinutes(newSession.end_time);

    for (const assign of currentAssignments) {
      if (assign.exam_session_id === newSessionId) {
        // Already assigned to this exact session
        return { hasConflict: true, conflictingSession: newSession };
      }
      const existingSession = this.getExamSessionById(assign.exam_session_id);
      if (existingSession && existingSession.exam_date === newSession.exam_date) {
        const eStart = timeToMinutes(existingSession.start_time);
        const eEnd = timeToMinutes(existingSession.end_time);

        if (Math.max(nStart, eStart) < Math.min(nEnd, eEnd)) {
          return { hasConflict: true, conflictingSession: existingSession };
        }
      }
    }
    return { hasConflict: false };
  }

  static assignParticipantManual(
    registrantId: string,
    sessionId: string
  ): { success: boolean; error?: string } {
    const registrant = this.getRegistrantById(registrantId);
    if (!registrant) return { success: false, error: 'Peserta tidak ditemukan.' };

    const session = this.getExamSessionById(sessionId);
    if (!session) return { success: false, error: 'Sesi ujian tidak ditemukan.' };

    const room = this.getRoomById(session.room_id);
    if (!room || !room.is_active) {
      return { success: false, error: 'Ruangan untuk sesi ini tidak aktif.' };
    }

    // Check capacity
    const currentAssignments = this.getAssignmentsForSession(sessionId);
    if (currentAssignments.length >= session.capacity) {
      return {
        success: false,
        error: `Kapasitas sesi "${session.name}" di ruangan ${room.name} sudah penuh (${session.capacity}/${session.capacity}).`,
      };
    }

    // Check participant conflict
    const conflict = this.validateParticipantConflict(registrantId, sessionId);
    if (conflict.hasConflict && conflict.conflictingSession) {
      return {
        success: false,
        error: `Konflik Peserta: ${registrant.full_name} sudah memiliki jadwal ujian "${conflict.conflictingSession.name}" pada tanggal & jam yang bertabrakan.`,
      };
    }

    const newAssignment: ExamAssignment = {
      id: generateUUID(),
      registrant_id: registrantId,
      exam_session_id: sessionId,
      created_at: new Date().toISOString(),
    };

    const allAssignments = this.getExamAssignments();
    allAssignments.push(newAssignment);
    setStorageItem(STORAGE_KEYS.EXAM_ASSIGNMENTS, allAssignments);
    return { success: true };
  }

  static removeAssignment(assignmentId: string): void {
    const assignments = this.getExamAssignments().filter((a) => a.id !== assignmentId);
    setStorageItem(STORAGE_KEYS.EXAM_ASSIGNMENTS, assignments);
  }

  // AUTO MAPPING ENGINE
  static autoMapParticipants(options?: {
    sessionIds?: string[];
    onlyUnscheduled?: boolean;
  }): {
    success: boolean;
    assignedCount: number;
    details: { sessionName: string; roomName: string; added: number; total: number }[];
    error?: string;
  } {
    const registrants = this.getRegistrants();
    const sessions = this.getExamSessions();
    const rooms = this.getRooms();
    const currentAssignments = this.getExamAssignments();

    // Target sessions
    const targetSessions = sessions.filter((s) => {
      if (options?.sessionIds && options.sessionIds.length > 0) {
        if (!options.sessionIds.includes(s.id)) return false;
      }
      const room = rooms.find((r) => r.id === s.room_id);
      return room && room.is_active;
    });

    if (targetSessions.length === 0) {
      return {
        success: false,
        assignedCount: 0,
        details: [],
        error: 'Tidak ada sesi ujian aktif yang tersedia untuk pemetaan otomatis.',
      };
    }

    // Find candidates
    let candidates: Registrant[] = [];
    if (options?.onlyUnscheduled !== false) {
      // Find registrants with 0 assignments
      candidates = registrants.filter((r) => {
        return !currentAssignments.some((a) => a.registrant_id === r.id);
      });
    } else {
      candidates = [...registrants];
    }

    if (candidates.length === 0) {
      return {
        success: false,
        assignedCount: 0,
        details: [],
        error: 'Semua pendaftar sudah memiliki jadwal ujian atau tidak ada calon peserta baru.',
      };
    }

    const newAssignmentsToAdd: ExamAssignment[] = [];
    const sessionDetailsMap: Record<
      string,
      { sessionName: string; roomName: string; added: number; total: number }
    > = {};

    for (const s of targetSessions) {
      const room = rooms.find((r) => r.id === s.room_id);
      const existingInSession = currentAssignments.filter((a) => a.exam_session_id === s.id).length;
      sessionDetailsMap[s.id] = {
        sessionName: s.name,
        roomName: room?.name || 'Ruangan',
        added: 0,
        total: existingInSession,
      };
    }

    let assignedTotal = 0;

    for (const candidate of candidates) {
      // Find best available session
      for (const session of targetSessions) {
        const detail = sessionDetailsMap[session.id];
        if (detail.total < session.capacity) {
          // Check conflict
          const wouldConflict = newAssignmentsToAdd.some(
            (na) =>
              na.registrant_id === candidate.id && na.exam_session_id === session.id
          );
          if (wouldConflict) continue;

          // Check time conflict with candidate's other assignments
          const conflictCheck = this.validateParticipantConflict(candidate.id, session.id);
          if (!conflictCheck.hasConflict) {
            newAssignmentsToAdd.push({
              id: generateUUID(),
              registrant_id: candidate.id,
              exam_session_id: session.id,
              created_at: new Date().toISOString(),
            });
            detail.added += 1;
            detail.total += 1;
            assignedTotal += 1;
            break; // Move to next candidate
          }
        }
      }
    }

    if (newAssignmentsToAdd.length > 0) {
      const combined = [...currentAssignments, ...newAssignmentsToAdd];
      setStorageItem(STORAGE_KEYS.EXAM_ASSIGNMENTS, combined);
    }

    return {
      success: true,
      assignedCount: assignedTotal,
      details: Object.values(sessionDetailsMap),
    };
  }

  // --- ANNOUNCEMENTS ---
  static getAnnouncements(): Announcement[] {
    return getStorageItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
  }

  static getAnnouncementForRegistrant(registrantId: string): Announcement | undefined {
    return this.getAnnouncements().find((a) => a.registrant_id === registrantId);
  }

  static updateAnnouncement(
    registrantId: string,
    updates: Partial<Announcement>
  ): Announcement {
    const announcements = this.getAnnouncements();
    const idx = announcements.findIndex((a) => a.registrant_id === registrantId);
    const now = new Date().toISOString();

    if (idx === -1) {
      const newAnn: Announcement = {
        id: generateUUID(),
        registrant_id: registrantId,
        status: updates.status || 'Dalam Proses',
        is_published: updates.is_published !== undefined ? updates.is_published : true,
        notes: updates.notes,
        published_at: updates.is_published ? now : null,
        created_at: now,
        updated_at: now,
      };
      announcements.push(newAnn);
      setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
      return newAnn;
    }

    const updated: Announcement = {
      ...announcements[idx],
      ...updates,
      updated_at: now,
    };
    if (updates.is_published === true && !announcements[idx].published_at) {
      updated.published_at = now;
    }
    announcements[idx] = updated;
    setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    return updated;
  }

  static bulkUpdateAnnouncementStatus(
    registrantIds: string[],
    status: 'Dalam Proses' | 'Diterima' | 'Belum Diterima',
    isPublished: boolean = true
  ): void {
    const now = new Date().toISOString();
    const announcements = this.getAnnouncements();

    for (const regId of registrantIds) {
      const idx = announcements.findIndex((a) => a.registrant_id === regId);
      if (idx !== -1) {
        announcements[idx] = {
          ...announcements[idx],
          status,
          is_published: isPublished,
          published_at: isPublished ? (announcements[idx].published_at || now) : null,
          updated_at: now,
        };
      } else {
        announcements.push({
          id: generateUUID(),
          registrant_id: regId,
          status,
          is_published: isPublished,
          published_at: isPublished ? now : null,
          created_at: now,
          updated_at: now,
        });
      }
    }
    setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
  }

  // --- PUBLIC LOOKUP ENDPOINTS ---
  static lookupExamSchedule(registrationNumber: string): PublicScheduleLookupResult | { error: string } {
    const registrant = this.getRegistrantByNumber(registrationNumber);
    if (!registrant) {
      return { error: 'Nomor registrasi tidak ditemukan. Pastikan Anda memasukkan nomor dengan format SPMB-BINA-NUSA-XXX yang sesuai.' };
    }

    const assignments = this.getAssignmentsForRegistrant(registrant.id);
    const sessions = this.getExamSessions();
    const rooms = this.getRooms();

    const enriched: EnrichedExamAssignment[] = [];
    for (const assign of assignments) {
      const session = sessions.find((s) => s.id === assign.exam_session_id);
      if (session) {
        const room = rooms.find((r) => r.id === session.room_id);
        enriched.push({
          id: assign.id,
          registrant_id: registrant.id,
          exam_session_id: session.id,
          session_name: session.name,
          exam_date: session.exam_date,
          start_time: session.start_time,
          end_time: session.end_time,
          room_id: session.room_id,
          room_name: room?.name || 'Ruangan Belum Ditentukan',
        });
      }
    }

    return {
      registrant,
      schedules: enriched,
    };
  }

  static lookupAnnouncement(registrationNumber: string): PublicAnnouncementLookupResult | { error: string } {
    const settings = this.getSettings();
    const registrant = this.getRegistrantByNumber(registrationNumber);
    if (!registrant) {
      return { error: 'Nomor registrasi tidak ditemukan. Pastikan Anda memasukkan nomor dengan format SPMB-BINA-NUSA-XXX yang sesuai.' };
    }

    const announcement = this.getAnnouncementForRegistrant(registrant.id) || null;
    const isGlobalPublished = settings.announcement_published_global !== false;
    const isItemPublished = announcement ? announcement.is_published : false;

    return {
      registrant,
      announcement,
      academic_year: settings.academic_year || '2027/2028',
      is_published: isGlobalPublished && isItemPublished,
    };
  }

  // Reset database to initial seed
  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    setStorageItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    setStorageItem(STORAGE_KEYS.ROOMS, DEFAULT_ROOMS);
    setStorageItem(STORAGE_KEYS.EXAM_SESSIONS, DEFAULT_EXAM_SESSIONS);
    setStorageItem(STORAGE_KEYS.REGISTRANTS, DEFAULT_REGISTRANTS);
    setStorageItem(STORAGE_KEYS.EXAM_ASSIGNMENTS, DEFAULT_ASSIGNMENTS);
    setStorageItem(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    setStorageItem(STORAGE_KEYS.NEXT_REG_SEQ, 1);
  }

  static resetToDefaults(): void {
    this.resetToDefault();
  }

  static addRoom(data: { name: string; capacity: number; is_active?: boolean }): Room {
    return this.createRoom(data);
  }

  static addExamSession(data: {
    name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    room_id: string;
    capacity?: number;
  }): { session?: ExamSession; error?: string } {
    return this.createExamSession(data);
  }

  static assignParticipantToSession(
    registrantId: string,
    sessionId: string
  ): { success: boolean; error?: string } {
    return this.assignParticipantManual(registrantId, sessionId);
  }

  static unassignParticipant(assignmentId: string): void {
    this.removeAssignment(assignmentId);
  }

  static upsertAnnouncement(
    registrantId: string,
    updates: Partial<Announcement>
  ): Announcement {
    return this.updateAnnouncement(registrantId, updates);
  }
}

// Utility: convert '08:30' to total minutes from midnight
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  return h * 60 + m;
}

// Utility: Export array of objects to CSV string
export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers: { key: keyof T; label: string }[]
): void {
  if (typeof window === 'undefined' || rows.length === 0) return;

  const headerLine = headers.map((h) => `"${String(h.label).replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h.key];
        return `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
