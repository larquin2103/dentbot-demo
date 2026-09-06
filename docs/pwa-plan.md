# Plan: convertir SonrieBot en PWA instalable

Objetivo: que el dueño de la clínica pueda instalar el panel en su teléfono
desde el navegador y abrirlo con un icono, sin pasar por una tienda de apps.

Este documento es el plan, no la implementación. Cada fase dice qué archivos
toca y por qué.

---

## Antes de empezar: qué significa "instalar" aquí

Todo el estado de la app vive en el `localStorage` **del navegador que la
abre** (`sonriebot-appointments`, `sonriebot-chat`, `sonriebot-onboarding`…).
No hay base de datos.

Consecuencia directa y no negociable: **la PWA instalada en el teléfono arranca
vacía**. Las citas que el dueño ve en el portátil están en el `localStorage` de
ese portátil y no viajan al móvil. Instalar no sincroniza nada.

Eso deja dos productos distintos bajo la misma petición:

| | Qué obtiene el dueño | Coste |
|---|---|---|
| **A. Demo instalable** | La app en su icono, con datos de ejemplo, para enseñarla y probar la experiencia | Este plan: ~1 jornada |
| **B. Panel real** | Sus citas de verdad, sincronizadas entre portátil y móvil | Backend + autenticación: cambio de arquitectura |

**Este plan implementa A**, y la última sección deja escrito qué haría falta
para B. Se elige A porque es lo que el código soporta hoy y porque B no es un
trabajo de PWA: es un backend con una PWA encima.

> Riesgo de producto, no técnico: si el dueño instala esto esperando B, la
> decepción es inmediata y ningún service worker la arregla. Conviene decirle
> qué está instalando.

---

## Decisiones ya tomadas

| Decisión | Elección | Por qué |
|---|---|---|
| Alcance | Demo instalable (A), con la ruta a B documentada | Es lo que soporta el código actual |
| Plataformas | Android **y** iOS | No sabemos qué teléfono tiene; iOS necesita camino propio |
| Pantalla de arranque | La agenda | Si instala un icono es para consultar el día |
| Service worker | `vite-plugin-pwa` (Workbox) | Precachea los chunks con hash automáticamente |
| Actualizaciones | Aviso, no recarga automática | Recargar solo mientras alguien mira la agenda desconcierta |
| Iconos | `@vite-pwa/assets-generator` desde el SVG de marca | Genera todos los tamaños, incluido maskable |

Versiones comprobadas en el registro de npm: `vite-plugin-pwa@1.3.0` (acepta
Vite 5, el del proyecto), `@vite-pwa/assets-generator@1.0.2`,
`workbox-window@7.4.1`.

---

## Estado actual (verificado en el repo)

Lo que ya juega a favor:

- `netlify.toml` tiene el redirect SPA y cabeceras de seguridad.
- `index.html` ya trae `viewport-fit=cover` y `theme-color` `#0E4F66`.
- El chat degrada solo cuando no hay red (`openrouter.js` cae a respuestas
  locales) y **el indicador de conexión ya lo anuncia en ámbar**. El
  comportamiento offline honesto ya está construido.
- El layout ya respeta `env(safe-area-inset-bottom)`, que es justo lo que hace
  falta en modo `standalone` sin barra del navegador.

Lo que hay que arreglar antes de poner iconos encima:

- **`index.html:5` apunta a `/tooth-icon.svg`, que no existe** en `public/`.
  El favicon está roto en producción (404).
- **`public/favicon.svg` es de una identidad anterior**: verde `#4EC9A0` →
  `#2A7D63`, no el teal clínico `#0E4F66` de la app. El diente correcto está en
  `src/components/UI/Header.jsx` (`LogoMark`).
- **No hay router.** `view` es un `useState('chat')` en `src/App.jsx:14`, así
  que hoy no se puede enlazar la agenda ni abrirla desde un acceso directo.

---

## Fase 1 — Arreglar la identidad (independiente de la PWA)

Sin esto, los iconos de instalación heredan una marca que ya no existe.

1. Crear `public/tooth-icon.svg`: el path de `LogoMark` sobre fondo teal
   `#0E4F66`, en un lienzo cuadrado con margen. Es la fuente de la que saldrán
   todos los demás tamaños.
2. Apuntar ahí el `<link rel="icon">` de `index.html`.
3. Retirar `public/favicon.svg` (identidad vieja) o reemplazar su contenido.

**Verificación:** cargar la app y ver el diente teal en la pestaña, sin 404 en
la consola de red.

---

## Fase 2 — Iconos

```bash
npm i -D @vite-pwa/assets-generator
npx pwa-assets-generator --preset minimal-2023 public/tooth-icon.svg
```

Genera `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png` y
`apple-touch-icon-180x180.png`.

Punto de atención: el icono **maskable** se recorta en círculo en Android. El
diente debe quedar dentro del 80% central o le cortarán las raíces. Si el
preset no deja bastante aire, se genera con un SVG aparte que tenga más margen.

No hay rasterizador en el sistema (ni ImageMagick, ni sips, ni ffmpeg), así que
esta herramienta —que trae `sharp`— es la vía; no vale convertir a mano.

**Verificación:** abrir los PNG generados y comprobar que el diente no toca los
bordes en el maskable.

---

## Fase 3 — Manifest y meta de iOS

En `vite.config.js`, añadir el plugin junto a `react()`:

```js
VitePWA({
  registerType: 'prompt',
  includeAssets: ['tooth-icon.svg', 'apple-touch-icon-180x180.png', 'robots.txt'],
  manifest: {
    name: 'Clínica Dental Sonrisa Perfecta · Panel',
    short_name: 'SonrieBot',
    description: 'Panel de atención y agenda clínica',
    lang: 'es',
    start_url: '/?view=calendar',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F8FAFC',  // theme.colors.background (claro)
    theme_color: '#0E4F66',       // theme.colors.primary (claro)
    icons: [ /* los cuatro de la fase 2 */ ],
    shortcuts: [
      { name: 'Agenda del día', url: '/?view=calendar' },
      { name: 'Asistente',      url: '/?view=chat' }
    ]
  }
})
```

`start_url` y `shortcuts` dependen de la fase 4.

En `index.html`, los meta que Safari sigue necesitando aparte del manifest:
`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` y el
`<link rel="apple-touch-icon">`.

> Detalle de tema: `theme_color` es un valor fijo del manifest y la app tiene
> modo claro y oscuro. Se fija el teal claro y, si molesta, se ajusta en
> caliente con la etiqueta `<meta name="theme-color">` desde `ThemeContext`.

---

## Fase 4 — Vista inicial enlazable

Requisito de `start_url` y de los accesos directos. Cambio pequeño y contenido
en `src/App.jsx`:

- Leer `?view=` de `location.search` al inicializar el estado:
  `useState(() => new URLSearchParams(location.search).get('view') === 'calendar' ? 'calendar' : 'chat')`.
- Al cambiar de vista, reflejarlo con `history.replaceState` para que la URL
  siga siendo compartible.

No se introduce react-router: sería una dependencia nueva para dos vistas.

**Verificación:** abrir `/?view=calendar` y aterrizar en la agenda.

---

## Fase 5 — Service worker

Configuración de Workbox dentro del plugin:

- **Precache** del app shell y los chunks (`vendor`, `animations`, `calendar`,
  `pdf`). El plugin los descubre solo tras el build.
- **`/.netlify/functions/*` → `NetworkOnly`.** Cachear el chat sería servir
  respuestas viejas del asistente como si fueran nuevas. Es la regla más
  importante del archivo.
- **`navigateFallback: '/index.html'`** con `navigateFallbackDenylist` para
  `/.netlify/`, de modo que no choque con el redirect SPA del `netlify.toml`.
- **Google Fonts.** Hoy Inter se carga desde `fonts.googleapis.com`. Dos
  salidas: cachearla con `CacheFirst` y caducidad, o **autoalojar Inter** y
  quitar la dependencia de red. Recomiendo autoalojar: mejora el primer render
  y hace el offline de verdad completo, sin reglas de caché de terceros.

Aviso de actualización: `virtual:pwa-register` con `onNeedRefresh`, mostrado con
el mismo patrón de confirmación en línea que ya usan el chat y el dashboard
(nada de `alert()`; el proyecto ya arrastra cuatro y no conviene añadir uno).

**Verificación:** `npm run build && npm run preview`, cargar, apagar la red y
recargar. La agenda debe abrirse; el chat debe mostrar el indicador ámbar.

---

## Fase 6 — Botón de instalar

Dos caminos, porque las plataformas no se comportan igual:

- **Android / Chrome:** capturar `beforeinstallprompt`, guardarlo y mostrar un
  botón "Instalar"; al pulsarlo, `prompt()`. Ocultarlo tras `appinstalled` o si
  `display-mode: standalone` ya está activo.
- **iOS / Safari:** ese evento **no existe**. Hay que detectar iOS y mostrar la
  instrucción real: *Compartir → Añadir a pantalla de inicio*. Sin esto, en
  iPhone no hay forma de descubrir que la app es instalable.

Sitio natural: el menú de `HelpButton`, que ya es el cajón de acciones
secundarias, en vez de meter un botón nuevo en el header.

---

## Fase 7 — Cabeceras de Netlify

En `netlify.toml`:

```toml
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Cache-Control = "no-cache"
    Content-Type = "application/manifest+json"
```

Sin esto, el service worker puede caer bajo una regla de caché larga y dejar la
app congelada en una versión vieja sin manera limpia de actualizarla.

---

## Fase 8 — Verificación

1. `npm run lint` y `npm run build` limpios.
2. `npm run preview`, instalar de verdad en un teléfono y abrir desde el icono.
3. Modo avión: la agenda carga, el chat avisa en ámbar.
4. Lighthouse → categoría PWA.
5. Publicar una versión nueva y comprobar que aparece el aviso de actualización.

**Límite conocido:** los pasos 2 a 5 exigen un navegador real. En este entorno
la extensión de Chrome no está conectada, así que puedo dejar el código escrito
y correcto, pero **la comprobación de instalación tendrá que hacerla una
persona** o habrá que conectar la extensión. Una PWA sin probar instalada no
está terminada.

---

## Coste

| Fases | Trabajo |
|---|---|
| 1–5, 7 (mecánicas) | Media jornada a una jornada |
| 6 (instalación) | Media jornada si hay que cubrir iOS y Android |
| 8 (verificación) | Depende del acceso a un dispositivo real |

Dependencias nuevas: `vite-plugin-pwa` y `@vite-pwa/assets-generator`, ambas de
desarrollo. **Ninguna nueva en producción.**

---

## Después: qué haría falta para el panel real (opción B)

Cuando el dueño tenga que ver *sus* citas en el móvil:

1. **Almacén compartido** en vez de `localStorage`: Netlify Blobs (ya está en
   el proyecto para la memoria de WhatsApp) o Postgres/Supabase si hacen falta
   consultas.
2. **Autenticación**, aunque sea un PIN por clínica: hoy cualquiera con la URL
   ve la agenda completa con nombres, emails y teléfonos de pacientes.
3. **Estrategia de sincronización** y resolución de conflictos entre
   dispositivos.
4. **Notificaciones push** para avisar de una cita nueva, que es probablemente
   lo que de verdad quiere alguien con la app instalada. Exige el service
   worker de este plan más un servidor de push.

Los puntos 1 y 2 son requisito legal además de técnico: son datos de salud de
personas identificables.
