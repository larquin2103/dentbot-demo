#!/usr/bin/env bash
# Regenera los archivos de voz en off (español mexicano) usando espeak-ng.
# Requiere: apt-get install espeak-ng
#
# Para mayor calidad sustituye este script por una llamada a un TTS neural
# (ElevenLabs, Google Cloud TTS, Azure Speech, Piper) y conserva los nombres
# de archivo para que PromoVideo.jsx los siga importando sin cambios.
set -euo pipefail
cd "$(dirname "$0")"

VOICE="es-mx"
SPEED=170

espeak-ng -v "$VOICE" -s "$SPEED" -p 45 -w 01-intro.wav \
  "Sonríe Bot. Inteligencia artificial para tu clínica dental."

espeak-ng -v "$VOICE" -s "$SPEED" -p 40 -w 02-problem.wav \
  "Tu clínica pierde pacientes mientras duerme. Cuarenta por ciento de llamadas, sin respuesta."

espeak-ng -v "$VOICE" -s "$SPEED" -p 50 -w 03-chat.wav \
  "Sonríe Bot atiende veinticuatro horas. Conversa como un humano, entiende a tus pacientes y agenda citas al instante."

espeak-ng -v "$VOICE" -s "$SPEED" -p 50 -w 04-booking.wav \
  "Reservar es así de fácil. En cinco pasos, tus pacientes confirman su cita sin esperar."

espeak-ng -v "$VOICE" -s "$SPEED" -p 50 -w 05-features.wav \
  "Una solución completa. Inteligencia artificial, Google Calendar, reportes en pe de efe, y diseño profesional."

espeak-ng -v "$VOICE" -s "$SPEED" -p 55 -w 06-cta.wav \
  "Empieza hoy. Convierte cada visita en una cita confirmada. Prueba Sonríe Bot."

echo "Voz en off regenerada en $(pwd)"
