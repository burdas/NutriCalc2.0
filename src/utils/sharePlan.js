import LZString from 'lz-string';

export const SHARE_HASH_PREFIX = '#/compartir/';

export function serializePlan(mealPlan) {
  return LZString.compressToEncodedURIComponent(JSON.stringify(mealPlan));
}

export function deserializePlan(encoded) {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  } catch {}
  return null;
}

export function buildShareUrl(mealPlan) {
  return `${window.location.origin}${window.location.pathname}${SHARE_HASH_PREFIX}${serializePlan(mealPlan)}`;
}

export function parseSharedHash() {
  const hash = window.location.hash;
  if (!hash.startsWith(SHARE_HASH_PREFIX)) return null;
  return hash.slice(SHARE_HASH_PREFIX.length);
}

export function clearSharedHash() {
  if (window.location.hash.startsWith(SHARE_HASH_PREFIX)) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

let _mealCounter = Date.now();
let _ingredientCounter = Date.now();

function generateMealId() {
  return `m_${++_mealCounter}`;
}

function generateIngredientId() {
  return `i_${++_ingredientCounter}`;
}

export function reassignIds(plan) {
  const next = {};
  for (const day of Object.keys(plan)) {
    next[day] = {};
    for (const slot of Object.keys(plan[day])) {
      next[day][slot] = (plan[day][slot] || []).map((meal) => ({
        ...meal,
        id: generateMealId(),
        ingredients: (meal.ingredients || []).map((ing) => ({
          ...ing,
          id: generateIngredientId(),
        })),
      }));
    }
  }
  return next;
}
