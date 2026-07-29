import { useState, useRef, useCallback } from 'react';

const API_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

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

    timerRef.current = setTimeout(async () => {
      try {
        const q = encodeURIComponent(query.trim());
        const words = query.trim().toLowerCase().split(/\s+/);
        const url = `${API_BASE}?search_terms=${q}&json=1&page_size=10&lc=es`;
        const res = await fetch(url);

        if (!res.ok) {
          if (res.status === 503) throw new Error('Servicio temporalmente no disponible');
          throw new Error('Error al buscar alimentos');
        }

        const data = await res.json();
        let mapped = (data.products || []).map((p) => {
          const n = p.nutriments || {};
          return {
            code: p.code || p.id,
            product_name: p.product_name_es || p.product_name || p.generic_name_es || p.generic_name || 'Producto sin nombre',
            brands: p.brands || '',
            calorias: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
            proteinas: Math.round((n.proteins_100g || n.proteins || 0) * 10) / 10,
            carbohidratos: Math.round((n.carbohydrates_100g || n.carbohydrates || 0) * 10) / 10,
            grasas: Math.round((n.fat_100g || n.fat || 0) * 10) / 10,
          };
        });

        mapped.sort((a, b) => {
          const aName = a.product_name.toLowerCase();
          const bName = b.product_name.toLowerCase();
          const aScore = words.reduce((s, w) => s + (aName.includes(w) ? 1 : 0), 0);
          const bScore = words.reduce((s, w) => s + (bName.includes(w) ? 1 : 0), 0);
          return bScore - aScore;
        });

        setResults(mapped);
        setError(null);
      } catch (e) {
        setError(e.message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, clear };
}
