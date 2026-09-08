import { roundKcal, roundMacro } from './calculations';

const DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const DAY_ALIAS = {
  lunes: 'lunes',
  martes: 'martes',
  miercoles: 'miércoles',
  'miércoles': 'miércoles',
  jueves: 'jueves',
  viernes: 'viernes',
  sabado: 'sábado',
  'sábado': 'sábado',
  domingo: 'domingo',
};

const SLOTS = ['desayuno', 'comida', 'merienda', 'cena', 'otros'];

let _counter = Date.now();
function generateUniqueId(prefix) {
  return `${prefix}_${Date.now()}_${++_counter}_${Math.floor(Math.random() * 10000)}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateDietWithGemini({
  apiKey,
  targetCalories,
  macros,
  dietType = 'balanced',
  allergies = '',
  customPrompt = '',
  onProgress = () => {},
}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Debes proporcionar una clave de API de Google AI Studio (Gemini).');
  }

  const prompt = `
Eres un nutricionista experto. Crea una planificación semanal completa de 7 días (lunes a domingo) para una dieta personalizada y realista.

OBJETIVOS NUTRICIONALES DIARIOS (Aproximar cada día a estos totales):
- Calorías totales: ~${targetCalories} kcal
- Proteínas: ~${macros.proteinG} g (${macros.proteinP}%)
- Carbohidratos: ~${macros.carbG} g (${macros.carbP}%)
- Grasas: ~${macros.fatG} g (${macros.fatP}%)

PAUTAS DEL USUARIO:
- Tipo de dieta / estilo: ${dietType}
- Alergias / Alimentos a evitar: ${allergies || 'Ninguna'}
- Pautas específicas del usuario: ${customPrompt || 'Platos variados, saludables, equilibrados y fáciles de preparar.'}

REGLAS DE FORMATO (OBLIGATORIO):
Devuelve EXCLUSIVAMENTE un objeto JSON válido con la estructura exacta indicada a continuación, sin explicaciones ni markdown fuera del JSON:
{
  "lunes": {
    "desayuno": [
      {
        "nombre": "Nombre del plato o comida",
        "calorias": 400,
        "proteinas": 30.0,
        "carbohidratos": 45.0,
        "grasas": 10.0,
        "ingredients": [
          {
            "nombre": "Nombre del ingrediente",
            "cantidad": 100,
            "calorias": 200,
            "proteinas": 15.0,
            "carbohidratos": 20.0,
            "grasas": 5.0
          }
        ]
      }
    ],
    "comida": [...],
    "merienda": [...],
    "cena": [...],
    "otros": []
  },
  "martes": { ... },
  "miércoles": { ... },
  "jueves": { ... },
  "viernes": { ... },
  "sábado": { ... },
  "domingo": { ... }
}

Notas:
- Reparto diario aproximado: Desayuno ~25%, Comida ~35%, Merienda ~15%, Cena ~25%.
- Cada slot de comida debe incluir su plato principal y sus ingredientes detallados.
- "otros" puede ser un array vacío [].
- La suma diaria de calorías debe estar muy cerca de ${targetCalories} kcal.
`;

  // Modelos activos y verificados en Google AI Studio (API v1beta)
  const models = [
    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview' },
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' },
  ];

  let lastError = null;

  for (let mIndex = 0; mIndex < models.length; mIndex++) {
    const { id: modelId, name: modelName } = models[mIndex];
    const isLastModel = mIndex === models.length - 1;

    // Intentos de reintento por modelo en caso de saturación temporal (con espera activa)
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt === 1) {
        onProgress(`Conectando con ${modelName}...`);
      } else {
        onProgress(`Reintentando con ${modelName} (${attempt}/${maxAttempts})...`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s per request

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey.trim()}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const rawMessage = errorData.error?.message || `Error ${response.status} de la API (${modelName})`;
          const lowerMsg = rawMessage.toLowerCase();

          const isHighDemand =
            response.status === 429 ||
            response.status === 503 ||
            response.status === 500 ||
            lowerMsg.includes('high demand') ||
            lowerMsg.includes('overloaded') ||
            lowerMsg.includes('quota') ||
            lowerMsg.includes('resource_exhausted') ||
            lowerMsg.includes('unavailable') ||
            lowerMsg.includes('try again');

          const isDeprecatedOrUnavailable =
            response.status === 404 ||
            response.status === 400 ||
            lowerMsg.includes('not found') ||
            lowerMsg.includes('not supported') ||
            lowerMsg.includes('no longer available') ||
            lowerMsg.includes('update your code');

          lastError = new Error(rawMessage);

          if (isDeprecatedOrUnavailable) {
            // Immediately jump to next model without waiting
            if (!isLastModel) {
              onProgress(`${modelName} no disponible. Cambiando a ${models[mIndex + 1].name}...`);
              break; // break inner retry loop to try next model
            }
            throw new Error(rawMessage);
          }

          if (isHighDemand) {
            if (attempt < maxAttempts) {
              const waitSec = attempt * 3;
              for (let s = waitSec; s >= 1; s--) {
                onProgress(`Alta demanda en ${modelName}. Esperando ${s}s para reintentar...`);
                await sleep(1000);
              }
              continue; // retry same model
            }

            // If exhausted attempts on this model, switch to next model
            if (!isLastModel) {
              onProgress(`${modelName} sigue saturado. Probando ${models[mIndex + 1].name}...`);
              await sleep(600);
              break; // break inner loop, next model
            }

            throw new Error('Los modelos de Gemini experimentan alta demanda temporal en este momento. Puedes esperar unos segundos y reintentar, o generar tu dieta instantáneamente con la base local.');
          }

          throw new Error(rawMessage);
        }

        onProgress('Procesando ingredientes y cuadrando macronutrientes...');

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error('La API de Gemini no devolvió contenido válido.');
        }

        let parsedPlan;
        try {
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsedPlan = JSON.parse(cleanedText);
        } catch {
          throw new Error('No se pudo interpretar el formato devuelto por Gemini.');
        }

        return normalizePlan(parsedPlan);
      } catch (err) {
        clearTimeout(timeoutId);

        if (err.name === 'AbortError') {
          lastError = new Error(`Tiempo de espera agotado con ${modelName}.`);
          if (attempt < maxAttempts) {
            onProgress(`Respuesta lenta de ${modelName}. Reintentando...`);
            await sleep(1000);
            continue;
          }
          if (!isLastModel) {
            onProgress(`${modelName} no respondió a tiempo. Probando ${models[mIndex + 1].name}...`);
            break;
          }
          throw new Error('La solicitud a Google AI Studio ha tardado demasiado tiempo. Comprueba tu conexión a Internet o clave de API.');
        }

        lastError = err;
        const msg = err.message || '';
        const isRetryable =
          msg.includes('saturado') ||
          msg.includes('alta demanda') ||
          msg.includes('429') ||
          msg.includes('503') ||
          msg.includes('500') ||
          msg.includes('404') ||
          msg.includes('not found') ||
          msg.includes('not supported') ||
          msg.includes('no longer available') ||
          msg.includes('update your code');

        if (isRetryable && !isLastModel) {
          onProgress(`Cambiando a ${models[mIndex + 1].name}...`);
          await sleep(600);
          break;
        }

        throw err;
      }
    }
  }

  throw lastError || new Error('No se pudo conectar con la API de Google AI Studio.');
}

function normalizePlan(rawPlan) {
  const normalized = {};

  for (const canonicalDay of DAYS) {
    normalized[canonicalDay] = {};

    // Find matching key in rawPlan ignoring accent or case
    const foundKey = Object.keys(rawPlan).find(
      (k) => DAY_ALIAS[k.toLowerCase().trim()] === canonicalDay
    );

    const dayData = foundKey ? rawPlan[foundKey] : {};

    for (const slot of SLOTS) {
      const meals = Array.isArray(dayData[slot]) ? dayData[slot] : [];

      normalized[canonicalDay][slot] = meals.map((m) => {
        const ingredients = Array.isArray(m.ingredients)
          ? m.ingredients.map((ing) => ({
              id: generateUniqueId('i'),
              nombre: String(ing.nombre || 'Ingrediente'),
              cantidad: Number(ing.cantidad) || 100,
              calorias: roundKcal(ing.calorias || 0),
              proteinas: roundMacro(ing.proteinas || 0),
              carbohidratos: roundMacro(ing.carbohidratos || 0),
              grasas: roundMacro(ing.grasas || 0),
            }))
          : [];

        let cal = Number(m.calorias) || 0;
        let prot = Number(m.proteinas) || 0;
        let carb = Number(m.carbohidratos) || 0;
        let fat = Number(m.grasas) || 0;

        if (ingredients.length > 0 && cal === 0) {
          cal = ingredients.reduce((sum, i) => sum + (i.calorias || 0), 0);
          prot = ingredients.reduce((sum, i) => sum + (i.proteinas || 0), 0);
          carb = ingredients.reduce((sum, i) => sum + (i.carbohidratos || 0), 0);
          fat = ingredients.reduce((sum, i) => sum + (i.grasas || 0), 0);
        }

        return {
          id: generateUniqueId('m'),
          nombre: String(m.nombre || 'Comida'),
          calorias: roundKcal(cal),
          proteinas: roundMacro(prot),
          carbohidratos: roundMacro(carb),
          grasas: roundMacro(fat),
          ingredients,
        };
      });
    }
  }

  return normalized;
}
