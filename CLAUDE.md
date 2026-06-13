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

Deploy a Netlify:
```bash
netlify deploy --prod
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores. **Distinción clave:**

- **Secretos** → sin prefijo. Solo los lee la Netlify Function en el servidor; **nunca** se incluyen en el bundle del cliente.
- **Públicas** → prefijo `VITE_`. Se exponen en el bundle del cliente. No poner secretos aquí.

| Variable | Tipo | Propósito |
|---|---|---|
| `OPENROUTER_API_KEY` | 🔒 Secreto (servidor) | Acceso a LLMs vía OpenRouter desde `netlify/functions/chat.js` |
| `VITE_GOOGLE_CLIENT_ID` | Público | OAuth para Google Calendar |
| `VITE_GOOGLE_API_KEY` | Público | API de Google Calendar |
| `VITE_CLINIC_NAME` | Público | Nombre de la clínica (UI, PDF, emails, system prompt) |
| `VITE_CLINIC_ADDRESS`, `VITE_CLINIC_PHONE`, `VITE_CLINIC_EMAIL`, `VITE_CLINIC_DOCTOR` | Público | Datos de contacto de la clínica |
| `VITE_CLINIC_CURRENCY` | Público | Moneda de los precios: símbolo o código (`€` def., `$`, `MXN`…) |
| `VITE_CLINIC_CURRENCY_POSITION` | Público | Posición del símbolo: `after` (def., `60€`) o `before` (`$60`) |

> **Atención:** los archivos `.env*` (salvo `.env.example`) están en `.gitignore`. Nunca commitear credenciales reales ni exponerlas en logs. En Netlify se configuran en *Site settings → Environment variables*.

## Arquitectura

Es una SPA de React 18 + Vite. El estado se persiste en `localStorage` del navegador. El único código de servidor es una **Netlify Function** (`netlify/functions/chat.js`) que actúa de proxy hacia OpenRouter para no exponer la API key en el cliente.

### Vistas

`App.jsx` controla una única variable de estado `view` (`'chat'` | `'calendar'`) que alterna entre `ChatInterface` y `CalendarView`, envueltos en `ThemeProvider` + `ChatProvider`.

### Contextos

- **`ThemeContext`** — persiste preferencia light/dark en `localStorage` (`sonriebot-theme`). Expone un objeto `theme` con design tokens (`colors`, `typography`, `spacing`, `borderRadius`, `animations`). Todos los componentes consumen el tema directamente a través de inline styles en lugar de CSS classes.
- **`ChatContext`** — `useReducer` con los actions: `ADD_MESSAGE`, `SET_TYPING`, `ADD_RATING`, `START_BOOKING_FLOW`, `UPDATE_BOOKING_DATA`, `NEXT_BOOKING_STEP`, `PREV_BOOKING_STEP`, `COMPLETE_BOOKING`, `CANCEL_BOOKING`, `CLEAR_CHAT`. Los mensajes se persisten en `localStorage` (`sonriebot-chat`).

### Flujo de agendamiento

`ChatInterface` implementa un wizard de 6 pasos: Servicio → Fecha → Hora → Nombre → Email → Teléfono. Al completarse, la cita se escribe en `localStorage` (`sonriebot-appointments`) y opcionalmente se sincroniza con Google Calendar via `calendarSync.js`.

### Servicios

- **`openrouter.js`** — Cliente delgado: hace `POST` a `/.netlify/functions/chat` (no conoce la API key). La cascada de modelos y el system prompt viven en la función. Si la función falla, usa `getLocalResponse()` con respuestas por palabras clave como respaldo.
- **`netlify/functions/chat.js`** — Proxy server-side a OpenRouter. Guarda la cascada de modelos (claude-3-haiku → gpt-4o-mini → llama-3.1-70b) y el `SYSTEM_PROMPT`. Lee `OPENROUTER_API_KEY` y los `VITE_CLINIC_*` de `process.env`. Maneja `type: 'chat'` y `type: 'reengagement'`.
- **`calendarSync.js`** — Autenticación OAuth con Google Identity Services cargado dinámicamente. Crea eventos en Google Calendar y genera archivos iCal para descarga.
- **`exportService.js`** — Exporta el resumen del día a PDF (jsPDF), genera texto para WhatsApp y contenido HTML para email. Define las constantes `SERVICES` y `DOCTORS` usadas también en `CalendarView`.
- **`currency.js`** — Moneda configurable por la clínica. Expone `CURRENCY` y `formatPrice(amount)`, que toma el importe numérico y aplica `VITE_CLINIC_CURRENCY` + `VITE_CLINIC_CURRENCY_POSITION`. Los precios se guardan como número en cada tabla `SERVICES` y se formatean aquí; la Netlify Function replica la misma lógica para el system prompt.

### Estilos

No hay CSS modules ni Tailwind. Los estilos se aplican como inline styles tomando valores del objeto `theme` del `ThemeContext`. El archivo `App.css` e `index.css` definen sólo resets globales y clases base mínimas. Al añadir nuevos componentes, seguir el mismo patrón: `style={{ color: theme.colors.text, ... }}`.

### Build

Vite divide el bundle en 4 chunks manuales: `vendor` (react + react-dom), `animations` (framer-motion), `calendar` (date-fns), `pdf` (jspdf). No usar `terser` como minificador; el proyecto usa `esbuild`. El build elimina `console.*` y `debugger` en producción vía `esbuild.drop` (`vite.config.js`); no afecta a `vite dev`.
