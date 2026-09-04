# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos principales

```bash
npm run dev        # Servidor de desarrollo en http://localhost:3000 (sin Netlify Functions)
netlify dev        # Dev con Netlify Functions (necesario para probar el chat IA en local)
npm run build      # Build de producción → carpeta dist/
npm run preview    # Preview del build en local
npm run lint       # ESLint 9 flat config (0 warnings permitidos)
```

No hay framework de tests en el proyecto (no existe `npm test`). La verificación pre-commit es `npm run lint` (debe quedar en verde, 0 warnings) y un `npm run build` limpio.

Deploy a Netlify:
```bash
netlify deploy --prod
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores. **Distinción clave:**

- **Secretos** → sin prefijo. Solo los leen las Netlify Functions en el servidor; **nunca** se incluyen en el bundle del cliente.
- **Públicas** → prefijo `VITE_`. Se exponen en el bundle del cliente. No poner secretos aquí.

| Variable | Tipo | Propósito |
|---|---|---|
| `OPENROUTER_API_KEY` | 🔒 Secreto (servidor) | Acceso a LLMs vía OpenRouter desde ambas funciones (`chat.js` y `whatsapp.js`) |
| `VITE_GOOGLE_CLIENT_ID` | Público | OAuth para Google Calendar |
| `VITE_GOOGLE_API_KEY` | Público | API de Google Calendar |
| `VITE_CLINIC_NAME` | Público | Nombre de la clínica (UI, PDF, emails, system prompt) |
| `VITE_CLINIC_ADDRESS`, `VITE_CLINIC_PHONE`, `VITE_CLINIC_EMAIL`, `VITE_CLINIC_DOCTOR` | Público | Datos de contacto de la clínica |
| `VITE_CLINIC_CURRENCY` | Público | Moneda de los precios: símbolo o código (`€` def., `$`, `MXN`…) |
| `VITE_CLINIC_CURRENCY_POSITION` | Público | Posición del símbolo: `after` (def., `60€`) o `before` (`$60`) |

Las `VITE_CLINIC_*` las leen tanto el cliente (`import.meta.env`) como las funciones de servidor (`process.env`), que replican los valores por defecto. Nota: `netlify dev` inyecta las `VITE_*` en `process.env` de las funciones; en `vite dev` puro las funciones no corren.

> **Atención:** los archivos `.env*` (salvo `.env.example`) están en `.gitignore`. Nunca commitear credenciales reales ni exponerlas en logs. En Netlify se configuran en *Site settings → Environment variables*.

## Arquitectura

Es una SPA de React 18 + Vite. El estado se persiste íntegramente en `localStorage` del navegador (no hay base de datos). El único código de servidor son **dos Netlify Functions** en `netlify/functions/`:

- **`chat.js`** — proxy del chat web hacia OpenRouter (oculta la API key).
- **`whatsapp.js`** — webhook de WhatsApp (Twilio Sandbox) que reutiliza el mismo cerebro (system prompt + cascada de modelos) con memoria por número en Netlify Blobs.

### Vistas

`App.jsx` monta el árbol de providers y renderiza `AppShell`, que controla una única variable de estado `view` (`'chat'` | `'calendar'`) para alternar entre `ChatInterface` y `CalendarView` (con transición de `framer-motion`). `Header` cambia la vista; además, el onboarding puede pedir un cambio de vista mediante `requestViewChange` del `OnboardingContext` (`AppShell` observa `requestedView` y lo aplica). El orden de los providers importa: **`ThemeProvider` › `OnboardingProvider` › `ChatProvider`**.

### Contextos

- **`ThemeContext`** — persiste preferencia light/dark en `localStorage` (`sonriebot-theme`). Expone un objeto `theme` con design tokens (`colors`, `typography`, `spacing`, `borderRadius`, `animations`). Todos los componentes consumen el tema directamente vía inline styles en lugar de CSS classes.
- **`OnboardingContext`** — orquesta la primera experiencia: `WelcomeModal`, el `Tour` guiado por pasos y los `Tooltip`. Persiste en `localStorage` (`sonriebot-onboarding`) qué ha visto el usuario (`hasSeenWelcome`, `tourCompleted`, `tooltipsDismissed`). También expone `requestViewChange` para que el tour navegue entre vistas.
- **`ChatContext`** — `useReducer` con los actions: `ADD_MESSAGE`, `SET_TYPING`, `ADD_RATING`, `START_BOOKING_FLOW`, `UPDATE_BOOKING_DATA`, `NEXT_BOOKING_STEP`, `PREV_BOOKING_STEP`, `COMPLETE_BOOKING`, `CANCEL_BOOKING`, `CLEAR_CHAT`. Persiste los mensajes en `localStorage` (`sonriebot-chat`) y el estado del wizard de reserva en `sonriebot-booking-flow`, con una ventana de reanudación de 24h (`BOOKING_RESUME_WINDOW_MS`): una reserva a medias se retoma al recargar. El estado incluye flags `reengagement` (`softSent`/`hardSent`).

### Flujo de agendamiento

`ChatInterface` implementa un wizard de 6 pasos: Servicio → Fecha → Hora → Nombre → Email → Teléfono. La apertura del wizard está pilotada por el LLM: el `SYSTEM_PROMPT` emite el marcador **`[INICIAR_RESERVA]`** en una línea aparte cuando detecta intención de reservar; `ChatInterface` (`BOOKING_TRIGGER`) lo detecta, lo limpia del mensaje visible y arranca el wizard. `scheduling.js` provee los huecos disponibles según horario (`getAvailableSlotsForDate`), las próximas fechas y el parseo de fechas en español ("mañana", "lunes"…). Al completarse, la cita se escribe en `localStorage` (`sonriebot-appointments`) y opcionalmente se sincroniza con Google Calendar vía `calendarSync.js`.

### Reenganche por inactividad

El hook `useInactivityWatcher` (en `ChatInterface`) dispara dos niveles tras la última actividad: **soft a los 60s** y **hard a los 240s**. Cada nivel llama a `generateReengagementMessage(history, level)` de `openrouter.js`, que pega en la Netlify Function con `type: 'reengagement'` (la función usa una instrucción distinta y menos tokens). El mensaje hard puede incluir `[INICIAR_RESERVA]` para abrir el wizard.

### Netlify Functions (servidor)

- **`chat.js`** — Proxy server-side a OpenRouter. Guarda la cascada de modelos (`anthropic/claude-3-haiku` → `openai/gpt-4o-mini` → `meta-llama/llama-3.1-70b-instruct`) y el `SYSTEM_PROMPT`. Lee `OPENROUTER_API_KEY` y las `VITE_CLINIC_*` de `process.env`. Maneja `type: 'chat'` y `type: 'reengagement'`. Si falta la key devuelve 503; si todos los modelos fallan, 502 (el cliente cae entonces a su respuesta local).
- **`whatsapp.js`** — Webhook de Twilio WhatsApp Sandbox. Recibe `POST` form-urlencoded, responde con **TwiML** `<Message>` (sin necesidad de Account SID/Token). Usa su propio `SYSTEM_PROMPT` (adaptado a WhatsApp, sin markdown) y la misma cascada de modelos. Guarda la **memoria de conversación por número** en **Netlify Blobs** (store `whatsapp-sessions`); si Blobs no está disponible, degrada a respuesta sin memoria. Elimina el marcador `[INICIAR_RESERVA]` (en WhatsApp no hay wizard). Setup documentado en `docs/whatsapp-demo-setup.md`.

### Servicios (frontend, `src/services/`)

- **`openrouter.js`** — Cliente delgado hacia `/.netlify/functions/chat` (no conoce la API key). Expone `sendMessageToSonrieBot`, `generateReengagementMessage` y `testChatConnection`. Si la función falla, usa `getLocalResponse()` con respuestas por palabras clave como respaldo.
- **`scheduling.js`** — Lógica de agenda: `BOOKABLE_SERVICES` (catálogo reservable), horarios laborales (`WORK_HOURS`), huecos libres cruzando con `sonriebot-appointments`, y parseo de fechas en español (`dayNameToNextDate`, `parseRelativeDay`).
- **`calendarSync.js`** — OAuth con Google Identity Services cargado dinámicamente. Crea eventos en Google Calendar y genera archivos iCal para descarga.
- **`exportService.js`** — Exporta el resumen del día a PDF (jsPDF), genera texto para WhatsApp y HTML para email. Define `SERVICES` y `DOCTORS` (usados también en `CalendarView`).
- **`currency.js`** — Moneda configurable. Expone `CURRENCY` y `formatPrice(amount)`, que toma el importe **numérico** y aplica `VITE_CLINIC_CURRENCY` + `VITE_CLINIC_CURRENCY_POSITION`. Cada catálogo pasa el número a `formatPrice()` donde se define; la Netlify Function replica la misma lógica para el system prompt.
- **`sampleData.js`** — Siembra citas de demo en `sonriebot-appointments` (marcadas `isSample`, ancladas al lunes de la semana actual) para poblar el dashboard. `loadSampleData` / `clearSampleData` / `hasSampleData`; lo usan `WelcomeModal` y `HelpButton`.

### ⚠️ Catálogo de servicios duplicado

La lista de servicios/precios está **redefinida en varios sitios** con formas distintas. Si cambias un precio, nombre o servicio, actualízalo en todos:

- `scheduling.js` → `BOOKABLE_SERVICES` (fuente del wizard; la importan `ChatInterface` y `BookingWidgets`)
- `exportService.js` → `SERVICES` + `DOCTORS`
- `calendarSync.js` → `SERVICES`
- `CalendarView.jsx` → `SERVICES`
- `netlify/functions/chat.js` y `netlify/functions/whatsapp.js` → dentro del `SYSTEM_PROMPT`

### Persistencia (`localStorage`)

No hay backend de datos; todo vive en el navegador. Claves:

| Clave | Origen | Contenido |
|---|---|---|
| `sonriebot-theme` | `ThemeContext` | Preferencia light/dark |
| `sonriebot-chat` | `ChatContext` | Historial de mensajes |
| `sonriebot-booking-flow` | `ChatContext` | Wizard de reserva en curso (reanudable 24h) |
| `sonriebot-appointments` | ChatInterface, CalendarView, sampleData, calendarSync | Citas agendadas |
| `sonriebot-onboarding` | `OnboardingContext` | Progreso de onboarding |
| `sonriebot-sample-data-loaded` | `sampleData` | Flag de datos de demo cargados |
| `googleCalendarToken`, `lastCalendarSync` | `calendarSync` | Token OAuth y última sync |

Para sincronizar vistas que leen las mismas claves, quien escribe citas dispara `window.dispatchEvent(new Event('storage'))`; los consumidores (p. ej. `CalendarView`) escuchan el evento `storage` para refrescar.

### Estilos

No hay CSS modules ni Tailwind. Los estilos se aplican como inline styles tomando valores del objeto `theme` del `ThemeContext`. `App.css` e `index.css` definen sólo resets globales y clases base mínimas. Al añadir nuevos componentes, seguir el mismo patrón: `style={{ color: theme.colors.text, ... }}`.

### Build

Vite divide el bundle en 4 chunks manuales: `vendor` (react + react-dom), `animations` (framer-motion), `calendar` (date-fns), `pdf` (jspdf). No usar `terser` como minificador; el proyecto usa `esbuild`. El build elimina `console.*` y `debugger` en producción vía `esbuild.drop` (`vite.config.js`); no afecta a `vite dev`.
