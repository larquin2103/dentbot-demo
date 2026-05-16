# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos principales

```bash
npm run dev        # Servidor de desarrollo en http://localhost:3000
npm run build      # Build de producción → carpeta dist/
npm run preview    # Preview del build en local
npm run lint       # ESLint (0 warnings permitidos)
```

Deploy a Netlify:
```bash
netlify deploy --prod
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores. Las claves con prefijo `VITE_` son expuestas al bundle del cliente. Las variables requeridas son:

| Variable | Propósito |
|---|---|
| `VITE_OPENROUTER_API_KEY` | Acceso a LLMs via OpenRouter |
| `VITE_GOOGLE_CLIENT_ID` | OAuth para Google Calendar |
| `VITE_GOOGLE_API_KEY` | API de Google Calendar |
| `VITE_CLINIC_NAME` | Nombre de la clínica (usado en PDF, emails, prompts) |
| `VITE_CLINIC_ADDRESS`, `VITE_CLINIC_PHONE`, `VITE_CLINIC_EMAIL` | Datos de contacto de la clínica |

> **Atención:** `.env.production` contiene credenciales reales. Nunca exponerlo en commits ni en logs.

## Arquitectura

Es una SPA de React 18 + Vite sin backend propio. Todo el estado se persiste en `localStorage` del navegador.

### Vistas

`App.jsx` controla una única variable de estado `view` (`'chat'` | `'calendar'`) que alterna entre `ChatInterface` y `CalendarView`, envueltos en `ThemeProvider` + `ChatProvider`.

### Contextos

- **`ThemeContext`** — persiste preferencia light/dark en `localStorage` (`sonriebot-theme`). Expone un objeto `theme` con design tokens (`colors`, `typography`, `spacing`, `borderRadius`, `animations`). Todos los componentes consumen el tema directamente a través de inline styles en lugar de CSS classes.
- **`ChatContext`** — `useReducer` con los actions: `ADD_MESSAGE`, `SET_TYPING`, `ADD_RATING`, `START_BOOKING_FLOW`, `UPDATE_BOOKING_DATA`, `NEXT_BOOKING_STEP`, `PREV_BOOKING_STEP`, `COMPLETE_BOOKING`, `CANCEL_BOOKING`, `CLEAR_CHAT`. Los mensajes se persisten en `localStorage` (`sonriebot-chat`).

### Flujo de agendamiento

`ChatInterface` implementa un wizard de 6 pasos: Servicio → Fecha → Hora → Nombre → Email → Teléfono. Al completarse, la cita se escribe en `localStorage` (`sonriebot-appointments`) y opcionalmente se sincroniza con Google Calendar via `calendarSync.js`.

### Servicios

- **`openrouter.js`** — Llama a la API de OpenRouter con fallback entre modelos (claude-3-haiku → gpt-4o-mini → llama-3-70b). Si todos fallan, usa `getLocalResponse()` con respuestas hardcodeadas por palabras clave.
- **`calendarSync.js`** — Autenticación OAuth con Google Identity Services cargado dinámicamente. Crea eventos en Google Calendar y genera archivos iCal para descarga.
- **`exportService.js`** — Exporta el resumen del día a PDF (jsPDF), genera texto para WhatsApp y contenido HTML para email. Define las constantes `SERVICES` y `DOCTORS` usadas también en `CalendarView`.

### Estilos

No hay CSS modules ni Tailwind. Los estilos se aplican como inline styles tomando valores del objeto `theme` del `ThemeContext`. El archivo `App.css` e `index.css` definen sólo resets globales y clases base mínimas. Al añadir nuevos componentes, seguir el mismo patrón: `style={{ color: theme.colors.text, ... }}`.

### Build

Vite divide el bundle en 4 chunks manuales: `vendor` (react + react-dom), `animations` (framer-motion), `calendar` (date-fns), `pdf` (jspdf). No usar `terser` como minificador; el proyecto usa `esbuild`.
