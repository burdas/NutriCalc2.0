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

export const DEFAULT_GEMINI_KEY = '';

export const DIET_TYPES = {
  balanced: { label: 'Mediterránea / Equilibrada', desc: 'Variada, basada en alimentos frescos, legumbres, verduras y carnes magras' },
  highProtein: { label: 'Alta en Proteína', desc: 'Enfocada en ganancia muscular y saciedad con mayor aporte proteico' },
  vegetarian: { label: 'Vegetariana', desc: 'Sin carne ni pescado. Incluye huevos, lácteos y proteína vegetal' },
  vegan: { label: 'Vegana', desc: '100% de origen vegetal: legumbres, tofu, frutos secos y semillas' },
  keto: { label: 'Keto / Cetogénica', desc: 'Baja en carbohidratos, alta en grasas saludables' },
  lowCarb: { label: 'Baja en Carbohidratos', desc: 'Reducción moderada de carbohidratos simples y refinados' },
};

export const DEFAULT_CONFIG = {
  goalAdjustments: { ...DEFAULT_GOAL_ADJUSTMENTS },
  macroPreset: 'balanced',
  geminiApiKey: DEFAULT_GEMINI_KEY,
  dietType: 'balanced',
  allergies: '',
  customPrompt: '',
};

export const CONFIG_STORAGE_KEY = 'calorie-config';
