import { useState, useRef, useCallback } from 'react';

const PRIMARY_URL = 'https://search.openfoodfacts.org/search';
const FALLBACK_URL = 'https://world.openfoodfacts.org/cgi/search.pl';
const FIELDS = 'code,product_name,generic_name,brands,nutriments';
const TIMEOUT_MS = 10000;
const PAGE_SIZE = 15;
const DEBOUNCE_MS = 500;

function normalizeProduct(p) {
  const n = p.nutriments || {};
  return {
    code: p.code || p.id,
    product_name:
      p.product_name_es || p.product_name || p.generic_name_es || p.generic_name || 'Producto sin nombre',
    brands: p.brands || '',
    calorias: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
    proteinas: Math.round((n.proteins_100g || n.proteins || 0) * 10) / 10,
    carbohidratos: Math.round((n.carbohydrates_100g || n.carbohydrates || 0) * 10) / 10,
    grasas: Math.round((n.fat_100g || n.fat || 0) * 10) / 10,
  };
}

export function useOpenFoodFacts() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const search = useCallback((query) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query || query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(async () => {
      const q = encodeURIComponent(query.trim());
      const words = query.trim().toLowerCase().split(/\s+/);

      const urls = [
        `${PRIMARY_URL}?q=${q}&page_size=${PAGE_SIZE}&fields=${FIELDS}&lc=es`,
        `${FALLBACK_URL}?search_terms=${q}&search_simple=1&action=process&json=1&page_size=${PAGE_SIZE}&fields=${FIELDS}&lc=es`,
      ];

      let lastError = null;

      for (const url of urls) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        let res;

        try {
          res = await fetch(url, { signal: controller.signal });
        } catch (err) {
          clearTimeout(timeoutId);
          lastError = err.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Error de red';
          continue;
        }

        clearTimeout(timeoutId);

        if (!res.ok) {
          lastError = `Error del servidor (${res.status})`;
          continue;
        }

        try {
          const data = await res.json();
          const rawProducts = data.hits || data.products || [];

          let mapped = rawProducts
            .filter((p) => p.product_name || p.generic_name)
            .map(normalizeProduct);

          mapped.sort((a, b) => {
            const aName = a.product_name.toLowerCase();
            const bName = b.product_name.toLowerCase();
            const aScore = words.reduce((s, w) => s + (aName.includes(w) ? 1 : 0), 0);
            const bScore = words.reduce((s, w) => s + (bName.includes(w) ? 1 : 0), 0);
            return bScore - aScore;
          });

          setResults(mapped);
          setError(null);
          setLoading(false);
          return;
        } catch (err) {
          lastError = 'Error al procesar la respuesta';
        }
      }

      setError(lastError);
      setResults([]);
      setLoading(false);
    }, DEBOUNCE_MS);
  }, []);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, clear };
}
