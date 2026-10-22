export interface TimezoneOption {
  value: string;
  label: string;
  offsetHours: number; // For easy visual representation and fallback
  city: string;
}

export const SUPPORTED_TIMEZONES: TimezoneOption[] = [
  { value: 'Asia/Almaty', label: 'Казахстан (Алматы, Астана) - UTC+5', offsetHours: 5, city: 'Алматы' },
  { value: 'Asia/Manila', label: 'Филиппины (Манила) - UTC+8', offsetHours: 8, city: 'Манила' },
  { value: 'Europe/Kyiv', label: 'Украина (Киев) - UTC+3', offsetHours: 3, city: 'Киев' },
  { value: 'Europe/Istanbul', label: 'Турция / МСК - UTC+3', offsetHours: 3, city: 'Стамбул' },
  { value: 'Asia/Tashkent', label: 'Узбекистан (Ташкент) - UTC+5', offsetHours: 5, city: 'Ташкент' },
  { value: 'Europe/London', label: 'Великобритания (Лондон) - UTC+1', offsetHours: 1, city: 'Лондон' },
  { value: 'America/New_York', label: 'США (Нью-Йорк) - UTC-4', offsetHours: -4, city: 'Нью-Йорк' },
  { value: 'UTC', label: 'UTC Universal Time - UTC+0', offsetHours: 0, city: 'UTC' },
];

/**
 * Convert time string "HH:mm" from one timezone to another
 */
export function convertTimeBetweenZones(
  timeStr: string,
  fromTz: string = 'Asia/Almaty',
  toTz: string = 'Asia/Manila'
): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  
  const fromZone = SUPPORTED_TIMEZONES.find(t => t.value === fromTz) || { offsetHours: 5 };
  const toZone = SUPPORTED_TIMEZONES.find(t => t.value === toTz) || { offsetHours: 8 };

  const [hoursStr, minutesStr] = timeStr.split(':');
  let h = parseInt(hoursStr, 10);
  const m = parseInt(minutesStr, 10);

  if (isNaN(h) || isNaN(m)) return timeStr;

  const diffHours = toZone.offsetHours - fromZone.offsetHours;
  h = (h + diffHours) % 24;
  if (h < 0) h += 24;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}`;
}

/**
 * Format current ISO date string to readable format with timezone
 */
export function formatCurrentDate(lang: 'ru' | 'en' = 'ru'): string {
  const d = new Date();
  return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate late minutes between scheduled start "HH:mm" and actual start "HH:mm"
 */
export function calculateLateMinutes(plannedStart: string, actualStart: string): number {
  if (!plannedStart || !actualStart) return 0;
  
  const [ph, pm] = plannedStart.split(':').map(Number);
  const [ah, am] = actualStart.split(':').map(Number);
  
  if (isNaN(ph) || isNaN(pm) || isNaN(ah) || isNaN(am)) return 0;
  
  const plannedTotalMinutes = ph * 60 + pm;
  const actualTotalMinutes = ah * 60 + am;
  
  // Grace period 3 minutes
  const diff = actualTotalMinutes - plannedTotalMinutes;
  return diff > 3 ? diff : 0;
}

/**
 * Calculate duration between two "HH:mm" times
 */
export function calculateDurationHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return 0;

  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins < startMins) {
    endMins += 24 * 60; // Next day
  }

  const duration = (endMins - startMins) / 60;
  return Math.round(duration * 10) / 10;
}

/**
 * Get current time in HH:mm
 */
export function getCurrentTimeHHMM(tz?: string): string {
  const now = new Date();
  if (tz) {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);
      return parts;
    } catch {
      // Fallback
    }
  }
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
