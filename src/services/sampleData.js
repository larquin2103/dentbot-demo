import { format, addDays, startOfWeek } from 'date-fns';

const STORAGE_KEY = 'sonriebot-appointments';
const SAMPLE_FLAG_KEY = 'sonriebot-sample-data-loaded';

const SAMPLE_PATIENTS = [
  { name: 'María González',  email: 'maria.gonzalez@email.com',  phone: '612 345 678' },
  { name: 'Carlos Ruiz',     email: 'carlos.ruiz@email.com',     phone: '634 112 998' },
  { name: 'Lucía Fernández', email: 'lucia.fernandez@email.com', phone: '655 220 471' },
  { name: 'Javier Martín',   email: 'javier.martin@email.com',   phone: '677 845 213' },
  { name: 'Ana Torres',      email: 'ana.torres@email.com',      phone: '699 451 887' },
  { name: 'Pablo Navarro',   email: 'pablo.navarro@email.com',   phone: '611 778 320' },
  { name: 'Elena Castro',    email: 'elena.castro@email.com',    phone: '622 098 561' },
  { name: 'Diego Romero',    email: 'diego.romero@email.com',    phone: '688 334 902' },
  { name: 'Isabel Vidal',    email: 'isabel.vidal@email.com',    phone: '610 902 158' },
  { name: 'Marcos Iglesias', email: 'marcos.iglesias@email.com', phone: '644 671 003' }
];

const SAMPLE_TEMPLATES = [
  // dayOffset relative to "Monday of current week"; null status → confirmed
  { dayOffset: 0, time: '09:30', service: 'limpieza',       status: 'confirmed' },
  { dayOffset: 0, time: '10:30', service: 'consulta',       status: 'confirmed' },
  { dayOffset: 0, time: '12:00', service: 'ortodoncia',     status: 'pending'   },
  { dayOffset: 0, time: '16:30', service: 'blanqueamiento', status: 'confirmed' },

  { dayOffset: 1, time: '09:00', service: 'consulta',       status: 'confirmed' },
  { dayOffset: 1, time: '11:00', service: 'limpieza',       status: 'confirmed' },
  { dayOffset: 1, time: '17:00', service: 'implante',       status: 'pending'   },

  { dayOffset: 2, time: '10:00', service: 'urgencia',       status: 'confirmed' },
  { dayOffset: 2, time: '12:30', service: 'limpieza',       status: 'confirmed' },
  { dayOffset: 2, time: '16:00', service: 'consulta',       status: 'pending'   },

  { dayOffset: 3, time: '09:30', service: 'blanqueamiento', status: 'confirmed' },
  { dayOffset: 3, time: '13:00', service: 'consulta',       status: 'confirmed' },

  { dayOffset: 4, time: '10:00', service: 'ortodoncia',     status: 'pending'   },
  { dayOffset: 4, time: '11:30', service: 'limpieza',       status: 'confirmed' },
  { dayOffset: 4, time: '17:30', service: 'consulta',       status: 'confirmed' },

  { dayOffset: 5, time: '09:30', service: 'limpieza',       status: 'confirmed' },
  { dayOffset: 5, time: '11:00', service: 'urgencia',       status: 'confirmed' }
];

export function generateSampleAppointments(referenceDate = new Date()) {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
  return SAMPLE_TEMPLATES.map((tpl, idx) => {
    const patient = SAMPLE_PATIENTS[idx % SAMPLE_PATIENTS.length];
    const day = addDays(monday, tpl.dayOffset);
    return {
      id: `sample-${idx}-${day.getTime()}`,
      date: format(day, 'yyyy-MM-dd'),
      time: tpl.time,
      service: tpl.service,
      patient: patient.name,
      email: patient.email,
      phone: patient.phone,
      status: tpl.status,
      isSample: true
    };
  });
}

export function loadSampleData(referenceDate = new Date()) {
  const existing = readAppointments();
  const samples = generateSampleAppointments(referenceDate);
  const taken = new Set(existing.map(a => `${a.date}|${a.time}`));
  const merged = [...existing, ...samples.filter(s => !taken.has(`${s.date}|${s.time}`))];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  localStorage.setItem(SAMPLE_FLAG_KEY, '1');
  window.dispatchEvent(new Event('storage'));
  return merged;
}

export function clearSampleData() {
  const existing = readAppointments();
  const kept = existing.filter(a => !a.isSample);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
  localStorage.removeItem(SAMPLE_FLAG_KEY);
  window.dispatchEvent(new Event('storage'));
  return kept;
}

export function hasSampleData() {
  return localStorage.getItem(SAMPLE_FLAG_KEY) === '1';
}

function readAppointments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
