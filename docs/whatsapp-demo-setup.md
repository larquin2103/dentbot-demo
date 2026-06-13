# Demo de WhatsApp en 10 minutos (Twilio Sandbox)

Este demo conecta tu agente a WhatsApp usando el **Sandbox de Twilio**. No
requiere verificación de empresa de Meta ni tokens que caduquen. La respuesta se
envía con **TwiML**, así que **no necesitas Account SID ni Auth Token** para que
funcione.

El cerebro es el mismo del agente web (`netlify/functions/whatsapp.js` reutiliza
el SYSTEM_PROMPT y la cascada de modelos de OpenRouter). La memoria de la
conversación se guarda por número en **Netlify Blobs** (sin configuración).

---

## Requisitos previos

1. El sitio desplegado en Netlify (el repo actual).
2. La variable `OPENROUTER_API_KEY` configurada en Netlify (la misma del chat web).
   > Sin ella el bot responde igual, pero con respuestas locales básicas en vez de IA.
3. Una cuenta gratuita de Twilio: https://www.twilio.com/try-twilio

---

## Pasos

### 1. Despliega la función
Haz deploy del repo en Netlify (o `git push` si tienes deploy automático). Tras
el deploy, tu webhook estará en:

```
https://<tu-sitio>.netlify.app/.netlify/functions/whatsapp
```

### 2. Activa el WhatsApp Sandbox de Twilio
1. Entra en la consola de Twilio → **Messaging → Try it out → Send a WhatsApp message**.
2. Verás un número del sandbox (p. ej. `+1 415 523 8886`) y un código tipo
   `join <dos-palabras>`.
3. Desde **tu** WhatsApp, envía ese `join <código>` al número del sandbox.
   - Repite este paso con cada teléfono que vaya a probar el demo (es por
     dispositivo; en el sandbox cada participante debe unirse una vez).

### 3. Conecta el webhook
En la misma página del sandbox, sección **Sandbox configuration**:
- **When a message comes in:** pega
  `https://<tu-sitio>.netlify.app/.netlify/functions/whatsapp`
- **Method:** `HTTP POST`
- Guarda.

### 4. Prueba
Escribe por WhatsApp al número del sandbox, por ejemplo:
- "Hola"
- "¿Qué precios tenéis?"
- "Quiero pedir cita para una limpieza"

El agente responde y te lleva a agendar paso a paso, con memoria de la conversación.

---

## Guion sugerido para la demo a clientes
1. "¿Qué tratamientos ofrecéis?" → lista de servicios con precios.
2. "Me duele una muela" → ofrece urgencia para hoy/mañana.
3. "Quiero cita para limpieza el viernes por la mañana" → recoge día/hora/nombre/email
   y confirma la cita con un resumen.

---

## Límites de este demo (y cómo se resuelven en producción)
- **Sandbox:** cada usuario debe enviar `join <código>` una vez. En producción se
  usa un número propio con la **Cloud API oficial** (sin código de unión).
- **Las citas no aparecen aún en la "Agenda" web:** el panel web lee de
  `localStorage` del navegador; para que las reservas de WhatsApp se vean en la
  agenda hace falta el **datastore compartido** del plan de producción
  (Supabase/Postgres).
- **Recordatorios proactivos** (24 h antes) requieren **plantillas aprobadas** por
  Meta y la Cloud API oficial.

> Para el siguiente paso (número propio, oficial, recordatorios y sincronización
> con la agenda), ver el plan de integración completo.
