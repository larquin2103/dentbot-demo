import { useState } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatProvider } from './contexts/ChatContext'
import ChatInterface from './components/Chat/ChatInterface'
import CalendarView from './components/Dashboard/CalendarView'
import Header from './components/UI/Header'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [view, setView] = useState('chat')

  return (
    <ThemeProvider>
      <ChatProvider>
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
        </div>
      </ChatProvider>
    </ThemeProvider>
  )
}

export default App
