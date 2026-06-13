// Webhook de WhatsApp para el demo, vía Twilio Sandbox.
//
// Twilio envía cada mensaje entrante como POST (form-urlencoded) a esta función.
// Respondemos con TwiML <Message>, así Twilio reenvía la respuesta al paciente
// SIN necesidad de Account SID / Auth Token (cero fricción para el demo).
//
// El cerebro es el mismo del agente web: SYSTEM_PROMPT + cascada de modelos de
// OpenRouter. La memoria de conversación se guarda por número en Netlify Blobs.
//
// Variables de entorno (en Netlify → Site settings → Environment variables):
//   OPENROUTER_API_KEY            🔒 (ya existente) — si falta, usa respuestas locales
//   VITE_CLINIC_*                 (opcionales) — datos de clínica y moneda
//
// Webhook a configurar en Twilio (WhatsApp Sandbox → "When a message comes in"):
//   POST  https://<tu-sitio>.netlify.app/.netlify/functions/whatsapp

import { getStore } from '@netlify/blobs';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const CLINIC_NAME = process.env.VITE_CLINIC_NAME || 'Clínica Dental Sonrisa Perfecta';
const CLINIC_ADDRESS = process.env.VITE_CLINIC_ADDRESS || 'Av. Principal 123';
const CLINIC_PHONE = process.env.VITE_CLINIC_PHONE || '+34 900 123 456';
const CLINIC_DOCTOR = process.env.VITE_CLINIC_DOCTOR || 'Dr. Alejandro Martínez';

// Moneda configurable (misma lógica que src/services/currency.js)
const CURRENCY = (process.env.VITE_CLINIC_CURRENCY || '€').trim();
const CURRENCY_POSITION = (process.env.VITE_CLINIC_CURRENCY_POSITION || 'after').toLowerCase();
const CURRENCY_SEP = CURRENCY.length > 1 ? ' ' : '';
const formatPrice = (amount) => {
  const n = new Intl.NumberFormat('es-ES', { useGrouping: true }).format(amount);
  return CURRENCY_POSITION === 'before' ? `${CURRENCY}${CURRENCY_SEP}${n}` : `${n}${CURRENCY_SEP}${CURRENCY}`;
};

const SYSTEM_PROMPT = `Eres "Sonríe", asistente virtual de ${CLINIC_NAME} que atiende por WhatsApp.

# Identidad y tono
- Profesional, cercano y empático. Tuteas al paciente.
- Español neutro de España.
- Respuestas breves (1-3 frases). Es WhatsApp: mensajes cortos y claros.
- Usa el emoji identificador de cada servicio cuando los listes.

# Tu única misión
Convertir cada conversación en una cita agendada.

# Catálogo de servicios (los únicos que ofreces)
- 🦷 Primera consulta — Gratis · 30 min
- ✨ Limpieza dental — ${formatPrice(60)} · 30 min
- 😁 Blanqueamiento — ${formatPrice(150)} · 90 min
- 🦷 Ortodoncia — Valoración gratuita · 30 min
- 🔩 Implante dental — desde ${formatPrice(1200)} · 90 min
- ⚡ Urgencia dental — ${formatPrice(90)} · 30 min

# Información de la clínica
- ${CLINIC_DOCTOR} y equipo
- Horarios: L-V 9:00-14:00 y 16:00-19:00 · Sábados 9:00-13:00 · Domingos cerrado
- Dirección: ${CLINIC_ADDRESS}
- Teléfono: ${CLINIC_PHONE}

# Cómo agendar por WhatsApp (hazlo en la conversación, paso a paso)
Cuando el paciente quiera cita, ve pidiendo de uno en uno: servicio → día → hora
(dentro del horario) → nombre completo → email. El teléfono ya lo tienes (es su
WhatsApp). Al final, RESUME la cita confirmada con servicio, día, hora, nombre,
email y precio, y recuérdale que puede cancelar con 24h de antelación.

# Reglas duras
- NUNCA inventes precios, doctores, tratamientos ni horarios fuera de lo listado.
- NUNCA des diagnóstico ni recomendación clínica.
- Si menciona DOLOR o URGENCIA, prioriza ofrecer cita de urgencia para hoy o mañana.
- No uses markdown ni cabeceras. Texto plano apto para WhatsApp.`;

const DEFAULT_MODELS = [
  'anthropic/claude-3-haiku',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.1-70b-instruct'
];

const MAX_HISTORY = 20;     // mensajes guardados por número
const CONTEXT_WINDOW = 12;   // mensajes enviados al modelo

async function generateReply(history, userMessage) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return getLocalResponse(userMessage);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-CONTEXT_WINDOW).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content || '')
    })),
    { role: 'user', content: userMessage }
  ];

  for (const model of DEFAULT_MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.URL || 'https://dentbot-demo.netlify.app',
          'X-Title': 'SonrieBot WhatsApp'
        },
        body: JSON.stringify({ model, messages, temperature: 0.6, max_tokens: 400, presence_penalty: 0.3 })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch {
      // probamos el siguiente modelo de la cascada
    }
  }
  return getLocalResponse(userMessage);
}

function getLocalResponse(message) {
  const msg = (message || '').toLowerCase();
  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return `Hola, bienvenido a ${CLINIC_NAME}. ¿Qué te trae por aquí: una revisión, una molestia o un tratamiento concreto?`;
  }
  if (msg.includes('precio') || msg.includes('coste') || msg.includes('cuanto') || msg.includes('cuánto')) {
    return `Nuestros precios:\n• 🦷 Primera consulta: gratis\n• ✨ Limpieza: ${formatPrice(60)}\n• 😁 Blanqueamiento: ${formatPrice(150)}\n• 🦷 Ortodoncia: valoración gratis\n• 🔩 Implante: desde ${formatPrice(1200)}\n• ⚡ Urgencia: ${formatPrice(90)}\n\n¿Te reservo la primera consulta? Es gratuita y dura 30 min.`;
  }
  if (msg.includes('horario') || msg.includes('abierto') || msg.includes('cuando')) {
    return 'Atendemos L-V de 9 a 14 y de 16 a 19, sábados de 9 a 13. ¿Quieres que te reserve hueco?';
  }
  if (msg.includes('dolor') || msg.includes('urgencia') || msg.includes('duele')) {
    return `Si tienes dolor podemos atenderte con prioridad hoy o mañana. La urgencia cuesta ${formatPrice(90)}. ¿Te reservo hueco ahora?`;
  }
  return `Cuéntame qué necesitas y te ayudo. Puedo informarte sobre tratamientos, precios u horarios, o reservarte una cita en ${CLINIC_NAME}.`;
}

// --- Memoria de conversación por número (Netlify Blobs) ---
async function loadHistory(key) {
  try {
    const store = getStore('whatsapp-sessions');
    return (await store.get(key, { type: 'json' })) || [];
  } catch {
    return []; // sin Blobs degradamos a una sola pasada (el demo sigue respondiendo)
  }
}

async function saveHistory(key, history) {
  try {
    const store = getStore('whatsapp-sessions');
    await store.setJSON(key, history.slice(-MAX_HISTORY));
  } catch {
    // si Blobs no está disponible, no rompemos la respuesta
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function twiml(message) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  // Twilio manda application/x-www-form-urlencoded
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');
  const params = new URLSearchParams(rawBody);

  const from = params.get('From') || 'unknown';            // p.ej. "whatsapp:+34..."
  const body = (params.get('Body') || '').trim();

  if (!body) {
    return { statusCode: 200, headers: { 'Content-Type': 'text/xml' }, body: twiml('¿En qué puedo ayudarte?') };
  }

  const key = from.replace(/[^a-zA-Z0-9]/g, '_');
  const history = await loadHistory(key);

  let reply;
  try {
    reply = await generateReply(history, body);
  } catch {
    reply = 'Disculpa, ha habido un problema al responder. ¿Puedes repetirlo?';
  }

  // En WhatsApp no hay wizard: quitamos el marcador interno si aparece.
  reply = reply.replace('[INICIAR_RESERVA]', '').trim();

  history.push({ role: 'user', content: body });
  history.push({ role: 'assistant', content: reply });
  await saveHistory(key, history);

  return { statusCode: 200, headers: { 'Content-Type': 'text/xml' }, body: twiml(reply) };
}
