import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const lightTheme = {
  colors: {
    primary: '#0E4F66',
    primaryLight: '#E6F0F4',
    primaryDark: '#0A3A4D',

    secondary: '#0F766E',
    secondaryLight: '#ECFDF5',

    accent: '#B45309',
    accentLight: '#FEF3C7',

    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    surfaceMuted: '#F8FAFC',

    text: '#0F172A',
    textSecondary: '#475569',
    textLight: '#94A3B8',

    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    borderStrong: '#CBD5E1',

    success: '#059669',
    successLight: '#ECFDF5',
    warning: '#B45309',
    warningLight: '#FEF3C7',
    error: '#B91C1C',
    errorLight: '#FEF2F2',
    info: '#0369A1',
    infoLight: '#EFF6FF',

    gradient: 'linear-gradient(135deg, #0E4F66 0%, #0F766E 100%)',
    gradientLight: 'linear-gradient(135deg, #E6F0F4 0%, #ECFDF5 100%)',

    cardShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
    cardHover: '0 4px 6px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.04)',
    cardElevated: '0 10px 25px rgba(15, 23, 42, 0.08), 0 4px 10px rgba(15, 23, 42, 0.04)',

    services: {
      consulta: '#0E7490',
      limpieza: '#0369A1',
      blanqueamiento: '#0F766E',
      ortodoncia: '#A16207',
      implante: '#B91C1C',
      urgencia: '#C2410C'
    }
  },

  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizes: {
      xs: '0.75rem',
      sm: '0.8125rem',
      base: '0.9375rem',
      lg: '1rem',
      xl: '1.125rem',
      '2xl': '1.375rem',
      '3xl': '1.75rem',
      '4xl': '2.25rem'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.55,
      relaxed: 1.75
    }
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '2.5rem'
  },

  borderRadius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.625rem',
    xl: '0.875rem',
    '2xl': '1.125rem',
    full: '9999px'
  },

  animations: {
    duration: { fast: '0.15s', normal: '0.2s', slow: '0.3s' },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#14B8A6',
    primaryLight: '#134E4A',
    primaryDark: '#0F766E',

    secondary: '#22D3EE',
    secondaryLight: '#164E63',

    accent: '#F59E0B',
    accentLight: '#451A03',

    background: '#0F172A',
    surface: '#1E293B',
    surfaceHover: '#334155',
    surfaceMuted: '#172033',

    text: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textLight: '#94A3B8',

    border: '#334155',
    borderLight: '#1E293B',
    borderStrong: '#475569',

    success: '#10B981',
    successLight: '#064E3B',
    warning: '#F59E0B',
    warningLight: '#451A03',
    error: '#EF4444',
    errorLight: '#450A0A',
    info: '#38BDF8',
    infoLight: '#0C4A6E',

    gradient: 'linear-gradient(135deg, #14B8A6 0%, #0891B2 100%)',
    gradientLight: 'linear-gradient(135deg, #134E4A 0%, #164E63 100%)',

    cardShadow: '0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)',
    cardHover: '0 4px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
    cardElevated: '0 10px 25px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.4)',

    services: {
      consulta: '#22D3EE',
      limpieza: '#38BDF8',
      blanqueamiento: '#2DD4BF',
      ortodoncia: '#F59E0B',
      implante: '#F87171',
      urgencia: '#FB923C'
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
