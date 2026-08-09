import { useState, useCallback, useMemo } from 'react';
import { roundKcal, roundMacro } from '../utils/calculations';

const STORAGE_KEY = 'meal-plan:v2';

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const MEAL_SLOTS = ['desayuno', 'comida', 'merienda', 'cena', 'otros'];
const SLOT_LABELS = {
  desayuno: 'Desayuno',
  comida: 'Comida',
  merienda: 'Merienda',
  cena: 'Cena',
  otros: 'Otros',
};

let _idCounter = Date.now();
function generateId() {
  return `m_${++_idCounter}`;
}

const EMPTY_MEAL = () => ({ id: generateId(), nombre: '', calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, ingredients: [] });


function createDefaultPlan() {
  const plan = {};
  for (const day of DAYS) {
    plan[day] = {};
    for (const slot of MEAL_SLOTS) {
      plan[day][slot] = [EMPTY_MEAL()];
    }
  }
  return plan;
}

function loadPlan() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return createDefaultPlan();
}

export function useMealPlanner() {
  const [mealPlan, setMealPlan] = useState(loadPlan);

  const persist = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }, []);

  const updateMeal = useCallback((day, slot, mealId, field, value) => {
    setMealPlan((prev) =>
      persist({
        ...prev,
        [day]: {
          ...prev[day],
          [slot]: prev[day][slot].map((m) =>
            m.id === mealId ? { ...m, [field]: value } : m
          ),
        },
      })
    );
  }, [persist]);

  const updateMealBulk = useCallback((day, slot, mealId, fields) => {
    setMealPlan((prev) =>
      persist({
        ...prev,
        [day]: {
          ...prev[day],
          [slot]: prev[day][slot].map((m) =>
            m.id === mealId ? { ...m, ...fields } : m
          ),
        },
      })
    );
  }, [persist]);

  const updateMealIngredients = useCallback((day, slot, mealId, ingredients) => {
    setMealPlan((prev) =>
      persist({
        ...prev,
        [day]: {
          ...prev[day],
          [slot]: prev[day][slot].map((m) =>
            m.id === mealId ? { ...m, ingredients } : m
          ),
        },
      })
    );
  }, [persist]);

  const addMeal = useCallback((day, slot) => {
    setMealPlan((prev) =>
      persist({
        ...prev,
        [day]: { ...prev[day], [slot]: [...prev[day][slot], EMPTY_MEAL()] },
      })
    );
  }, [persist]);

  const duplicateMeal = useCallback((day, slot, mealId) => {
    setMealPlan((prev) => {
      const meals = prev[day][slot];
      const index = meals.findIndex((m) => m.id === mealId);
      if (index === -1) return prev;

      const source = meals[index];
      const copy = {
        ...source,
        id: generateId(),
        ingredients: (source.ingredients || []).map((ing) => ({
          ...ing,
          id: 'i_' + Date.now() + Math.random(),
        })),
      };

      const next = [...meals];
      next.splice(index + 1, 0, copy);

      return persist({
        ...prev,
        [day]: { ...prev[day], [slot]: next },
      });
    });
  }, [persist]);

  const removeMeal = useCallback((day, slot, mealId) => {
    setMealPlan((prev) =>
      persist({
        ...prev,
        [day]: {
          ...prev[day],
          [slot]: prev[day][slot].filter((m) => m.id !== mealId),
        },
      })
    );
  }, [persist]);

  const moveMeal = useCallback((sourceDay, sourceSlot, sourceIndex, destDay, destSlot, destIndex) => {
    setMealPlan((prev) => {
      const sourceArr = [...prev[sourceDay][sourceSlot]];
      const [moved] = sourceArr.splice(sourceIndex, 1);

      const destArr = [...prev[destDay][destSlot]];
      destArr.splice(destIndex, 0, moved);

      return persist({
        ...prev,
        [sourceDay]: { ...prev[sourceDay], [sourceSlot]: sourceArr },
        [destDay]: { ...prev[destDay], [destSlot]: destArr },
      });
    });
  }, [persist]);

  const replacePlan = useCallback((next) => {
    setMealPlan(persist(next));
  }, [persist]);

  const dailyTotals = useMemo(() => {
    const totals = {};
    for (const day of DAYS) {
      let cal = 0, prot = 0, carb = 0, gras = 0;
      const dayPlan = mealPlan[day];
      if (dayPlan) {
        for (const slot of MEAL_SLOTS) {
          const meals = dayPlan[slot];
          if (meals) {
            for (const meal of meals) {
              cal += meal.calorias || 0;
              prot += meal.proteinas || 0;
              carb += meal.carbohidratos || 0;
              gras += meal.grasas || 0;
            }
          }
        }
      }
      totals[day] = {
        calorias: roundKcal(cal),
        proteinas: roundMacro(prot),
        carbohidratos: roundMacro(carb),
        grasas: roundMacro(gras),
      };
    }
    return totals;
  }, [mealPlan]);

  return { mealPlan, replacePlan, updateMeal, updateMealBulk, updateMealIngredients, addMeal, duplicateMeal, removeMeal, moveMeal, dailyTotals, DAYS, MEAL_SLOTS, SLOT_LABELS };
}