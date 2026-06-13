// Moneda configurable por la clínica (una por despliegue).
//
//   VITE_CLINIC_CURRENCY          símbolo o código: € (def.), $, £, MXN, USD…
//   VITE_CLINIC_CURRENCY_POSITION 'after' (def., "60€") | 'before' ("$60")
//
// El importe se guarda como número en cada servicio y se formatea aquí, para
// que cambiar de moneda no requiera tocar los datos de precios.

export const CURRENCY = (import.meta.env.VITE_CLINIC_CURRENCY || '€').trim();

const POSITION = (import.meta.env.VITE_CLINIC_CURRENCY_POSITION || 'after').toLowerCase();
// Códigos (MXN, USD…) se separan con espacio; símbolos (€, $) van pegados.
const SEP = CURRENCY.length > 1 ? ' ' : '';

// useGrouping: true fuerza el separador de miles (es-ES no lo aplica a 1.200 por defecto).
const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: true });

/** Formatea un importe numérico con la moneda configurada: 1200 → "1.200€". */
export function formatPrice(amount) {
  const n = numberFormat.format(amount);
  return POSITION === 'before' ? `${CURRENCY}${SEP}${n}` : `${n}${SEP}${CURRENCY}`;
}
