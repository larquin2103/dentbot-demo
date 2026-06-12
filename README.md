# 🦷 DentBot Pro — Demo de Automatización Dental con IA

**Demo interactivo profesional** para mostrar a clientes potenciales el poder de un agente virtual de IA especializado en clínicas dentales.

## 🌐 **Ver Demo en Vivo**

🔗 **https://dentbot-demo.netlify.app**

*(Despliega en Netlify en 2 minutos - ver instrucciones abajo)*

---

## ⚡ **Cómo funciona el chat con IA**

Las llamadas al modelo **no se hacen desde el navegador**. El cliente envía el
mensaje a una **Netlify Function** (`netlify/functions/chat.js`) que guarda la
API key en el servidor y habla con OpenRouter. Así la clave **nunca viaja en el
bundle del cliente**.

- ✅ Cascada de 3 modelos con _fallback_ automático (Claude Haiku → GPT-4o-mini → Llama 3.1 70B)
- ✅ Si la función o todos los modelos fallan, hay respuestas locales de respaldo
- ✅ La API key vive solo en la variable de entorno `OPENROUTER_API_KEY` (server-side)

> Obtén una API key gratis (sin tarjeta) en [openrouter.ai/keys](https://openrouter.ai/keys).

---

## ✨ Características del Demo

### **Dashboard Ejecutivo**
- Métricas en tiempo real de la clínica
- Agenda del día con estados de citas
- Feed de actividad automática
- Banner de ROI estimado

### **Agente IA en Vivo**
- **6 modelos disponibles** (4 gratuitos + 2 de producción)
- Modelos gratis incluidos:
  - 🆓 Llama 3.3 70B (Meta)
  - 🆓 Gemini 2.0 Flash (Google)
  - 🆓 Mistral 7B (Mistral AI)
  - 🆓 DeepSeek R1 (DeepSeek)
- Modelos de pago:
  - 💼 Claude Sonnet 4 (Anthropic)
  - 💰 GPT-4o Mini (OpenAI)
- Chat funcional con system prompt personalizado
- Sugerencias de preguntas predefinidas

### **Flujos n8n Documentados**
- 3 flujos completos explicados paso a paso:
  1. Recepción de WhatsApp → IA → Respuesta
  2. Recordatorio automático de citas
  3. Captación de reseñas Google
- Código visible en cada nodo
- Guía de deploy en Railway (15 minutos)

---

## 🚀 Desplegar en Netlify (2 minutos)

### Opción A: Deploy Automático desde GitHub

1. Ve a [netlify.com](https://netlify.com) e inicia sesión
2. Click en **"Add new site"** → **"Import an existing project"**
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `larquin2103/dentbot-demo`
5. Netlify detectará automáticamente la configuración (`netlify.toml`)
6. En **Site settings → Environment variables** añade:
   - `OPENROUTER_API_KEY` → tu key de OpenRouter (**secreto, sin prefijo `VITE_`**)
   - Opcionales: `VITE_CLINIC_NAME`, `VITE_CLINIC_ADDRESS`, `VITE_CLINIC_PHONE`,
     `VITE_CLINIC_EMAIL`, `VITE_CLINIC_DOCTOR`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY`
7. Click en **"Deploy site"**

✅ ¡Listo! Tu demo estará en vivo en `https://tu-sitio.netlify.app`

> **Desarrollo local del chat con IA:** usa `netlify dev` (no `npm run dev`) para
> que la Netlify Function esté disponible en local. Con `npm run dev` el chat
> seguirá funcionando con las respuestas locales de respaldo.

### Opción B: Deploy Manual con CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd dentbot-demo
netlify deploy --prod
```

---

## 🎯 Cómo Usar el Demo con Clientes

### **Paso 1: Configurar la API Key (una sola vez)**

La key se configura en el servidor, no en la UI:

1. Obtén una API Key gratis en [openrouter.ai/keys](https://openrouter.ai/keys)
2. En Netlify → **Site settings → Environment variables**, añade `OPENROUTER_API_KEY`
3. Vuelve a desplegar. El chat queda operativo para todos los visitantes

### **Paso 2: Demo Interactivo**

El cliente puede:
- Escribir como si fuera un paciente
- Preguntar por precios, horarios, servicios
- Solicitar agendar una cita
- Ver respuestas instantáneas y profesionales

### **Paso 3: Mostrar Arquitectura**

Ir a la pestaña **"Flujos n8n"** para explicar:
- Cómo se conecta WhatsApp
- El rol de la IA en el proceso
- La automatización completa sin intervención manual

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Frontend | React 18 + Vite | UI rápida y moderna |
| Estilos | Inline styles (Design Tokens) | "Clinical Luxury" aesthetic |
| Backend ligero | Netlify Functions | Proxy seguro al LLM (oculta la API key) |
| IA | OpenRouter API | Acceso a múltiples modelos LLM con fallback |
| Backend (producción) | n8n + Railway | Orquestación de flujos |
| DB (producción) | Supabase | Historial de conversaciones |
| WhatsApp | Evolution API | Conexión con WhatsApp Business |
| Deploy | Netlify | Hosting estático gratuito |

---

## 🎨 Diseño: "Clinical Luxury"

**Inspiración:** Sala de espera premium + tecnología quirúrgica

### Paleta de Colores
- **Fondo:** Negro profundo (#0E1117)
- **Superficies:** Grafito (#1C2028) / Verde quirúrgico (#4EC9A0)
- **Texto:** Crema marfil (#F0EDE6)
- **Acentos:** Dorado premium (#C9A45A)

### Tipografía
- **Títulos:** Fraunces (serif elegante)
- **Cuerpo:** DM Sans (legibilidad moderna)
- **Datos técnicos:** DM Mono (monospace técnico)

---

## 📋 Precios de Servicios (Configurables)

El sistema incluye precios de referencia para CDMX:

| Servicio | Rango de Precio |
|----------|----------------|
| Consulta | $400–600 MXN |
| Limpieza | $500–800 MXN |
| Blanqueamiento | $2,500–4,000 MXN |
| Ortodoncia | $12,000–20,000 MXN |
| Implante | $18,000–35,000 MXN |
| Endodoncia | $3,500–6,000 MXN |

*Estos valores pueden personalizarse por clínica en el `SYSTEM_PROMPT`*

---

## 🔐 Seguridad y Buenas Prácticas

- ✅ La API key de OpenRouter vive **solo en el servidor** (Netlify Function), nunca en el bundle del cliente
- ✅ Variables públicas (`VITE_*`) separadas de los secretos (sin prefijo) — ver `.env.example`
- ✅ `console.*` y `debugger` se eliminan del build de producción (`vite.config.js`)
- ✅ Headers de seguridad configurados en `netlify.toml` (X-Frame-Options, nosniff, Referrer-Policy)
- ✅ ESLint 9 (flat config) en verde, 0 warnings (`npm run lint`)
- ✅ Sin secretos commiteados (`.env*` ignorados; solo se versiona `.env.example`)

> Nota: la sincronización con Google Calendar usa OAuth de cliente y guarda el
> token en `localStorage`. Suficiente para el demo; para producción a gran escala
> conviene mover ese flujo a un backend.

---

## 📞 Contacto y Soporte

**Desarrollador:** larquin2103  
**Repositorio:** [github.com/larquin2103/dentbot-demo](https://github.com/larquin2103/dentbot-demo)

---

## 🎁 Bonus: Scripts de Venta

### Para el primer contacto con el cliente:

> "Le voy a mostrar un demo **totalmente funcional** de cómo su clínica puede atender pacientes 24/7 con IA. Usted mismo puede probarlo ahora con su teléfono."

### Durante la demo:

> "Lo que ve aquí es exactamente lo que sus pacientes experimentarían en WhatsApp. La IA responde en segundos, agenda citas y nunca pierde un lead."

### Al cerrar:

> "Con una inversión menor a lo que cuesta una sola limpieza, usted tiene este sistema funcionando todo el mes, capturando pacientes incluso los domingos."

---

**© 2025 DentBot Pro** — Transformando la atención dental con IA 🦷✨
