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

// Thin async client over Route Handlers. Keeps SchoolDatabase name so consumers need only add `await`.
async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    credentials: 'include',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { error?: string }).error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map((x) => parseInt(x || '0', 10));
  return h * 60 + m;
}

export class SchoolDatabase {
  /** No-op (kept for compat; previously seeded localStorage) */
  static init(): void {}

  // --- SETTINGS ---
  static async getSettings(): Promise<SystemSettings> {
    const raw = await fetchJson<SystemSettings>('/api/settings');
    return {
      ...raw,
      registration_prefix: (raw.registration_prefix as string) || (raw.registration_number_prefix as string) || 'SPMB-BINA-NUSA',
      registration_number_prefix: (raw.registration_number_prefix as string) || (raw.registration_prefix as string) || 'SPMB-BINA-NUSA',
      school_phone: (raw.school_phone as string) || (raw.phone as string) || '0812-8900-2008 / (021) 5937-2008',
      phone: (raw.phone as string) || (raw.school_phone as string) || '0812-8900-2008 / (021) 5937-2008',
      school_email: (raw.school_email as string) || (raw.email as string) || 'info@binanusa.sch.id',
      email: (raw.email as string) || (raw.school_email as string) || 'info@binanusa.sch.id',
      school_address: (raw.school_address as string) || (raw.address as string) || 'Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540',
      address: (raw.address as string) || (raw.school_address as string) || 'Gedung Bina Nusa Islamic School, Perum. Taman Raya Rajeg, Blok L4, Mekarsari, Kec. Rajeg, Kab. Tangerang, Banten 15540',
      announcement_published_global: (raw.announcement_published_global as boolean) ?? (raw.is_announcement_published as boolean) ?? true,
      is_announcement_published: (raw.is_announcement_published as boolean) ?? (raw.announcement_published_global as boolean) ?? true,
    } as SystemSettings;
  }

  static async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    return fetchJson<SystemSettings>('/api/settings', { method: 'PATCH', body: JSON.stringify(settings) });
  }

  // --- REGISTRANTS ---
  static async getRegistrants(): Promise<Registrant[]> {
    return fetchJson<Registrant[]>('/api/registrants');
  }

  static async getRegistrantById(id: string): Promise<Registrant | undefined> {
    const list = await this.getRegistrants();
    return list.find((r) => r.id === id);
  }

  static async getRegistrantByNumber(regNum: string): Promise<Registrant | undefined> {
    const clean = regNum.trim().toUpperCase();
    const list = await this.getRegistrants();
    return list.find((r) => r.registration_number.toUpperCase() === clean);
  }

  static async generateNextRegistrationNumber(): Promise<string> {
    // Server generates atomically on POST; this is kept for compat only.
    const s = await this.getSettings();
    const prefix = s.registration_prefix || 'SPMB-BINA-NUSA';
    return `${prefix}-XXX`;
  }

  static async registerNewStudent(data: {
    full_name: string;
    gender: 'Laki-laki' | 'Perempuan';
    birth_date: string;
    education_level?: 'SD';
    previous_school: string;
    phone: string;
  }): Promise<{ registrant: Registrant; announcement: Announcement }> {
    return fetchJson<{ registrant: Registrant; announcement: Announcement }>('/api/registrants', {
      method: 'POST',
      body: JSON.stringify({
        full_name: data.full_name.trim(),
        gender: data.gender,
        birth_date: data.birth_date,
        education_level: data.education_level || 'SD',
        previous_school: data.previous_school.trim(),
        phone: data.phone.trim(),
      }),
    });
  }

  static async updateRegistrant(id: string, updates: Partial<Registrant>): Promise<Registrant> {
    return fetchJson<Registrant>(`/api/registrants/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  }

  static async deleteRegistrant(id: string): Promise<void> {
    await fetchJson<{ ok: boolean }>(`/api/registrants/${id}`, { method: 'DELETE' });
  }

  // --- ROOMS ---
  static async getRooms(): Promise<Room[]> {
    return fetchJson<Room[]>('/api/rooms');
  }

  static async getActiveRooms(): Promise<Room[]> {
    const rooms = await this.getRooms();
    return rooms.filter((r) => r.is_active);
  }

  static async getRoomById(id: string): Promise<Room | undefined> {
    const rooms = await this.getRooms();
    return rooms.find((r) => r.id === id);
  }

  static async createRoom(data: { name: string; capacity: number; is_active?: boolean }): Promise<Room> {
    return fetchJson<Room>('/api/rooms', { method: 'POST', body: JSON.stringify(data) });
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    return fetchJson<Room>(`/api/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  }

  static async deleteRoom(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fetchJson<{ ok: boolean }>(`/api/rooms/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, error: msg };
    }
  }

  // --- EXAM SESSIONS ---
  static async getExamSessions(): Promise<ExamSession[]> {
    return fetchJson<ExamSession[]>('/api/exam-sessions');
  }

  static async getExamSessionById(id: string): Promise<ExamSession | undefined> {
    const list = await this.getExamSessions();
    return list.find((s) => s.id === id);
  }

  static async validateRoomConflict(
    roomId: string,
    examDate: string,
    startTime: string,
    endTime: string,
    excludeSessionId?: string,
  ): Promise<{ hasConflict: boolean; conflictingSession?: ExamSession }> {
    const sessions = await this.getExamSessions();
    const rooms = await this.getRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room || !room.is_active) return { hasConflict: true };
    const sMin = timeToMinutes(startTime), eMin = timeToMinutes(endTime);
    for (const s of sessions) {
      if (excludeSessionId && s.id === excludeSessionId) continue;
      if (s.room_id === roomId && s.exam_date === examDate) {
        const a = timeToMinutes(s.start_time), b = timeToMinutes(s.end_time);
        if (Math.max(sMin, a) < Math.min(eMin, b)) return { hasConflict: true, conflictingSession: s };
      }
    }
    return { hasConflict: false };
  }

  static async createExamSession(data: {
    name: string;
    exam_date: string;
    start_time: string;
    end_time: string;
    room_id: string;
    capacity?: number;
  }): Promise<{ session?: ExamSession; error?: string }> {
    try {
      const session = await fetchJson<ExamSession>('/api/exam-sessions', { method: 'POST', body: JSON.stringify(data) });
      return { session };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  static async updateExamSession(id: string, updates: Partial<ExamSession>): Promise<{ session?: ExamSession; error?: string }> {
    try {
      const session = await fetchJson<ExamSession>(`/api/exam-sessions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
      return { session };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  static async deleteExamSession(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fetchJson<{ ok: boolean }>(`/api/exam-sessions/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // --- EXAM ASSIGNMENTS ---
  static async getExamAssignments(): Promise<ExamAssignment[]> {
    return fetchJson<ExamAssignment[]>('/api/exam-assignments');
  }

  static async getAssignmentsForSession(sessionId: string): Promise<ExamAssignment[]> {
    return fetchJson<ExamAssignment[]>(`/api/exam-assignments?exam_session_id=${encodeURIComponent(sessionId)}`);
  }

  static async getAssignmentsForRegistrant(registrantId: string): Promise<ExamAssignment[]> {
    return fetchJson<ExamAssignment[]>(`/api/exam-assignments?registrant_id=${encodeURIComponent(registrantId)}`);
  }

  static async validateParticipantConflict(
    registrantId: string,
    newSessionId: string,
  ): Promise<{ hasConflict: boolean; conflictingSession?: ExamSession }> {
    const [newSession, assignments] = await Promise.all([
      this.getExamSessionById(newSessionId),
      this.getAssignmentsForRegistrant(registrantId),
    ]);
    if (!newSession) return { hasConflict: false };
    const nS = timeToMinutes(newSession.start_time), nE = timeToMinutes(newSession.end_time);
    for (const a of assignments) {
      if (a.exam_session_id === newSessionId) return { hasConflict: true, conflictingSession: newSession };
      const other = await this.getExamSessionById(a.exam_session_id);
      if (other && other.exam_date === newSession.exam_date) {
        const eS = timeToMinutes(other.start_time), eE = timeToMinutes(other.end_time);
        if (Math.max(nS, eS) < Math.min(nE, eE)) return { hasConflict: true, conflictingSession: other };
      }
    }
    return { hasConflict: false };
  }

  static async assignParticipantManual(registrantId: string, sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await fetchJson<ExamAssignment>('/api/exam-assignments', {
        method: 'POST',
        body: JSON.stringify({ registrant_id: registrantId, exam_session_id: sessionId }),
      });
      return { success: true };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  static async removeAssignment(assignmentId: string): Promise<void> {
    await fetchJson<{ ok: boolean }>(`/api/exam-assignments/${assignmentId}`, { method: 'DELETE' });
  }

  static async autoMapParticipants(options?: { sessionIds?: string[]; onlyUnscheduled?: boolean }): Promise<{
    success: boolean;
    assignedCount: number;
    details: { sessionName: string; roomName: string; added: number; total: number }[];
    error?: string;
  }> {
    try {
      const res = await fetchJson<{ success: boolean; assignedCount: number; details: { sessionName: string; roomName: string; added: number; total: number }[] }>(
        '/api/exam-assignments',
        { method: 'POST', body: JSON.stringify({ sessionIds: options?.sessionIds, onlyUnscheduled: options?.onlyUnscheduled ?? true }) },
      );
      return res;
    } catch (e: unknown) {
      return { success: false, assignedCount: 0, details: [], error: e instanceof Error ? e.message : String(e) };
    }
  }

  // --- ANNOUNCEMENTS ---
  static async getAnnouncements(): Promise<Announcement[]> {
    return fetchJson<Announcement[]>('/api/announcements');
  }

  static async getAnnouncementForRegistrant(registrantId: string): Promise<Announcement | undefined> {
    const list = await this.getAnnouncements();
    return list.find((a) => a.registrant_id === registrantId);
  }

  static async updateAnnouncement(registrantId: string, updates: Partial<Announcement>): Promise<Announcement> {
    return fetchJson<Announcement>('/api/announcements', {
      method: 'PATCH',
      body: JSON.stringify({ registrant_id: registrantId, ...updates }),
    });
  }

  static async bulkUpdateAnnouncementStatus(
    registrantIds: string[],
    status: 'Dalam Proses' | 'Diterima' | 'Belum Diterima',
    isPublished: boolean = true,
  ): Promise<void> {
    await fetchJson<{ ok: boolean }>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify({ registrant_ids: registrantIds, status, is_published: isPublished }),
    });
  }

  // --- PUBLIC LOOKUPS ---
  static async lookupExamSchedule(registrationNumber: string): Promise<PublicScheduleLookupResult | { error: string }> {
    try {
      return await fetchJson<PublicScheduleLookupResult>(`/api/public/lookup?type=schedule&reg=${encodeURIComponent(registrationNumber)}`);
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  static async lookupAnnouncement(registrationNumber: string): Promise<PublicAnnouncementLookupResult | { error: string }> {
    try {
      return await fetchJson<PublicAnnouncementLookupResult>(`/api/public/lookup?type=announcement&reg=${encodeURIComponent(registrationNumber)}`);
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Compat shims
  static async resetToDefault(): Promise<void> {
    // No-op: destructive reset removed. Use Supabase dashboard if truly needed.
  }
  static async resetToDefaults(): Promise<void> { return this.resetToDefault(); }
  static async addRoom(data: { name: string; capacity: number; is_active?: boolean }): Promise<Room> { return this.createRoom(data); }
  static async addExamSession(data: { name: string; exam_date: string; start_time: string; end_time: string; room_id: string; capacity?: number }): Promise<{ session?: ExamSession; error?: string }> { return this.createExamSession(data); }
  static async assignParticipantToSession(registrantId: string, sessionId: string): Promise<{ success: boolean; error?: string }> { return this.assignParticipantManual(registrantId, sessionId); }
  static async unassignParticipant(assignmentId: string): Promise<void> { return this.removeAssignment(assignmentId); }
  static async upsertAnnouncement(registrantId: string, updates: Partial<Announcement>): Promise<Announcement> { return this.updateAnnouncement(registrantId, updates); }
}

export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers: { key: keyof T; label: string }[],
): void {
  if (typeof window === 'undefined' || rows.length === 0) return;
  const headerLine = headers.map((h) => `"${String(h.label).replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) =>
    headers.map((h) => {
      const val = row[h.key];
      return `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`;
    }).join(','),
  );
  const csvContent = '﻿' + [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
