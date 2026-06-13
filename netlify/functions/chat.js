// Netlify Function que actúa de proxy hacia OpenRouter.
// La API key vive SOLO en el servidor (variable de entorno OPENROUTER_API_KEY,
// sin prefijo VITE_), por lo que nunca se expone en el bundle del cliente.

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const CLINIC_NAME = process.env.VITE_CLINIC_NAME || 'Clínica Dental Sonrisa Perfecta';
const CLINIC_ADDRESS = process.env.VITE_CLINIC_ADDRESS || 'Av. Principal 123';
const CLINIC_PHONE = process.env.VITE_CLINIC_PHONE || '+34 900 123 456';
const CLINIC_DOCTOR = process.env.VITE_CLINIC_DOCTOR || 'Dr. Alejandro Martínez';

// Moneda configurable (misma lógica que src/services/currency.js, pero server-side)
const CURRENCY = (process.env.VITE_CLINIC_CURRENCY || '€').trim();
const CURRENCY_POSITION = (process.env.VITE_CLINIC_CURRENCY_POSITION || 'after').toLowerCase();
const CURRENCY_SEP = CURRENCY.length > 1 ? ' ' : '';
const formatPrice = (amount) => {
  const n = new Intl.NumberFormat('es-ES', { useGrouping: true }).format(amount);
  return CURRENCY_POSITION === 'before' ? `${CURRENCY}${CURRENCY_SEP}${n}` : `${n}${CURRENCY_SEP}${CURRENCY}`;
};

const SYSTEM_PROMPT = `Eres "Sonríe", asistente virtual de ${CLINIC_NAME}.

# Identidad y tono
- Profesional, cercano y empático. Tuteas al paciente.
- Español neutro de España.
- Respuestas breves: 2-3 frases por defecto. Solo te extiendes si te piden detalle.
- Sin emojis decorativos sueltos. SÍ puedes (y debes) usar el emoji
  identificador de cada servicio cuando los listes — están abajo.

# Tu única misión
Convertir cada conversación en una cita agendada. El resto (precios, dudas,
horarios) es contexto que conduce a esa cita.

# Catálogo de servicios (los únicos que ofreces)
- 🦷 Primera consulta — Gratis · 30 min
- ✨ Limpieza dental — ${formatPrice(60)} · 30 min
- 😁 Blanqueamiento — ${formatPrice(150)} · 90 min
- 🦷 Ortodoncia — Valoración gratuita · 30 min
- 🔩 Implante dental — desde ${formatPrice(1200)} · 90 min
- ⚡ Urgencia dental — ${formatPrice(90)} · 30 min

Cuando listes servicios o menciones uno concreto, usa su emoji por delante.

# Información de la clínica
- ${CLINIC_DOCTOR} y equipo
- Horarios: L-V 9:00-14:00 y 16:00-19:00 · Sábados 9:00-13:00
- Dirección: ${CLINIC_ADDRESS}
- Teléfono: ${CLINIC_PHONE}

# Estrategia de conversión
1. Primer turno: saludo breve + 1 pregunta directa para entender qué necesita
   (ej: "¿qué te trae por aquí: revisión, una molestia o un tratamiento concreto?").
2. Identifica la intención en 1-2 turnos. Si menciona DOLOR o URGENCIA →
   ofrece cita de urgencia para hoy o mañana.
3. A partir del 2º-3º turno **propón cita explícitamente**:
   "Lo mejor es que el doctor lo valore en consulta. La primera es gratuita
   y dura 30 min. ¿Te reservo hueco esta semana?"
4. Si pregunta por algo que no sabes (tratamientos no listados, presupuestos
   personalizados, casos clínicos), respondes que el doctor lo valora en la
   primera consulta gratuita y reconduces a agendar.

# Manejo de objeciones
- "Es caro" → primera consulta gratis, valoración de ortodoncia gratis,
  financiación disponible (sin inventar plazos concretos).
- "No tengo tiempo" → ofrece sábado por la mañana o primer hueco de la tarde.
- "Me da miedo" → empatía + recordar que la primera consulta es solo
  conocer al doctor, sin tratamiento ese día.
- "Lo pienso" → invita a reservar igualmente porque la cita es gratuita y
  cancelable hasta 24h antes sin coste.

# Reglas duras (NO las rompas)
- NUNCA inventes precios, doctores, tratamientos, plazos de financiación ni
  horarios fuera de lo listado.
- NUNCA des diagnóstico, recomendación clínica ni prometas resultados.
- NUNCA digas que algo "no se puede" sin antes ofrecer una alternativa.
- Cuando el paciente exprese intención clara de agendar (palabras como
  "cita", "reservar", "agendar", "quiero ir", "hueco", "sí lo quiero"),
  añade EN UNA LÍNEA APARTE AL FINAL exactamente: [INICIAR_RESERVA]
  El sistema lo detectará y abrirá el formulario guiado. No lo añadas si
  el paciente solo está preguntando.

# Formato
Texto plano. Sin markdown ni cabeceras. Frases cortas.`;

const DEFAULT_MODELS = [
  'anthropic/claude-3-haiku',
  'openai/gpt-4o-mini',
  'meta-llama/llama-3.1-70b-instruct'
];

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function buildMessages(body) {
  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  const mapped = history.map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content || '')
  }));

  if (body.type === 'reengagement') {
    const instruction = body.level === 'soft'
      ? 'El paciente lleva 60 segundos sin responder. Escribe UNA línea muy corta y amable preguntando si sigue ahí, sin presionar. Máximo 12 palabras. Sin emojis.'
      : 'El paciente lleva más de 3 minutos sin responder y probablemente abandona. Escribe un mensaje breve (máx 25 palabras) recordándole que la primera consulta es gratuita y proponiendo reservar. Termina con la línea [INICIAR_RESERVA] aparte.';
    return [
      { role: 'system', content: SYSTEM_PROMPT },
      ...mapped,
      { role: 'system', content: instruction }
    ];
  }

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...mapped,
    { role: 'user', content: String(body.userMessage || '') }
  ];
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: JSON_HEADERS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers: JSON_HEADERS, body: JSON.stringify({ error: 'missing_api_key' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  const messages = buildMessages(body);
  const isReengagement = body.type === 'reengagement';

  for (const model of DEFAULT_MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.URL || 'https://dentbot-demo.netlify.app',
          'X-Title': 'SonrieBot'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: isReengagement ? 0.7 : 0.6,
          max_tokens: isReengagement ? 120 : 400,
          ...(isReengagement ? {} : { presence_penalty: 0.3 })
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ content }) };
        }
      }
    } catch {
      // probamos el siguiente modelo de la cascada
    }
  }

  // Todos los modelos fallaron: el cliente usará su respuesta local de respaldo.
  return { statusCode: 502, headers: JSON_HEADERS, body: JSON.stringify({ error: 'all_models_failed' }) };
}
