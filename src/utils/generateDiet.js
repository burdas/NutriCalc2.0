import { roundKcal, roundMacro } from './calculations';
import { FOOD_DATABASE } from './foodDatabase';

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const GENERATED_SLOTS = ['desayuno', 'comida', 'merienda', 'cena'];
const SLOT_PERCENT = {
  desayuno: 0.25,
  comida: 0.35,
  merienda: 0.15,
  cena: 0.25,
};

function uniqueId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function dishRatios(dish) {
  const protCal = dish.proteinas * 4;
  const carbCal = dish.carbohidratos * 4;
  const fatCal = dish.grasas * 9;
  const total = protCal + carbCal + fatCal || 1;
  return { prot: protCal / total, carb: carbCal / total, fat: fatCal / total };
}

function scoreDish(dish, target) {
  const r = dishRatios(dish);
  return (
    (r.prot - target.prot) ** 2 +
    (r.carb - target.carb) ** 2 +
    (r.fat - target.fat) ** 2
  );
}

function pickDish(pool, used) {
  const available = pool.filter((d) => !used.has(d.nombre));
  const candidates = available.length > 0 ? available : pool;
  const pick = candidates[Math.floor(Math.random() * Math.min(6, candidates.length))];
  used.add(pick.nombre);
  return pick;
}

function buildMeal(dish, slotCal) {
  const grams = Math.max(20, Math.round((slotCal / dish.kcal) * 100));
  const factor = grams / 100;
  return {
    id: uniqueId('m'),
    nombre: dish.nombre,
    calorias: roundKcal(dish.kcal * factor),
    proteinas: roundMacro(dish.proteinas * factor),
    carbohidratos: roundMacro(dish.carbohidratos * factor),
    grasas: roundMacro(dish.grasas * factor),
    ingredients: [
      {
        id: uniqueId('i'),
        nombre: dish.nombre,
        cantidad: grams,
        calorias: dish.kcal,
        proteinas: dish.proteinas,
        carbohidratos: dish.carbohidratos,
        grasas: dish.grasas,
      },
    ],
  };
}

export function generateDiet({ targetCalories, macros }) {
  const targetProt = (macros.proteinG * 4) / ((macros.proteinG * 4 + macros.carbG * 4 + macros.fatG * 9) || 1);
  const targetCarb = (macros.carbG * 4) / ((macros.proteinG * 4 + macros.carbG * 4 + macros.fatG * 9) || 1);
  const targetFat = (macros.fatG * 9) / ((macros.proteinG * 4 + macros.carbG * 4 + macros.fatG * 9) || 1);
  const target = { prot: targetProt, carb: targetCarb, fat: targetFat };

  const pools = {};
  for (const slot of GENERATED_SLOTS) {
    pools[slot] = [...FOOD_DATABASE[slot]].sort((a, b) => scoreDish(a, target) - scoreDish(b, target));
  }

  const used = new Map(GENERATED_SLOTS.map((slot) => [slot, new Set()]));
  const plan = {};

  for (const day of DAYS) {
    plan[day] = {};
    for (const slot of GENERATED_SLOTS) {
      const slotCal = roundKcal(targetCalories * SLOT_PERCENT[slot]);
      plan[day][slot] = [buildMeal(pickDish(pools[slot], used.get(slot)), slotCal)];
    }
    plan[day].otros = [];
  }

  return plan;
}
