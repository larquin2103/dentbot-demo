const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function sendMessageToSonrieBot(userMessage, conversationHistory = []) {
  try {
    const systemPrompt = `Eres SonríeBot, asistente dental virtual de ${import.meta.env.VITE_CLINIC_NAME}. Responde de manera profesional, amable y concisa.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-3),
      { role: 'user', content: userMessage }
    ];

    // Intentar con modelos en orden
    const models = [
      'anthropic/claude-3-haiku',
      'openai/gpt-4o-mini',
      'meta-llama/llama-3-70b-instruct'
    ];

    for (const model of models) {
      try {
        const response = await fetch(OPENROUTER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'SonrieBot'
          },
          body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 300 })
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content;
        }
      } catch (e) {
        console.log(`Modelo ${model} falló, intentando siguiente...`);
      }
    }

    return getLocalResponse(userMessage);
  } catch (error) {
    console.error('Error:', error);
    return getLocalResponse(userMessage);
  }
}

function getLocalResponse(message) {
  const msg = message.toLowerCase();
  const clinicName = import.meta.env.VITE_CLINIC_NAME || 'Clínica Dental Sonrisa Perfecta';

  if (msg.includes('hola') || msg.includes('buenos')) {
    return `¡Hola! 👋 Bienvenido a ${clinicName}.\n\nSoy SonríeBot, tu asistente dental virtual. ¿En qué puedo ayudarte hoy?`;
  }
  if (msg.includes('cita') || msg.includes('agendar')) {
    return '¡Claro! 📅 Para agendar tu cita:\n\n1️⃣ Dime qué servicio te interesa\n2️⃣ Fecha y hora que prefieras\n3️⃣ Tus datos de contacto\n\nHorarios: L-V 9:00-14:00 y 16:00-19:00';
  }
  if (msg.includes('precio') || msg.includes('costo')) {
    return 'Nuestros precios:\n\n🦷 Primera consulta: GRATIS\n✨ Limpieza: 60€\n😁 Blanqueamiento: desde 150€\n🔩 Implantes: desde 1.200€\n⚡ Urgencias: 90€';
  }
  return 'Gracias por tu consulta. 😊\n\nPuedo ayudarte con:\n📅 Agendar citas\n💰 Información de precios\n🦷 Servicios dentales\n\n¿Qué necesitas?';
}