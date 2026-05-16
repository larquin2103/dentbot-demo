import { createContext, useContext, useReducer, useEffect } from 'react';

const ChatContext = createContext();

const STORAGE_KEY_MESSAGES = 'sonriebot-chat';
const STORAGE_KEY_BOOKING = 'sonriebot-booking-flow';
const BOOKING_RESUME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

const emptyBookingData = {
  service: null,
  date: null,
  time: null,
  name: '',
  email: '',
  phone: ''
};

const initialState = {
  messages: [],
  isTyping: false,
  ratings: {},
  bookingFlow: {
    active: false,
    step: 0,
    data: { ...emptyBookingData },
    lastUpdated: null
  },
  reengagement: {
    softSent: false,
    hardSent: false
  },
  quickResponses: [
    { id: 1, text: 'Reservar cita', action: 'booking' },
    { id: 2, text: 'Servicios y tratamientos', action: 'services' },
    { id: 3, text: 'Precios', action: 'pricing' },
    { id: 4, text: 'Horarios y dirección', action: 'info' },
    { id: 5, text: 'Tengo dolor', action: 'emergency' }
  ]
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'ADD_RATING':
      return {
        ...state,
        ratings: { ...state.ratings, [action.payload.messageId]: action.payload.rating }
      };
    case 'START_BOOKING_FLOW':
      return {
        ...state,
        bookingFlow: {
          active: true,
          step: 1,
          data: { ...emptyBookingData },
          lastUpdated: Date.now()
        }
      };
    case 'RESUME_BOOKING_FLOW':
      return {
        ...state,
        bookingFlow: { ...action.payload, lastUpdated: Date.now() }
      };
    case 'UPDATE_BOOKING_DATA':
      return {
        ...state,
        bookingFlow: {
          ...state.bookingFlow,
          data: { ...state.bookingFlow.data, ...action.payload },
          lastUpdated: Date.now()
        }
      };
    case 'NEXT_BOOKING_STEP':
      return {
        ...state,
        bookingFlow: {
          ...state.bookingFlow,
          step: state.bookingFlow.step + 1,
          lastUpdated: Date.now()
        }
      };
    case 'PREV_BOOKING_STEP':
      return {
        ...state,
        bookingFlow: {
          ...state.bookingFlow,
          step: Math.max(1, state.bookingFlow.step - 1),
          lastUpdated: Date.now()
        }
      };
    case 'COMPLETE_BOOKING':
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookingFlow: {
          active: false,
          step: 0,
          data: { ...emptyBookingData },
          lastUpdated: null
        }
      };
    case 'MARK_REENGAGEMENT':
      return {
        ...state,
        reengagement: { ...state.reengagement, [action.payload]: true }
      };
    case 'RESET_REENGAGEMENT':
      return {
        ...state,
        reengagement: { softSent: false, hardSent: false }
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        messages: [],
        ratings: {},
        bookingFlow: { ...initialState.bookingFlow },
        reengagement: { softSent: false, hardSent: false }
      };
    default:
      return state;
  }
}

function loadInitialState() {
  const state = { ...initialState };
  try {
    const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (savedMessages) state.messages = JSON.parse(savedMessages);
  } catch {
    // ignore corrupt storage
  }
  try {
    const savedBooking = localStorage.getItem(STORAGE_KEY_BOOKING);
    if (savedBooking) {
      const parsed = JSON.parse(savedBooking);
      const fresh = parsed.lastUpdated && (Date.now() - parsed.lastUpdated) < BOOKING_RESUME_WINDOW_MS;
      if (parsed.active && fresh) {
        state.bookingFlow = parsed;
      } else {
        localStorage.removeItem(STORAGE_KEY_BOOKING);
      }
    }
  } catch {
    // ignore
  }
  return state;
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(state.messages));
    } catch {
      // storage full, ignore
    }
  }, [state.messages]);

  useEffect(() => {
    try {
      if (state.bookingFlow.active) {
        localStorage.setItem(STORAGE_KEY_BOOKING, JSON.stringify(state.bookingFlow));
      } else {
        localStorage.removeItem(STORAGE_KEY_BOOKING);
      }
    } catch {
      // ignore
    }
  }, [state.bookingFlow]);

  const addMessage = (message) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        ...message,
        id: message.id ?? Date.now() + Math.random(),
        timestamp: message.timestamp ?? new Date().toISOString()
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
