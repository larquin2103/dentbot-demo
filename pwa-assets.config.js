import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Teal primario del tema claro (theme.colors.primary en ThemeContext).
const BRAND = '#0E4F66'

// El preset por defecto rellena el margen con blanco y deja un 30% de aire, y
// eso rompe los dos iconos que se recortan:
//
//   maskable → Android lo recorta en círculo. Si el fondo no llega al borde, el
//              cuadrado teal queda flotando sobre el relleno del sistema.
//   apple    → iOS le aplica su propio squircle. Con relleno blanco alrededor
//              del teal aparece un marco claro que no es de la marca.
//
// Con el fondo de marca a sangre, el recorte de cada plataforma cae siempre
// sobre teal. El padding baja a un valor que deja el diente holgadamente dentro
// del círculo seguro del 80% sin encogerlo hasta hacerlo irreconocible.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { fit: 'contain', background: BRAND }
    },
    apple: {
      sizes: [180],
      padding: 0.08,
      resizeOptions: { fit: 'contain', background: BRAND }
    }
  },
  images: ['public/tooth-icon.svg']
})
