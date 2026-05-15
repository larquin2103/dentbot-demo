import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useChat } from '../../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickResponses from './QuickResponses';
import RatingSystem from '../UI/RatingSystem';

// Servicios disponibles
const SERVICES = [
  { id: 'consulta', name: 'Primera consulta', price: 'Gratis', duration: '30 min', emoji: '🦷' },
  { id: 'limpieza', name: 'Limpieza dental', price: '60€', duration: '30 min', emoji: '✨' },
  { id: 'blanqueamiento', name: 'Blanqueamiento', price: '150€', duration: '90 min', emoji: '😁' },
  { id: 'ortodoncia', name: 'Ortodoncia', price: 'Valoración gratis', duration: '30 min', emoji: '🦷' },
  { id: 'implante', name: 'Implante dental', price: '1.200€', duration: '90 min', emoji: '🔩' },
  { id: 'urgencia', name: 'Urgencia dental', price: '90€', duration: '30 min', emoji: '⚡' }
];

export default function ChatInterface() {
  const { theme } = useTheme();
  const { state, addMessage, dispatch } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isTyping]);

  // Manejar el flujo de agendamiento
  const handleBookingFlow = async (userInput) => {
    const { step, data } = state.bookingFlow;
    const input = userInput.trim();

    switch (step) {
      case 1: // Seleccionar servicio
        const service = SERVICES.find(s => 
          s.name.toLowerCase().includes(input.toLowerCase()) ||
          s.id === input.toLowerCase() ||
          (input.includes('1') && s.id === 'consulta') ||
          (input.includes('2') && s.id === 'limpieza') ||
          (input.includes('3') && s.id === 'blanqueamiento') ||
          (input.includes('4') && s.id === 'ortodoncia') ||
          (input.includes('5') && s.id === 'implante') ||
          (input.includes('6') && s.id === 'urgencia')
        );
        
        if (service) {
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { service } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({ 
            role: 'assistant', 
            content: `✅ Has seleccionado: ${service.emoji} ${service.name}\n\nAhora necesito saber:\n📅 ¿Qué fecha prefieres?\n(Ejemplo: 15 de marzo, o dime un día de la semana)`
          });
        } else {
          addMessage({ 
            role: 'assistant', 
            content: `Por favor, selecciona uno de nuestros servicios:\n\n1️⃣ ${SERVICES[0].emoji} Primera consulta - ${SERVICES[0].price}\n2️⃣ ${SERVICES[1].emoji} Limpieza dental - ${SERVICES[1].price}\n3️⃣ ${SERVICES[2].emoji} Blanqueamiento - ${SERVICES[2].price}\n4️⃣ ${SERVICES[3].emoji} Ortodoncia - ${SERVICES[3].price}\n5️⃣ ${SERVICES[4].emoji} Implante - ${SERVICES[4].price}\n6️⃣ ${SERVICES[5].emoji} Urgencia - ${SERVICES[5].price}\n\nPuedes escribir el número o el nombre del servicio.`
          });
        }
        break;

      case 2: // Fecha
        // Aceptar varios formatos de fecha
        const datePatterns = [
          /(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i,
          /(\d{4})-(\d{2})-(\d{2})/,
          /mañana/i,
          /pasado mañana/i,
          /lunes|martes|miércoles|jueves|viernes|sábado/i
        ];
        
        const hasDate = datePatterns.some(pattern => pattern.test(input));
        
        if (hasDate || input.length > 3) {
          // Convertir la entrada a una fecha
          let dateStr = input;
          const months = {
            'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
            'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
            'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
          };
          
          const match = input.match(/(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
          if (match) {
            const day = match[1].padStart(2, '0');
            const month = months[match[2].toLowerCase()];
            const year = new Date().getFullYear();
            dateStr = `${year}-${month}-${day}`;
          } else if (input.toLowerCase().includes('mañana')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateStr = tomorrow.toISOString().split('T')[0];
          }

          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { date: dateStr } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({ 
            role: 'assistant', 
            content: `📅 Fecha registrada: ${dateStr}\n\nAhora dime:\n🕐 ¿Qué horario prefieres?\n\nDisponible:\n🌅 Mañana: 9:00 - 14:00\n🌆 Tarde: 16:00 - 19:00\n\nPuedes decirme la hora exacta (ejemplo: "10:30")`
          });
        } else {
          addMessage({ 
            role: 'assistant', 
            content: '📅 ¿Para qué fecha quieres la cita?\n\nPuedes decirme:\n• Una fecha específica (ejemplo: "15 de marzo")\n• Un día de la semana\n• "Mañana" o "pasado mañana"\n\nO escríbela en formato DD/MM'
          });
        }
        break;

      case 3: // Hora
        const timeMatch = input.match(/(\d{1,2}):?(\d{2})?/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = timeMatch[2] || '00';
          
          // Ajustar formato
          if (input.toLowerCase().includes('tarde') || hours < 9) {
            hours += 12;
          }
          
          const timeStr = `${hours.toString().padStart(2, '0')}:${minutes}`;
          
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { time: timeStr } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({ 
            role: 'assistant', 
            content: `🕐 Hora registrada: ${timeStr}\n\n¡Ya casi terminamos! Solo necesito tus datos:\n\n📝 ¿Cuál es tu nombre completo?`
          });
        } else {
          addMessage({ 
            role: 'assistant', 
            content: '🕐 ¿A qué hora prefieres?\n\nHorarios disponibles cada 30 minutos:\n• Mañana: 9:00, 9:30, 10:00... hasta 13:30\n• Tarde: 16:00, 16:30, 17:00... hasta 18:30\n\nEjemplo: "10:30 de la mañana"'
          });
        }
        break;

      case 4: // Nombre
        if (input.length >= 3) {
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { name: input } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({ 
            role: 'assistant', 
            content: `✅ Nombre registrado: ${input}\n\n📧 ¿Cuál es tu correo electrónico?\n(Te enviaremos la confirmación de la cita)`
          });
        } else {
          addMessage({ 
            role: 'assistant', 
            content: '📝 Por favor, dime tu nombre completo (nombre y apellido)'
          });
        }
        break;

      case 5: // Email
        if (input.includes('@') && input.includes('.')) {
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { email: input } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({ 
            role: 'assistant', 
            content: `📧 Email registrado: ${input}\n\n📱 Por último, ¿tu número de teléfono?\n(Por si necesitamos contactarte)`
          });
        } else {
          addMessage({ 
            role: 'assistant', 
            content: '📧 Por favor, ingresa un email válido (ejemplo: nombre@email.com)'
          });
        }
        break;

      case 6: // Teléfono y confirmación
  if (input.length >= 7) {
    dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { phone: input } });
    
    // Guardar la cita en el calendario (sin await)
    const bookingData = { ...state.bookingFlow.data, phone: input };
    console.log('📋 Datos completos de la cita:', bookingData);
    
    // Guardar (no necesita await porque no esperamos respuesta)
    saveAppointmentToCalendar(bookingData);
    
    dispatch({ type: 'COMPLETE_BOOKING' });
    addMessage({ 
      role: 'assistant', 
      content: `🎉 ¡CITA CONFIRMADA!\n\n📋 Resumen de tu cita:\n━━━━━━━━━━━━━━━\n🦷 Servicio: ${bookingData.service.emoji} ${bookingData.service.name}\n📅 Fecha: ${bookingData.date}\n🕐 Hora: ${bookingData.time}\n👤 Paciente: ${bookingData.name}\n📧 Email: ${bookingData.email}\n📱 Tel: ${bookingData.phone}\n💰 Precio: ${bookingData.service.price}\n━━━━━━━━━━━━━━━\n\n✅ Te hemos enviado un email de confirmación\n📱 Recibirás un recordatorio 24h antes\n\n📍 Clínica Dental Sonrisa Perfecta\nAv. Principal 123\n📞 +34 900 123 456\n\n¿Necesitas algo más? 😊`
    });
  } else {
    addMessage({ 
      role: 'assistant', 
      content: '📱 Por favor, ingresa un número de teléfono válido (mínimo 7 dígitos)'
    });
  }
  break;
    }
  };

  // Guardar cita en el calendario
  const saveAppointmentToCalendar = async (bookingData) => {
  const existingAppointments = JSON.parse(localStorage.getItem('sonriebot-appointments') || '[]');
  const newAppointment = {
    id: Date.now(),
    date: bookingData.date,
    time: bookingData.time,
    service: bookingData.service.id,
    serviceName: bookingData.service.name,
    patient: bookingData.name,
    email: bookingData.email,
    phone: bookingData.phone,
    price: bookingData.service.price,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  existingAppointments.push(newAppointment);
  localStorage.setItem('sonriebot-appointments', JSON.stringify(existingAppointments));
  console.log('✅ Cita guardada en calendario local:', newAppointment);
  
  // Disparar evento para que el calendario se actualice
  window.dispatchEvent(new Event('storage'));
  
  // Sincronizar con Google Calendar si está conectado
  const googleToken = localStorage.getItem('googleCalendarToken');
  if (googleToken) {
    console.log('🔄 Detectado token de Google, sincronizando...');
    try {
      const { syncToGoogleCalendar } = await import('../../services/calendarSync');
      const eventId = await syncToGoogleCalendar(newAppointment);
      if (eventId) {
        console.log('✅ Cita sincronizada con Google Calendar:', eventId);
        // Actualizar la cita local con el ID de Google
        const updatedAppointments = JSON.parse(localStorage.getItem('sonriebot-appointments') || '[]');
        const finalUpdated = updatedAppointments.map(apt => {
          if (apt.id === newAppointment.id) {
            return { ...apt, googleEventId: eventId };
          }
          return apt;
        });
        localStorage.setItem('sonriebot-appointments', JSON.stringify(finalUpdated));
        window.dispatchEvent(new Event('storage'));
      } else {
        console.log('⚠️ No se pudo crear el evento en Google Calendar');
      }
    } catch (error) {
      console.log('⚠️ Error al sincronizar con Google:', error.message);
    }
  } else {
    console.log('ℹ️ Google Calendar no conectado. Cita guardada solo localmente.');
  }
};

  // Manejar envío de mensajes
  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    // Agregar mensaje del usuario
    addMessage({ role: 'user', content: message.trim() });
    setInputMessage('');
    
    // Si estamos en flujo de agendamiento
    if (state.bookingFlow.active) {
      dispatch({ type: 'SET_TYPING', payload: true });
      setTimeout(() => {
        handleBookingFlow(message.trim());
        dispatch({ type: 'SET_TYPING', payload: false });
      }, 1000);
      return;
    }

    // Detectar si el usuario quiere agendar una cita
    const bookingKeywords = ['cita', 'agendar', 'reservar', 'pedir hora', 'quiero ir', 'cuándo puedo'];
    const wantsBooking = bookingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (wantsBooking) {
      dispatch({ type: 'START_BOOKING_FLOW' });
      dispatch({ type: 'SET_TYPING', payload: true });
      
      setTimeout(() => {
        addMessage({ 
          role: 'assistant', 
          content: '¡Claro! Te ayudaré a agendar tu cita. 📅\n\nPrimero, ¿qué servicio te interesa?\n\n1️⃣ 🦷 Primera consulta - GRATIS\n2️⃣ ✨ Limpieza dental - 60€\n3️⃣ 😁 Blanqueamiento - 150€\n4️⃣ 🦷 Ortodoncia - Valoración gratis\n5️⃣ 🔩 Implante dental - 1.200€\n6️⃣ ⚡ Urgencia dental - 90€\n\nPuedes escribir el número o el nombre del servicio.'
        });
        dispatch({ type: 'SET_TYPING', payload: false });
      }, 1000);
      return;
    }

    // Respuesta normal del chat
    dispatch({ type: 'SET_TYPING', payload: true });
    
    try {
      const response = await getBotResponse(message.trim());
      setTimeout(() => {
        addMessage({ 
          role: 'assistant', 
          content: response,
          messageId: Date.now()
        });
        dispatch({ type: 'SET_TYPING', payload: false });
      }, 1000);
    } catch (error) {
      addMessage({ 
        role: 'assistant', 
        content: 'Disculpa, hubo un error. ¿Puedes intentar de nuevo?',
        error: true
      });
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  // Respuesta del bot (puedes integrar OpenRouter aquí después)
  const getBotResponse = async (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('precio') || msg.includes('costo')) {
      return 'Nuestros precios:\n\n🦷 Primera consulta: GRATIS\n✨ Limpieza: 60€\n😁 Blanqueamiento: 150€\n🦷 Ortodoncia: Valoración gratis\n🔩 Implantes: desde 1.200€\n⚡ Urgencias: 90€\n\n¿Te gustaría agendar una cita? Solo dime "quiero agendar"';
    }
    
    if (msg.includes('horario') || msg.includes('abierto')) {
      return '🕐 Nuestros horarios:\n\n📅 Lunes a Viernes: 9:00-14:00 y 16:00-19:00\n📅 Sábados: 9:00-13:00\n❌ Domingos: Cerrado\n\n📍 Av. Principal 123, Ciudad Dental\n📞 +34 900 123 456';
    }
    
    if (msg.includes('dolor') || msg.includes('urgencia')) {
      return '⚠️ ¿Tienes dolor dental? Podemos atenderte con prioridad.\n\nLa consulta de urgencia cuesta 90€.\n\n¿Quieres agendar una cita de urgencia? Solo dime "agendar urgencia"';
    }
    
    return '¡Gracias por tu mensaje! 😊\n\nPuedo ayudarte con:\n📅 Agendar una cita\n💰 Información de precios\n🕐 Horarios\n⚡ Urgencias\n\n¿Qué necesitas? Si quieres agendar, solo dime "quiero una cita"';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'booking':
        handleSendMessage('Quiero agendar una cita');
        break;
      case 'services':
        handleSendMessage('¿Qué servicios ofrecen?');
        break;
      case 'pricing':
        handleSendMessage('¿Cuáles son sus precios?');
        break;
      case 'info':
        handleSendMessage('Información de la clínica y horarios');
        break;
      case 'emergency':
        handleSendMessage('Tengo una urgencia dental');
        break;
    }
  };

  return (
    <div className="chat-interface" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxWidth: '780px',
      margin: '0 auto',
      background: theme.colors.background,
      fontFamily: theme.typography.fontFamily
    }}>
      {/* Status bar */}
      <div style={{
        padding: '0.75rem 1.25rem',
        background: 'transparent',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm,
          fontWeight: 500,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: theme.colors.success, display: 'inline-block',
            boxShadow: `0 0 0 3px ${theme.colors.success}25`,
          }} />
          {state.bookingFlow.active
            ? 'Reserva en curso'
            : 'Asistente en línea · Dr. Alejandro Martínez disponible'}
        </div>

        {state.bookingFlow.active && (
          <div style={{
            background: theme.colors.primaryLight,
            color: theme.colors.primary,
            padding: '0.25rem 0.625rem',
            borderRadius: theme.borderRadius.full,
            fontSize: theme.typography.sizes.xs,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}>
            Paso {state.bookingFlow.step} de 6
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1, overflowY: 'auto', padding: theme.spacing.lg,
          display: 'flex', flexDirection: 'column', gap: theme.spacing.md
        }}>
          {/* Welcome Message */}
          {state.messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <MessageBubble
                role="assistant"
                content={`Bienvenido a Clínica Dental Sonrisa Perfecta.\n\nSoy el asistente virtual de la clínica. Puedo ayudarte con:\n\n•  Solicitar una cita paso a paso\n•  Consultar tratamientos y precios\n•  Resolver dudas sobre horarios o urgencias\n\n¿En qué puedo ayudarte hoy?`}
                theme={theme}
              />
            </motion.div>
          )}

          {/* Quick Responses */}
          {state.messages.length <= 2 && (
            <QuickResponses
              responses={state.quickResponses}
              onAction={handleQuickAction}
              theme={theme}
            />
          )}

          {/* Messages */}
          <AnimatePresence>
            {state.messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  theme={theme}
                />
                {message.role === 'assistant' && message.messageId && (
                  <RatingSystem messageId={message.messageId} theme={theme} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {state.isTyping && <TypingIndicator theme={theme} />}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '1rem 1.25rem 1.25rem',
          background: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
        }}>
          {/* Botón de cancelar agendamiento */}
          {state.bookingFlow.active && (
            <div style={{ textAlign: 'center', marginBottom: theme.spacing.sm }}>
              <button
                onClick={() => {
                  dispatch({ type: 'CANCEL_BOOKING' });
                  addMessage({
                    role: 'assistant',
                    content: 'Has cancelado el proceso de reserva. ¿Necesitas algo más?'
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: 500,
                }}
              >
                Cancelar reserva
              </button>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
            padding: '0.375rem 0.375rem 0.375rem 0.875rem',
            background: theme.colors.background,
            border: `1px solid ${state.bookingFlow.active ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            transition: 'border-color 0.15s ease',
          }}>
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={state.bookingFlow.active ? 'Escribe tu respuesta…' : 'Escribe tu consulta…'}
              rows={1}
              style={{
                flex: 1,
                padding: '0.5rem 0',
                border: 'none',
                background: 'transparent',
                color: theme.colors.text,
                fontSize: theme.typography.sizes.base,
                resize: 'none',
                outline: 'none',
                fontFamily: theme.typography.fontFamily,
                lineHeight: 1.5,
              }}
            />
            <motion.button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              whileTap={{ scale: 0.96 }}
              aria-label="Enviar mensaje"
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: theme.borderRadius.md,
                background: inputMessage.trim() ? theme.colors.primary : theme.colors.borderLight,
                color: inputMessage.trim() ? '#FFFFFF' : theme.colors.textLight,
                border: 'none',
                cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.375rem',
                fontSize: theme.typography.sizes.sm,
                fontWeight: 600,
                transition: 'background 0.15s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Enviar
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}