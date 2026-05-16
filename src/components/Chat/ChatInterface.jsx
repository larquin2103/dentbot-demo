import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useChat } from '../../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickResponses from './QuickResponses';
import RatingSystem from '../UI/RatingSystem';
import BookingWidget from './BookingWidgets';
import { sendMessageToSonrieBot, generateReengagementMessage } from '../../services/openrouter';
import { useInactivityWatcher } from '../../hooks/useInactivityWatcher';
import {
  BOOKABLE_SERVICES as SERVICES,
  dayNameToNextDate,
  parseRelativeDay,
  formatLongDate
} from '../../services/scheduling';

const BOOKING_TRIGGER = '[INICIAR_RESERVA]';

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

  // Inactividad: solo activa cuando hay al menos un mensaje del usuario
  // y no estamos en medio del flujo de booking
  const hasUserMessage = state.messages.some(m => m.role === 'user');
  const inactivityEnabled = hasUserMessage && !state.bookingFlow.active;

  const handleSoftIdle = useCallback(async () => {
    if (state.reengagement.softSent) return;
    dispatch({ type: 'MARK_REENGAGEMENT', payload: 'softSent' });
    try {
      const text = await generateReengagementMessage(state.messages, 'soft');
      addMessage({ role: 'assistant', content: text.replace('[INICIAR_RESERVA]', '').trim() });
    } catch (e) {
      addMessage({ role: 'assistant', content: '¿Sigues ahí? Si necesitas algo más, te leo.' });
    }
  }, [state.messages, state.reengagement.softSent, addMessage, dispatch]);

  const handleHardIdle = useCallback(async () => {
    if (state.reengagement.hardSent) return;
    dispatch({ type: 'MARK_REENGAGEMENT', payload: 'hardSent' });
    try {
      const text = await generateReengagementMessage(state.messages, 'hard');
      const trigger = text.includes('[INICIAR_RESERVA]');
      const cleaned = text.replace('[INICIAR_RESERVA]', '').trim();
      addMessage({ role: 'assistant', content: cleaned });
      if (trigger) {
        setTimeout(() => triggerBookingFlow(), 700);
      }
    } catch (e) {
      addMessage({
        role: 'assistant',
        content: 'Antes de irte: la primera consulta es gratuita y dura 30 min. ¿Te reservo hueco esta semana?'
      });
    }
  }, [state.messages, state.reengagement.hardSent, addMessage, dispatch]);

  const { reset: resetIdle } = useInactivityWatcher({
    enabled: inactivityEnabled,
    onSoftIdle: handleSoftIdle,
    onHardIdle: handleHardIdle,
  });

  // Sincronizar la ref usada por handleSendMessage
  useEffect(() => {
    resetIdleRef.current = resetIdle;
  }, [resetIdle]);

  // Retomar reserva pendiente al cargar (persistida en localStorage)
  // Reanuda directamente con el prompt del paso en curso para no romper
  // el handler del flujo (que espera el dato del paso actual).
  const resumePromptedRef = useRef(false);
  useEffect(() => {
    if (resumePromptedRef.current) return;
    if (!state.bookingFlow.active) return;
    const { step, data } = state.bookingFlow;
    if (step === 0) return;

    resumePromptedRef.current = true;
    const svcName = data?.service?.name;

    const stepPrompts = {
      1: { content: 'Tenías una reserva a medias. Elige el servicio:',                       widget: { type: 'service-picker' } },
      2: { content: `Retomamos tu reserva${svcName ? ` de ${svcName}` : ''}. ¿Qué día prefieres?`, widget: { type: 'date-picker' } },
      3: { content: `Seguimos con tu reserva${svcName ? ` de ${svcName}` : ''}. Elige hora:`,      widget: { type: 'time-picker', date: data?.date } },
      4: { content: 'Casi terminamos. ¿Cuál es tu nombre completo?' },
      5: { content: 'Última recta. ¿Cuál es tu correo electrónico?' },
      6: { content: 'Y por último, ¿tu número de teléfono?' }
    };

    const prompt = stepPrompts[step] || { content: 'Continuemos con tu reserva.' };

    setTimeout(() => {
      addMessage({ role: 'assistant', ...prompt });
    }, 500);
  }, [state.bookingFlow, addMessage]);

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
            content: `Has elegido ${service.emoji} ${service.name}. ¿Qué día prefieres venir?`,
            widget: { type: 'date-picker' }
          });
        } else {
          addMessage({
            role: 'assistant',
            content: 'Toca el servicio que necesitas:',
            widget: { type: 'service-picker' }
          });
        }
        break;

      case 2: { // Fecha
        const months = {
          enero: '01', febrero: '02', marzo: '03', abril: '04',
          mayo: '05', junio: '06', julio: '07', agosto: '08',
          septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
        };

        let parsedDate = null;

        const isoMatch = input.match(/(\d{4})-(\d{2})-(\d{2})/);
        const monthMatch = input.match(/(\d{1,2})\s*(?:de\s*)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);

        if (isoMatch) {
          parsedDate = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
        } else if (monthMatch) {
          const day = monthMatch[1].padStart(2, '0');
          const month = months[monthMatch[2].toLowerCase()];
          const year = new Date().getFullYear();
          parsedDate = new Date(`${year}-${month}-${day}T00:00:00`);
        } else {
          parsedDate = parseRelativeDay(input) || dayNameToNextDate(input);
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          if (parsedDate.getDay() === 0) {
            addMessage({
              role: 'assistant',
              content: 'Los domingos no abrimos. Toca otro día, por favor:',
              widget: { type: 'date-picker' }
            });
            break;
          }
          const dateStr = format(parsedDate, 'yyyy-MM-dd');
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { date: dateStr } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({
            role: 'assistant',
            content: `Día apuntado: ${formatLongDate(parsedDate)}. ¿A qué hora te viene bien?`,
            widget: { type: 'time-picker', date: dateStr }
          });
        } else {
          addMessage({
            role: 'assistant',
            content: 'Toca el día que prefieras:',
            widget: { type: 'date-picker' }
          });
        }
        break;
      }

      case 3: { // Hora
        const timeMatch = input.match(/(\d{1,2}):?(\d{2})?/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = timeMatch[2] || '00';
          if (input.toLowerCase().includes('tarde') || hours < 9) {
            hours += 12;
          }
          const timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { time: timeStr } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({
            role: 'assistant',
            content: `Hora ${timeStr} reservada. ¿Cuál es tu nombre completo?`
          });
        } else {
          addMessage({
            role: 'assistant',
            content: 'Toca el hueco que prefieras:',
            widget: { type: 'time-picker', date: state.bookingFlow.data.date }
          });
        }
        break;
      }

      case 4: // Nombre
        if (input.length >= 3) {
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { name: input } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({
            role: 'assistant',
            content: `Gracias ${input}. ¿Cuál es tu correo electrónico? Te enviaremos la confirmación.`
          });
        } else {
          addMessage({
            role: 'assistant',
            content: 'Necesito tu nombre completo (nombre y apellido).'
          });
        }
        break;

      case 5: // Email
        if (input.includes('@') && input.includes('.')) {
          dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { email: input } });
          dispatch({ type: 'NEXT_BOOKING_STEP' });
          addMessage({
            role: 'assistant',
            content: 'Perfecto. Por último, ¿tu teléfono? Es por si tenemos que avisarte de algún cambio.'
          });
        } else {
          addMessage({
            role: 'assistant',
            content: 'Ese correo no parece válido. Inténtalo de nuevo (ej: nombre@email.com).'
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
      content: `✅ Cita confirmada\n\nResumen:\n• ${bookingData.service.emoji} ${bookingData.service.name}\n• 📅 ${formatLongDate(bookingData.date)}\n• 🕐 ${bookingData.time}\n• 👤 ${bookingData.name}\n• 📧 ${bookingData.email}\n• 📱 ${bookingData.phone}\n• 💰 ${bookingData.service.price}\n\nTe hemos enviado la confirmación por email y recibirás un recordatorio 24h antes. Si necesitas cancelar, hazlo con al menos 24h de antelación.\n\n¿Algo más en lo que pueda ayudarte?`
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

  // Reiniciar el watcher de inactividad cuando el usuario escribe
  const resetIdleRef = useRef(() => {});

  const triggerBookingFlow = useCallback((preMessage) => {
    if (preMessage) {
      addMessage({ role: 'assistant', content: preMessage });
    }
    dispatch({ type: 'START_BOOKING_FLOW' });
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: 'Elige el servicio que necesitas:',
        widget: { type: 'service-picker' }
      });
    }, 500);
  }, [addMessage, dispatch]);

  // Handler que reciben los botones del flujo (servicio/fecha/hora)
  const handleWidgetAction = useCallback((type, payload, displayText) => {
    addMessage({ role: 'user', content: displayText });
    dispatch({ type: 'RESET_REENGAGEMENT' });
    resetIdleRef.current?.();
    dispatch({ type: 'SET_TYPING', payload: true });

    setTimeout(() => {
      if (type === 'service') {
        dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { service: payload } });
        dispatch({ type: 'NEXT_BOOKING_STEP' });
        addMessage({
          role: 'assistant',
          content: `Has elegido ${payload.emoji} ${payload.name}. ¿Qué día prefieres venir?`,
          widget: { type: 'date-picker' }
        });
      } else if (type === 'date') {
        dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { date: payload } });
        dispatch({ type: 'NEXT_BOOKING_STEP' });
        addMessage({
          role: 'assistant',
          content: `Día apuntado: ${displayText}. ¿A qué hora te viene bien?`,
          widget: { type: 'time-picker', date: payload }
        });
      } else if (type === 'time') {
        dispatch({ type: 'UPDATE_BOOKING_DATA', payload: { time: payload } });
        dispatch({ type: 'NEXT_BOOKING_STEP' });
        addMessage({
          role: 'assistant',
          content: `Hora ${payload} reservada. ¿Cuál es tu nombre completo?`
        });
      }
      dispatch({ type: 'SET_TYPING', payload: false });
    }, 400);
  }, [addMessage, dispatch]);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    addMessage({ role: 'user', content: message.trim() });
    setInputMessage('');

    // Cualquier respuesta del usuario reinicia inactividad y reabre la
    // posibilidad de reenviar reenganches
    dispatch({ type: 'RESET_REENGAGEMENT' });
    resetIdleRef.current?.();

    // Si estamos en flujo de agendamiento, lo gestiona handleBookingFlow
    if (state.bookingFlow.active) {
      dispatch({ type: 'SET_TYPING', payload: true });
      setTimeout(() => {
        handleBookingFlow(message.trim());
        dispatch({ type: 'SET_TYPING', payload: false });
      }, 800);
      return;
    }

    // Respuesta del agente vía LLM
    dispatch({ type: 'SET_TYPING', payload: true });
    try {
      const raw = await sendMessageToSonrieBot(message.trim(), state.messages);
      const hasTrigger = raw.includes(BOOKING_TRIGGER);
      const cleaned = raw.replace(BOOKING_TRIGGER, '').trim();

      addMessage({
        role: 'assistant',
        content: cleaned || 'De acuerdo.',
        messageId: Date.now()
      });

      if (hasTrigger) {
        setTimeout(() => triggerBookingFlow(), 700);
      }
    } catch (error) {
      console.error('Bot error:', error);
      addMessage({
        role: 'assistant',
        content: 'Disculpa, ha habido un problema al responder. ¿Puedes repetirlo?',
        error: true
      });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
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
      width: '100%',
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
        gap: '0.5rem',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm,
          fontWeight: 500,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: theme.colors.success, display: 'inline-block',
            boxShadow: `0 0 0 3px ${theme.colors.success}25`,
            flexShrink: 0,
          }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {state.bookingFlow.active
              ? 'Reserva en curso'
              : 'Asistente en línea · Dr. Alejandro Martínez'}
          </span>
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
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="chat-messages" style={{
          flex: 1, overflowY: 'auto', padding: 'clamp(0.75rem, 3vw, 1.25rem)',
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
            {state.messages.map((message, idx) => {
              const isLast = idx === state.messages.length - 1;
              return (
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
                  {message.role === 'assistant' && message.widget && isLast && (
                    <BookingWidget widget={message.widget} theme={theme} onAction={handleWidgetAction} />
                  )}
                  {message.role === 'assistant' && message.messageId && (
                    <RatingSystem messageId={message.messageId} theme={theme} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          <AnimatePresence>
            {state.isTyping && <TypingIndicator theme={theme} />}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area" style={{
          padding: 'clamp(0.625rem, 2.5vw, 1rem) clamp(0.75rem, 3vw, 1.25rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(0.75rem, 3vw, 1.25rem))',
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