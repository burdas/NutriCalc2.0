import { useState, useMemo, useEffect } from 'react';
import { Card, Modal } from '@heroui/react';
import { Calculator } from 'lucide-react';
import { Header } from './components/Header';
import { CalorieForm } from './components/CalorieForm';
import { CalorieResults } from './components/CalorieResults';
import { SettingsPanel } from './components/SettingsPanel';
import { useDarkMode } from './hooks/useDarkMode';
import { useConfig } from './hooks/useConfig';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from './utils/calculations';
import { MACRO_PRESETS } from './utils/defaults';

const STORAGE_KEY = 'calorie-form-values';

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
  const [values, setValues] = useState(loadInitialValues);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    <div className="mx-auto max-w-2xl px-4 lg:max-w-7xl">
      <Header
        isDark={isDark}
        onToggleDark={toggleDark}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex flex-col gap-8 pb-12 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col lg:h-full">
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
            <CalorieResults {...results} />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl bg-content1 p-8 shadow-sm">
              <div className="flex flex-col items-center gap-3 text-center">
                <Calculator className="size-12 text-[var(--foreground)]/30" />
                <p className="text-lg font-semibold">Completa el formulario</p>
                <p className="text-muted text-sm max-w-60">
                  Ingresa tus datos para calcular tus calorías diarias
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}

export default App;
