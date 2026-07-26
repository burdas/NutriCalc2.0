export const DEFAULT_GOAL_ADJUSTMENTS = {
  lose: -350,
  maintain: 0,
  gain: 350,
};

export const MACRO_PRESETS = {
  balanced: { label: 'Balanceado', proteinPerKg: 1.8, fatPercent: 0.25 },
  highProtein: { label: 'Alta proteína', proteinPerKg: 2.2, fatPercent: 0.30 },
  lowCarb: { label: 'Bajo carbohidrato', proteinPerKg: 2.0, fatPercent: 0.35 },
  keto: { label: 'Keto', proteinPerKg: 1.6, fatPercent: 0.65 },
  custom: { label: 'Personalizado', proteinPerKg: 1.8, fatPercent: 0.25 },
};

export const DEFAULT_CONFIG = {
  goalAdjustments: { ...DEFAULT_GOAL_ADJUSTMENTS },
  macroPreset: 'balanced',
};

export const CONFIG_STORAGE_KEY = 'calorie-config';
