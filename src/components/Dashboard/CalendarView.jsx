import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isToday, addMonths, subMonths, parseISO,
  addHours, differenceInHours
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  exportToPDF, 
  shareViaWhatsApp, 
  shareViaEmail, 
  generateWhatsAppMessage,
  assignDoctorToAppointment,
  DOCTORS 
} from '../../services/exportService';
import CalendarSync from '../Calendar/CalendarSync';
import Tooltip from '../Onboarding/Tooltip';

// Servicios con colores y tiempos (paleta profesional, sin morados ni neón)
const SERVICES = {
  consulta: { name: 'Primera consulta', color: '#0E7490', duration: 30, icon: '🦷', price: 'Gratis' },
  limpieza: { name: 'Limpieza dental', color: '#0369A1', duration: 30, icon: '✨', price: '60€' },
  blanqueamiento: { name: 'Blanqueamiento', color: '#0F766E', duration: 90, icon: '😁', price: '150€' },
  ortodoncia: { name: 'Ortodoncia', color: '#A16207', duration: 30, icon: '🦷', price: 'Consulta gratis' },
  implante: { name: 'Implante dental', color: '#B91C1C', duration: 90, icon: '🔩', price: '1.200€' },
  urgencia: { name: 'Urgencia', color: '#C2410C', duration: 30, icon: '⚡', price: '90€' }
};

const WORK_HOURS = {
  weekday: { morning: { start: 9, end: 14 }, afternoon: { start: 16, end: 19 } },
  saturday: { morning: { start: 9, end: 13 } }
};

export default function CalendarView() {
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('sonriebot-appointments');
    return saved ? JSON.parse(saved) : [];
  });
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [filterService, setFilterService] = useState('all');
  const [viewMode, setViewMode] = useState('month');

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sonriebot-appointments');
      if (saved) setAppointments(JSON.parse(saved));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('sonriebot-appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (JSON.stringify(parsed) !== JSON.stringify(appointments)) {
          setAppointments(parsed);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [appointments]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // CORRECCIÓN: Calcular offset para que el calendario empiece en Lunes
  const startDayOfWeek = monthStart.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  const offsetDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Convertir a Lunes=0, Martes=1, etc.

  // Crear array con espacios vacíos al inicio para alinear correctamente
  const calendarDays = [];
  for (let i = 0; i < offsetDays; i++) {
    calendarDays.push(null);
  }
  calendarDays.push(...daysInMonth);

  const getAppointmentsForDay = (day) => {
    if (!day) return [];
    const dateStr = format(day, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.date === dateStr);
  };

  const handleCancelAppointment = (appointmentId) => {
  console.log('🗑️ Cancelando cita:', appointmentId);
  
  const appointment = appointments.find(apt => apt.id === appointmentId);
  if (!appointment) {
    console.error('❌ Cita no encontrada');
    return;
  }

  console.log('📋 Cita a cancelar:', appointment);

  const appointmentDate = parseISO(`${appointment.date}T${appointment.time}`);
  const now = new Date();
  const hoursUntilAppointment = differenceInHours(appointmentDate, now);

  console.log(`⏰ Horas hasta la cita: ${hoursUntilAppointment}`);

  if (hoursUntilAppointment < 24) {
    alert('⚠️ No se puede cancelar con menos de 24 horas de antelación.\n\nPolítica de cancelación: Se cobrará el 50% del valor de la consulta.');
    setCancelConfirm(null);
    return;
  }

  // Eliminar la cita
  const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
  console.log('📊 Citas después de cancelar:', updatedAppointments.length);
  
  setAppointments(updatedAppointments);
  localStorage.setItem('sonriebot-appointments', JSON.stringify(updatedAppointments));
  setCancelConfirm(null);
  
  alert('✅ Cita cancelada exitosamente.\n\nSe ha liberado el horario.');
};

  const getDayStats = (day) => {
    const dayApps = getAppointmentsForDay(day);
    const totalDuration = dayApps.reduce((sum, apt) => sum + (SERVICES[apt.service]?.duration || 30), 0);
    const serviceCount = {};
    dayApps.forEach(apt => { serviceCount[apt.service] = (serviceCount[apt.service] || 0) + 1; });
    return {
      total: dayApps.length,
      totalDuration,
      serviceCount,
      revenue: dayApps.reduce((sum, apt) => {
        const price = SERVICES[apt.service]?.price || '0€';
        return sum + (parseInt(price.replace(/[^0-9]/g, '')) || 0);
      }, 0)
    };
  };

  const getAvailableSlots = (day) => {
    if (!day) return [];
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 0) return [];
    const dayApps = getAppointmentsForDay(day);
    const bookedTimes = dayApps.map(apt => apt.time);
    let allSlots = [];
    const workHours = dayOfWeek === 6 ? WORK_HOURS.saturday : WORK_HOURS.weekday;
    if (workHours.morning) {
      for (let h = workHours.morning.start; h < workHours.morning.end; h += 0.5) {
        const hours = Math.floor(h), minutes = (h % 1) * 60;
        allSlots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
    if (workHours.afternoon) {
      for (let h = workHours.afternoon.start; h < workHours.afternoon.end; h += 0.5) {
        const hours = Math.floor(h), minutes = (h % 1) * 60;
        allSlots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
    return allSlots.filter(slot => !bookedTimes.includes(slot));
  };

  const getOccupancyPercentage = (day) => {
    if (!day) return 0;
    const totalSlots = getAvailableSlots(day).length + getAppointmentsForDay(day).length;
    if (totalSlots === 0) return 0;
    return (getAppointmentsForDay(day).length / totalSlots) * 100;
  };

  const getOccupancyColor = (percentage) => {
    if (percentage === 0) return theme.colors.success;
    if (percentage < 50) return theme.colors.success;
    if (percentage < 75) return theme.colors.warning;
    if (percentage < 100) return theme.colors.error;
    return '#666';
  };

  const filteredAppointments = selectedDay 
    ? getAppointmentsForDay(selectedDay).filter(apt => filterService === 'all' || apt.service === filterService)
    : [];

  return (
    <div className="calendar-view" style={{ padding: 'clamp(0.625rem, 2.5vw, 1rem)', maxWidth: '1200px', margin: '0 auto', height: '100%', overflow: 'auto' }}>
      {/* Header con estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg,
          boxShadow: theme.colors.cardShadow
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: theme.spacing.lg }}>
          <div>
            <h2 style={{ color: theme.colors.text, margin: 0, fontSize: theme.typography.sizes['2xl'], fontWeight: 600, letterSpacing: '-0.015em', display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              Agenda clínica
              <Tooltip
                id="calendar-overview"
                title="Vista general"
                text="Selecciona un día del calendario para ver detalles, exportar a PDF o WhatsApp, y asignar doctor a cada cita."
                placement="bottom"
              />
            </h2>
            <p style={{ color: theme.colors.textSecondary, margin: '4px 0 0', fontSize: theme.typography.sizes.sm }}>
              Dr. Alejandro Martínez · Planificación y disponibilidad
            </p>
          </div>

          <div data-tour="calendar-stats" style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
            <StatCard iconType="calendar" label="Citas hoy" value={getAppointmentsForDay(new Date()).length} subtitle="programadas" color={theme.colors.primary} theme={theme} />
            <StatCard iconType="week" label="Esta semana" value={appointments.filter(apt => {
              const aptDate = new Date(apt.date), today = new Date();
              return aptDate >= today && aptDate <= addHours(today, 168);
            }).length} subtitle="citas" color={theme.colors.secondary} theme={theme} />
            <StatCard iconType="revenue" label="Ingresos mes" value={`${appointments.reduce((sum, apt) => {
              const price = SERVICES[apt.service]?.price || '0';
              return sum + (parseInt(price.replace(/[^0-9]/g, '')) || 0);
            }, 0)}€`} subtitle="estimado" color={theme.colors.accent} theme={theme} />
          </div>
        </div>
      </motion.div>

      {/* Calendario */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.lg,
          boxShadow: theme.colors.cardShadow
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg, flexWrap: 'wrap', gap: theme.spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <NavButton icon="←" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} theme={theme} />
            <h3 style={{ color: theme.colors.text, margin: 0, textTransform: 'capitalize', minWidth: '180px', textAlign: 'center', fontSize: theme.typography.sizes.lg }}>
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <NavButton icon="→" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} theme={theme} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}
              style={{
                background: theme.colors.primary, border: 'none', borderRadius: theme.borderRadius.md,
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`, cursor: 'pointer', color: 'white',
                fontWeight: 600, fontSize: theme.typography.sizes.sm
              }}
            >
              Hoy
            </motion.button>
          </div>
          
          {/* Toggle vista */}
          <div style={{ display: 'flex', gap: '2px', background: theme.colors.border, borderRadius: theme.borderRadius.md, padding: 2 }}>
            <ViewToggle active={viewMode === 'month'} onClick={() => setViewMode('month')} icon="📅" label="Mes" theme={theme} />
            <ViewToggle active={viewMode === 'day'} onClick={() => { setViewMode('day'); if (!selectedDay) setSelectedDay(new Date()); }} icon="📋" label="Día" theme={theme} />
          </div>
        </div>

        {/* Grid mes */}
        {viewMode === 'month' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: theme.spacing.xs, marginBottom: theme.spacing.md }}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} style={{ textAlign: 'center', color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm, fontWeight: 600, padding: theme.spacing.sm }}>
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: theme.spacing.xs }}>
              {calendarDays.map((day, index) => {
                // Celda vacía para alinear el calendario
                if (day === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="calendar-day"
                      style={{
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        opacity: 0.15,
                        background: theme.colors.background
                      }}
                    />
                  );
                }

                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentDay = isToday(day);
                const dayApps = getAppointmentsForDay(day);
                const occupancy = getOccupancyPercentage(day);
                const occupancyColor = getOccupancyColor(occupancy);
                
                return (
                  <motion.button
                    key={format(day, 'yyyy-MM-dd')}
                    className="calendar-day"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { setSelectedDay(day); setShowDayDetail(true); }}
                    style={{
                      padding: theme.spacing.sm, borderRadius: theme.borderRadius.md,
                      background: isSelected ? theme.colors.primary : isCurrentDay ? `${theme.colors.primary}15` : theme.colors.background,
                      border: isCurrentDay ? `2px solid ${theme.colors.primary}` : `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
                      cursor: 'pointer', opacity: day.getDay() === 0 ? 0.5 : 1,
                      textAlign: 'left', position: 'relative'
                    }}
                  >
                    <div style={{ color: isSelected ? 'white' : theme.colors.text, fontWeight: isCurrentDay ? 700 : 400, fontSize: theme.typography.sizes.base, marginBottom: theme.spacing.xs }}>
                      {format(day, 'd')}
                    </div>
                    {dayApps.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {dayApps.slice(0, 3).map((apt, i) => {
                          const service = SERVICES[apt.service];
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6rem', color: theme.colors.textSecondary }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: service?.color || '#999' }} />
                              <span>{apt.time}</span><span>{service?.icon}</span>
                            </div>
                          );
                        })}
                        {dayApps.length > 3 && <div style={{ fontSize: '0.6rem', color: theme.colors.textSecondary }}>+{dayApps.length - 3} más</div>}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, height: 3, background: theme.colors.border, borderRadius: 1.5, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(occupancy, 100)}%`, height: '100%', background: occupancyColor, borderRadius: 1.5 }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {viewMode === 'day' && selectedDay && (
          <DayTimelineView day={selectedDay} appointments={getAppointmentsForDay(selectedDay)} services={SERVICES} theme={theme} />
        )}
      </motion.div>

      {/* Panel detalle del día */}
      <AnimatePresence>
        {showDayDetail && selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: theme.colors.surface, borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.xl, boxShadow: theme.colors.cardHover, overflow: 'hidden'
            }}
          >
            <DayDetailPanel
              day={selectedDay} appointments={filteredAppointments}
              allAppointments={getAppointmentsForDay(selectedDay)} services={SERVICES}
              stats={getDayStats(selectedDay)} availableSlots={getAvailableSlots(selectedDay)}
              filterService={filterService} setFilterService={setFilterService}
              cancelConfirm={cancelConfirm} setCancelConfirm={setCancelConfirm}
              handleCancelAppointment={handleCancelAppointment}
              setAppointments={setAppointments} theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTES HELPER ---

function StatIcon({ type, color }) {
  const common = {
    width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  if (type === 'calendar') {
    return (
      <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    );
  }
  if (type === 'week') {
    return (
      <svg {...common}><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
    );
  }
  if (type === 'revenue') {
    return (
      <svg {...common}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    );
  }
  return null;
}

function StatCard({ label, value, subtitle, color, iconType, theme }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      style={{
        background: theme.colors.surface, borderRadius: theme.borderRadius.lg,
        padding: '0.875rem 1rem', border: `1px solid ${theme.colors.border}`,
        display: 'flex', alignItems: 'center',
        gap: '0.875rem', minWidth: '160px'
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: theme.borderRadius.md, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <StatIcon type={iconType} color={color} />
      </div>
      <div>
        <div style={{ fontSize: theme.typography.sizes['2xl'], fontWeight: 700, color: theme.colors.text, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em' }}>{value}</div>
        <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary, marginTop: 2, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        {subtitle && <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textLight, marginTop: 1 }}>{subtitle}</div>}
      </div>
    </motion.div>
  );
}

function NavButton({ icon, onClick, theme }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        background: theme.colors.background, border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, cursor: 'pointer',
        color: theme.colors.text, fontSize: '1.2rem', width: '36px', height: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {icon}
    </motion.button>
  );
}

function ViewToggle({ active, onClick, icon, label, theme }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        background: active ? theme.colors.primary : 'transparent',
        color: active ? 'white' : theme.colors.textSecondary,
        border: 'none', borderRadius: theme.borderRadius.sm, cursor: 'pointer',
        fontSize: theme.typography.sizes.sm, fontWeight: active ? 600 : 400
      }}
    >
      {icon} {label}
    </button>
  );
}

function ActionButton({ icon, label, color, onClick, theme }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: theme.spacing.xs,
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        background: `${color}12`, color: color,
        border: `1px solid ${color}30`, borderRadius: theme.borderRadius.md,
        cursor: 'pointer', fontSize: theme.typography.sizes.sm, fontWeight: 600, whiteSpace: 'nowrap'
      }}
    >
      {icon} {label}
    </motion.button>
  );
}

function DayDetailPanel({ 
  day, appointments, allAppointments, services, stats, 
  availableSlots, filterService, setFilterService,
  cancelConfirm, setCancelConfirm, handleCancelAppointment,
  setAppointments, theme 
}) {
  return (
    <div>
      <CalendarSync day={day} appointments={allAppointments} stats={stats} onSyncComplete={(merged) => setAppointments(merged)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.lg, flexWrap: 'wrap', gap: theme.spacing.md }}>
        <div>
          <h3 style={{ color: theme.colors.text, margin: 0, textTransform: 'capitalize' }}>
            📅 {format(day, "EEEE d 'de' MMMM yyyy", { locale: es })}
          </h3>
          <div style={{ display: 'flex', gap: theme.spacing.lg, marginTop: theme.spacing.sm }}>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm }}>📊 {stats.total} citas</span>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm }}>⏱️ {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}min</span>
            <span style={{ color: theme.colors.success, fontSize: theme.typography.sizes.sm }}>🟢 {availableSlots.length} libres</span>
            <span style={{ color: theme.colors.primary, fontSize: theme.typography.sizes.sm, fontWeight: 600 }}>💰 {stats.revenue}€</span>
          </div>
        </div>
        <select value={filterService} onChange={(e) => setFilterService(e.target.value)}
          style={{ padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.text, cursor: 'pointer' }}>
          <option value="all">🔍 Todos</option>
          {Object.entries(services).map(([key, s]) => <option key={key} value={key}>{s.icon} {s.name}</option>)}
        </select>
      </div>

      {/* Botones exportación unificados */}
      <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.lg, flexWrap: 'wrap' }}>
        <ActionButton icon="📄" label="PDF" color={theme.colors.primary} onClick={() => exportToPDF(day, allAppointments, stats)} theme={theme} />
        <ActionButton icon="💬" label="WhatsApp" color="#25D366" onClick={() => shareViaWhatsApp(day, allAppointments, stats)} theme={theme} />
        <ActionButton icon="📧" label="Email" color={theme.colors.secondary} onClick={() => shareViaEmail(day, allAppointments, stats)} theme={theme} />
        <ActionButton icon="📋" label="Copiar" color={theme.colors.textSecondary} onClick={() => {
          const text = generateWhatsAppMessage(day, allAppointments, stats);
          navigator.clipboard.writeText(text).then(() => alert('✅ Resumen copiado'));
        }} theme={theme} />
      </div>

      {/* Barra ocupación */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.xs, fontSize: theme.typography.sizes.sm }}>
          <span style={{ color: theme.colors.textSecondary }}>Ocupación</span>
          <span style={{ color: theme.colors.text, fontWeight: 600 }}>{allAppointments.length}/{allAppointments.length + availableSlots.length} slots</span>
        </div>
        <div style={{ height: 8, background: theme.colors.border, borderRadius: 4, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${allAppointments.length + availableSlots.length > 0 ? (allAppointments.length / (allAppointments.length + availableSlots.length)) * 100 : 0}%` }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${theme.colors.success}, ${theme.colors.warning}, ${theme.colors.error})`, borderRadius: 4 }} />
        </div>
      </div>

      {/* Distribución servicios */}
      {Object.keys(stats.serviceCount).length > 0 && (
        <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.lg, flexWrap: 'wrap' }}>
          {Object.entries(stats.serviceCount).map(([sid, count]) => {
            const s = services[sid];
            return (
              <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: `${s?.color}15`, borderRadius: theme.borderRadius.full, fontSize: theme.typography.sizes.sm, color: s?.color, fontWeight: 600 }}>
                {s?.icon} {s?.name}: {count}
              </div>
            );
          })}
        </div>
      )}

      {/* Lista citas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <h4 style={{ color: theme.colors.text, margin: 0 }}>📋 Citas {filterService !== 'all' && `(${services[filterService]?.name})`}</h4>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: theme.spacing.xl, color: theme.colors.textSecondary }}>
            {filterService === 'all' ? 'No hay citas 🎉' : `No hay citas de ${services[filterService]?.name}`}
          </div>
        ) : (
          appointments.sort((a, b) => a.time.localeCompare(b.time)).map((apt, index) => {
            const service = services[apt.service];
            const aptDate = parseISO(`${apt.date}T${apt.time}`);
            const hoursUntil = differenceInHours(aptDate, new Date());
            const canCancel = hoursUntil >= 24;
            return (
              <motion.div key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md,
                  background: theme.colors.background, borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.border}`, borderLeft: `4px solid ${service?.color || '#999'}`,
                  opacity: apt.status === 'cancelled' ? 0.5 : 1, flexWrap: 'wrap'
                }}>
                <div style={{ textAlign: 'center', minWidth: '60px' }}>
                  <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: 700, color: theme.colors.text }}>{apt.time}</div>
                  <div style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textSecondary }}>{service?.duration}min</div>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <span style={{ fontSize: '1.5rem' }}>{service?.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.text }}>{service?.name}</div>
                      <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
                        {apt.patient} • {apt.email || 'Sin email'} • {apt.phone || 'Sin teléfono'}
                        {apt.doctorId && (
                          <span style={{ color: DOCTORS.find(d => d.id === apt.doctorId)?.color, fontWeight: 600, marginLeft: theme.spacing.sm }}>
                            | 👨‍⚕️ {DOCTORS.find(d => d.id === apt.doctorId)?.name.split(' ').slice(0, 2).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <div style={{ fontWeight: 600, color: theme.colors.text }}>{service?.price}</div>
                  <div style={{ fontSize: theme.typography.sizes.xs, padding: '2px 8px', borderRadius: theme.borderRadius.full, background: apt.status === 'confirmed' ? `${theme.colors.success}20` : `${theme.colors.warning}20`, color: apt.status === 'confirmed' ? theme.colors.success : theme.colors.warning, display: 'inline-block' }}>
                    {apt.status === 'confirmed' ? '✓ Confirmada' : '⏳ Pendiente'}
                  </div>
                </div>
                <select value={apt.doctorId || ''} onChange={(e) => {
                  const doctorId = e.target.value ? parseInt(e.target.value) : null;
                  assignDoctorToAppointment(apt.id, doctorId);
                  window.dispatchEvent(new Event('storage'));
                  const saved = localStorage.getItem('sonriebot-appointments');
                  if (saved) setAppointments(JSON.parse(saved));
                }}
                style={{ padding: `${theme.spacing.xs} ${theme.spacing.sm}`, borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.border}`, background: apt.doctorId ? `${DOCTORS.find(d => d.id === apt.doctorId)?.color}20` : theme.colors.background, color: apt.doctorId ? DOCTORS.find(d => d.id === apt.doctorId)?.color : theme.colors.textSecondary, fontSize: theme.typography.sizes.xs, cursor: 'pointer', minWidth: '130px', fontWeight: apt.doctorId ? 600 : 400 }}>
                  <option value="">👨‍⚕️ Sin asignar</option>
                  {DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {canCancel ? (
  <>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        console.log('🖱️ Click en cancelar cita:', apt.id);
        setCancelConfirm(apt.id);
      }}
      style={{
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        background: `${theme.colors.error}12`,
        color: theme.colors.error,
        border: `1px solid ${theme.colors.error}30`,
        borderRadius: theme.borderRadius.sm,
        cursor: 'pointer',
        fontSize: theme.typography.sizes.xs,
        fontWeight: 500,
        whiteSpace: 'nowrap'
      }}
    >
      ❌ Cancelar
    </motion.button>

    {/* AGREGAR ESTO: Botones de confirmación */}
    {cancelConfirm === apt.id && (
      <div style={{ display: 'flex', gap: theme.spacing.xs, marginTop: theme.spacing.xs }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleCancelAppointment(apt.id)}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            background: theme.colors.error,
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            cursor: 'pointer',
            fontSize: theme.typography.sizes.xs,
            fontWeight: 600
          }}
        >
          ✓ Sí, cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCancelConfirm(null)}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            background: theme.colors.background,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.sm,
            cursor: 'pointer',
            fontSize: theme.typography.sizes.xs
          }}
        >
          ✗ No
        </motion.button>
      </div>
    )}
  </>
) : (
  <span style={{
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    color: theme.colors.textLight,
    fontSize: theme.typography.sizes.xs,
    whiteSpace: 'nowrap'
  }}>
    🔒 No cancelable
  </span>
)}
              </motion.div>
            );
          })
        )}
      </div>

      {availableSlots.length > 0 && (
        <div style={{ marginTop: theme.spacing.lg }}>
          <h4 style={{ color: theme.colors.text, marginBottom: theme.spacing.sm }}>🟢 Disponibles ({availableSlots.length})</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {availableSlots.map(slot => (
              <span key={slot} style={{ padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: `${theme.colors.success}15`, color: theme.colors.success, borderRadius: theme.borderRadius.full, fontSize: theme.typography.sizes.sm, fontWeight: 600 }}>
                {slot}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayTimelineView({ day, appointments, services, theme }) {
  const workHours = day.getDay() === 6 ? { start: 9, end: 13 } : { start: 9, end: 19 };
  const hours = [];
  for (let h = workHours.start; h < workHours.end; h++) {
    if (h < 14 || h >= 16) hours.push(h);
  }
  return (
    <div style={{ marginTop: theme.spacing.lg }}>
      <h4 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>📋 Línea de tiempo - {format(day, "EEEE d 'de' MMMM", { locale: es })}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        {hours.map(hour => {
          const hourStr = `${hour.toString().padStart(2, '0')}:00`;
          const hourApps = appointments.filter(apt => parseInt(apt.time.split(':')[0]) === hour);
          return (
            <div key={hour} style={{ display: 'flex', gap: theme.spacing.md, padding: theme.spacing.sm, background: hourApps.length > 0 ? `${theme.colors.primary}10` : 'transparent', borderRadius: theme.borderRadius.md, border: `1px solid ${hourApps.length > 0 ? theme.colors.primary + '30' : 'transparent'}` }}>
              <div style={{ minWidth: '60px', fontWeight: 600, color: hourApps.length > 0 ? theme.colors.primary : theme.colors.textSecondary }}>{hourStr}</div>
              <div style={{ flex: 1 }}>
                {hourApps.length > 0 ? hourApps.map(apt => {
                  const service = services[apt.service];
                  return (
                    <div key={apt.id} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, padding: `${theme.spacing.xs} ${theme.spacing.sm}`, background: `${service?.color}20`, borderRadius: theme.borderRadius.sm, marginBottom: 2 }}>
                      <span>{service?.icon}</span><span style={{ fontWeight: 500 }}>{apt.patient}</span>
                      <span style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.sm }}>{service?.name} • {service?.duration}min</span>
                    </div>
                  );
                }) : <span style={{ color: theme.colors.textLight, fontSize: theme.typography.sizes.sm }}>Disponible</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}