import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

// Paleta profesional para clínica dental
const lightTheme = {
  colors: {
    // Colores principales - Azul médico profesional
    primary: '#0D6B7D',        // Azul petróleo médico
    primaryLight: '#E8F4F8',   // Fondo azul muy claro
    primaryDark: '#0A4F5C',    // Azul oscuro para hover
    
    // Secundario - Verde menta salud
    secondary: '#2EBD85',      // Verde menta
    secondaryLight: '#E8F8F2', // Fondo verde muy claro
    
    // Acento - Coral suave para llamadas a la acción
    accent: '#FF6B6B',         // Coral
    accentLight: '#FFF0F0',    // Fondo coral claro
    
    // Fondos
    background: '#F7F9FC',     // Gris azulado muy claro
    surface: '#FFFFFF',        // Blanco puro para tarjetas
    surfaceHover: '#F0F4F8',   // Hover suave
    
    // Texto
    text: '#1A2332',           // Azul oscuro para texto principal
    textSecondary: '#5A6B7F',  // Gris azulado para texto secundario
    textLight: '#8FA0B4',      // Gris claro para texto terciario
    
    // Bordes
    border: '#E2E8F0',         // Gris muy claro
    borderLight: '#F0F4F8',    // Casi blanco
    
    // Estados
    success: '#2EBD85',        // Verde éxito
    successLight: '#E8F8F2',   // Fondo verde claro
    warning: '#F59E0B',        // Ámbar
    warningLight: '#FEF3C7',   // Fondo ámbar claro
    error: '#EF4444',          // Rojo
    errorLight: '#FEE2E2',     // Fondo rojo claro
    info: '#3B82F6',          // Azul info
    infoLight: '#EFF6FF',      // Fondo azul claro
    
    // Gradientes
    gradient: 'linear-gradient(135deg, #0D6B7D 0%, #2EBD85 100%)',
    gradientLight: 'linear-gradient(135deg, #E8F4F8 0%, #E8F8F2 100%)',
    
    // Sombras
    cardShadow: '0 1px 3px rgba(13, 107, 125, 0.08), 0 1px 2px rgba(13, 107, 125, 0.06)',
    cardHover: '0 4px 6px rgba(13, 107, 125, 0.1), 0 2px 4px rgba(13, 107, 125, 0.06)',
    cardElevated: '0 10px 15px rgba(13, 107, 125, 0.1), 0 4px 6px rgba(13, 107, 125, 0.05)',
    
    // Colores de servicios
    services: {
      consulta: '#2EBD85',      // Verde
      limpieza: '#3B82F6',      // Azul
      blanqueamiento: '#8B5CF6', // Púrpura
      ortodoncia: '#F59E0B',    // Ámbar
      implante: '#EF4444',      // Rojo
      urgencia: '#FF6B6B'       // Coral
    }
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.8125rem',  // 13px
      base: '0.875rem', // 14px
      lg: '1rem',       // 16px
      xl: '1.125rem',   // 18px
      '2xl': '1.25rem', // 20px
      '3xl': '1.5rem',  // 24px
      '4xl': '1.875rem' // 30px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    '3xl': '2.5rem'  // 40px
  },
  
  borderRadius: {
    xs: '0.25rem',   // 4px
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.25rem', // 20px
    full: '9999px'
  },
  
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.2s',
      slow: '0.3s'
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

// Tema oscuro con los mismos ajustes
const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#4FD1C5',
    primaryLight: '#1A2F3A',
    primaryDark: '#38B2AC',
    secondary: '#48BB78',
    secondaryLight: '#1A2F2A',
    accent: '#FC8181',
    accentLight: '#3A1F1F',
    background: '#0F1A24',
    surface: '#1A2F3A',
    surfaceHover: '#223B48',
    text: '#E2E8F0',
    textSecondary: '#A0AEC0',
    textLight: '#718096',
    border: '#2D4452',
    borderLight: '#223B48',
    success: '#48BB78',
    successLight: '#1A2F2A',
    warning: '#F6AD55',
    warningLight: '#3A2F1A',
    error: '#FC8181',
    errorLight: '#3A1F1F',
    info: '#63B3ED',
    infoLight: '#1A2F3A',
    gradient: 'linear-gradient(135deg, #4FD1C5 0%, #48BB78 100%)',
    gradientLight: 'linear-gradient(135deg, #1A2F3A 0%, #1A2F2A 100%)',
    cardShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    cardHover: '0 4px 6px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
    cardElevated: '0 10px 15px rgba(0, 0, 0, 0.5), 0 4px 6px rgba(0, 0, 0, 0.4)',
    services: {
      consulta: '#48BB78',
      limpieza: '#63B3ED',
      blanqueamiento: '#B794F4',
      ortodoncia: '#F6AD55',
      implante: '#FC8181',
      urgencia: '#FF6B6B'
    }
  }
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('sonriebot-theme')
    return saved ? JSON.parse(saved) : false
  })

  const theme = isDark ? darkTheme : lightTheme

  useEffect(() => {
    localStorage.setItem('sonriebot-theme', JSON.stringify(isDark))
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    // Aplicar color de fondo al body
    document.body.style.backgroundColor = theme.colors.background
  }, [isDark, theme])

  const toggleTheme = () => setIsDark(!isDark)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}