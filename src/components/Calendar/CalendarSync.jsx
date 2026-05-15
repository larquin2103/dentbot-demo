import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  initGoogleAPI, 
  authenticateGoogle, 
  fullSync,
  downloadICalFile,
  generateICalFile
} from '../../services/calendarSync';

export default function CalendarSync({ 
  day, 
  appointments, 
  stats, 
  onSyncComplete 
}) {
  const { theme } = useTheme();
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // Verificar si ya hay token
    const token = localStorage.getItem('googleCalendarToken');
    if (token) {
      setIsGoogleConnected(true);
    }
    setShowButtons(true);
  }, []);

  const handleConnectGoogle = async () => {
    setSyncStatus('🔄 Conectando con Google...');
    
    try {
      await initGoogleAPI();
      const success = await authenticateGoogle();
      
      if (success) {
        setIsGoogleConnected(true);
        setSyncStatus('✅ Conectado a Google Calendar');
        setTimeout(() => setSyncStatus(''), 3000);
      } else {
        setSyncStatus('❌ No se pudo conectar. Verifica la consola (F12)');
      }
    } catch (error) {
      console.error('Error:', error);
      setSyncStatus('❌ Error de conexión. ¿Está habilitada la API?');
    }
  };

  const handleFullSync = async () => {
    setIsSyncing(true);
    setSyncStatus('🔄 Sincronizando con Google Calendar...');
    
    try {
      const merged = await fullSync();
      localStorage.setItem('lastCalendarSync', new Date().toISOString());
      
      setSyncStatus(`✅ ${merged.length} citas sincronizadas`);
      onSyncComplete?.(merged);
    } catch (error) {
      console.error('Error:', error);
      setSyncStatus('❌ Error en sincronización');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const handleExportICal = () => {
    downloadICalFile(day, appointments);
    setSyncStatus('✅ Archivo iCal descargado');
    setTimeout(() => setSyncStatus(''), 3000);
  };

  if (!showButtons) return null;

  return (
    <div style={{ marginBottom: theme.spacing.lg }}>
      <div style={{
        display: 'flex',
        gap: theme.spacing.sm,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Google Calendar */}
        {!isGoogleConnected ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnectGoogle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontSize: theme.typography.sizes.sm,
              fontWeight: 600
            }}
          >
            🔗 Conectar Google Calendar
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFullSync}
            disabled={isSyncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: isSyncing ? '#ccc' : '#0F9D58',
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              fontSize: theme.typography.sizes.sm,
              fontWeight: 600
            }}
          >
            {isSyncing ? '⏳' : '🔄'} {isSyncing ? 'Sincronizando...' : 'Sincronizar Google'}
          </motion.button>
        )}

        {/* iCal */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExportICal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer',
            fontSize: theme.typography.sizes.sm,
            fontWeight: 600
          }}
        >
          📅 Descargar iCal
        </motion.button>
      </div>

      {/* Estado */}
      <AnimatePresence>
        {syncStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: theme.spacing.sm,
              marginTop: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              background: syncStatus.includes('✅') 
                ? `${theme.colors.success}15` 
                : syncStatus.includes('❌') 
                  ? `${theme.colors.error}15` 
                  : `${theme.colors.primary}15`,
              color: syncStatus.includes('✅') 
                ? theme.colors.success 
                : syncStatus.includes('❌') 
                  ? theme.colors.error 
                  : theme.colors.primary,
              fontSize: theme.typography.sizes.sm,
              textAlign: 'center'
            }}
          >
            {syncStatus}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}