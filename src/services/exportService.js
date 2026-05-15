import { jsPDF } from 'jspdf';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos de la clínica desde variables de entorno
const CLINIC_NAME    = import.meta.env.VITE_CLINIC_NAME;
const CLINIC_ADDRESS = import.meta.env.VITE_CLINIC_ADDRESS;
const CLINIC_PHONE   = import.meta.env.VITE_CLINIC_PHONE;
const CLINIC_EMAIL   = import.meta.env.VITE_CLINIC_EMAIL;

// Servicios con sus detalles
const SERVICES = {
  consulta:       { name: 'Primera consulta',  color: '#4CAF50', duration: 30,  icon: '🦷', price: 'Gratis' },
  limpieza:       { name: 'Limpieza dental',   color: '#2196F3', duration: 30,  icon: '✨', price: '60€' },
  blanqueamiento: { name: 'Blanqueamiento',    color: '#FF9800', duration: 90,  icon: '😁', price: '150€' },
  ortodoncia:     { name: 'Ortodoncia',        color: '#9C27B0', duration: 30,  icon: '🦷', price: 'Consulta gratis' },
  implante:       { name: 'Implante dental',   color: '#F44336', duration: 90,  icon: '🔩', price: '1.200€' },
  urgencia:       { name: 'Urgencia',          color: '#FF5722', duration: 30,  icon: '⚡', price: '90€' }
};

// Doctores disponibles
const DOCTORS = [
  { id: 1, name: 'Dr. Alejandro Martínez', specialty: 'Odontología General', color: '#2196F3' },
  { id: 2, name: 'Dra. Carmen Ruiz',       specialty: 'Ortodoncia',          color: '#9C27B0' },
  { id: 3, name: 'Dr. Carlos López',       specialty: 'Implantología',       color: '#F44336' },
  { id: 4, name: 'Dra. Ana Sánchez',       specialty: 'Odontopediatría',     color: '#4CAF50' }
];

/**
 * Exportar resumen del día a PDF
 */
export function exportToPDF(day, appointments, stats) {
  const doc = new jsPDF();
  const dateStr = format(day, "EEEE d 'de' MMMM yyyy", { locale: es });
  
  doc.setFont('helvetica');
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(33, 150, 243);
  doc.text(CLINIC_NAME, 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Resumen de Citas del Día', 20, 30);
  
  // Fecha
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text(dateStr, 20, 42);
  
  // Línea separadora
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(0.5);
  doc.line(20, 46, 190, 46);
  
  // Estadísticas
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text(`Total citas: ${stats.total}`, 20, 56);
  doc.text(`Tiempo total: ${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}min`, 20, 63);
  doc.text(`Ingresos estimados: ${stats.revenue}€`, 20, 70);
  
  // Tabla de citas
  let y = 85;
  
  // Encabezados
  doc.setFillColor(33, 150, 243);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.rect(20, y, 170, 8, 'F');
  doc.text('Hora',     22,  y + 6);
  doc.text('Paciente', 45,  y + 6);
  doc.text('Servicio', 100, y + 6);
  doc.text('Precio',   145, y + 6);
  doc.text('Doctor',   170, y + 6);
  
  y += 12;
  
  // Filas de citas
  appointments
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((apt, index) => {
      const service = SERVICES[apt.service];
      const doctor  = DOCTORS[index % DOCTORS.length];
      
      if (index % 2 === 0) {
        doc.setFillColor(245, 249, 255);
        doc.rect(20, y - 5, 170, 10, 'F');
      }
      
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(9);
      doc.text(apt.time,                                   22,  y);
      doc.text(apt.patient?.substring(0, 20) || 'Sin nombre', 45, y);
      doc.text(service?.name?.substring(0, 18) || 'N/A',  100, y);
      doc.text(service?.price || 'N/A',                   145, y);
      doc.text(doctor.name.split(' ').slice(0, 2).join(' '), 170, y);
      
      y += 10;
    });
  
  // Notas al pie
  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Este resumen fue generado automáticamente por SonríeBot`, 20, y);
  doc.text(`${CLINIC_ADDRESS} | ${CLINIC_PHONE}`, 20, y + 5);
  doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 20, y + 10);
  
  const filename = `Citas_${format(day, 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
  
  return filename;
}

/**
 * Generar texto para compartir por WhatsApp
 */
export function generateWhatsAppMessage(day, appointments, stats) {
  const dateStr = format(day, "EEEE d 'de' MMMM", { locale: es });
  
  let message = `🦷 *${CLINIC_NAME}*\n`;
  message += `📅 *Resumen de Citas - ${dateStr}*\n\n`;
  message += `📊 Total: ${stats.total} citas\n`;
  message += `⏱️ Tiempo: ${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}min\n`;
  message += `💰 Ingresos est.: ${stats.revenue}€\n\n`;
  message += `📋 *Citas del día:*\n\n`;
  
  appointments
    .sort((a, b) => a.time.localeCompare(b.time))
    .forEach((apt, index) => {
      const service = SERVICES[apt.service];
      const doctor  = DOCTORS[index % DOCTORS.length];
      message += `🕐 ${apt.time} - ${service?.icon} ${service?.name}\n`;
      message += `👤 ${apt.patient}\n`;
      message += `👨‍⚕️ ${doctor.name}\n`;
      message += `💰 ${service?.price}\n`;
      if (apt.phone) message += `📱 ${apt.phone}\n`;
      message += `\n`;
    });
  
  message += `📍 ${CLINIC_ADDRESS}\n`;
  message += `📞 ${CLINIC_PHONE}\n\n`;
  message += `_Generado por SonríeBot_`;
  
  return message;
}

/**
 * Generar contenido HTML para Email
 */
export function generateEmailContent(day, appointments, stats) {
  const dateStr = format(day, "EEEE d 'de' MMMM yyyy", { locale: es });
  const subject = `Resumen de Citas - ${dateStr}`;
  
  const body = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; opacity: 0.9; }
        .stats { display: flex; gap: 15px; margin: 20px 0; }
        .stat-card { background: #f5f9ff; padding: 15px; border-radius: 8px; text-align: center; flex: 1; }
        .stat-card .number { font-size: 24px; font-weight: bold; color: #2196F3; }
        .stat-card .label { font-size: 12px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #2196F3; color: white; padding: 10px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
        tr:nth-child(even) { background: #f5f9ff; }
        .footer { margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; font-size: 12px; color: #666; }
        .doctor-tag { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; color: white; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🦷 ${CLINIC_NAME}</h1>
        <p>Resumen de Citas del Día</p>
      </div>
      
      <h2>📅 ${dateStr}</h2>
      
      <div class="stats">
        <div class="stat-card">
          <div class="number">${stats.total}</div>
          <div class="label">Total Citas</div>
        </div>
        <div class="stat-card">
          <div class="number">${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}min</div>
          <div class="label">Tiempo Total</div>
        </div>
        <div class="stat-card">
          <div class="number">${stats.revenue}€</div>
          <div class="label">Ingresos Est.</div>
        </div>
      </div>
      
      <h3>📋 Citas Programadas</h3>
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Servicio</th>
            <th>Precio</th>
            <th>Doctor Asignado</th>
          </tr>
        </thead>
        <tbody>
          ${appointments.sort((a, b) => a.time.localeCompare(b.time)).map((apt, index) => {
            const service = SERVICES[apt.service];
            const doctor  = DOCTORS[index % DOCTORS.length];
            return `
              <tr>
                <td><strong>${apt.time}</strong></td>
                <td>${apt.patient || 'Sin nombre'}</td>
                <td>${service?.icon} ${service?.name}</td>
                <td>${service?.price}</td>
                <td><span class="doctor-tag" style="background: ${doctor.color}">${doctor.name}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>📍 ${CLINIC_ADDRESS} | 📞 ${CLINIC_PHONE} | ✉️ ${CLINIC_EMAIL}</p>
        <p>Este resumen fue generado automáticamente por SonríeBot el ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
      </div>
    </body>
    </html>
  `;
  
  return { subject, body };
}

/**
 * Compartir por WhatsApp
 */
export function shareViaWhatsApp(day, appointments, stats) {
  const message = generateWhatsAppMessage(day, appointments, stats);
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}

/**
 * Compartir por Email
 */
export function shareViaEmail(day, appointments, stats) {
  const { subject, body } = generateEmailContent(day, appointments, stats);
  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent('Abre este email en un cliente compatible con HTML')}`;
  window.open(mailtoLink, '_blank');
  
  navigator.clipboard.writeText(body).then(() => {
    alert('✅ Contenido HTML copiado al portapapeles. Pégalo en tu cliente de email.');
  });
}

/**
 * Asignar doctor a una cita
 */
export function assignDoctorToAppointment(appointmentId, doctorId) {
  const appointments = JSON.parse(localStorage.getItem('sonriebot-appointments') || '[]');
  const updatedAppointments = appointments.map(apt => {
    if (apt.id === appointmentId) {
      return { ...apt, doctorId };
    }
    return apt;
  });
  localStorage.setItem('sonriebot-appointments', JSON.stringify(updatedAppointments));
  return updatedAppointments;
}

export { DOCTORS };