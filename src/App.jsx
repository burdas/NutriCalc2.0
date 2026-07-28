import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { Card, Modal, NumberField, Label } from '@heroui/react';
import { Calculator } from 'lucide-react';
import { Header } from './components/Header';
import { CalorieForm } from './components/CalorieForm';
const CalorieResults = lazy(() => import('./components/CalorieResults').then(m => ({ default: m.CalorieResults })));
const WeightProjection = lazy(() => import('./components/WeightProjection').then(m => ({ default: m.WeightProjection })));
const WeeklyMealPlanner = lazy(() => import('./components/WeeklyMealPlanner').then(m => ({ default: m.WeeklyMealPlanner })));
import { SettingsPanel } from './components/SettingsPanel';
import { InfoContent } from './components/InfoContent';
import { useDarkMode } from './hooks/useDarkMode';
import { useConfig } from './hooks/useConfig';
import { useMealPlanner } from './hooks/useMealPlanner';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from './utils/calculations';
import { MACRO_PRESETS } from './utils/defaults';

const STORAGE_KEY = 'calorie-form-values:v1';
const TARGET_WEIGHT_KEY = 'calorie-target-weight:v1';

const DEFAULT_VALUES = {
  age: undefined,
  weight: undefined,
  height: undefined,
  sex: 'male',
  activity: '',
  goal: '',
};

function loadInitialValues() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_VALUES, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_VALUES;
}

function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { config, setConfig, resetConfig } = useConfig();
  const { mealPlan, addMeal, removeMeal, moveMeal, updateMealBulk, updateMealIngredients, dailyTotals } = useMealPlanner();
  const [values, setValues] = useState(loadInitialValues);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [targetWeight, setTargetWeight] = useState(() => {
    try {
      const stored = localStorage.getItem(TARGET_WEIGHT_KEY);
      return stored ? JSON.parse(stored) : undefined;
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    localStorage.setItem(TARGET_WEIGHT_KEY, JSON.stringify(targetWeight));
  }, [targetWeight]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  const macroConfig = useMemo(() => {
    const preset = config.macroPreset;
    if (preset === 'custom') {
      return config.customMacros ?? { proteinPerKg: 1.8, fatPercent: 0.25 };
    }
    return MACRO_PRESETS[preset];
  }, [config.macroPreset, config.customMacros]);

  const results = useMemo(() => {
    const { age, weight, height, sex, activity, goal } = values;
    if (!age || !weight || !height || !activity || !goal) return null;

    const bmr = Math.round(calculateBMR(weight, height, age, sex));
    const tdee = calculateTDEE(bmr, activity);
    const targetCalories = calculateTargetCalories(tdee, goal, config.goalAdjustments);
    const macros = calculateMacros(targetCalories, weight, macroConfig);

    return { bmr, tdee, targetCalories, macros };
  }, [values, config.goalAdjustments, macroConfig]);

  return (
    <>
    <div className="mx-auto max-w-2xl px-4 lg:max-w-7xl">
      <Header
        isDark={isDark}
        onToggleDark={toggleDark}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenInfo={() => setInfoOpen(true)}
      />

      <main className="flex flex-col gap-8 pb-12 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col lg:h-full animate-[fadeInUp_0.5s_ease-out_0.1s_both]">
          <Card>
            <Card.Header>
              <Card.Title>Tus datos</Card.Title>
              <Card.Description>
                Completa los campos para calcular tus calorías diarias
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <CalorieForm values={values} onChange={setValues} />
            </Card.Content>
          </Card>
        </div>

        <div className="flex flex-col lg:h-full">
          {results ? (
            <Suspense fallback={<div className="flex flex-1 items-center justify-center"><span className="text-muted text-sm">Cargando...</span></div>}>
              <CalorieResults {...results} />
            </Suspense>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-content1 p-8 shadow-sm animate-[fadeIn_0.3s_ease-out]">
              <div className="flex flex-col items-center gap-3 text-center">
                <Calculator className="size-12 text-[var(--foreground)]/30 animate-[gentlePulse_2s_ease-in-out_infinite]" />
                <p className="text-lg font-semibold">Completa el formulario</p>
                <p className="text-muted text-sm max-w-60">
                  Ingresa tus datos para calcular tus calorías diarias
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {results && (
        <>
        <section className="pb-12 animate-[fadeInUp_0.5s_ease-out_0.6s_both]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Proyección de peso</h2>
              <p className="text-muted text-sm">
                Establece tu peso objetivo y visualiza el tiempo estimado para alcanzarlo
              </p>
            </div>
            <div className="w-full sm:w-auto sm:max-w-xs">
              <NumberField
                value={targetWeight}
                onChange={(v) => setTargetWeight(v ?? undefined)}
                minValue={20}
                maxValue={300}
                step={1}
                variant="secondary"
              >
                <Label>Peso objetivo (kg)</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input placeholder={values.weight?.toString()} />
                  <NumberField.IncrementButton />
                </NumberField.Group>
              </NumberField>
            </div>
          </div>
          <Card>
            <Card.Content>
              <Suspense fallback={<div className="flex items-center justify-center py-8"><span className="text-muted text-sm">Cargando...</span></div>}>
                <WeightProjection
                  currentWeight={values.weight}
                  goal={values.goal}
                  goalAdjustment={config.goalAdjustments[values.goal]}
                  targetWeight={targetWeight}
                />
              </Suspense>
            </Card.Content>
          </Card>
        </section>
        </>
      )}
    </div>

      {results && (
        <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-8">
        <Suspense fallback={<div className="flex items-center justify-center py-8"><span className="text-muted text-sm">Cargando...</span></div>}>
          <WeeklyMealPlanner
            mealPlan={mealPlan}
            onAddMeal={addMeal}
            onRemoveMeal={removeMeal}
            onMoveMeal={moveMeal}
            onUpdateMealBulk={updateMealBulk}
            onUpdateMealIngredients={updateMealIngredients}
            dailyTotals={dailyTotals}
            target={results.targetCalories}
            macros={results.macros}
          />
        </Suspense>
        </div>
      )}

      <Modal.Backdrop isOpen={infoOpen} onOpenChange={setInfoOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Cómo funciona la calculadora</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <InfoContent />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop isOpen={settingsOpen} onOpenChange={setSettingsOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Configuración</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <SettingsPanel
                config={config}
                setConfig={setConfig}
                resetConfig={resetConfig}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}

export default App;
