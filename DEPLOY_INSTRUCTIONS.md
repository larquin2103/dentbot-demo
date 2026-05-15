# 🚀 Guía Rápida de Deploy en Netlify

## Opción 1: Deploy Automático (Recomendado - 2 minutos)

1. **Ve a Netlify**: [netlify.com](https://netlify.com) e inicia sesión
2. **Nuevo sitio**: Click en "Add new site" → "Import an existing project"
3. **Conecta GitHub**: Autoriza Netlify y selecciona `larquin2103/dentbot-demo`
4. **Configuración automática**: Netlify detectará `netlify.toml` automáticamente
5. **Deploy**: Click en "Deploy site"

✅ **¡Listo!** Tu demo estará en vivo en ~1 minuto en:
`https://dentbot-demo-{random}.netlify.app`

### Personalizar dominio (opcional):
- Ve a "Site settings" → "Domain management"
- Click "Add custom domain"
- Ej: `tu-clinica-dental.netlify.app`

---

## Opción 2: Deploy Manual con CLI

```bash
# 1. Instalar Netlify CLI globalmente
npm install -g netlify-cli

# 2. Iniciar sesión
netlify login

# 3. Navegar al proyecto
cd dentbot-demo

# 4. Build de producción
npm run build

# 5. Deploy
netlify deploy --prod
```

---

## ✅ Qué Incluye Este Demo

### Diseño Premium "Clinical Luxury"
- 🎨 Paleta: Crema marfil / Grafito profundo / Verde quirúrgico
- ✨ Tipografía: Fraunces (elegante) + DM Mono (técnico)
- 🦷 Favicon dental personalizado con glow effect
- 📱 Responsive para móvil, tablet y desktop

### Funcionalidades Completas
- ✅ **Dashboard ejecutivo** con métricas reales
- ✅ **Chat IA funcional** con 6 modelos (4 gratis + 2 pago)
- ✅ **API key preconfigurada** de OpenRouter (funciona inmediatamente)
- ✅ **Flujos n8n documentados** con código visible
- ✅ **Sugerencias de preguntas** para guiar al usuario

### Modelos de IA Disponibles

#### Gratuitos (OpenRouter):
| Modelo | Provider | Contexto | Uso |
|--------|----------|----------|-----|
| Llama 3.3 70B | Meta | 128k | ⭐ Recomendado |
| Gemini 2.0 Flash | Google | 1M | Multimodal |
| Mistral 7B | Mistral AI | 32k | Rápido |
| DeepSeek R1 | DeepSeek | 64k | Razonamiento |

#### Producción:
| Modelo | Provider | Costo |
|--------|----------|-------|
| Claude Sonnet 4 | Anthropic | $$$ |
| GPT-4o Mini | OpenAI | $ |

---

## 🎯 Cómo Presentar el Demo a Clientes

### Script de Venta (5 minutos)

**Minuto 1 - Introducción:**
> "Este es el dashboard que vería tu recepcionista. Muestra citas del día, cancelaciones evitadas, reseñas captadas y tiempo de respuesta."

**Minuto 2 - Demo en Vivo:**
> "Voy a la pestaña 'Agente IA'. Aquí es donde tu paciente escribe por WhatsApp. Mira cómo responde automáticamente..."
> - Escribe: "¿Cuánto cuesta una limpieza dental?"
> - Espera respuesta (~3 segundos)
> - Destaca: profesionalismo, concisión, tono cálido

**Minuto 3 - Flujo Técnico:**
> "En la pestaña 'Flujos n8n' ves exactamente cómo funciona. Todo automático: WhatsApp → IA → Base de datos → Respuesta"

**Minuto 4 - ROI:**
> "Una clínica promedio ahorra 15 horas/semana de recepción y aumenta 40% sus reseñas en Google"

**Minuto 5 - Cierre:**
> "¿Te gustaría que implementemos esto en tu clínica? El deploy toma 15 minutos"

---

## 🔧 Configuración para Producción

### Para cada cliente:

1. **Obtener API Key gratuita**:
   - Ir a [openrouter.ai/keys](https://openrouter.ai/keys)
   - Crear cuenta (sin tarjeta requerida)
   - Copiar API key

2. **Actualizar en el demo**:
   - En la UI, ir a "Agente IA" → "Configuración del Agente"
   - Pegar la nueva API key
   - Click "OK"

3. **Opcional - Variables de entorno** (más seguro):
   ```bash
   # Crear archivo .env en producción
   VITE_OPENROUTER_API_KEY=sk-or-v1-...
   ```

---

## 📊 Métricas del Build

- **Tamaño total**: ~220 KB (69 KB gzipped)
- **Tiempo de build**: < 500ms
- **Módulos**: 15
- **Carga inicial**: < 2 segundos en 4G

---

## 🆘 Soporte

Si tienes problemas con el deploy:

1. Verifica que el repositorio sea público o que Netlify tenga acceso
2. Revisa los logs en Netlify: "Deploys" → click en deploy fallido
3. Error común: olvidar `npm run build` antes de deploy manual

**Repositorio**: https://github.com/larquin2103/dentbot-demo
