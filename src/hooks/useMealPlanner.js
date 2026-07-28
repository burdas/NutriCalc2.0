import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'meal-plan:v1';

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MEAL_SLOTS = ['desayuno', 'comida', 'merienda', 'cena', 'otros'];
const SLOT_LABELS = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
  otros: 'Otros',
};

const DEFAULT_MEAL = { nombre: '', calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };

function createDefaultPlan() {
  const plan = {};
  for (const day of DAYS) {
    plan[day] = {};
    for (const slot of MEAL_SLOTS) {
      plan[day][slot] = { ...DEFAULT_MEAL };
    }
  }
  return plan;
}

function loadPlan() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const plan = createDefaultPlan();
      for (const day of DAYS) {
        if (parsed[day]) {
          for (const slot of MEAL_SLOTS) {
            if (parsed[day][slot]) {
              plan[day][slot] = { ...DEFAULT_MEAL, ...parsed[day][slot] };
            }
          }
        }
      }
      return plan;
    }
  } catch {}
  return createDefaultPlan();
}

export function useMealPlanner() {
  const [mealPlan, setMealPlan] = useState(loadPlan);

  const updateMeal = useCallback((day, slot, field, value) => {
    setMealPlan((prev) => {
      const next = {
        ...prev,
        [day]: { ...prev[day], [slot]: { ...prev[day][slot], [field]: value } },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const dailyTotals = useMemo(() => {
    const totals = {};
    for (const day of DAYS) {
      let cal = 0, prot = 0, carb = 0, gras = 0;
      const dayPlan = mealPlan[day];
      if (dayPlan) {
        for (const slot of MEAL_SLOTS) {
          const meal = dayPlan[slot];
          if (meal) {
            cal += meal.calorias || 0;
            prot += meal.proteinas || 0;
            carb += meal.carbohidratos || 0;
            gras += meal.grasas || 0;
          }
        }
      }
      totals[day] = { calorias: cal, proteinas: prot, carbohidratos: carb, grasas: gras };
    }
    return totals;
  }, [mealPlan]);

  return { mealPlan, updateMeal, dailyTotals, DAYS, MEAL_SLOTS, SLOT_LABELS };
}
