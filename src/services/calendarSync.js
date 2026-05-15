import { format } from 'date-fns';

// Variables de entorno (sin valores hardcodeados)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

// Servicios para referencia
const SERVICES = {
  consulta: { name: 'Primera consulta', duration: 30, price: 'Gratis' },
  limpieza: { name: 'Limpieza dental', duration: 30, price: '60€' },
  blanqueamiento: { name: 'Blanqueamiento', duration: 90, price: '150€' },
  ortodoncia: { name: 'Ortodoncia', duration: 30, price: 'Consulta gratis' },
  implante: { name: 'Implante dental', duration: 90, price: '1.200€' },
  urgencia: { name: 'Urgencia', duration: 30, price: '90€' }
};

let tokenClient = null;
let googleToken = null;

/**
 * Inicializar Google Identity Services
 */
export async function initGoogleAPI() {
  return new Promise((resolve) => {
    // Restaurar token si existe
    const savedToken = localStorage.getItem('googleCalendarToken');
    if (savedToken) {
      googleToken = savedToken;
      console.log('✅ Token de Google restaurado');
    }

    // Si ya está cargado
    if (window.google?.accounts?.oauth2) {
      console.log('✅ Google Identity Services ya cargado');
      initTokenClient();
      resolve(true);
      return;
    }

    // Cargar script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Identity Services cargado');
      setTimeout(() => {
        initTokenClient();
        resolve(true);
      }, 500);
    };
    
    script.onerror = () => {
      console.error('❌ Error al cargar Google Identity Services');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
}

/**
 * Inicializar Token Client
 */
function initTokenClient() {
  if (!window.google?.accounts?.oauth2) {
    console.error('❌ Google accounts no disponible');
    return;
  }

  if (!GOOGLE_CLIENT_ID) {
    console.error('❌ VITE_GOOGLE_CLIENT_ID no configurado');
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('❌ Error obteniendo token:', tokenResponse.error);
        googleToken = null;
        return;
      }
      googleToken = tokenResponse.access_token;
      localStorage.setItem('googleCalendarToken', googleToken);
      console.log('✅ Token guardado correctamente');
    },
    error_callback: (error) => {
      console.error('❌ Error en token client:', error);
      googleToken = null;
    }
  });
  
  console.log('✅ Token Client inicializado');
}

/**
 * Autenticar con Google
 */
export async function authenticateGoogle() {
  console.log('🔑 Iniciando autenticación Google...');
  
  await initGoogleAPI();
  
  return new Promise((resolve) => {
    if (!tokenClient) {
      console.error('❌ TokenClient no inicializado');
      resolve(false);
      return;
    }

    try {
      tokenClient.requestAccessToken({ prompt: 'consent' });
      
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkToken = setInterval(() => {
        attempts++;
        
        if (googleToken) {
          clearInterval(checkToken);
          console.log('✅ Autenticación exitosa');
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkToken);
          console.error('❌ Timeout esperando token');
          resolve(false);
        }
      }, 500);
      
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      resolve(false);
    }
  });
}

/**
 * Verificar conexión
 */
export function isGoogleConnected() {
  const token = localStorage.getItem('googleCalendarToken');
  if (token) {
    googleToken = token;
    return true;
  }
  return !!googleToken;
}

/**
 * Desconectar Google
 */
export function disconnectGoogle() {
  const savedToken = localStorage.getItem('googleCalendarToken');
  if (savedToken && window.google?.accounts?.oauth2?.revoke) {
    window.google.accounts.oauth2.revoke(savedToken, () => {
      console.log('🔌 Token revocado');
    });
  }
  
  googleToken = null;
  localStorage.removeItem('googleCalendarToken');
  console.log('🔌 Desconectado de Google Calendar');
}

/**
 * Sincronizar cita con Google Calendar
 */
export async function syncToGoogleCalendar(appointment) {
  // Obtener token
  let token = googleToken;
  if (!token) {
    token = localStorage.getItem('googleCalendarToken');
    if (token) {
      googleToken = token;
      console.log('✅ Token restaurado para sincronización');
    }
  }
  
  if (!token) {
    console.log('⚠️ No hay token de Google. Conecta Google Calendar primero.');
    return null;
  }

  // Validar datos de la cita
  if (!appointment.date || !appointment.time) {
    console.error('❌ Cita sin fecha u hora:', appointment);
    return null;
  }

  try {
    const serviceName = appointment.serviceName || SERVICES[appointment.service]?.name || 'Cita dental';
    const duration = SERVICES[appointment.service]?.duration || 30;
    
    // Formatear fecha correctamente
    const dateStr = appointment.date.includes('T') 
      ? appointment.date.split('T')[0] 
      : appointment.date;
    const timeStr = appointment.time.includes(':') 
      ? appointment.time 
      : `${appointment.time}:00`;
    
    const startDateTime = `${dateStr}T${timeStr}:00`;
    
    // Validar fecha
    const startDate = new Date(startDateTime);
    if (isNaN(startDate.getTime())) {
      console.error('❌ Fecha inválida:', startDateTime);
      return null;
    }
    
    // Calcular hora de fin
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    const endTime = `${dateStr}T${endHours}:${endMinutes}:00`;

    const event = {
      summary: `🦷 ${serviceName} - ${appointment.patient || 'Paciente'}`,
      description: `Paciente: ${appointment.patient || 'N/A'}
Teléfono: ${appointment.phone || 'N/A'}
Email: ${appointment.email || 'N/A'}
Servicio: ${serviceName}
Precio: ${SERVICES[appointment.service]?.price || 'N/A'}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'Europe/Madrid'
      },
      end: {
        dateTime: endTime,
        timeZone: 'Europe/Madrid'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 }
        ]
      }
    };

    console.log('📤 Sincronizando con Google Calendar:', event.summary);

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Google Calendar: Evento creado:', data.id);
      
      // Guardar ID del evento
      const appointments = JSON.parse(localStorage.getItem('sonriebot-appointments') || '[]');
      const updated = appointments.map(apt => {
        if (apt.id === appointment.id) {
          return { ...apt, googleEventId: data.id };
        }
        return apt;
      });
      localStorage.setItem('sonriebot-appointments', JSON.stringify(updated));
      
      return data.id;
    } else {
      const error = await response.json();
      console.error('❌ Google Calendar Error:', error);
      
      if (response.status === 401) {
        console.log('🔄 Token expirado, limpiando...');
        googleToken = null;
        localStorage.removeItem('googleCalendarToken');
      }
      
      return null;
    }
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
    return null;
  }
}

/**
 * Generar archivo iCal
 */
export function generateICalFile(day, appointments) {
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SonrieBot//Clínica Dental//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Clínica Dental Sonrisa Perfecta',
    'X-WR-TIMEZONE:Europe/Madrid'
  ];

  appointments.forEach(apt => {
    if (!apt.date || !apt.time) return;
    
    const duration = SERVICES[apt.service]?.duration || 30;
    const startDateTime = `${apt.date}T${apt.time}:00`;
    const startDate = new Date(startDateTime);
    
    if (isNaN(startDate.getTime())) return;
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
    const endTime = `${apt.date}T${endHours}:${endMinutes}:00`;
    
    icalContent.push(
      'BEGIN:VEVENT',
      `DTSTART:${startDateTime.replace(/[-:]/g, '')}`,
      `DTEND:${endTime.replace(/[-:]/g, '')}`,
      `SUMMARY:${apt.serviceName || 'Cita dental'} - ${apt.patient || 'Paciente'}`,
      `DESCRIPTION:Paciente: ${apt.patient || 'N/A'}\\nTeléfono: ${apt.phone || 'N/A'}`,
      `LOCATION:Av. Principal 123, Ciudad Dental`,
      'END:VEVENT'
    );
  });

  icalContent.push('END:VCALENDAR');
  return icalContent.join('\r\n');
}

/**
 * Descargar archivo iCal
 */
export function downloadICalFile(day, appointments) {
  const icalContent = generateICalFile(day, appointments);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `citas_${format(day, 'yyyy-MM-dd')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log('✅ Archivo iCal descargado');
}

/**
 * Sincronización completa
 */
export async function fullSync() {
  const localAppointments = JSON.parse(localStorage.getItem('sonriebot-appointments') || '[]');
  let synced = 0;
  
  console.log(`🔄 Sincronizando ${localAppointments.length} citas...`);
  
  for (const apt of localAppointments) {
    // Validar cita
    if (!apt.date || !apt.time) {
      console.log(`  ⚠️ Cita ${apt.id}: falta fecha/hora`);
      continue;
    }
    
    const testDate = new Date(`${apt.date}T${apt.time}:00`);
    if (isNaN(testDate.getTime())) {
      console.log(`  ⚠️ Cita ${apt.id}: fecha inválida`);
      continue;
    }
    
    if (!apt.googleEventId) {
      console.log(`  📤 Sincronizando cita ${apt.id}...`);
      const eventId = await syncToGoogleCalendar(apt);
      if (eventId) {
        apt.googleEventId = eventId;
        synced++;
        console.log(`  ✅ Cita ${apt.id} sincronizada`);
      }
    }
  }
  
  localStorage.setItem('sonriebot-appointments', JSON.stringify(localAppointments));
  console.log(`✅ ${synced} citas sincronizadas`);
  
  return localAppointments;
}

export { SERVICES as SYNC_SERVICES };