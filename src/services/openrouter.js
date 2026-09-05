// El cliente nunca habla directamente con OpenRouter ni conoce la API key.
// Toda llamada al LLM pasa por la Netlify Function /.netlify/functions/chat,
// que guarda la clave en el servidor. Si la función no está disponible
// (p. ej. `vite dev` sin `netlify dev`) o falla, se usa una respuesta local.

const CHAT_ENDPOINT = '/.netlify/functions/chat';

import { formatPrice } from './currency';

const CLINIC_NAME = import.meta.env.VITE_CLINIC_NAME || 'Clínica Dental Sonrisa Perfecta';

// De dónde salió cada respuesta. La UI lo necesita para no anunciar "en línea"
// mientras en realidad está contestando el fallback local por palabras clave.
export const AI_SOURCE = {
  AI: 'ai',           // respuesta real del LLM vía la Netlify Function
  OFFLINE: 'offline'  // la función no respondió: respuesta local de respaldo
};

// Lanza si la función no está disponible (p. ej. `vite dev` sin `netlify dev`)
// o si responde vacío, para que quien llama pueda distinguir un fallo de
// transporte de una respuesta legítima del modelo.
async function callChatFunction(payload) {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`La función de chat respondió ${response.status}`);
  }
  const data = await response.json();
  const content = data?.content?.trim();
  if (!content) {
    throw new Error('La función de chat devolvió una respuesta vacía');
  }
  return content;
}

export async function sendMessageToSonrieBot(userMessage, conversationHistory = []) {
  try {
    const content = await callChatFunction({
      type: 'chat',
      userMessage,
      history: conversationHistory.map(m => ({ role: m.role, content: m.content }))
    });
    return { content, source: AI_SOURCE.AI };
  } catch (e) {
    console.warn('Chat function falló:', e.message);
    return { content: getLocalResponse(userMessage), source: AI_SOURCE.OFFLINE };
  }
}

export async function generateReengagementMessage(conversationHistory, level) {
  try {
    const content = await callChatFunction({
      type: 'reengagement',
      level,
      history: conversationHistory.map(m => ({ role: m.role, content: m.content }))
    });
    return { content, source: AI_SOURCE.AI };
  } catch (e) {
    console.warn('Reengagement function falló:', e.message);
    return {
      content: level === 'soft'
        ? '¿Sigues ahí? Si necesitas algo más, te leo.'
        : `Antes de irte: la primera consulta en ${CLINIC_NAME} es gratuita y solo lleva 30 min. ¿Te reservo hueco esta semana?\n\n[INICIAR_RESERVA]`,
      source: AI_SOURCE.OFFLINE
    };
  }
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
    return `Nuestros precios:\n• 🦷 Primera consulta: gratis\n• ✨ Limpieza: ${formatPrice(60)}\n• 😁 Blanqueamiento: ${formatPrice(150)}\n• 🦷 Ortodoncia: valoración gratis\n• 🔩 Implante: desde ${formatPrice(1200)}\n• ⚡ Urgencia: ${formatPrice(90)}\n\n¿Te reservo la primera consulta? Es gratuita y dura solo 30 min.`;
  }
  if (msg.includes('horario') || msg.includes('abierto') || msg.includes('cuando')) {
    return 'Atendemos L-V de 9 a 14 y de 16 a 19, sábados de 9 a 13. ¿Quieres que te reserve hueco?';
  }
  if (msg.includes('dolor') || msg.includes('urgencia') || msg.includes('duele')) {
    return `Si tienes dolor podemos atenderte con prioridad hoy o mañana. La urgencia cuesta ${formatPrice(90)}. ¿Te reservo hueco ahora?\n[INICIAR_RESERVA]`;
  }
  if (msg.includes('miedo') || msg.includes('nervios')) {
    return 'Es muy común. La primera consulta es solo conocer al doctor, sin tratamiento ese día, y es gratuita. ¿Te reservo cita?';
  }

  return `Cuéntame qué necesitas y te ayudo. Puedo informarte sobre nuestros tratamientos, precios o reservar una cita en ${CLINIC_NAME}.`;
}

export async function testChatConnection() {
  try {
    await callChatFunction({ type: 'chat', userMessage: 'ping', history: [] });
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
