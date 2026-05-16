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

function AppShell() {
  const [view, setView] = useState('chat')
  const { requestedView, clearRequestedView } = useOnboarding()

  useEffect(() => {
    if (requestedView && requestedView !== view) {
      setView(requestedView)
    }
    if (requestedView) {
      clearRequestedView()
    }
  }, [requestedView, view, clearRequestedView])

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
