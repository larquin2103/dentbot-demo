import { useState, useEffect } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatProvider } from './contexts/ChatContext'
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext'
import ChatInterface from './components/Chat/ChatInterface'
import CalendarView from './components/Dashboard/CalendarView'
import Header from './components/UI/Header'
import WelcomeModal from './components/Onboarding/WelcomeModal'
import Tour from './components/Onboarding/Tour'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// El chat es la vista por defecto, asi que solo 'calendar' viaja en la URL.
// Cualquier otro valor de ?view= cae en el chat en vez de dejar la app en un
// estado que ningun render contempla.
function viewFromSearch(search) {
  return new URLSearchParams(search).get('view') === 'calendar' ? 'calendar' : 'chat'
}

function AppShell() {
  // La vista inicial sale de la URL: es lo que hace enlazable la agenda y lo
  // que permite que el start_url del manifest y los accesos directos abran la
  // app donde toca. No se usa react-router: seria una dependencia nueva para
  // dos vistas.
  const [view, setView] = useState(() => viewFromSearch(window.location.search))
  const { requestedView, clearRequestedView } = useOnboarding()

  useEffect(() => {
    if (requestedView && requestedView !== view) {
      setView(requestedView)
    }
    if (requestedView) {
      clearRequestedView()
    }
  }, [requestedView, view, clearRequestedView])

  // Refleja la vista en la URL para que siga siendo compartible. Con
  // `replaceState` y no `pushState`: cada cambio de pestana no debe convertirse
  // en una entrada del historial que el boton atras tenga que deshacer una a
  // una antes de salir de la app.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (view === 'calendar') {
      params.set('view', 'calendar')
    } else {
      params.delete('view')
    }
    const query = params.toString()
    const search = query ? `?${query}` : ''
    if (search !== window.location.search) {
      window.history.replaceState(null, '', `${window.location.pathname}${search}${window.location.hash}`)
    }
  }, [view])

  return (
    <div className="app">
      <Header view={view} onViewChange={setView} />

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="main-content"
        >
          {view === 'chat' ? <ChatInterface /> : <CalendarView />}
        </motion.div>
      </AnimatePresence>

      <WelcomeModal />
      <Tour currentView={view} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <ChatProvider>
          <AppShell />
        </ChatProvider>
      </OnboardingProvider>
    </ThemeProvider>
  )
}

export default App
