import { useEffect, useRef, useCallback } from 'react';

/**
 * Detecta inactividad en el chat para enviar reenganches.
 *
 * onSoftIdle: dispara a softMs (60s) tras la última actividad.
 * onHardIdle: dispara a hardMs (240s = 60s + 3min) tras la última actividad.
 *
 * Cada nivel solo se dispara una vez por ciclo. La actividad del usuario
 * (llamar a `reset()`) reinicia ambos contadores.
 */
export function useInactivityWatcher({
  enabled,
  onSoftIdle,
  onHardIdle,
  softMs = 60_000,
  hardMs = 240_000,
}) {
  const softTimer = useRef(null);
  const hardTimer = useRef(null);
  const softFired = useRef(false);
  const hardFired = useRef(false);

  const clear = useCallback(() => {
    if (softTimer.current) clearTimeout(softTimer.current);
    if (hardTimer.current) clearTimeout(hardTimer.current);
    softTimer.current = null;
    hardTimer.current = null;
  }, []);

  const reset = useCallback(() => {
    clear();
    softFired.current = false;
    hardFired.current = false;
    if (!enabled) return;
    softTimer.current = setTimeout(() => {
      if (!softFired.current) {
        softFired.current = true;
        onSoftIdle?.();
      }
    }, softMs);
    hardTimer.current = setTimeout(() => {
      if (!hardFired.current) {
        hardFired.current = true;
        onHardIdle?.();
      }
    }, hardMs);
  }, [enabled, onSoftIdle, onHardIdle, softMs, hardMs, clear]);

  useEffect(() => {
    if (enabled) reset();
    else clear();
    return clear;
  }, [enabled, reset, clear]);

  return { reset, clear };
}
