const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const CLINIC_NAME = import.meta.env.VITE_CLINIC_NAME || 'Clínica Dental Sonrisa Perfecta';
const CLINIC_ADDRESS = import.meta.env.VITE_CLINIC_ADDRESS || 'Av. Principal 123';
const CLINIC_PHONE = import.meta.env.VITE_CLINIC_PHONE || '+34 900 123 456';
const CLINIC_DOCTOR = import.meta.env.VITE_CLINIC_DOCTOR || 'Dr. Alejandro Martínez';

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
- ✨ Limpieza dental — 60€ · 30 min
- 😁 Blanqueamiento — 150€ · 90 min
- 🦷 Ortodoncia — Valoración gratuita · 30 min
- 🔩 Implante dental — desde 1.200€ · 90 min
- ⚡ Urgencia dental — 90€ · 30 min

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

export async function sendMessageToSonrieBot(userMessage, conversationHistory = []) {
  if (!OPENROUTER_API_KEY) {
    return getLocalResponse(userMessage);
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'user', content: userMessage }
  ];

  for (const model of DEFAULT_MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SonrieBot'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          max_tokens: 400,
          presence_penalty: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      } else {
        console.warn(`OpenRouter ${model}: ${response.status}`);
      }
    } catch (e) {
      console.warn(`Modelo ${model} falló:`, e.message);
    }
  }

  return getLocalResponse(userMessage);
}

export async function generateReengagementMessage(conversationHistory, level) {
  if (!OPENROUTER_API_KEY) {
    return level === 'soft'
      ? '¿Sigues ahí? Si necesitas algo más, te leo.'
      : `Antes de irte: la primera consulta en ${CLINIC_NAME} es gratuita y solo lleva 30 min. ¿Te reservo hueco esta semana?\n\n[INICIAR_RESERVA]`;
  }

  const instruction = level === 'soft'
    ? 'El paciente lleva 60 segundos sin responder. Escribe UNA línea muy corta y amable preguntando si sigue ahí, sin presionar. Máximo 12 palabras. Sin emojis.'
    : 'El paciente lleva más de 3 minutos sin responder y probablemente abandona. Escribe un mensaje breve (máx 25 palabras) recordándole que la primera consulta es gratuita y proponiendo reservar. Termina con la línea [INICIAR_RESERVA] aparte.';

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.slice(-6).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content
    })),
    { role: 'system', content: instruction }
  ];

  for (const model of DEFAULT_MODELS) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SonrieBot'
        },
        body: JSON.stringify({
          model, messages, temperature: 0.7, max_tokens: 120
        })
      });
      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return content;
      }
    } catch (e) {
      console.warn(`Reengagement ${model} falló:`, e.message);
    }
  }

  return level === 'soft'
    ? '¿Sigues ahí? Si necesitas algo más, te leo.'
    : `Antes de irte: la primera consulta en ${CLINIC_NAME} es gratuita y solo lleva 30 min. ¿Te reservo hueco esta semana?\n\n[INICIAR_RESERVA]`;
}

function getLocalResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('hola') || msg.includes('buenos') || msg.includes('buenas')) {
    return `Hola, bienvenido a ${CLINIC_NAME}. ¿Qué te trae por aquí: una revisión, alguna molestia, o un tratamiento concreto?`;
  }
  if (msg.includes('cita') || msg.includes('agendar') || msg.includes('reservar') || msg.includes('hueco')) {
    return `Perfecto. Te ayudo a reservar tu cita en un momento.\n[INICIAR_RESERVA]`;
  }
  if (msg.includes('precio') || msg.includes('coste') || msg.includes('cuanto') || msg.includes('cuánto')) {
    return 'Nuestros precios:\n• 🦷 Primera consulta: gratis\n• ✨ Limpieza: 60€\n• 😁 Blanqueamiento: 150€\n• 🦷 Ortodoncia: valoración gratis\n• 🔩 Implante: desde 1.200€\n• ⚡ Urgencia: 90€\n\n¿Te reservo la primera consulta? Es gratuita y dura solo 30 min.';
  }
  if (msg.includes('horario') || msg.includes('abierto') || msg.includes('cuando')) {
    return 'Atendemos L-V de 9 a 14 y de 16 a 19, sábados de 9 a 13. ¿Quieres que te reserve hueco?';
  }
  if (msg.includes('dolor') || msg.includes('urgencia') || msg.includes('duele')) {
    return `Si tienes dolor podemos atenderte con prioridad hoy o mañana. La urgencia cuesta 90€. ¿Te reservo hueco ahora?\n[INICIAR_RESERVA]`;
  }
  if (msg.includes('miedo') || msg.includes('nervios')) {
    return 'Es muy común. La primera consulta es solo conocer al doctor, sin tratamiento ese día, y es gratuita. ¿Te reservo cita?';
  }

  return `Cuéntame qué necesitas y te ayudo. Puedo informarte sobre nuestros tratamientos, precios o reservar una cita en ${CLINIC_NAME}.`;
}

export async function testOpenRouterConnection() {
  if (!OPENROUTER_API_KEY) {
    return { success: false, error: 'Falta VITE_OPENROUTER_API_KEY' };
  }
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: DEFAULT_MODELS[0],
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      })
    });
    return { success: response.ok, status: response.status };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
