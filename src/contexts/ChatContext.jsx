import { createContext, useContext, useReducer, useEffect } from 'react';

const ChatContext = createContext();

const initialState = {
  messages: [],
  isTyping: false,
  conversationHistory: [],
  ratings: {},
  // NUEVO: Estado para el flujo de agendamiento
  bookingFlow: {
    active: false,
    step: 0,
    data: {
      service: null,
      date: null,
      time: null,
      name: '',
      email: '',
      phone: ''
    }
  },
  quickResponses: [
    { id: 1, text: '📅 Agendar cita', action: 'booking' },
    { id: 2, text: '🦷 Servicios dentales', action: 'services' },
    { id: 3, text: '💰 Consultar precios', action: 'pricing' },
    { id: 4, text: '🏥 Información clínica', action: 'info' },
    { id: 5, text: '⚡ Urgencia dental', action: 'emergency' }
  ]
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };
    case 'ADD_RATING':
      return {
        ...state,
        ratings: {
          ...state.ratings,
          [action.payload.messageId]: action.payload.rating
        }
      };
    case 'START_BOOKING_FLOW':
      return {
        ...state,
        bookingFlow: {
          active: true,
          step: 1,
          data: { service: null, date: null, time: null, name: '', email: '', phone: '' }
        }
      };
    case 'UPDATE_BOOKING_DATA':
      return {
        ...state,
        bookingFlow: {
          ...state.bookingFlow,
          data: { ...state.bookingFlow.data, ...action.payload }
        }
      };
    case 'NEXT_BOOKING_STEP':
      return {
        ...state,
        bookingFlow: {
          ...state.bookingFlow,
          step: state.bookingFlow.step + 1
        }
      };
    case 'PREV_BOOKING_STEP':
      return {
        ...state,
        bookingFlow: {
          ...state.bookingFlow,
          step: Math.max(1, state.bookingFlow.step - 1)
        }
      };
    case 'COMPLETE_BOOKING':
      return {
        ...state,
        bookingFlow: {
          active: false,
          step: 0,
          data: { service: null, date: null, time: null, name: '', email: '', phone: '' }
        }
      };
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookingFlow: {
          active: false,
          step: 0,
          data: { service: null, date: null, time: null, name: '', email: '', phone: '' }
        }
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        messages: [],
        ratings: {},
        bookingFlow: initialState.bookingFlow
      };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState, (initial) => {
    const saved = localStorage.getItem('sonriebot-chat');
    return saved ? { ...initial, messages: JSON.parse(saved) } : initial;
  });

  useEffect(() => {
    localStorage.setItem('sonriebot-chat', JSON.stringify(state.messages));
  }, [state.messages]);

  const addMessage = (message) => {
    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: {
        ...message,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
    });
  };

  return (
    <ChatContext.Provider value={{ state, dispatch, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};