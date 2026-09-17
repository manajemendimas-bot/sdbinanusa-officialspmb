// Single source of truth for gelombang/wave tanggal (dipakai publik SpmbInfoSection + admin RegistrantManagement).
export interface Wave {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

export const WAVES: Wave[] = [
  { id: 'inden', name: 'PPDB Inden', start: '2025-11-10', end: '2026-08-31' },
  { id: 'reguler-1', name: 'Gelombang Reguler 1', start: '2026-09-01', end: '2026-11-30' },
  { id: 'reguler-2', name: 'Gelombang Reguler 2', start: '2026-12-01', end: '2027-02-27' },
];

export function waveStatus(w: Wave, now: Date = new Date()): 'Mendatang' | 'Sedang Berlangsung' | 'Penuh' {
  const n = now.getTime();
  if (n < new Date(`${w.start}T00:00:00`).getTime()) return 'Mendatang';
  if (n > new Date(`${w.end}T23:59:59`).getTime()) return 'Penuh';
  return 'Sedang Berlangsung';
}

export function waveForDate(dateStr: string): Wave | undefined {
  const t = new Date(dateStr).getTime();
  return WAVES.find((w) => t >= new Date(`${w.start}T00:00:00`).getTime() && t <= new Date(`${w.end}T23:59:59`).getTime());
}

export function formatPeriodID(w: Wave): string {
  const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fmt(w.start)} – ${fmt(w.end)}`;
}

// Self-check: node -e "require('./lib/waves.ts')" tidak jalan langsung (TS) — assert manual di sini via komentar:
// waveStatus({id:'x',name:'x',start:'2099-01-01',end:'2099-12-31'}) => 'Mendatang'
// waveStatus({id:'x',name:'x',start:'2000-01-01',end:'2000-12-31'}) => 'Penuh'
// waveStatus({id:'x',name:'x',start:'2000-01-01',end:'2099-12-31'}) => 'Sedang Berlangsung'
