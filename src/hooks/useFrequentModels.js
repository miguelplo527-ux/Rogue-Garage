import { useEffect, useState } from 'react';
import { modelsService } from '../services/modelsService';
import { FEATURED_MODELS } from '../utils/constants';

/**
 * Modelos frecuentes calculados con las ventas reales.
 * Mientras no haya ventas (o si la función aún no existe) se completa con los modelos por defecto.
 */
export function useFrequentModels(limit = 5) {
  const [models, setModels] = useState(FEATURED_MODELS.slice(0, limit));

  useEffect(() => {
    let alive = true;
    modelsService
      .getFrequent(limit)
      .then((real) => {
        if (!alive || real.length === 0) return;
        const seen = new Set();
        const merged = [...real, ...FEATURED_MODELS].filter((m) => {
          const k = m.toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        setModels(merged.slice(0, limit));
      })
      .catch(() => {}); // sin función/ventas: se queda la lista por defecto
    return () => { alive = false; };
  }, [limit]);

  return models;
}
