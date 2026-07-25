import { useState, useMemo, useEffect } from 'react';
import { Card } from '@heroui/react';
import { Header } from './components/Header';
import { CalorieForm } from './components/CalorieForm';
import { CalorieResults } from './components/CalorieResults';
import { useDarkMode } from './hooks/useDarkMode';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from './utils/calculations';

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
  const [values, setValues] = useState(loadInitialValues);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  const results = useMemo(() => {
    const { age, weight, height, sex, activity, goal } = values;
    if (!age || !weight || !height || !activity || !goal) return null;

    const bmr = Math.round(calculateBMR(weight, height, age, sex));
    const tdee = calculateTDEE(bmr, activity);
    const targetCalories = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(targetCalories, weight);

    return { bmr, tdee, targetCalories, macros };
  }, [values]);

  return (
    <div className="mx-auto max-w-2xl px-4">
      <Header isDark={isDark} onToggleDark={toggleDark} />

      <main className="flex flex-col gap-8 pb-12">
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

        {results && <CalorieResults {...results} />}
      </main>
    </div>
  );
}

export default App;
