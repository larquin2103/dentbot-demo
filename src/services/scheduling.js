import { addDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const WORK_HOURS = {
  weekday: { morning: { start: 9, end: 14 }, afternoon: { start: 16, end: 19 } },
  saturday: { morning: { start: 9, end: 13 } }
};

const DAY_NAMES = {
  lunes: 1, martes: 2,
  'miércoles': 3, miercoles: 3,
  jueves: 4, viernes: 5,
  'sábado': 6, sabado: 6,
  domingo: 0
};

export const BOOKABLE_SERVICES = [
  { id: 'consulta',       name: 'Primera consulta', price: 'Gratis',           duration: '30 min', emoji: '🦷' },
  { id: 'limpieza',       name: 'Limpieza dental',  price: '60€',              duration: '30 min', emoji: '✨' },
  { id: 'blanqueamiento', name: 'Blanqueamiento',   price: '150€',             duration: '90 min', emoji: '😁' },
  { id: 'ortodoncia',     name: 'Ortodoncia',       price: 'Valoración gratis', duration: '30 min', emoji: '🦷' },
  { id: 'implante',       name: 'Implante dental',  price: 'Desde 1.200€',     duration: '90 min', emoji: '🔩' },
  { id: 'urgencia',       name: 'Urgencia dental',  price: '90€',              duration: '30 min', emoji: '⚡' }
];

export function getNextAvailableDates(count = 10) {
  const dates = [];
  let cursor = new Date();
  let safety = 0;
  while (dates.length < count && safety < 30) {
    if (cursor.getDay() !== 0) {
      dates.push(new Date(cursor));
    }
    cursor = addDays(cursor, 1);
    safety++;
  }
  return dates;
}

export function getAvailableSlotsForDate(date) {
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0) return [];

  const dateStr = format(date, 'yyyy-MM-dd');
  let appointments = [];
  try {
    appointments = JSON.parse(localStorage.getItem('sonriebot-appointments') || '[]');
  } catch {
    appointments = [];
  }
  const bookedTimes = appointments.filter(a => a.date === dateStr).map(a => a.time);

  const workHours = dayOfWeek === 6 ? WORK_HOURS.saturday : WORK_HOURS.weekday;
  const now = new Date();
  const isToday = format(now, 'yyyy-MM-dd') === dateStr;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (const period of ['morning', 'afternoon']) {
    if (!workHours[period]) continue;
    const { start, end } = workHours[period];
    for (let h = start; h < end; h += 0.5) {
      const hours = Math.floor(h);
      const minutes = (h % 1) * 60;
      const slot = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      if (isToday && (hours * 60 + minutes) <= nowMinutes + 30) continue;
      if (bookedTimes.includes(slot)) continue;
      slots.push(slot);
    }
  }
  return slots;
}

export function dayNameToNextDate(input) {
  if (!input) return null;
  const lower = input.toLowerCase().normalize('NFC');
  const match = lower.match(/\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/);
  if (!match) return null;
  const target = DAY_NAMES[match[1]];
  if (target === undefined) return null;
  const today = new Date();
  let diff = target - today.getDay();
  if (diff <= 0) diff += 7;
  return addDays(today, diff);
}

export function parseRelativeDay(input) {
  if (!input) return null;
  const lower = input.toLowerCase().normalize('NFC');
  if (lower.includes('pasado mañana') || lower.includes('pasado manana')) {
    return addDays(new Date(), 2);
  }
  if (lower.includes('mañana') || lower.includes('manana')) {
    return addDays(new Date(), 1);
  }
  if (lower.includes('hoy')) {
    return new Date();
  }
  return null;
}

export function formatDateLabel(date) {
  return format(date, "EEE d 'de' MMM", { locale: es });
}

export function formatLongDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}
