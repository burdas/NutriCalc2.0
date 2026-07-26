import { useState, useCallback } from 'react';
import { DEFAULT_CONFIG, CONFIG_STORAGE_KEY } from '../utils/defaults';

function loadConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_CONFIG };
}

export function useConfig() {
  const [config, setConfigState] = useState(loadConfig);

  const setConfig = useCallback((updater) => {
    setConfigState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    const copy = { ...DEFAULT_CONFIG, goalAdjustments: { ...DEFAULT_CONFIG.goalAdjustments } };
    setConfigState(copy);
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(copy));
  }, []);

  return { config, setConfig, resetConfig };
}
