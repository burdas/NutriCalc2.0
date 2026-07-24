const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

const GOAL_ADJUSTMENTS = {
  lose: -350,
  maintain: 0,
  gain: 350,
};

export function calculateBMR(weight, height, age, sex) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(bmr, activity) {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
}

export function calculateTargetCalories(tdee, goal) {
  return Math.round(tdee + GOAL_ADJUSTMENTS[goal]);
}

export function calculateMacros(targetCalories, weight) {
  const proteinG = Math.round(1.8 * weight);
  const proteinCal = proteinG * 4;

  const fatCal = Math.round(targetCalories * 0.25);
  const fatG = Math.round(fatCal / 9);

  const carbCal = targetCalories - proteinCal - fatCal;
  const carbG = Math.round(Math.max(0, carbCal) / 4);

  return { proteinG, fatG, carbG };
}

export const ACTIVITY_OPTIONS = [
  { id: 'sedentary', label: 'Sedentario', desc: 'Poco o ningún ejercicio' },
  { id: 'light', label: 'Ligeramente activo', desc: '1-3 días/semana' },
  { id: 'moderate', label: 'Moderadamente activo', desc: '3-5 días/semana' },
  { id: 'active', label: 'Muy activo', desc: '6-7 días/semana' },
  { id: 'extra', label: 'Extra activo', desc: 'Trabajo físico + ejercicio intenso' },
];

export const GOAL_OPTIONS = [
  { id: 'lose', label: 'Perder peso', desc: 'Déficit calórico (350 kcal menos)' },
  { id: 'maintain', label: 'Mantener peso', desc: 'Mantenimiento calórico' },
  { id: 'gain', label: 'Ganar músculo', desc: 'Superávit calórico (350 kcal más)' },
];
